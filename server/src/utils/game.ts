import { correctAnswerIndex } from "@/state/question.state";
import { musicKitApiUrl } from "@/utils/constants";
import { GameQuestion, Room, Track } from "shared";

type QuestionKind = "topArtistLongTerm" | "topTrackLongTerm" | "topArtistMediumTerm" | "topTrackMediumTerm" | "topArtistShortTerm" | "topTrackShortTerm";

type MusicKitSong = {
  id: string;
  attributes: {
    name: string;
    artistName: string;
    artwork: { url: string };
    previews: { url: string }[];
  };
};

export class GameGenerationError extends Error {
  constructor(public readonly reason: "not_enough_tracks" | "catalog_unavailable") {
    super(reason);
    this.name = "GameGenerationError";
  }
}

const shuffle = <T>(array: T[]): T[] =>
  [...array].sort(() => Math.random() - 0.5);

const mapSongs = (data: MusicKitSong[]): Track[] =>
  data.map((song) => ({
    id: song.id,
    title: song.attributes.name,
    cover: song.attributes.artwork.url.replace("{w}", "600").replace("{h}", "600"),
    artists: song.attributes.artistName.split(" & ").map((artist) => ({
      name: artist
    })),
    previewUrl: song.attributes.previews[0]?.url
  }));

const fetchDefaultPlaylistId = async (token: string): Promise<string> => {
  const url = `${musicKitApiUrl}/catalog/fr/charts?types=playlists&limit=1`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (!response.ok) throw new GameGenerationError("catalog_unavailable");

  const result: { results?: { playlists?: { data?: { id: string }[] }[] } } = await response.json();
  const playlistId = result.results?.playlists?.[0]?.data?.[0]?.id;
  if (!playlistId) throw new GameGenerationError("catalog_unavailable");
  return playlistId;
};

const fetchSongs = async (room: Room, token: string): Promise<Track[]> => {
  const musicSource = room.settings.musicSource ?? {
    type: "playlist" as const,
    id: await fetchDefaultPlaylistId(token),
  };

  const resourceType = musicSource.type === "playlist" ? "playlists" : "albums";
  const url = `${musicKitApiUrl}/catalog/fr/${resourceType}/${musicSource.id}/tracks`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (!response.ok) throw new GameGenerationError("catalog_unavailable");

  const result: { data?: MusicKitSong[] } = await response.json();
  if (!Array.isArray(result.data)) throw new GameGenerationError("catalog_unavailable");
  return mapSongs(result.data);
};

export const generateRandomQuestions = async (
  room: Room,
  number: number
): Promise<GameQuestion[]> => {
  const questions: GameQuestion[] = [];
  const answerIndexes: Record<number, number> = {};

  const token = process.env.MUSICKIT_DEVELOPER_TOKEN
  if (!token) {
    throw new GameGenerationError("catalog_unavailable")
  }

  // Une question a besoin d'un extrait et de trois propositions différentes.
  // On déduplique le catalogue avant de démarrer la partie pour éviter une
  // question sans son ou avec des réponses ambiguës.
  const songs = Array.from(
    new Map(
      (await fetchSongs(room, token))
        .filter((song) => Boolean(song.previewUrl))
        .map((song) => [song.id, song]),
    ).values(),
  );
  if (songs.length < 4) {
    throw new GameGenerationError("not_enough_tracks");
  }

  const usedQuestionTrackIds = new Set<string>();
  const usedAnswerIds = new Set<string>();

  for (let i = 0; i < number; i++) {
    const unusedSongs = songs.filter((song) => !usedQuestionTrackIds.has(song.id));
    const questionPool = unusedSongs.length > 0 ? unusedSongs : songs;

    const correctAnswer = questionPool[Math.floor(Math.random() * questionPool.length)];
    usedQuestionTrackIds.add(correctAnswer.id);

    const freshWrongAnswerPool = shuffle(
      songs.filter((song) => song.id !== correctAnswer.id && !usedAnswerIds.has(song.id))
    );
    const fallbackWrongAnswerPool = shuffle(songs.filter((song) => song.id !== correctAnswer.id));
    const wrongAnswerPool = freshWrongAnswerPool.length >= 3 ? freshWrongAnswerPool : fallbackWrongAnswerPool;
    const wrongAnswers = wrongAnswerPool.slice(0, 3);

    const answers = shuffle([correctAnswer, ...wrongAnswers]);
    answers.forEach((answer) => usedAnswerIds.add(answer.id));

    answerIndexes[questions.length] = answers.indexOf(
      correctAnswer
    );

    questions.push({
      id: questions.length,
      type: "track",
      question: `Quelle est cette musique ?`,
      questionKey: "track",
      answers,
      previewTrack: {
        artists: [],
        cover: "",
        id: "0",
        title: "",
        previewUrl: correctAnswer.previewUrl,
      },
    });
  }
  correctAnswerIndex[room.code] = answerIndexes;
  return questions;
};

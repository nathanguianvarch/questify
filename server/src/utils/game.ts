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
  const result: { results: { playlists: { data: { id: string }[] }[] } } = await response.json();
  return result.results.playlists[0].data[0].id;
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
  const result: { data: MusicKitSong[] } = await response.json();
  return mapSongs(result.data);
};

export const generateRandomQuestions = async (
  room: Room,
  number: number
): Promise<GameQuestion[]> => {
  const questions: GameQuestion[] = [];

  correctAnswerIndex[room.code] = {};

  try {
    const token = process.env.MUSICKIT_DEVELOPER_TOKEN
    if (!token) {
      throw new Error("MUSICKIT_DEVELOPER_TOKEN manquant")
    }

    const songs = await fetchSongs(room, token);
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
      while (wrongAnswers.length < 3 && songs.length > 0) {
        wrongAnswers.push(songs[Math.floor(Math.random() * songs.length)]);
      }

      const answers = shuffle([correctAnswer, ...wrongAnswers]);
      answers.forEach((answer) => usedAnswerIds.add(answer.id));

      correctAnswerIndex[room.code][questions.length] = answers.indexOf(
        correctAnswer
      );

      questions.push({
        id: questions.length,
        type: "track",
        question: `Quelle est cette musique ?`,
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
  }

  catch (e) {
    if (e instanceof Error) {
      console.log(e.message)
    }
    throw e
  }
  return questions;
};
import { correctAnswerIndex } from "@/state/question.state";
import { GameQuestion, Room } from "shared";
import { requestArtistTopTracks, requestTrack } from "./spotify";

type QuestionKind = "topArtistLongTerm" | "topTrackLongTerm" | "topArtistMediumTerm" | "topTrackMediumTerm" | "topArtistShortTerm" | "topTrackShortTerm";

const shuffle = <T>(array: T[]): T[] =>
  [...array].sort(() => Math.random() - 0.5);

export const generateRandomQuestions = async (
  room: Room,
  authorization: string
): Promise<GameQuestion[]> => {
  const player = room.players[0];
  const questions: GameQuestion[] = [];

  correctAnswerIndex[room.code] = {};

  const questionPool: QuestionKind[] = shuffle([
    "topArtistLongTerm",
    "topTrackLongTerm",
    "topArtistMediumTerm",
    "topTrackMediumTerm",
    "topArtistShortTerm",
    "topTrackShortTerm"
  ]);

  for (const kind of questionPool) {
    const id = questions.length;
    if (kind === "topArtistLongTerm" && player.playerStats.topArtists.longTerm.length > 0) {
      const answers = shuffle(player.playerStats.topArtists.longTerm);

      correctAnswerIndex[room.code][id] = answers.indexOf(
        player.playerStats.topArtists.longTerm[0]
      );

      const previewTrack = shuffle(await requestArtistTopTracks(shuffle(answers)[0].id, authorization))[0];

      questions.push({
        id,
        type: "artist",
        question: `Qui est l'artiste #1 de ${player.username} ces 12 derniers mois ?`,
        answers,
        previewTrack: {
          ...previewTrack,
          previewUrl: "",
        },
      });
    }

    if (kind === "topTrackLongTerm" && player.playerStats.topTracks.longTerm.length > 0) {
      const answers = shuffle(player.playerStats.topTracks.longTerm);

      correctAnswerIndex[room.code][id] = answers.indexOf(
        player.playerStats.topTracks[0]
      );

      const previewTrack = await requestTrack(shuffle(answers)[0].id, authorization);

      questions.push({
        id,
        type: "track",
        question: `Quelle est la musique #1 de ${player.username} ces 12 derniers mois ?`,
        answers,
        previewTrack: {
          ...previewTrack,
          previewUrl: "",
        },
      });
    }
    if (kind === "topArtistMediumTerm" && player.playerStats.topArtists.mediumTerm.length > 0) {
      const answers = shuffle(player.playerStats.topArtists.mediumTerm);
      correctAnswerIndex[room.code][id] = answers.indexOf(
        player.playerStats.topArtists.mediumTerm[0]
      );

      const previewTrack = shuffle(await requestArtistTopTracks(shuffle(answers)[0].id, authorization))[0];

      questions.push({
        id,
        type: "artist",
        question: `Qui est l'artiste #1 de ${player.username} ces 6 derniers mois ?`,
        answers,
        previewTrack: {
          ...previewTrack,
          previewUrl: "",
        },
      });
    }
    if (kind === "topTrackMediumTerm" && player.playerStats.topTracks.mediumTerm.length > 0) {
      const answers = shuffle(player.playerStats.topTracks.mediumTerm);

      correctAnswerIndex[room.code][id] = answers.indexOf(
        player.playerStats.topTracks.mediumTerm[0]
      );

      const previewTrack = await requestTrack(shuffle(answers)[0].id, authorization);

      questions.push({
        id,
        type: "track",
        question: `Quelle est la musique #1 de ${player.username} ces 6 derniers mois ?`,
        answers,
        previewTrack: {
          ...previewTrack,
          previewUrl: "",
        },
      });
    }
    if (kind === "topArtistShortTerm" && player.playerStats.topArtists.shortTerm.length > 0) {
      const answers = shuffle(player.playerStats.topArtists.shortTerm);

      correctAnswerIndex[room.code][id] = answers.indexOf(
        player.playerStats.topArtists.shortTerm[0]
      );

      const previewTrack = shuffle(await requestArtistTopTracks(shuffle(answers)[0].id, authorization))[0];

      questions.push({
        id,
        type: "artist",
        question: `Qui est l'artiste #1 de ${player.username} ces 4 dernières semaines ?`,
        answers,
        previewTrack: {
          ...previewTrack,
          previewUrl: "",
        },
      });
    }
    if (kind === "topTrackShortTerm" && player.playerStats.topTracks.shortTerm.length > 0) {
      const answers = shuffle(player.playerStats.topTracks.shortTerm);

      correctAnswerIndex[room.code][id] = answers.indexOf(
        player.playerStats.topTracks.shortTerm[0]
      );

      const previewTrack = await requestTrack(shuffle(answers)[0].id, authorization);

      questions.push({
        id,
        type: "track",
        question: `Quelle est la musique #1 de ${player.username} ces 4 dernières semaines ?`,
        answers,
        previewTrack: {
          ...previewTrack,
          previewUrl: "",
        },
      });
    }
  }
  return questions;
};
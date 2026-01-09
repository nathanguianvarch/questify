import { Player } from "./player";

export type BaseGameQuestion = {
  id: number;
  type: "artist" | "player" | "track";
  question: string;
  playersAnswerState?: { [playerId: string]: AnswerState };
  audioUrl?: string;
};

export type AnswerState = "unanswered" | "answered" | "correct" | "wrong";

export type Artist = {
  id: string;
  name: string;
  cover: string;
  popularity: number;
};

export type Track = {
  id: string;
  title: string;
  artists: { id: string; name: string }[];
  cover: string;
};

export type ArtistQuestion = BaseGameQuestion & {
  type: "artist";
  answers: Artist[];
};

export type TrackQuestion = BaseGameQuestion & {
  type: "track";
  answers: Track[];
};

export type PlayerQuestion = BaseGameQuestion & {
  type: "player";
  answers: Player[];
};

export type GameQuestion = ArtistQuestion | TrackQuestion | PlayerQuestion;
import { Player } from "./player";

export type BaseGameQuestion = {
  id: number;
  type: "artist" | "player" | "track";
  question: string;
  playersAnswerState?: { [playerId: string]: AnswerState };
  previewTrack?: Track
};

export type AnswerState = "unanswered" | "answered" | "correct" | "wrong";

export type Artist = {
  id: string;
  name: string;
  cover: string;
  followers: number;
};

export type Track = {
  id: string;
  title: string;
  artists: { id: string; name: string }[];
  cover: string;
  previewUrl?: string;
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

export type PlayerScore = Record<string, number>
import { Player } from "./player";

export type GameQuestion = {
  id: number;
  type: "artist" | "player";
  question: string;
  answers: (Player | Artist)[];
  correctAnswer: number;
  audioUrl?: string;
};

export type Artist = {
  id: string;
  name: string;
  cover: string;
  popularity: number;
};
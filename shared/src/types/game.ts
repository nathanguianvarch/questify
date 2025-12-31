import { Player } from "./player";

export type GameQuestion = {
  id: number;
  question: string;
  answers: Player[];
  correctAnswer: number;
  audioUrl?: string;
};
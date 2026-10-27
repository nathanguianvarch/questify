import { GameQuestion } from "./game";
import { Player } from "./player";

export type Room = {
  code: string;
  hostSocketId: string | undefined;
  players: Player[];
  settings: {
    numberOfQuestions: number;
    seats: number;
    timePerQuestion: number;
    musicSource?: MusicSource;
    isPrivate: boolean;
  }
  status: RoomStatus;

  questions?: GameQuestion[]
  currentQuestion?: GameQuestion;
  currentQuestionEndsAt?: number;
  answers?: Record<string, number>
};

export type RoomStatus = "waiting" | "in_progress" | "finished";

export type MusicSource = {
  type: "playlist" | "album";
  id: string;
};

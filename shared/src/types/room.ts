import { GameQuestion } from "./game";
import { Player } from "./player";

export type Room = {
  code: string;
  hostSocketId: string;
  players: Player[];
  status: RoomStatus;

  questions?: GameQuestion[]
  currentQuestion?: GameQuestion;
  answers?: Record<string, number>
};

export type RoomStatus = "waiting" | "in_progress" | "finished";

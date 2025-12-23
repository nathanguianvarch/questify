import { GameQuestion } from "./game";
import { Player } from "./player";

export type Room = {
  code: string;
  hostSocketId: string;
  players: Player[];
  status: RoomStatus;
  currentQuestion?: GameQuestion;
};

export type RoomStatus = "waiting" | "in_progress" | "finished";

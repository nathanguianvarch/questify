import { Player } from "./player";
import { Room } from "./room";

export interface ServerToClientEvents {
  roomCreated: (room: Room) => void;
  roomUpdated: (room: Room) => void;
  gameStarted: (room: Room) => void;
  gameEnded: (room: Room) => void;
  roomNotFound: () => void;
}

export interface ClientToServerEvents {
  createRoom: (payload: { player: Player }) => void;
  joinRoom: (payload: { roomCode: string; player: Player }) => void;
  startGame: (payload: { roomCode: string }) => void;
  endGame: (payload: { roomCode: string }) => void;
}
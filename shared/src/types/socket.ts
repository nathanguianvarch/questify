import { Player } from "./player";
import { Room } from "./room";

export interface ServerToClientEvents {
  roomCreated: (room: Room) => void;
  roomUpdated: (room: Room) => void;
  roomJoined: (room: Room) => void;
  roomLeft: (room: Room) => void;
  gameStarted: (room: Room) => void;
  gameEnded: (room: Room) => void;
}

export interface ClientToServerEvents {
  createRoom: (payload: { player: Player }) => void;
  joinRoom: (payload: { roomCode: string; player: Player }) => void;
  leaveRoom: (payload: { roomCode: string; }) => void;
  startGame: (payload: { roomCode: string }) => void;
  answerQuestion: (payload: { roomCode: string, answerIndex: number }) => void;
  endGame: (payload: { roomCode: string }) => void;
}
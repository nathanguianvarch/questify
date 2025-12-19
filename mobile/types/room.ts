import { Player } from "./player";

export type Room = {
  code: string;
  hostSocketId: string;
  players: Player[];
};

export type RoomStore = {
  room: Room | null;
  setRoom: (room: Room) => void;
  updateRoom: (partialRoom: Partial<Room>) => void;
  clearRoom: () => void;
};
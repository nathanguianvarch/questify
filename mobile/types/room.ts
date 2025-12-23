import { Room } from "shared";

export type RoomStore = {
  room: Room | null;
  setRoom: (room: Room) => void;
  updateRoom: (partialRoom: Partial<Room>) => void;
  clearRoom: () => void;
};
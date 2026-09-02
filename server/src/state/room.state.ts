import { Room } from "shared";
import { AppServer } from "@/types/socket";

export const rooms: Record<string, Room> = {};

export const emitActiveRooms = (io: AppServer) => {
  const publicRooms = Object.values(rooms).filter(
    (room) => !room.settings.isPrivate
  );
  io.emit("activeRooms", publicRooms);
};
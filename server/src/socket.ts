import { Server, Socket } from "socket.io";
import { registerRoomSockets } from "./sockets/room.socket";
import { rooms } from "./state/room.state";


export const initSockets = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log("Client connecté :", socket.id);

    registerRoomSockets(io, socket);

    socket.emit("activeRooms", rooms.length ?? 0);

    socket.on("disconnect", () => {
      console.log("Client déconnecté :", socket.id);
    });
  });
};
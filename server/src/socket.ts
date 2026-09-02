import { registerRoomSockets } from "./sockets/room.socket";
import { rooms } from "./state/room.state";
import { AppServer, AppSocket } from "./types/socket";


export const initSockets = (io: AppServer) => {
  io.on("connection", (socket: AppSocket) => {
    console.log("Client connecté :", socket.id);

    registerRoomSockets(io, socket);

    socket.on("timeSync", (_clientTime, callback) => {
      callback(Date.now());
    });

    socket.emit(
      "activeRooms",
      Object.values(rooms).filter((room) => !room.settings.isPrivate)
    );

    socket.on("disconnect", () => {
      console.log("Client déconnecté :", socket.id);
    });
  });
};
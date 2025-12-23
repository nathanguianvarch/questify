import { rooms } from "@/state/room";
import { Player } from "shared";
import { Server, Socket } from "socket.io";

type SocketContext = {
  io: Server;
  socket: Socket;
}

export const registerRoomSockets = (io: Server, socket: Socket) => {
  socket.on("createRoom", createRoom({ io, socket }));
  socket.on("joinRoom", joinRoom({ io, socket }));
  socket.on("leaveRoom", leaveRoom({ io, socket }));

  socket.on("startGame", startGame({ io, socket }));
  socket.on("endGame", startGame({ io, socket }));

  socket.on("disconnect", () => {
    for (const roomCode in rooms) {
      const room = rooms[roomCode];

      room.players = room.players.filter(
        (p) => p.socketId !== socket.id
      );

      if (room.hostSocketId === socket.id) {
        room.hostSocketId = room.players[0]?.socketId;
      }

      if (room.players.length < 2 && room.status === "in_progress") {
        room.status = "finished";
        room.currentQuestion = undefined;
      }


      if (room.players.length === 0) {
        delete rooms[roomCode];
      } else {
        io.to(roomCode).emit("roomUpdated", room);
      }
    }
  });
}

const createRoom = ({ io, socket }: SocketContext) => ({ player }: { player: Player }) => {
  const roomCode = Math.floor(1000 + Math.random() * 9000).toString();

  rooms[roomCode] = {
    code: roomCode,
    hostSocketId: socket.id,
    players: [{ socketId: socket.id, ...player }],
    status: "waiting"
  };

  socket.join(roomCode);
  socket.emit("roomCreated", rooms[roomCode]);
  console.log(`${player.username} a créer la partie ${roomCode}`)
}

const joinRoom = ({ io, socket }: SocketContext) => ({ roomCode, player }: { roomCode: string, player: Player }) => {
  const room = rooms[roomCode];

  if (!room) return;

  const alreadyInRoom = room.players.some(
    (p) => p.socketId === socket.id
  );
  if (alreadyInRoom) return;

  room.players.push({ socketId: socket.id, ...player });
  socket.join(roomCode);

  io.to(roomCode).emit("roomUpdated", room);
  socket.emit("roomJoined", rooms[roomCode]);
  console.log(`${player.username} a rejoint la partie ${roomCode}`)
}

const leaveRoom = ({ io, socket }: SocketContext) => ({ roomCode }: { roomCode: string }) => {
  const room = rooms[roomCode];

  room.players = room.players.filter(
    (p) => p.socketId !== socket.id
  );

  socket.leave(roomCode);

  if (room.hostSocketId === socket.id) {
    room.hostSocketId = room.players[0]?.socketId;
  }

  if (room.players.length === 0) {
    delete rooms[roomCode];
  }

  if (room.players.length < 2 && room.status === "in_progress") {
    room.status = "finished";
    room.currentQuestion = undefined;
  }

  io.to(roomCode).emit("roomUpdated", room);
  socket.emit("roomLeft", roomCode);

  console.log(`Socket ${socket.id} a quitté la partie ${roomCode}`);
}

const startGame = ({ io, socket }: SocketContext) => ({ roomCode }: { roomCode: string }) => {
  const room = rooms[roomCode]
  if (!room) return;
  if (room.hostSocketId !== socket.id) return;

  room.status = "in_progress"
  room.currentQuestion = {
    question: "Question de test",
    answers: room.players.map((player) => player.username),
  }
  io.to(roomCode).emit("gameStarted", room)
}

const endGame = ({ io, socket }: SocketContext) => ({ roomCode }: { roomCode: string }) => {
  const room = rooms[roomCode]
  if (!room) return;
  room.status = "finished"
  room.currentQuestion = null

  io.to(roomCode).emit("gameEnded", room)
}
import express from 'express';
import { createServer } from 'http';
import { Server } from "socket.io";

import { userRouter } from "@/routes/user.routes";

type Player = {
  socketId: string;
};
type Room = {
  code: string;
  hostSocketId: string;
  players: Player[];
};

const app = express()
const server = createServer(app);
const io = new Server(server);
const port = 3000

const rooms: Record<string, Room> = {};

app.get('/', (req, res) => {
  res.send('Server online')
})

app.use("/user", userRouter)

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on("createRoom", () => {
    const roomCode = Math.floor(1000 + Math.random() * 9000).toString();

    rooms[roomCode] = {
      code: roomCode,
      hostSocketId: socket.id,
      players: [{ socketId: socket.id }],
    };

    socket.join(roomCode);
    socket.emit("roomCreated", rooms[roomCode]);
  });

  socket.on("joinRoom", ({ roomCode }) => {
    const room = rooms[roomCode];

    if (!room) {
      socket.emit("roomNotFound");
      return;
    }

    const alreadyInRoom = room.players.some(
      (p) => p.socketId === socket.id
    );
    if (alreadyInRoom) return;

    room.players.push({ socketId: socket.id });
    socket.join(roomCode);

    io.to(roomCode).emit("roomUpdated", room);
  });

  socket.on("disconnect", () => {
    for (const roomCode in rooms) {
      const room = rooms[roomCode];

      room.players = room.players.filter(
        (p) => p.socketId !== socket.id
      );

      if (room.hostSocketId === socket.id) {
        room.hostSocketId = room.players[0]?.socketId;
      }

      if (room.players.length === 0) {
        delete rooms[roomCode];
      } else {
        io.to(roomCode).emit("roomUpdated", room);
      }
    }
  });
});

server.listen(port, () => {
  console.log(`Questify server listening on port ${port}`)
})

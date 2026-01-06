import { rooms } from "@/state/room.state";
import { GameQuestion, Player, Room } from "shared";
import { Server, Socket } from "socket.io";

const QUESTIONS: GameQuestion[] = [
  {
    id: 1,
    type: "player",
    question: "Qui est l’intrus ?",
    answers: [],
    correctAnswer: 2,
    audioUrl: "https://p.scdn.co/mp3-preview/c304a8f6eef87734e1e3aeaba3239348e49b794c"
  },
  {
    id: 2,
    type: "artist",
    question: "Quel est cet artiste ?",
    answers: [],
    correctAnswer: 1,
    audioUrl: "https://samplelib.com/lib/preview/mp3/sample-3s.mp3"
  }
];

type SocketContext = {
  io: Server;
  socket: Socket;
}

export const registerRoomSockets = (io: Server, socket: Socket) => {
  socket.on("createRoom", createRoom({ io, socket }));
  socket.on("joinRoom", joinRoom({ io, socket }));
  socket.on("leaveRoom", leaveRoom({ io, socket }));

  socket.on("startGame", startGame({ io, socket }));
  socket.on("answerQuestion", answerQuestion({ io, socket }));
  socket.on("endGame", endGame({ io, socket }));

  socket.on("disconnect", () => disconnect({ io, socket }));
}

const createRoom = ({ io, socket }: SocketContext) => ({ player }: { player: Player }) => {
  const roomCode = Math.floor(1000 + Math.random() * 9000).toString();

  rooms[roomCode] = {
    code: roomCode,
    hostSocketId: socket.id,
    players: [{ socketId: socket.id, ...player }],
    status: "waiting",
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
  console.log(room.players[0].playerStats)
  const questions: GameQuestion[] = [
    {
      id: 1,
      type: "artist",
      question: `Quel est cet artiste ?`,
      answers: room.players[0].playerStats.topArtists,
      correctAnswer: 0,
      audioUrl: ""
    }
  ]
  room.questions = questions.length >= 5 ? questions.slice(0, 5) :
    room.questions = questions
  room.currentQuestion = room.questions[0]
  room.answers = {};

  io.to(roomCode).emit("roomUpdated", room)
}

const endGame = ({ io, socket }: SocketContext) => ({ roomCode }: { roomCode: string }) => {
  const room = rooms[roomCode]
  if (!room) return;
  room.status = "finished"
  room.currentQuestion = null

  io.to(roomCode).emit("gameEnded", room)
}

const answerQuestion = ({ io, socket }: SocketContext) => (
  { roomCode, answerIndex }: { roomCode: string; answerIndex: number }
) => {
  const room = rooms[roomCode];

  if (room.answers[socket.id] !== undefined) return;

  room.answers[socket.id] = answerIndex;

  if (Object.keys(room.answers).length === room.players.length) {
    goToNextQuestion(io, room);
  }
};

const goToNextQuestion = (io: Server, room: Room) => {
  const questionIndex = room.questions.indexOf(room.currentQuestion)
  console.log(questionIndex, room.questions.length)
  if (questionIndex + 1 >= room.questions.length) {
    room.status = "finished";
    room.currentQuestion = undefined;
    console.log(room)

    io.to(room.code).emit("roomUpdated", room);
    return;
  }

  room.currentQuestion = room.questions[questionIndex + 1];
  room.answers = {};

  io.to(room.code).emit("roomUpdated", room);
};

const disconnect = ({ io, socket }: SocketContext) => {
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
}
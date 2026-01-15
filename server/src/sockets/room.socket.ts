import { correctAnswerIndex } from "@/state/question.state";
import { rooms } from "@/state/room.state";
import { score } from "@/state/score.state";
import { generateRandomQuestions } from "@/utils/game";
import { requestPreviewSongAudio } from "@/utils/spotify";
import { GameQuestion, Player, Room } from "shared";
import { Server, Socket } from "socket.io";

type SocketContext = {
  io: Server;
  socket: Socket;
}

export const registerRoomSockets = async (io: Server, socket: Socket) => {
  socket.on("createRoom", createRoom({ io, socket }));
  socket.on("joinRoom", joinRoom({ io, socket }));
  socket.on("leaveRoom", leaveRoom({ io, socket }));
  socket.on("kickPlayer", kickPlayer({ io, socket }));

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
    timePerQuestion: 15,
    seats: 5,
  };

  io.emit("activeRooms", Object.keys(rooms).length ?? 0);

  socket.join(roomCode);
  socket.emit("roomCreated", rooms[roomCode]);
  console.log(`${player.username} a créer la partie ${roomCode}`)
}

const joinRoom = ({ io, socket }: SocketContext) => ({ roomCode, player }: { roomCode: string, player: Player }) => {
  const room = rooms[roomCode];

  if (!room) {
    socket.emit("roomNotExists", roomCode);
    return;
  }

  if (room.players.length >= room.seats) {
    socket.emit("roomFull", roomCode);
    return;
  }
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

const kickPlayer = ({ io, socket }: SocketContext) => (roomCode: string, player: Player) => {
  // TODO: À corriger

  const room = rooms[roomCode];
  if (!room) return;
  if (room.hostSocketId !== socket.id) return;

  room.players = room.players.filter(
    (p) => p.socketId !== player.socketId
  );

  socket.leave(roomCode);

  io.to(roomCode).emit("roomUpdated", room);
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

const startGame = ({ io, socket }: SocketContext) => async (roomCode: string, authorization: string) => {
  const room = rooms[roomCode]
  if (!room) return;
  if (room.hostSocketId !== socket.id) return;

  room.status = "in_progress"

  const questions: GameQuestion[] = await generateRandomQuestions(room, authorization);

  for (const question of questions) {
    if (question.previewTrack) {
      question.previewTrack.previewUrl = await requestPreviewSongAudio(question.previewTrack.id);
    }
  }

  room.questions = questions
  room.currentQuestion = room.questions[0]
  room.answers = {};

  for (const player of room.players) {
    score[room.code] = score[room.code] || {};
    score[room.code][player.socketId] = 0;
  }

  const endQuestionDate = (new Date().getTime() + room.timePerQuestion * 1000);

  io.to(roomCode).emit("roomUpdated", room)

  // const intervalId = setInterval(() => {
  //   if (new Date().getTime() >= endQuestionDate) {
  //     console.log("Time's up for question", room.currentQuestion?.id);
  //     clearInterval(intervalId);
  //     const questionId = room.currentQuestion?.id;
  //     const correctIndex = questionId ? correctAnswerIndex[room.code]?.[questionId] : undefined;

  //     io.to(room.code).emit("answerResult", {
  //       result: "wrong",
  //       correctAnswerIndex: correctIndex
  //     });
  //     setTimeout(() => {
  //       goToNextQuestion(io, room);
  //     }, 2000);
  //   }
  // }, room.timePerQuestion * 1000);
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

  const questionId = room.currentQuestion?.id;
  const correctIndex = questionId ? correctAnswerIndex[room.code]?.[questionId] : undefined;

  const roomScore = score[room.code] || {};
  if (answerIndex === correctIndex) {
    roomScore[socket.id] = (roomScore[socket.id] || 0) + 1;
  } else {
    roomScore[socket.id] = roomScore[socket.id] || 0;
  }
  score[room.code] = roomScore;
  if (Object.keys(room.answers).length >= room.players.length) {
    setTimeout(() => {
      const questionId = room.currentQuestion?.id;
      const correctIndex = questionId ? correctAnswerIndex[room.code]?.[questionId] : undefined;

      io.to(room.code).emit("answerResult", {
        result: answerIndex === correctIndex ? "correct" : "wrong",
        correctAnswerIndex: correctIndex
      });
    }, 1000);

    setTimeout(() => {
      goToNextQuestion(io, room);
    }, 2000);
  }
};

const goToNextQuestion = (io: Server, room: Room) => {
  const questionIndex = room.questions.indexOf(room.currentQuestion)
  if (questionIndex + 1 >= room.questions.length) {
    room.status = "finished";
    room.currentQuestion = undefined;

    const roomScore = score[room.code] || {};
    io.to(room.code).emit("gameFinished", room, roomScore);
    io.emit("activeRooms", Object.keys(rooms).length ?? 0);
    return;
  }

  room.currentQuestion = room.questions[questionIndex + 1];
  room.answers = {};

  io.to(room.code).emit("nextQuestion", room.currentQuestion);

  const endQuestionDate = (new Date().getTime() + room.timePerQuestion * 1000);
  // const intervalId = setInterval(() => {
  //   if (new Date().getTime() >= endQuestionDate) {
  //     console.log("Time's up for question", room.currentQuestion?.id);
  //     clearInterval(intervalId);
  //     const questionId = room.currentQuestion?.id;
  //     const correctIndex = questionId ? correctAnswerIndex[room.code]?.[questionId] : undefined;
  //     console.log("correctIndex:", correctIndex);

  //     io.to(room.code).emit("answerResult", {
  //       result: "wrong",
  //       correctAnswerIndex: correctIndex
  //     });
  //     console.log("Going to next question due to timeout");
  //     setTimeout(() => {
  //       goToNextQuestion(io, room);
  //     }, 2000);
  //   }
  // }, room.timePerQuestion * 1000);
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
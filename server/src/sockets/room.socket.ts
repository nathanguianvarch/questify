import { correctAnswerIndex } from "@/state/question.state";
import { emitActiveRooms, rooms } from "@/state/room.state";
import { score } from "@/state/score.state";
import { lockedRooms, questionTimers } from "@/state/timer.state";
import { AppServer, AppSocket } from "@/types/socket";
import { generateRandomQuestions } from "@/utils/game";
import { GameQuestion, Player, Room } from "shared";

type SocketContext = {
  io: AppServer;
  socket: AppSocket;
}

export const registerRoomSockets = async (io: AppServer, socket: AppSocket) => {
  socket.on("createRoom", createRoom({ io, socket }));
  socket.on("joinRoom", joinRoom({ io, socket }));
  socket.on("leaveRoom", leaveRoom({ io, socket }));
  socket.on("kickPlayer", kickPlayer({ io, socket }));
  socket.on("changeSettings", changeSettings({ io, socket }));

  socket.on("startGame", startGame({ io, socket }));
  socket.on("replayGame", replayGame({ io, socket }));
  socket.on("answerQuestion", answerQuestion({ io, socket }));
  socket.on("endGame", endGame({ io, socket }));

  socket.on("disconnect", () => disconnect({ io, socket }));
}

const BASE_POINTS = 1000;
const MIN_SPEED_MULTIPLIER = 0.5;

const computeAnswerPoints = (room: Room) => {
  if (room.settings.timePerQuestion === 0) return BASE_POINTS;

  const totalTimeMs = room.settings.timePerQuestion * 1000;
  const remainingMs = Math.max(
    0,
    Math.min(totalTimeMs, (room.currentQuestionEndsAt ?? Date.now()) - Date.now())
  );
  const speedRatio = totalTimeMs > 0 ? remainingMs / totalTimeMs : 0;
  const multiplier = MIN_SPEED_MULTIPLIER + (1 - MIN_SPEED_MULTIPLIER) * speedRatio;

  return Math.round(BASE_POINTS * multiplier);
};

const clearQuestionTimer = (roomCode: string) => {
  const timer = questionTimers[roomCode];
  if (timer) {
    clearTimeout(timer);
    delete questionTimers[roomCode];
  }
};

const startQuestionTimer = (io: AppServer, room: Room) => {
  clearQuestionTimer(room.code);
  lockedRooms.delete(room.code);

  if (room.settings.timePerQuestion === 0) {
    room.currentQuestionEndsAt = undefined;
    return undefined;
  }

  const endQuestionAt = new Date().getTime() + room.settings.timePerQuestion * 1000;
  room.currentQuestionEndsAt = endQuestionAt;

  questionTimers[room.code] = setTimeout(() => {
    revealAndAdvance(io, room);
  }, room.settings.timePerQuestion * 1000);

  return endQuestionAt;
};

const revealAndAdvance = (io: AppServer, room: Room) => {
  if (lockedRooms.has(room.code)) return;
  lockedRooms.add(room.code);
  clearQuestionTimer(room.code);

  const questionId = room.currentQuestion?.id;
  const correctIndex = questionId !== undefined ? correctAnswerIndex[room.code]?.[questionId] : undefined;
  const roomAnswers = room.answers ?? {};

  for (const player of room.players) {
    if (!player.socketId) continue;
    const playerAnswerIndex = roomAnswers[player.socketId];
    io.to(player.socketId).emit("answerResult", {
      result: playerAnswerIndex !== undefined && playerAnswerIndex === correctIndex ? "correct" : "wrong",
      correctAnswerIndex: correctIndex,
      playersAnswers: roomAnswers,
    });
  }

  setTimeout(() => {
    goToNextQuestion(io, room);
  }, 1000);
};

const stopQuestionTracking = (roomCode: string) => {
  clearQuestionTimer(roomCode);
  lockedRooms.delete(roomCode);
};

const createRoom = ({ io, socket }: SocketContext) => ({ player }: { player: Player }) => {
  const roomCode = Math.floor(1000 + Math.random() * 9000).toString();

  rooms[roomCode] = {
    code: roomCode,
    hostSocketId: socket.id,
    players: [{ ...player, socketId: socket.id }],
    status: "waiting",
    settings: {
      numberOfQuestions: 5,
      seats: 5,
      timePerQuestion: 15,
      isPrivate: true,
    },
  };

  emitActiveRooms(io);

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

  if (room.players.length >= room.settings.seats) {
    socket.emit("roomFull", roomCode);
    return;
  }
  const alreadyInRoom = room.players.some(
    (p) => p.socketId === socket.id
  );
  if (alreadyInRoom) return;

  room.players.push({ ...player, socketId: socket.id });
  socket.join(roomCode);

  io.to(roomCode).emit("roomUpdated", room);
  socket.emit("roomJoined", rooms[roomCode]);
  console.log(`${player.username} a rejoint la partie ${roomCode}`)
}

const kickPlayer = ({ io, socket }: SocketContext) => (roomCode: string, socketId: string) => {
  const room = rooms[roomCode];
  if (!room) return;
  if (room.hostSocketId !== socket.id) return;
  if (socketId === socket.id) return;

  const kickedPlayer = room.players.find((p) => p.socketId === socketId);
  if (!kickedPlayer) return;

  room.players = room.players.filter(
    (p) => p.socketId !== socketId
  );

  // Le joueur exclu quitte la room avant l'emit : il ne reçoit donc pas
  // "playerKicked", seulement "kicked".
  io.sockets.sockets.get(socketId)?.leave(roomCode);
  io.to(socketId).emit("kicked", roomCode);

  io.to(roomCode).emit("playerKicked", kickedPlayer);
  io.to(roomCode).emit("roomUpdated", room);
  emitActiveRooms(io);
}

const changeSettings = ({ io, socket }: SocketContext) => (
  { roomCode, settings }: { roomCode: string; settings: Partial<Room["settings"]> }
) => {
  const room = rooms[roomCode];
  if (!room) return;
  if (room.hostSocketId !== socket.id) return;

  room.settings = { ...room.settings, ...settings };

  io.to(roomCode).emit("roomUpdated", room);
  emitActiveRooms(io);
}

const leaveRoom = ({ io, socket }: SocketContext) => ({ roomCode }: { roomCode: string }) => {
  const room = rooms[roomCode];

  const leavingPlayer = room.players.find((p) => p.socketId === socket.id);

  room.players = room.players.filter(
    (p) => p.socketId !== socket.id
  );

  socket.leave(roomCode);

  if (room.hostSocketId === socket.id) {
    room.hostSocketId = room.players[0]?.socketId;
  }

  if (room.players.length === 0) {
    stopQuestionTracking(roomCode);
    delete rooms[roomCode];
  } else {
    if (leavingPlayer) {
      io.to(roomCode).emit("playerLeft", leavingPlayer);
    }
    io.to(roomCode).emit("roomUpdated", room);
  }

  emitActiveRooms(io);
  socket.emit("roomLeft", roomCode);

  console.log(`Socket ${socket.id} a quitté la partie ${roomCode}`);
}

const startGame = ({ io, socket }: SocketContext) => async (roomCode: string, numberOfQuestions: number) => {
  const room = rooms[roomCode]
  if (!room) return;
  if (room.hostSocketId !== socket.id) return;

  room.status = "in_progress"

  const questions: GameQuestion[] = await generateRandomQuestions(room, numberOfQuestions);

  room.questions = questions
  room.currentQuestion = room.questions[0]
  room.answers = {};

  for (const player of room.players) {
    if (!player.socketId) continue;
    score[room.code] = score[room.code] || {};
    score[room.code][player.socketId] = 0;
  }

  startQuestionTimer(io, room);

  io.to(roomCode).emit("roomUpdated", room)
}

const replayGame = ({ io, socket }: SocketContext) => (roomCode: string) => {
  const room = rooms[roomCode];
  if (!room) return;
  if (room.hostSocketId !== socket.id) return;

  stopQuestionTracking(roomCode);
  room.status = "waiting";
  room.questions = undefined;
  room.currentQuestion = undefined;
  room.currentQuestionEndsAt = undefined;
  room.answers = undefined;
  score[roomCode] = {};

  io.to(roomCode).emit("roomUpdated", room);
  emitActiveRooms(io);
}

const endGame = ({ io, socket }: SocketContext) => ({ roomCode }: { roomCode: string }) => {
  const room = rooms[roomCode]
  if (!room) return;
  stopQuestionTracking(roomCode);
  room.status = "finished"
  room.currentQuestion = undefined
  room.currentQuestionEndsAt = undefined

  io.to(roomCode).emit("gameEnded", room)
}

const answerQuestion = ({ io, socket }: SocketContext) => (
  { roomCode, answerIndex }: { roomCode: string; answerIndex: number }
) => {
  const room = rooms[roomCode];

  if (!room || !room.answers) return;
  if (lockedRooms.has(room.code)) return;

  if (room.answers[socket.id] !== undefined) return;

  room.answers[socket.id] = answerIndex;

  const questionId = room.currentQuestion?.id;
  const correctIndex = questionId !== undefined ? correctAnswerIndex[room.code]?.[questionId] : undefined;

  const roomScore = score[room.code] || {};
  if (answerIndex === correctIndex) {
    roomScore[socket.id] = (roomScore[socket.id] || 0) + computeAnswerPoints(room);
  } else {
    roomScore[socket.id] = roomScore[socket.id] || 0;
  }
  score[room.code] = roomScore;

  if (Object.keys(room.answers).length >= room.players.length) {
    clearQuestionTimer(room.code);
    setTimeout(() => {
      revealAndAdvance(io, room);
    }, 500);
  }
};

const goToNextQuestion = (io: AppServer, room: Room) => {
  if (!room.questions || !room.currentQuestion) return;
  const questionIndex = room.questions.indexOf(room.currentQuestion)
  if (questionIndex + 1 >= room.questions.length) {
    stopQuestionTracking(room.code);
    room.status = "finished";
    room.currentQuestion = undefined;
    room.currentQuestionEndsAt = undefined;

    const roomScore = score[room.code] || {};
    io.to(room.code).emit("gameFinished", room, roomScore);
    emitActiveRooms(io);
    return;
  }

  room.currentQuestion = room.questions[questionIndex + 1];
  room.answers = {};

  const endQuestionAt = startQuestionTimer(io, room);

  io.to(room.code).emit("nextQuestion", room.currentQuestion, endQuestionAt);
};

const disconnect = ({ io, socket }: SocketContext) => {
  for (const roomCode in rooms) {
    const room = rooms[roomCode];

    const leavingPlayer = room.players.find((p) => p.socketId === socket.id);
    if (!leavingPlayer) continue;

    room.players = room.players.filter(
      (p) => p.socketId !== socket.id
    );

    if (room.hostSocketId === socket.id) {
      room.hostSocketId = room.players[0]?.socketId;
    }

    if (room.players.length === 0) {
      stopQuestionTracking(roomCode);
      delete rooms[roomCode];
    } else {
      io.to(roomCode).emit("playerLeft", leavingPlayer);
      io.to(roomCode).emit("roomUpdated", room);
    }
  }

  emitActiveRooms(io);
}
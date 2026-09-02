import { AnswerState, GameQuestion, PlayerScore } from "./game";
import { Player } from "./player";
import { Room } from "./room";

export interface ServerToClientEvents {
  roomCreated: (room: Room) => void;
  roomUpdated: (room: Room) => void;
  roomJoined: (room: Room) => void;
  roomNotExists: (roomCode: string) => void;
  roomFull: (roomCode: string) => void;
  activeRooms: (activeRooms: Room[]) => void;

  answerResult: ({ result, correctAnswerIndex, playersAnswers }: { result: AnswerState, correctAnswerIndex: number | undefined, playersAnswers: Record<string, number> }) => void;
  nextQuestion: (question: GameQuestion, endQuestionAt: number | undefined) => void;
  gameFinished: (room: Room, score: PlayerScore) => void;

  roomLeft: (roomCode: string) => void;
  playerLeft: (player: Player) => void;
  playerKicked: (player: Player) => void;
  gameStarted: (room: Room) => void;
  gameEnded: (room: Room) => void;
  kicked: (roomCode: string) => void;
}

export interface ClientToServerEvents {
  createRoom: (payload: { player: Player }) => void;
  joinRoom: (payload: { roomCode: string; player: Player }) => void;
  leaveRoom: (payload: { roomCode: string; }) => void;
  kickPlayer: (roomCode: string, socketId: string) => void;
  startGame: (roomCode: string, numberOfQuestions: number) => void;
  replayGame: (roomCode: string) => void;
  answerQuestion: (payload: { roomCode: string, answerIndex: number }) => void;
  endGame: (payload: { roomCode: string }) => void;
  changeSettings: (payload: { roomCode: string; settings: Partial<Room["settings"]> }) => void;
  timeSync: (clientTime: number, callback: (serverTime: number) => void) => void;
}
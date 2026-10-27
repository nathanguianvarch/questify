import { Artist, Track } from "./game";

export type Player = {
  socketId?: string;
  username: string;
  cover?: string;
};

export type AnswerArtist = Artist & {
  type: "artist";
};
export type AnswerTrack = Track & {
  type: "track";
};

export type AnswerPlayer = Player & {
  type: "player";
};
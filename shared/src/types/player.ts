import { Artist, Track } from "./game";

export type Player = {
  socketId: string;
  email: string;
  username: string;
  cover: string;
  playerStats?: SpotifyPlayerStats;
};

export type SpotifyPlayerStats = {
  topArtists: AnswerArtist[];
  topTracks: AnswerTrack[];
}

export type AnswerArtist = Artist & {
  type: "artist";
};
export type AnswerTrack = Track & {
  type: "track";
};

export type AnswerPlayer = Player & {
  type: "player";
};
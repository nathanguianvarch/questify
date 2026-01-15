import { Artist, Track } from "./game";

export type Player = {
  socketId: string;
  email: string;
  username: string;
  cover: string;
  playerStats?: SpotifyPlayerStats;
};

export type SpotifyPlayerStats = {
  topArtists: {
    longTerm: AnswerArtist[];
    mediumTerm: AnswerArtist[];
    shortTerm: AnswerArtist[];
  };
  topTracks: {
    longTerm: AnswerTrack[];
    mediumTerm: AnswerTrack[];
    shortTerm: AnswerTrack[];
  };
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
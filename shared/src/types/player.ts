export type Player = {
  socketId: string;
  email: string;
  username: string;
  cover: string;
  playerStats?: SpotifyPlayerStats;
};

export type SpotifyPlayerStats = {
  topArtists: {
    type: "artist";
    id: string;
    name: string;
    cover: string;
    popularity: number;
  }[];
  topTracks: string[];
}
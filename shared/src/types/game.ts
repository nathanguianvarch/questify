import { Player } from "./player";

export type BaseGameQuestion = {
  id: number;
  type: "artist" | "player" | "track";
  /** Texte déjà rédigé, conservé comme repli si le client ne connaît pas la clé. */
  question: string;
  /** Clé i18n de l'énoncé, traduite côté client (`game.questions.<clé>`). */
  questionKey?: "track";
  playersAnswerState?: { [playerId: string]: AnswerState };
  previewTrack?: Track
};

export type AnswerState = "unanswered" | "answered" | "correct" | "wrong";

export type Artist = {
  id: string;
  name: string;
  cover: string;
  followers: number;
};

export type Track = {
  id: string;
  title: string;
  artists: { name: string }[];
  cover: string;
  previewUrl?: string;
};

export type Playlist = {
  id: string;
  title: string;
  cover: string;
};

export type Album = {
  id: string;
  title: string;
  artists: { name: string }[];
  cover: string;
};

/** Album ou playlist du catalogue Apple Music, tel qu'affiché dans le sélecteur de thème. */
export type MusicSourceItem = {
  type: "playlist" | "album";
  id: string;
  title: string;
  cover: string;
  /** Artistes pour un album, curateur pour une playlist. */
  subtitle?: string;
};

/** Rangée de recommandations (top charts, charts par genre, nouveautés...). */
export type MusicSection = {
  id: string;
  title: string;
  items: MusicSourceItem[];
};

export type MusicSearchResults = {
  playlists: MusicSourceItem[];
  albums: MusicSourceItem[];
};

export type ArtistQuestion = BaseGameQuestion & {
  type: "artist";
  answers: Artist[];
};

export type TrackQuestion = BaseGameQuestion & {
  type: "track";
  answers: Track[];
};

export type PlayerQuestion = BaseGameQuestion & {
  type: "player";
  answers: Player[];
};

export type GameQuestion = ArtistQuestion | TrackQuestion | PlayerQuestion;

export type PlayerScore = Record<string, number>
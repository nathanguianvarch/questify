import { musicKitApiUrl } from "@/utils/constants";
import { Album, MusicSourceItem, Playlist } from "shared";

/** Les identifiants de ressources dépendent de la boutique : on reste sur la même partout. */
export const STOREFRONT = "fr";

/** Langues supportées par la boutique française, utilisées pour traduire les titres renvoyés par Apple. */
const LANGUAGE_TAGS: Record<string, string> = {
  fr: "fr-FR",
  en: "en-GB",
};

type MusicKitArtwork = { url: string };

export type MusicKitAlbum = {
  id: string;
  attributes: { name: string; artistName: string; artwork?: MusicKitArtwork };
};

export type MusicKitPlaylist = {
  id: string;
  attributes: {
    name: string;
    artwork?: MusicKitArtwork;
    curatorName?: string;
  };
};

export const languageTag = (lang: unknown): string =>
  (typeof lang === "string" && LANGUAGE_TAGS[lang]) || LANGUAGE_TAGS.fr;

export const parseLimit = (limit: unknown, fallback: number, max: number): number => {
  const parsed = Number(limit);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.min(Math.floor(parsed), max);
};

const artworkUrl = (artwork?: MusicKitArtwork): string =>
  artwork?.url.replace("{w}", "600").replace("{h}", "600") ?? "";

export const mapAlbum = (album: MusicKitAlbum): Album => ({
  id: album.id,
  title: album.attributes.name,
  artists: album.attributes.artistName
    .split(" & ")
    .map((artist) => ({ name: artist })),
  cover: artworkUrl(album.attributes.artwork),
});

export const mapPlaylist = (playlist: MusicKitPlaylist): Playlist => ({
  id: playlist.id,
  title: playlist.attributes.name,
  cover: artworkUrl(playlist.attributes.artwork),
});

export const albumToItem = (album: MusicKitAlbum): MusicSourceItem => ({
  type: "album",
  id: album.id,
  title: album.attributes.name,
  cover: artworkUrl(album.attributes.artwork),
  subtitle: album.attributes.artistName,
});

export const playlistToItem = (playlist: MusicKitPlaylist): MusicSourceItem => ({
  type: "playlist",
  id: playlist.id,
  title: playlist.attributes.name,
  cover: artworkUrl(playlist.attributes.artwork),
  subtitle: playlist.attributes.curatorName,
});

/** Appelle l'API Apple Music sur la boutique française et renvoie le corps typé. */
export const musicKitFetch = async <T>(
  path: string,
  params: Record<string, string | number | undefined>,
): Promise<T> => {
  const token = process.env.MUSICKIT_DEVELOPER_TOKEN;
  if (!token) throw new Error("MUSICKIT_DEVELOPER_TOKEN manquant");

  const url = new URL(`${musicKitApiUrl}/catalog/${STOREFRONT}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  }

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(`Apple Music ${path} a répondu ${response.status}`);
  }
  return (await response.json()) as T;
};

type CacheEntry = { expiresAt: number; value: unknown };
const cache = new Map<string, CacheEntry>();

/** Les charts bougent peu : on garde les réponses en mémoire pour ne pas rappeler Apple à chaque ouverture de la modale. */
export const withCache = async <T>(
  key: string,
  ttlMs: number,
  compute: () => Promise<T>,
): Promise<T> => {
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.value as T;

  const value = await compute();
  cache.set(key, { expiresAt: Date.now() + ttlMs, value });
  return value;
};

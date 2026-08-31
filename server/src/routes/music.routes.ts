import {
  albumToItem,
  languageTag,
  MusicKitAlbum,
  MusicKitPlaylist,
  musicKitFetch,
  parseLimit,
  playlistToItem,
  withCache,
} from "@/utils/musicKit";
import express from "express";
import { MusicSearchResults, MusicSection, MusicSourceItem } from "shared";

export const musicRouter = express.Router();

type ChartsResponse = {
  results: {
    albums?: { name?: string; data: MusicKitAlbum[] }[];
    playlists?: { name?: string; data: MusicKitPlaylist[] }[];
  };
};

type SearchResponse = {
  results: {
    albums?: { data: MusicKitAlbum[] };
    playlists?: { data: MusicKitPlaylist[] };
  };
};

type GenresResponse = { data: { id: string; attributes: { name: string } }[] };

/** Genres grand public d'Apple Music, dans l'ordre où on veut les proposer. */
const FEATURED_GENRE_IDS = ["14", "18", "17", "21", "15", "7", "20", "11"];
const GENRE_SECTIONS = 6;
const RECOMMENDATIONS_TTL = 60 * 60 * 1000;
const SEARCH_TTL = 5 * 60 * 1000;

const fetchCharts = (
  language: string,
  limit: number,
  genre?: string,
): Promise<ChartsResponse> =>
  musicKitFetch<ChartsResponse>("/charts", {
    types: "playlists,albums",
    limit,
    genre,
    l: language,
  });

const chartsToItems = (charts: ChartsResponse, limit: number): MusicSourceItem[] => [
  ...(charts.results.playlists?.[0]?.data ?? []).map(playlistToItem),
  ...(charts.results.albums?.[0]?.data ?? []).map(albumToItem),
].filter((item) => item.cover).slice(0, limit);

/** Genres mis en avant qui existent réellement sur la boutique, avec leur nom traduit. */
const fetchFeaturedGenres = async (language: string) => {
  const genres = await musicKitFetch<GenresResponse>("/genres", { l: language });
  const byId = new Map(genres.data.map((genre) => [genre.id, genre.attributes.name]));

  const featured = FEATURED_GENRE_IDS.filter((id) => byId.has(id)).map((id) => ({
    id,
    name: byId.get(id) as string,
  }));

  // La boutique n'expose pas les identifiants attendus : on retombe sur ses premiers genres.
  if (featured.length < 3) {
    return genres.data
      .filter((genre) => genre.id !== "34")
      .slice(0, GENRE_SECTIONS)
      .map((genre) => ({ id: genre.id, name: genre.attributes.name }));
  }
  return featured.slice(0, GENRE_SECTIONS);
};

const buildRecommendations = async (
  language: string,
  limit: number,
): Promise<MusicSection[]> => {
  const [topCharts, genres] = await Promise.all([
    fetchCharts(language, limit),
    fetchFeaturedGenres(language).catch(() => []),
  ]);

  const genreCharts = await Promise.all(
    genres.map((genre) =>
      fetchCharts(language, limit, genre.id)
        .then((charts) => ({ genre, charts }))
        .catch(() => null),
    ),
  );

  const sections: MusicSection[] = [];

  const topPlaylists = (topCharts.results.playlists?.[0]?.data ?? [])
    .map(playlistToItem)
    .filter((item) => item.cover);
  if (topPlaylists.length) {
    sections.push({
      id: "top-playlists",
      title: topCharts.results.playlists?.[0]?.name ?? "Top playlists",
      items: topPlaylists,
    });
  }

  const topAlbums = (topCharts.results.albums?.[0]?.data ?? [])
    .map(albumToItem)
    .filter((item) => item.cover);
  if (topAlbums.length) {
    sections.push({
      id: "top-albums",
      title: topCharts.results.albums?.[0]?.name ?? "Top albums",
      items: topAlbums,
    });
  }

  // Les charts par genre reprennent souvent le haut du classement général : on évite les doublons.
  const seen = new Set(
    sections.flatMap((section) => section.items.map((item) => `${item.type}:${item.id}`)),
  );

  for (const entry of genreCharts) {
    if (!entry) continue;
    const items = chartsToItems(entry.charts, limit).filter(
      (item) => !seen.has(`${item.type}:${item.id}`),
    );
    if (items.length < 3) continue;
    items.forEach((item) => seen.add(`${item.type}:${item.id}`));
    sections.push({
      id: `genre-${entry.genre.id}`,
      title: entry.genre.name,
      items,
    });
  }

  return sections;
};

musicRouter.get("/recommendations", async (req, res) => {
  const language = languageTag(req.query.lang);
  const limit = parseLimit(req.query.limit, 20, 25);

  try {
    const sections = await withCache(
      `recommendations:${language}:${limit}`,
      RECOMMENDATIONS_TTL,
      () => buildRecommendations(language, limit),
    );
    res.json(sections);
  } catch (e) {
    res.status(502).json({
      error: e instanceof Error ? e.message : "Recommandations indisponibles",
    });
  }
});

musicRouter.get("/search", async (req, res) => {
  const { term } = req.query;
  if (typeof term !== "string" || term.trim().length === 0) {
    res.status(400).json({ error: "Missing term query param" });
    return;
  }

  const language = languageTag(req.query.lang);
  const limit = parseLimit(req.query.limit, 20, 25);
  const query = term.trim();

  try {
    const results = await withCache(
      `search:${language}:${limit}:${query.toLowerCase()}`,
      SEARCH_TTL,
      async () => {
        const response = await musicKitFetch<SearchResponse>("/search", {
          term: query,
          types: "albums,playlists",
          limit,
          l: language,
        });
        const searchResults: MusicSearchResults = {
          playlists: (response.results.playlists?.data ?? [])
            .map(playlistToItem)
            .filter((item) => item.cover),
          albums: (response.results.albums?.data ?? [])
            .map(albumToItem)
            .filter((item) => item.cover),
        };
        return searchResults;
      },
    );
    res.json(results);
  } catch (e) {
    res.status(502).json({
      error: e instanceof Error ? e.message : "Recherche indisponible",
    });
  }
});

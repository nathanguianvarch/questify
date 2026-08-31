import {
  languageTag,
  mapPlaylist,
  MusicKitPlaylist,
  musicKitFetch,
  parseLimit,
} from "@/utils/musicKit";
import express from "express";
import { Playlist } from "shared";

export const playlistRouter = express.Router()

playlistRouter.get("/most-played", async (req, res) => {
  const limit = parseLimit(req.query.limit, 20, 25)
  try {
    const result = await musicKitFetch<{
      results: { playlists: { data: MusicKitPlaylist[] }[] }
    }>("/charts", { types: "playlists", limit, l: languageTag(req.query.lang) })
    const playlists: Playlist[] = result.results.playlists[0].data.map(mapPlaylist)
    res.json(playlists)
  }
  catch (e) {
    res.status(502).json({
      error: e instanceof Error ? e.message : "Playlists indisponibles"
    })
  }
})

import {
  languageTag,
  mapAlbum,
  MusicKitAlbum,
  musicKitFetch,
  parseLimit,
} from "@/utils/musicKit";
import express from "express";
import { Album } from "shared";

export const albumRouter = express.Router()

albumRouter.get("/most-played", async (req, res) => {
  const limit = parseLimit(req.query.limit, 20, 25)
  try {
    const result = await musicKitFetch<{
      results: { albums: { data: MusicKitAlbum[] }[] }
    }>("/charts", { types: "albums", limit, l: languageTag(req.query.lang) })
    const albums: Album[] = result.results.albums[0].data.map(mapAlbum)
    res.json(albums)
  }
  catch (e) {
    res.status(502).json({
      error: e instanceof Error ? e.message : "Albums indisponibles"
    })
  }
})

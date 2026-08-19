import { musicKitApiUrl } from "@/utils/constants";
import express from "express";
import { Playlist } from "shared";

export const playlistRouter = express.Router()

type MusicKitPlaylist = {
  id: string;
  attributes: { name: string; artwork: { url: string } };
};

playlistRouter.get("/most-played", async (req, res) => {
  const { limit } = req.query
  try {
    const response = await fetch(`${musicKitApiUrl}/catalog/fr/charts?types=playlists&limit=${limit}`, {
      headers: {
        "Authorization": `Bearer ${process.env.MUSICKIT_DEVELOPER_TOKEN}`
      }
    })
    const result: { results: { playlists: { data: MusicKitPlaylist[] }[] } } = await response.json()
    const playlists: Playlist[] = result.results.playlists[0].data.map((playlist) => ({
      id: playlist.id,
      title: playlist.attributes.name,
      cover: playlist.attributes.artwork.url.replace("{w}", "600").replace("{h}", "600")
    }))
    res.json(playlists)
  }
  catch (e) {
    if (e instanceof Error) {
      throw new Error(e.message)
    }
  }
})

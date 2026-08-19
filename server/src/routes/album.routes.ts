import { musicKitApiUrl } from "@/utils/constants";
import express from "express";
import { Album } from "shared";

export const albumRouter = express.Router()

type MusicKitAlbum = {
  id: string;
  attributes: { name: string; artistName: string; artwork: { url: string } };
};

albumRouter.get("/most-played", async (req, res) => {
  const { limit } = req.query
  try {
    const response = await fetch(`${musicKitApiUrl}/catalog/fr/charts?types=albums&limit=${limit}`, {
      headers: {
        "Authorization": `Bearer ${process.env.MUSICKIT_DEVELOPER_TOKEN}`
      }
    })
    const result: { results: { albums: { data: MusicKitAlbum[] }[] } } = await response.json()
    const albums: Album[] = result.results.albums[0].data.map((album) => ({
      id: album.id,
      title: album.attributes.name,
      artists: album.attributes.artistName.split(" & ").map((artist) => ({
        name: artist
      })),
      cover: album.attributes.artwork.url.replace("{w}", "600").replace("{h}", "600")
    }))
    res.json(albums)
  }
  catch (e) {
    if (e instanceof Error) {
      throw new Error(e.message)
    }
  }
})

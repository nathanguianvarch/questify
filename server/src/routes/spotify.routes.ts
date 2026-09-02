import { requestArtistTopTracks, requestTrack } from '@/utils/spotify';
import 'dotenv/config';
import express from "express";
import { Artist } from 'shared';

export const spotifyRouter = express.Router()

const redirectionUri = "questify://login"
const spotifyAccountURL = "https://accounts.spotify.com"
export const spotifyApiURL = "https://api.spotify.com/v1"

const authHeader = "Basic " + Buffer
  .from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`)
  .toString("base64");

type SpotifyImage = { url: string };
type SpotifyArtistItem = { id: string; name: string; images: SpotifyImage[]; followers: { total: number } };
type SpotifyTrackItem = {
  id: string;
  name: string;
  artists: { id: string; name: string }[];
  album: { images: SpotifyImage[] };
};

spotifyRouter.get("/accesstoken", async (req, res) => {
  const code = req.query.code;
  if (typeof code !== "string") {
    res.status(400).json({ error: "Missing code query param" });
    return;
  }

  const bodyParams = new URLSearchParams();
  bodyParams.append('code', code);
  bodyParams.append('redirect_uri', redirectionUri);
  bodyParams.append('grant_type', 'authorization_code');

  const response = await fetch(`${spotifyAccountURL}/api/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": authHeader
    },
    body: bodyParams.toString()
  })
  res.status(response.status).json(await response.json());
})


spotifyRouter.get("/refreshtoken", async (req, res) => {
  const refreshToken = req.query.refresh_token;
  if (typeof refreshToken !== "string") {
    res.status(400).json({ error: "Missing refresh_token query param" });
    return;
  }

  const bodyParams = new URLSearchParams();
  bodyParams.append('grant_type', 'refresh_token');
  bodyParams.append('refresh_token', refreshToken);

  const response = await fetch(`${spotifyAccountURL}/api/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": authHeader
    },
    body: bodyParams.toString()
  })

  res.status(response.status).json(await response.json());
})

spotifyRouter.get("/me", async (req, res) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    res.status(401).json({ error: "Missing authorization header" });
    return;
  }

  const response = await fetch(`${spotifyApiURL}/me`, {
    method: "GET",
    headers: {
      "Authorization": authorization
    }
  })

  res.status(response.status).json(await response.json());
})

spotifyRouter.get("/me/top/tracks", async (req, res) => {
  const authorization = req.headers.authorization;
  const timeRange = req.query.time_range;
  const limit = req.query.limit;
  if (!authorization) {
    res.status(401).json({ error: "Missing authorization header" });
    return;
  }
  if (typeof timeRange !== "string" || typeof limit !== "string") {
    res.status(400).json({ error: "Missing time_range or limit query param" });
    return;
  }

  const url = new URL(`${spotifyApiURL}/me/top/tracks`);
  url.searchParams.append("time_range", timeRange);
  url.searchParams.append("limit", limit);

  const response = await fetch(url, {
    headers: {
      "Authorization": authorization
    }
  })

  if (response.ok) {
    const result: { items: SpotifyTrackItem[] } = await response.json();
    const tracks = result.items.map((item) => ({
      id: item.id,
      title: item.name,
      artists: item.artists,
      cover: item.album.images[0]?.url,
    }));
    res.json(tracks);
  } else {
    res.status(response.status).json(await response.json());
  }
})

spotifyRouter.get("/me/top/artists", async (req, res) => {
  const authorization = req.headers.authorization;
  const timeRange = req.query.time_range;
  const limit = req.query.limit;
  if (!authorization) {
    res.status(401).json({ error: "Missing authorization header" });
    return;
  }
  if (typeof timeRange !== "string" || typeof limit !== "string") {
    res.status(400).json({ error: "Missing time_range or limit query param" });
    return;
  }

  const url = new URL(`${spotifyApiURL}/me/top/artists`);
  url.searchParams.append("time_range", timeRange);
  url.searchParams.append("limit", limit);

  const response = await fetch(url, {
    headers: {
      "Authorization": authorization
    }
  })

  if (response.ok) {
    const result: { items: SpotifyArtistItem[] } = await response.json();

    const artists: Artist[] = result.items.map((item) => ({
      id: item.id,
      name: item.name,
      cover: item.images[0]?.url,
      followers: item.followers.total,
    }));
    res.json(artists);
  } else {
    res.status(response.status).json(await response.json());
  }
})

spotifyRouter.get("/tracks/:id", async (req, res) => {
  const authorization = req.headers.authorization;
  const { id } = req.params
  if (!authorization) {
    res.status(401).json({ error: "Missing authorization header" });
    return;
  }

  requestTrack(id, authorization)
    .then((track) => {
      res.json(track);
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
})

spotifyRouter.get("/artists/:id/top-tracks", async (req, res) => {
  const authorization = req.headers.authorization;
  const { id } = req.params
  if (!authorization) {
    res.status(401).json({ error: "Missing authorization header" });
    return;
  }

  requestArtistTopTracks(id, authorization)
    .then((tracks) => {
      res.json(tracks);
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
})

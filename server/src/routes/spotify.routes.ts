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

spotifyRouter.get("/accesstoken", async (req, res) => {
  const { code } = req.query

  const bodyParams = new URLSearchParams();
  bodyParams.append('code', code.toString());
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
  if (response.ok) {
    res.json(await response.json());
  } else {
    res.json(await response.json()).status(response.status);
  }
})


spotifyRouter.get("/refreshtoken", async (req, res) => {
  const { refresh_token } = req.query

  const bodyParams = new URLSearchParams();
  bodyParams.append('grant_type', 'refresh_token');
  bodyParams.append('refresh_token', refresh_token.toString());

  const response = await fetch(`${spotifyAccountURL}/api/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": authHeader
    },
    body: bodyParams.toString()
  })

  if (response.ok) {
    res.json(await response.json());
  } else {
    res.json(await response.json()).status(response.status);
  }
})

spotifyRouter.get("/me", async (req, res) => {
  const { authorization } = req.headers

  const response = await fetch(`${spotifyApiURL}/me`, {
    method: "GET",
    headers: {
      "Authorization": authorization
    }
  })

  if (response.ok) {
    res.json(await response.json());
  } else {
    res.json(await response.json()).status(response.status);
  }
})

spotifyRouter.get("/me/top/tracks", async (req, res) => {
  const { authorization } = req.headers
  const { time_range, limit } = req.query

  let url = new URL(`${spotifyApiURL}/me/top/tracks`);

  url.searchParams.append("time_range", time_range.toString());
  url.searchParams.append("limit", limit.toString());

  const response = await fetch(url, {
    headers: {
      "Authorization": authorization
    }
  })

  if (response.ok) {
    const result = await response.json();
    const tracks = result.items.map((item: any) => {
      return { id: item.id, title: item.name, artists: item.artists, cover: item.album.images[0].url };
    });
    res.json(tracks);
  } else {
    res.json(await response.json()).status(response.status);
  }
})

spotifyRouter.get("/me/top/artists", async (req, res) => {
  const { authorization } = req.headers
  const { time_range, limit } = req.query

  let url = new URL(`${spotifyApiURL}/me/top/artists`);

  url.searchParams.append("time_range", time_range.toString());
  url.searchParams.append("limit", limit.toString());

  const response = await fetch(url, {
    headers: {
      "Authorization": authorization
    }
  })

  if (response.ok) {
    const result = await response.json();

    const artists: Artist[] = result.items.map((item: any) => {
      return { id: item.id, name: item.name, cover: item.images[0].url, followers: item.followers.total };
    });
    res.json(artists);
  } else {
    res.json(await response.json()).status(response.status);
  }
})

spotifyRouter.get("/tracks/:id", async (req, res) => {
  const { authorization } = req.headers
  const { id } = req.params

  let url = new URL(`${spotifyApiURL}/tracks/${id}`);

  const response = await fetch(url, {
    headers: {
      "Authorization": authorization
    }
  })

  if (response.ok) {
    const result = await response.json();

    // const tracks: Track = result.items.map((item: any) => {
    //   return { id: item.id, title: item.name, artists: item.artists, cover: item.album.images[0].url };
    // });
    res.json({ id: result.id, title: result.name, artists: result.artists, cover: result.album.images[0].url });
  } else {
    res.json(await response.json()).status(response.status);
  }
})
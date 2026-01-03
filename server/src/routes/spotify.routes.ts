import 'dotenv/config';
import express from "express";

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
      return { id: item.id, title: item.name, artists: item.artists.map((artist: any) => artist.name), cover: item.album.images[0].url };
    });
    res.json(tracks);
  } else {
    res.json(await response.json()).status(response.status);
  }
})
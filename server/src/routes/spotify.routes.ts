import express from "express";

export const spotifyRouter = express.Router()

const redirectionUri = "questify://login"
const spotifyAccountURL = "https://accounts.spotify.com"

const authHeader = Buffer
  .from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`)
  .toString("base64");
const encodedCredentials = btoa(`${process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID}:${process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_SECRET}`);
export const authorizationHeader = `Basic ${authHeader}`;


spotifyRouter.post("/accesstoken", async (req, res) => {
  const { code } = req.params

  const bodyParams = new URLSearchParams();
  bodyParams.append('code', code);
  bodyParams.append('redirect_uri', redirectionUri);
  bodyParams.append('grant_type', 'authorization_code');

  const response = await fetch(`${spotifyAccountURL}/api/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": "Basic YzQ3ZGU0YjMwNjg2NGQ1NWIzNzA2NmJiNjk3NGYzNWQ6ODZhMWM1NzY0ODZhNDljMTgwZmE5MmNkZGYzYjljOGE="
    },
    body: bodyParams.toString()
  })

  if (response.ok) {
    res.json(await response.json());
    // const result = await response.json()
    // await SecureStore.setItemAsync("accessToken", result.access_token)
    // await SecureStore.setItemAsync("refreshToken", result.refresh_token)
    // await SecureStore.setItemAsync("expireTokenDate", (Date.now() + (result.expires_in * 1000)).toString())
    // await SecureStore.setItemAsync("scopeToken", result.scope)
    // return true
  } else {
    res.json(await response.json()).status(response.status);
  }
})
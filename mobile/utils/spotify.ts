import { makeRedirectUri } from "expo-auth-session";
import { router } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import { Alert } from "react-native";
import { Player } from "shared";

export const spotifyAccountURL = "https://accounts.spotify.com"
export const spotifyApiURL = "https://api.spotify.com/v1"
export const redirectionUri = makeRedirectUri({ scheme: "questify", path: "login" })

const encodedCredentials = btoa(`${process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID}:${process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_SECRET}`);
export const authorizationHeader = `Basic ${encodedCredentials}`;

export const requestAccessToken = async (code: string) => {
  const bodyParams = new URLSearchParams();
  bodyParams.append('code', code);
  bodyParams.append('redirect_uri', redirectionUri);
  bodyParams.append('grant_type', 'authorization_code');

  const response = await fetch(`${spotifyAccountURL}/api/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": authorizationHeader
    },
    body: bodyParams.toString()
  })

  if (response.ok) {
    const result = await response.json()
    await SecureStore.setItemAsync("accessToken", result.access_token)
    await SecureStore.setItemAsync("refreshToken", result.refresh_token)
    await SecureStore.setItemAsync("expireTokenDate", (Date.now() + (result.expires_in * 1000)).toString())
    await SecureStore.setItemAsync("scopeToken", result.scope)
    return true
  } else {
    console.log(response)
    Alert.alert("Erreur", "Une erreur est survenue")
    return new Error()
  }
}

const requestRefreshToken = async () => {
  const refreshToken = await SecureStore.getItemAsync("refreshToken")
  const expireTokenDate = await SecureStore.getItemAsync("expireTokenDate")

  if (!refreshToken || !expireTokenDate) return false
  if (Date.now() < parseInt(expireTokenDate)) return true

  const bodyParams = new URLSearchParams()
  bodyParams.append("grant_type", "refresh_token")
  bodyParams.append("refresh_token", refreshToken)

  const response = await fetch(`${spotifyAccountURL}/api/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": authorizationHeader
    },
    body: bodyParams.toString()
  })

  if (!response.ok) {
    console.log(await response.text())
    Alert.alert("Erreur", "Impossible de rafraîchir la session Spotify")
    return false
  }


  const result = await response.json()

  await SecureStore.setItemAsync("accessToken", result.access_token)

  if (result.refresh_token) {
    await SecureStore.setItemAsync("refreshToken", result.refresh_token)
  }

  await SecureStore.setItemAsync(
    "expireTokenDate",
    (Date.now() + result.expires_in * 1000).toString()
  )

  return true
}

export const requestAccountInformations = async (): Promise<Player> => {
  const spotifyUser = await fetchWithAuth(`${spotifyApiURL}/me`, {
    method: "GET",
  })
  return {
    username: spotifyUser.display_name, cover: spotifyUser.images[0].url, ...spotifyUser
  }
}

export const getAccessToken = async () => {
  return await SecureStore.getItemAsync("accessToken")
}

export const logout = async () => {
  await SecureStore.deleteItemAsync("accessToken")
  router.replace("/login")
}


export const requestPreviewSongAudio = async (id: string) => {
  const response = await fetch(`https://open.spotify.com/embed/track/${id}`)
  const result = await response.text()
  const previewUrl = result.split('"audioPreview":{"url":"')[1].split('"')[0]
  return previewUrl
}

export const requestSongInfos = async (id: string) => {
  const result = await fetchWithAuth(`${spotifyApiURL}/tracks/${id}`, {
    method: "GET",
  })
  const artists = []
  for (const artist of result.artists) {
    artists.push(artist.name)
  }
  return {
    cover: result.album.images[0].url,
    title: result.name,
    artist: artists.join(", ")
  }
}

export const fetchWithAuth = async (url: string, options: RequestInit) => {
  await requestRefreshToken()

  const accessToken = await SecureStore.getItemAsync("accessToken")
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Bearer ${accessToken}`
    }
  })
  const result = await response.json()
  if (response.ok) {
    return result
  } else {
    console.log(response)
    Alert.alert("Erreur", "Une erreur est survenue")
    return new Error()
  }
}
import { makeRedirectUri } from "expo-auth-session";
import { router } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import { Alert } from "react-native";

export const spotifyAccountURL = "https://accounts.spotify.com"
export const spotifyApiURL = "https://api.spotify.com/v1"
export const redirectionUri = makeRedirectUri({ scheme: "questify", path: "redirect" })

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
    await SecureStore.setItemAsync("expireTokenDate", (Date.now() + result.expires_in).toString())
    await SecureStore.setItemAsync("scopeToken", result.scope)
    return true
  } else {
    console.log(response)
    Alert.alert("Erreur", "Une erreur est survenue")
    return new Error()
  }
}

export const requestRefreshToken = async () => {
  const refreshToken = await SecureStore.getItemAsync("refreshToken")
  const expireTokenDate = await SecureStore.getItemAsync("expireTokenDate")
  if (refreshToken && expireTokenDate && parseInt(expireTokenDate) < Date.now()) {
    const bodyParams = new URLSearchParams();
    bodyParams.append('refresh_token', refreshToken);
    bodyParams.append('grant_type', 'refresh_token');

    const response = await fetch(`${spotifyAccountURL}/api/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: bodyParams.toString()
    })

    if (response.ok) {
      const result = await response.json()
      await SecureStore.setItemAsync("accessToken", result.access_token)
      await SecureStore.setItemAsync("refreshToken", result.refresh_token)
      await SecureStore.setItemAsync("expireTokenDate", (Date.now() + result.expires_in).toString())
      await SecureStore.setItemAsync("scopeToken", result.scope)
      return true
    } else {
      console.log(response)
      Alert.alert("Erreur", "Une erreur est survenue")
      return new Error()
    }
  }
}

export const requestAccountInformations = async () => {
  const response = await fetch(`${spotifyApiURL}/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Bearer ${await getAccessToken()}`
    },
  })
  if (response.ok) {
    return await response.json()
  } else {
    console.log(await response.json())
    Alert.alert("Erreur", "Une erreur est survenue")
    return new Error()
  }
}

export const getAccessToken = async () => {
  return await SecureStore.getItemAsync("accessToken")
}

export const logout = async () => {
  await SecureStore.deleteItemAsync("accessToken")
  router.replace("/spotify-connection")
}
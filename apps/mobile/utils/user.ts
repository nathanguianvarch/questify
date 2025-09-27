import {
  makeRedirectUri,
  useAuthRequest,
  ResponseType,
} from "expo-auth-session";
import * as SecureStore from 'expo-secure-store';
import { useEffect } from "react";

const SPOTIFY_CONFIG = {
  clientId: "0c23a449d0314d688b6f994cb011e191",
  clientSecret: "8eb01cdbbbbf473db1536a730bd818ed",
  redirectUri: makeRedirectUri({ scheme: "questify", path: "redirect" }),
  scopes: ["user-read-email", "playlist-modify-public"],
};

const discovery = {
  authorizationEndpoint: "https://accounts.spotify.com/authorize",
  tokenEndpoint: "https://accounts.spotify.com/api/token",
};


export const useSpotifyAuth = () => {

  const [authRequest, authResponse, promptAsync] = useAuthRequest(
    {
      responseType: ResponseType.Code,
      clientId: SPOTIFY_CONFIG.clientId,
      clientSecret: SPOTIFY_CONFIG.clientSecret,
      scopes: SPOTIFY_CONFIG.scopes,
      usePKCE: false,
      redirectUri: SPOTIFY_CONFIG.redirectUri,
      extraParams: {
      }
    },
    discovery
  );

  const saveTokenData = async (data: any) => {
    const expiration = Date.now() + data.expires_in;
    await SecureStore.setItemAsync("access_token", data.access_token);
    await SecureStore.setItemAsync("expiration", expiration.toString());
    await SecureStore.setItemAsync("refresh_token", data.refresh_token);
  };

  useEffect(() => {
    const getToken = async () => {
      if (authResponse && authResponse.type === "success") {
        const code = authResponse.params.code;
        console.log(code)
        const body = new URLSearchParams({
          grant_type: "authorization_code",
          code,
          client_id: SPOTIFY_CONFIG.clientId,
          client_secret: SPOTIFY_CONFIG.clientSecret,
          redirect_uri: SPOTIFY_CONFIG.redirectUri,
        });

        const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: body.toString(),
        });

        const data = await tokenResponse.json();
        const expiration = Date.now() + data.expires_in
        console.log(data)
        await saveTokenData(data);
      }
    };
    getToken();
  }, [authResponse]);

  const getUserData = async () => {
    const access_token = await SecureStore.getItemAsync("access_token");
    const headers: HeadersInit = {
      Authorization: "Bearer " + access_token
    }

    return null
  };

  const refreshToken = async () => {
    const refresh_token = await SecureStore.getItemAsync("refresh_token");
    const expiration = await SecureStore.getItemAsync("expiration");
    if (refresh_token && expiration && parseInt(expiration) < Date.now()) {
      const body = new URLSearchParams({
        grant_type: "refresh_token",
        client_id: SPOTIFY_CONFIG.clientId,
        client_secret: SPOTIFY_CONFIG.clientSecret,
        refresh_token: refresh_token,
      });

      const res = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      });
      const data = await res.json();
      const expiration = Date.now() + data.expires_in
      console.log(expiration)
      await saveTokenData(data);
    }
  }

  const isConnected = async () => {
    const access_token = await SecureStore.getItemAsync("access_token");
    const expiration = await SecureStore.getItemAsync("expiration");
    return !!access_token && expiration && parseInt(expiration) > Date.now();
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("access_token")
    await SecureStore.deleteItemAsync("expiration")
    await SecureStore.deleteItemAsync("refresh_token")
  }

  return {
    authRequest,
    promptAsync,
    isConnected,
    logout,
    getUserData
  };
};
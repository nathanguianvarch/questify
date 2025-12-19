import Button from "@/components/Button";
import {
  redirectionUri,
  requestAccessToken,
  spotifyAccountURL,
} from "@/utils/spotify";
import { useAuthRequest } from "expo-auth-session";
import { router } from "expo-router";
import { maybeCompleteAuthSession } from "expo-web-browser";
import { useEffect } from "react";
import { Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

maybeCompleteAuthSession();

export default function SpotifyConnection() {
  const [, response, promptAsync] = useAuthRequest(
    {
      clientId: process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID ?? "",
      clientSecret: process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_SECRET ?? "",
      scopes: ["user-read-email", "playlist-modify-public"],
      redirectUri: redirectionUri,
      usePKCE: false,
    },
    {
      authorizationEndpoint: `${spotifyAccountURL}/authorize`,
    }
  );
  useEffect(() => {
    const requestAccessTokenAsync = async () => {
      if (response) {
        if (response.type === "success") {
          if (await requestAccessToken(response.params.code)) {
            router.replace("/");
          }
        } else if (response.type === "error") {
          Alert.alert("Erreur", response.params.error);
        }
      }
    };
    requestAccessTokenAsync();
  }, [response]);
  return (
    <SafeAreaView className="flex-1 justify-center">
      <Button onClick={() => promptAsync()}>Se connecter à Spotify</Button>
    </SafeAreaView>
  );
}

import Button from "@/components/Button";
import { requestAccessToken, spotifyAccountURL } from "@/services/spotify";
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
      scopes: ["user-read-email", "playlist-modify-public", "user-top-read"],
      redirectUri: "questify://login",
      usePKCE: false,
      extraParams: {
        show_dialog: "true",
      },
    },
    {
      authorizationEndpoint: `${spotifyAccountURL}/authorize`,
    }
  );
  useEffect(() => {
    const requestAccessTokenAsync = async () => {
      if (response) {
        if (response.type === "success" && response.params.code) {
          if (await requestAccessToken(response.params.code)) {
            router.replace("/");
          }
        } else if (response.type === "error" && response.params.error) {
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

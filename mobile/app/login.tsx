import Button from "@/components/Button";
import { requestAccessToken, spotifyAccountURL } from "@/services/spotify";
import { useAuthRequest } from "expo-auth-session";
import { router } from "expo-router";
import { maybeCompleteAuthSession } from "expo-web-browser";
import { useEffect } from "react";
import { Alert, Image, Text, View } from "react-native";

maybeCompleteAuthSession();

export default function SpotifyConnection() {
  const [, response, promptAsync] = useAuthRequest(
    {
      clientId: process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID ?? "",
      scopes: ["user-read-email", "user-top-read"],
      redirectUri: "questify://login",
      usePKCE: false,
      extraParams: {
        show_dialog: "true",
      },
    },
    {
      authorizationEndpoint: `${spotifyAccountURL}/authorize`,
    },
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
    <View className="flex-1 justify-center">
      <View className="flex items-center gap-8">
        <View className="flex flex-col justify-center items-center gap-3">
          <Image
            source={require("@/assets/images/icon.png")}
            className="w-32 h-32"
          />

          <Text className="text-white text-5xl font-bold">Questify</Text>
        </View>
        <Button className="w-full" onClick={() => promptAsync()}>
          Se connecter à Spotify
        </Button>
      </View>
    </View>
  );
}

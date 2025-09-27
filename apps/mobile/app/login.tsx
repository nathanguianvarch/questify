import Button from "@/components/ui/button";
import { useSpotifyAuth } from "@/utils/user";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Login() {
  const { promptAsync } = useSpotifyAuth();
  return (
    <SafeAreaView>
      <Button text="Se connecter avec Spotify" onPress={promptAsync}></Button>
    </SafeAreaView>
  );
}

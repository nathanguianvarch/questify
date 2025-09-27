import Button from "@/components/ui/button";
import { useRouter } from "expo-router";
import { Alert, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function IndexPage() {
  const router = useRouter();
  return (
    <SafeAreaView>
      <Button
        text="Se connecter avec Spotify"
        onPress={() => router.push("/login")}
      ></Button>
    </SafeAreaView>
  );
}

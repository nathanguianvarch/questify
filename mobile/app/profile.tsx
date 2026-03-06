import Button from "@/components/Button";
import NavBar from "@/components/NavBar";
import { usePlayer } from "@/hooks/usePlayer";
import { logout } from "@/services/spotify";
import { router } from "expo-router";
import { ChevronLeft, User } from "lucide-react-native";
import { Image, Text, TouchableOpacity, View } from "react-native";

export default function Profile() {
  const player = usePlayer((s) => s.player);
  return (
    <View className="flex-1">
      <NavBar
        title="Profil"
        leftContent={
          <View className="flex-1 flex flex-row gap-5 items-center justify-end">
            <TouchableOpacity onPress={() => router.back()}>
              <ChevronLeft strokeWidth={2.7} size={30} color="#ffff" />
            </TouchableOpacity>
          </View>
        }
      />
      {player ? (
        <View className="flex gap-4 p-4">
          <View className="flex justify-center items-center gap-4">
            {player.cover ? (
              <Image
                className="h-32 w-32 rounded-full"
                source={{ uri: player.cover }}
              />
            ) : (
              <User color="#ffff" />
            )}
            <View className="flex items-center">
              <Text className="text-white font-semibold text-3xl">
                {player.username}
              </Text>
              <Text className="text-white/50">{player.email}</Text>
            </View>
          </View>
          <Button backgroundColor="error" onClick={logout}>
            Se déconnecter
          </Button>
        </View>
      ) : (
        <Text className="text-white">Chargement</Text>
      )}
    </View>
  );
}

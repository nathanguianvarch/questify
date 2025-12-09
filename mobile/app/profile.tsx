import Button from "@/components/Button";
import NavBar from "@/components/NavBar";
import { UserData } from "@/types/spotify";
import { logout, requestAccountInformations } from "@/utils/spotify";
import { router } from "expo-router";
import { ChevronLeft, User } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

export default function Profile() {
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const getUserData = async () => {
      setUserData(await requestAccountInformations());
    };
    getUserData();
  }, []);
  return (
    <View>
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
      {userData ? (
        <View className="flex gap-4 p-4">
          <View className="flex justify-center items-center gap-4">
            {userData.images ? (
              <Image
                className="h-32 w-32 rounded-full"
                source={{ uri: userData.images[0].url }}
              />
            ) : (
              <User color="#ffff" />
            )}
            <View className="flex items-center">
              <Text className="text-white font-semibold text-3xl">
                {userData.display_name}
              </Text>
              <Text className="text-white/50">{userData.email}</Text>
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

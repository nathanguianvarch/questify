import NavBar from "@/components/NavBar";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { usePlayer } from "@/hooks/usePlayer";
import { useRoom } from "@/hooks/useRoom";
import { router } from "expo-router";
import { useBottomTabBarHeight } from "expo-router/js-tabs";
import { deleteItemAsync, setItemAsync } from "expo-secure-store";
import { useEffect, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";

const SAVE_DELAY_MS = 100;

export default function Profile() {
  const tabBarHeight = useBottomTabBarHeight();
  const setPlayer = usePlayer((s) => s.setPlayer);
  const updatePlayer = usePlayer((s) => s.updatePlayer);
  const savedUsername = usePlayer((s) => s.player.username);
  const clearRoom = useRoom((s) => s.clearRoom);

  const [username, setUsername] = useState(savedUsername);
  const [lastSyncedUsername, setLastSyncedUsername] = useState(savedUsername);

  // Resynchronise quand le pseudo change ailleurs (chargement initial,
  // réinitialisation) sans écraser la saisie en cours.
  if (lastSyncedUsername !== savedUsername) {
    setLastSyncedUsername(savedUsername);
    if (username.trim() !== savedUsername) setUsername(savedUsername);
  }

  const trimmedUsername = username.trim();
  const isSaving = trimmedUsername !== "" && trimmedUsername !== savedUsername;

  // Enregistrement automatique une fois la frappe terminée.
  useEffect(() => {
    if (!isSaving) return;

    const timeout = setTimeout(async () => {
      await setItemAsync("username", trimmedUsername);
      updatePlayer({ username: trimmedUsername });
    }, SAVE_DELAY_MS);

    return () => clearTimeout(timeout);
  }, [isSaving, trimmedUsername, updatePlayer]);

  const resetData = () => {
    Alert.alert(
      "Réinitialiser mes données",
      "Ton pseudo sera supprimé et tu devras le choisir à nouveau. Continuer ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Réinitialiser",
          style: "destructive",
          onPress: async () => {
            await deleteItemAsync("username");
            setPlayer({ username: "", cover: "" });
            clearRoom();
            router.replace("/onboarding");
          },
        },
      ],
    );
  };

  const initial = trimmedUsername.charAt(0).toUpperCase() || "?";

  return (
    <View className="flex-1 bg-black">
      <NavBar title="Profil" />
      <ScrollView
        contentContainerClassName="p-5 gap-8"
        contentContainerStyle={{ paddingBottom: tabBarHeight + 20 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View className="items-center gap-3 pt-2">
          <View className="w-20 h-20 rounded-full bg-[#00D560]/15 border-2 border-[#00D560]/40 items-center justify-center">
            <Text className="text-[#00D560] text-3xl font-bold">{initial}</Text>
          </View>
          <Text className="text-white text-2xl font-bold">
            {username.trim()}
          </Text>
        </View>

        <View className="gap-3">
          <Text className="text-white/40 text-sm font-semibold uppercase tracking-wider px-1">
            Identité
          </Text>
          <View className="bg-[#141414] rounded-3xl p-4 gap-3">
            <Text className="text-white font-semibold text-lg">
              Nom d&apos;utilisateur
            </Text>
            <Input
              value={username}
              keyboard="default"
              onChangeText={(value) => setUsername(value)}
              maxLength={16}
            ></Input>
          </View>
        </View>

        <View className="gap-3">
          <Text className="text-white/40 text-sm font-semibold uppercase tracking-wider px-1">
            Données
          </Text>
          <View className="bg-[#FF6367]/10 border border-[#FF6367]/30 rounded-3xl p-4 gap-2">
            <Text className="text-white font-semibold text-lg">
              Réinitialiser mes données
            </Text>
            <Button
              backgroundColor="error"
              onClick={resetData}
              className="mt-1"
            >
              Réinitialiser
            </Button>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

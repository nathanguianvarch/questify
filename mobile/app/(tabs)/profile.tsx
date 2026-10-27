import NavBar from "@/components/NavBar";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import SegmentedControl from "@/components/ui/SegmentedControl";
import { usePlayer } from "@/hooks/usePlayer";
import { useRoom } from "@/hooks/useRoom";
import {
  isSupportedLanguage,
  LANGUAGE_LABELS,
  setLanguage,
  SUPPORTED_LANGUAGES,
} from "@/i18n";
import { router } from "expo-router";
import { useBottomTabBarHeight } from "expo-router/js-tabs";
import { deleteItemAsync, setItemAsync } from "expo-secure-store";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, ScrollView, Text, View } from "react-native";

const SAVE_DELAY_MS = 100;

export default function Profile() {
  const { t, i18n } = useTranslation();
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
    Alert.alert(t("profile.reset"), t("profile.resetConfirmation"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("profile.resetAction"),
        style: "destructive",
        onPress: async () => {
          await deleteItemAsync("username");
          setPlayer({ username: "", cover: "" });
          clearRoom();
          router.replace("/onboarding");
        },
      },
    ]);
  };

  const initial = trimmedUsername.charAt(0).toUpperCase() || "?";
  const currentLanguage = isSupportedLanguage(i18n.language)
    ? i18n.language
    : undefined;

  return (
    <View className="flex-1 bg-black">
      <NavBar title={t("profile.title")} />
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
            {t("profile.settings")}
          </Text>
          <View className="bg-[#141414] rounded-3xl px-4 gap-3">
            <View className="gap-2 py-4 border-b border-white/5">
              <Text className="text-white font-semibold text-lg">
                {t("profile.username")}
              </Text>
              <Input
                value={username}
                keyboard="default"
                onChangeText={(value) => setUsername(value)}
                maxLength={16}
              ></Input>
            </View>
            <View className="flex flex-row gap-2 items-center justify-between py-4">
              <Text className="text-white font-semibold text-lg">
                {t("profile.language")}
              </Text>
              <SegmentedControl
                options={[...SUPPORTED_LANGUAGES]}
                value={currentLanguage}
                getLabel={(language) => LANGUAGE_LABELS[language]}
                onChange={(language) => language && setLanguage(language)}
              />
            </View>
          </View>
        </View>

        <View className="gap-3">
          <Text className="text-white/40 text-sm font-semibold uppercase tracking-wider px-1">
            {t("profile.data")}
          </Text>
          <View className="bg-[#FF6367]/10 border border-[#FF6367]/30 rounded-3xl p-4 gap-2">
            <Text className="text-white font-semibold text-lg">
              {t("profile.reset")}
            </Text>
            <Button
              backgroundColor="error"
              onClick={resetData}
              className="mt-1"
            >
              {t("profile.resetAction")}
            </Button>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

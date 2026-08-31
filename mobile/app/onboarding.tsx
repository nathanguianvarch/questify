import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { usePlayer } from "@/hooks/usePlayer";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { setItemAsync } from "expo-secure-store";
import { ArrowRight } from "lucide-react-native";
import { View } from "moti";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Image, KeyboardAvoidingView, Platform, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Onboarding() {
  const { t } = useTranslation();
  const setPlayer = usePlayer((s) => s.setPlayer);
  const [username, setUsername] = useState("");
  const [saving, setSaving] = useState(false);
  const canContinue = username.trim().length > 0;

  const continueOnboarding = async () => {
    const trimmedUsername = username.trim();
    if (!trimmedUsername || saving) return;

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await setItemAsync("username", trimmedUsername);
    setPlayer({ username: trimmedUsername, cover: "" });
    router.replace("/");
  };

  return (
    <View className="flex-1 bg-black">
      <SafeAreaView edges={["top", "bottom"]} className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1"
        >
          <View className="flex-1 justify-center px-6 gap-10">
            <View className="items-center gap-6">
              <View
                from={{ opacity: 0, translateY: 24, scale: 0.9 }}
                animate={{ opacity: 1, translateY: 0, scale: 1 }}
                transition={{ type: "timing", duration: 500, delay: 0 }}
              >
                <Image
                  source={require("@/assets/images/icon.png")}
                  className="w-24 h-24 rounded-full"
                  resizeMode="contain"
                />
              </View>

              <View
                className="items-center gap-2"
                from={{ opacity: 0, translateY: 24 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: "timing", duration: 500, delay: 100 }}
              >
                <Text className="text-white text-4xl font-bold text-center">
                  {t("onboarding.title")}
                </Text>
                <Text className="text-white/50 text-lg font-semibold text-center">
                  {t("onboarding.subtitle")}
                </Text>
              </View>
            </View>

            <View className="gap-4">
              <View
                className="gap-2"
                from={{ opacity: 0, translateY: 24 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: "timing", duration: 500, delay: 200 }}
              >
                <Text className="text-white/60 text-lg font-semibold ml-1">
                  {t("onboarding.usernameLabel")}
                </Text>
                <Input
                  value={username}
                  onChangeText={setUsername}
                  placeholder={t("onboarding.usernamePlaceholder")}
                  maxLength={16}
                  autoFocus
                  autoCorrect={false}
                  onSubmitEditing={continueOnboarding}
                  className="bg-white/10 rounded-2xl px-5 py-4 text-2xl text-white font-semibold text-center"
                />
              </View>

              <View
                from={{ opacity: 0, translateY: 24 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: "timing", duration: 500, delay: 300 }}
              >
                <Button
                  disabled={!canContinue || saving}
                  onClick={continueOnboarding}
                  className="gap-2"
                >
                  <Text className="text-black text-2xl font-semibold">
                    {t("onboarding.start")}
                  </Text>
                  <ArrowRight color="black" size={22} />
                </Button>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

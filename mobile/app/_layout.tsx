import { COLORS } from "@/constants/theme";
import { restoreStoredLanguage } from "@/i18n";
import { setAudioModeAsync } from "expo-audio";
import { DarkTheme, Stack, ThemeProvider } from "expo-router";
import { CircleCheck, CircleX, Info, TriangleAlert } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Toaster } from "sonner-native";
import "../global.css";

export default function RootLayout() {
  const [languageReady, setLanguageReady] = useState(false);

  useEffect(() => {
    if (Platform.OS === "ios") {
      setAudioModeAsync({
        playsInSilentMode: true,
        interruptionMode: "doNotMix",
      });
    }
  }, []);

  useEffect(() => {
    restoreStoredLanguage().finally(() => setLanguageReady(true));
  }, []);

  if (!languageReady) return null;

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView>
        <ThemeProvider value={DarkTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="room" />
          </Stack>
          <Toaster
            theme="dark"
            position="top-center"
            closeButton={false}
            richColors={false}
            icons={{
              success: <CircleCheck color={COLORS.primary} size={20} />,
              error: <CircleX color={COLORS.error} size={20} />,
              info: <Info color={COLORS.info} size={20} />,
              warning: <TriangleAlert color={COLORS.warning} size={20} />,
            }}
            toastOptions={{
              style: {
                backgroundColor: COLORS.surface,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.1)",
                borderRadius: 16,
                paddingVertical: 12,
                paddingHorizontal: 16,
              },
              titleStyle: {
                color: COLORS.white,
                fontSize: 16,
                fontWeight: "600",
              },
              descriptionStyle: {
                color: "rgba(255,255,255,0.6)",
                fontSize: 14,
              },
            }}
          />
        </ThemeProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

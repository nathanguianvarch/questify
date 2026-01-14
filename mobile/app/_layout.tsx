import { getAccessToken } from "@/services/spotify";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { setAudioModeAsync } from "expo-audio";
import { router, SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === "ios") {
      setAudioModeAsync({
        playsInSilentMode: true,
        interruptionMode: "doNotMix",
      });
    }
  }, []);
  useEffect(() => {
    const isLogged = async () => {
      if (!(await getAccessToken())) {
        router.replace("/login");
      }
      SplashScreen.hideAsync();
    };
    isLogged();
  }, []);
  return (
    <ThemeProvider value={DarkTheme}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }} />
        <StatusBar />
      </SafeAreaProvider>
    </ThemeProvider>
  );
}

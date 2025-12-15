import { getAccessToken } from "@/utils/spotify";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { router, SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "../global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
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
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar />
    </ThemeProvider>
  );
}

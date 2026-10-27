import { useLobby } from "@/hooks/useLobby";
import { usePlayer } from "@/hooks/usePlayer";
import { router, useLocalSearchParams } from "expo-router";
import { getItemAsync } from "expo-secure-store";
import { useEffect, useRef } from "react";
import { ActivityIndicator, View } from "react-native";

export default function JoinRoomFromLink() {
  const { roomCode } = useLocalSearchParams<{ roomCode: string }>();
  const setPlayer = usePlayer((s) => s.setPlayer);
  const { joinRoom } = useLobby();
  const hasJoined = useRef(false);

  useEffect(() => {
    if (hasJoined.current || !roomCode) return;
    hasJoined.current = true;

    const join = async () => {
      const username = (await getItemAsync("username")) ?? "";
      if (!username) {
        router.replace("/onboarding");
        return;
      }
      setPlayer({ username });

      joinRoom(roomCode, { onFail: () => router.replace("/") });
    };
    join();
  }, [roomCode, setPlayer, joinRoom]);

  return (
    <View className="flex-1 bg-black items-center justify-center">
      <ActivityIndicator color="#ffffff" size="large" />
    </View>
  );
}

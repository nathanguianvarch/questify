import ActiveRoomRow from "@/components/ActiveRoomRow";
import NavBar from "@/components/NavBar";
import Bouton from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useLobby } from "@/hooks/useLobby";
import { usePlayer } from "@/hooks/usePlayer";
import { router } from "expo-router";
import { useBottomTabBarHeight } from "expo-router/js-tabs";
import { getItemAsync } from "expo-secure-store";
import { ArrowRight, Gamepad2 } from "lucide-react-native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, View } from "react-native";

export default function Index() {
  const { t } = useTranslation();
  const tabBarHeight = useBottomTabBarHeight();
  const [roomCode, setRoomCode] = useState("");
  const [pseudoChecked, setPseudoChecked] = useState(false);

  const setPlayer = usePlayer((s) => s.setPlayer);
  const player = usePlayer((s) => s.player);
  const { activeRooms, createRoom, joinRoom, isCreatingRoom, isJoiningRoom } =
    useLobby();
  const hasPseudo = !!player.username.trim();

  useEffect(() => {
    const loadPlayer = async () => {
      const username = (await getItemAsync("username")) ?? "";
      if (!username) {
        router.replace("/onboarding");
        return;
      }
      setPlayer({ username });
      setPseudoChecked(true);
    };
    loadPlayer();
  }, [setPlayer]);

  if (!pseudoChecked) return <View className="flex-1 bg-black" />;

  return (
    <View className="flex-1 bg-black">
      <NavBar
        title={t("lobby.title")}
        leftContent={
          <View className="bg-white/10 rounded-full flex flex-row gap-1.5 px-3 py-2 items-center">
            <Text className="text-white font-semibold text-center text-lg">
              {activeRooms.length}
            </Text>
            <Gamepad2 color="#ffff" size={24} />
          </View>
        }
      />
      <View className="flex-col gap-4 m-4">
        <View className="flex flex-row gap-2.5">
          <Input
            value={roomCode}
            placeholder="----"
            onChangeText={setRoomCode}
            maxLength={4}
            className="flex-1"
          />
          <Bouton
            onClick={() => joinRoom(roomCode)}
            disabled={roomCode.length !== 4 || !hasPseudo}
            loading={isJoiningRoom}
            accessibilityLabel={t("lobby.joinAccessibility")}
          >
            <ArrowRight className="mr-2" size={24} color="black" />
          </Bouton>
        </View>

        <Bouton
          onClick={createRoom}
          disabled={!hasPseudo}
          loading={isCreatingRoom}
        >
          {t("lobby.createRoom")}
        </Bouton>

        {!hasPseudo && (
          <Text className="text-white/50 text-lg font-semibold">
            {t("lobby.missingUsername")}
          </Text>
        )}

        <View className="flex flex-col gap-2">
          <Text className="text-white font-semibold text-xl">
            {t("lobby.publicRooms")}
          </Text>
          {activeRooms.length > 0 ? (
            <ScrollView
              className="h-full"
              contentContainerStyle={{ paddingBottom: tabBarHeight }}
              showsVerticalScrollIndicator={false}
            >
              <View className="flex flex-col gap-2">
                {activeRooms.map((room) => (
                  <ActiveRoomRow
                    key={room.code}
                    room={room}
                    onPress={() => joinRoom(room.code)}
                  />
                ))}
              </View>
            </ScrollView>
          ) : (
            <View className="bg-white/5 rounded-2xl p-6 items-center">
              <Text className="text-white/50 text-lg font-semibold text-center">
                {t("lobby.noPublicRoom")}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

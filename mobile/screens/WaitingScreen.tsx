import PlayerRow from "@/components/PlayerRow";
import SelectPlaylistModal from "@/components/SelectPlaylistModal";
import Button from "@/components/ui/Button";
import { useRoom } from "@/hooks/useRoom";
import { socket } from "@/hooks/useSocket";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Player, Room } from "shared";
import { toast } from "sonner-native";

export default function WaitingScreen({
  isHost,
  numberOfQuestions,
}: {
  isHost: boolean;
  numberOfQuestions: number;
}) {
  const { t } = useTranslation();
  const room = useRoom((s) => s.room);
  const [starting, setStarting] = useState(false);
  const [playlistModalVisible, setPlaylistModalVisible] = useState(false);
  const [musicSourceTitle, setMusicSourceTitle] = useState<string | null>(null);

  const startGame = async () => {
    if (room) {
      setStarting(true);
      socket.emit("startGame", room.code, numberOfQuestions);
    }
  };

  const managePlayer = (player: Player) => {
    if (isHost && room) {
      Alert.alert(player.username, "", [
        {
          text: t("room.kickPlayer"),
          style: "destructive",
          onPress: () => {
            if (!player.socketId) return;
            socket.emit("kickPlayer", room.code, player.socketId);
          },
        },
        {
          text: t("common.cancel"),
          style: "cancel",
        },
      ]);
    }
  };

  const inviteFriends = async () => {
    if (!room) return;
    try {
      await Share.share({
        url: `${process.env.EXPO_PUBLIC_SERVER_URL}/share/${room.code}`,
      });
    } catch {
      toast.error(t("room.shareFailed"));
    }
  };

  const handleChangeSettings = (settings: Partial<Room["settings"]>) => {
    if (!room) return;

    socket.emit("changeSettings", { roomCode: room.code, settings });
  };

  const handleSelectMusicSource = (
    musicSource: Room["settings"]["musicSource"],
    title?: string,
  ) => {
    setMusicSourceTitle(title ?? null);
    handleChangeSettings({ musicSource });
  };

  if (!room) return;
  return (
    <View className="m-4 flex-1 justify-between">
      <View className="gap-2 shrink">
        <Text className="text-white/40 text-sm font-semibold uppercase racking-wider px-1">
          {t("room.players")}
        </Text>
        <View className="bg-[#141414] rounded-3xl p-2 max-h-96">
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="flex flex-col gap-2">
              {room.players.map((value, index) => (
                <PlayerRow
                  key={index}
                  player={value}
                  isHost={value.socketId === room.hostSocketId}
                  disabled={!isHost || value.socketId === room.hostSocketId}
                  canManage={isHost && value.socketId !== room.hostSocketId}
                  onPress={() => managePlayer(value)}
                />
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
      <View className="flex gap-4">
        <View className="bg-[#141414] rounded-3xl px-4 py-4 gap-1 items-center">
          <Text className="text-white text-center text-xl font-semibold">
            {t("room.waitingForPlayers", {
              count: room.players.length,
              seats: room.settings.seats,
            })}
          </Text>
          <TouchableOpacity onPress={() => setPlaylistModalVisible(true)}>
            <Text className="text-white/50 text-center font-semibold text-base">
              {t("room.theme", {
                theme: room.settings.musicSource
                  ? t("settings.selectedTheme")
                  : t("settings.defaultTheme"),
              })}
            </Text>
          </TouchableOpacity>
        </View>
        <Button backgroundColor="info" onClick={inviteFriends}>
          {t("room.invite")}
        </Button>
        {isHost && (
          <Button onClick={startGame} loading={starting}>
            {t("room.start")}
          </Button>
        )}
      </View>
      <SelectPlaylistModal
        visible={playlistModalVisible}
        setVisible={setPlaylistModalVisible}
        selectedMusicSource={room.settings.musicSource}
        onSelect={handleSelectMusicSource}
      />
    </View>
  );
}

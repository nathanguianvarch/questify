import PlayerRow from "@/components/PlayerRow";
import Button from "@/components/ui/Button";
import { useRoom } from "@/hooks/useRoom";
import { socket } from "@/hooks/useSocket";
import { useState } from "react";
import { Alert, ScrollView, Share, Text, View } from "react-native";
import { Player } from "shared";
import { toast } from "sonner-native";

export default function WaitingScreen({
  isHost,
  numberOfQuestions,
}: {
  isHost: boolean;
  numberOfQuestions: number;
}) {
  const room = useRoom((s) => s.room);
  const [starting, setStarting] = useState(false);

  const startGame = async () => {
    if (room) {
      setStarting(true);
      socket.emit("startGame", room.code, numberOfQuestions);
    }
  };

  const managePlayer = (player: Player) => {
    if (isHost && room) {
      Alert.alert(`${player.username}`, "", [
        {
          text: "Expulser",
          style: "destructive",
          onPress: () => {
            if (!player.socketId) return;
            socket.emit("kickPlayer", room.code, player.socketId);
          },
        },
        {
          text: "Annuler",
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
      toast.error("Impossible de partager le lien d'invitation");
    }
  };

  if (!room) return;
  return (
    <View className="m-4 flex-1 justify-between">
      <View className="gap-2 shrink">
        <Text className="text-white/40 text-sm font-semibold uppercase racking-wider px-1">
          Joueurs
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
            En attente de joueurs : {room.players.length} / {room.settings.seats}
          </Text>
          <Text className="text-white/50 text-center font-semibold text-base">
            Thème : {room.settings.musicSource ? "Thème sélectionné" : "Tubes du moment"}
          </Text>
        </View>
        <Button backgroundColor="info" onClick={inviteFriends}>
          Inviter des amis
        </Button>
        {isHost && (
          <Button onClick={startGame} loading={starting}>
            Lancer la partie
          </Button>
        )}
      </View>
    </View>
  );
}

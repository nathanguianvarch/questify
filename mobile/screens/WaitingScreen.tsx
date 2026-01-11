import Button from "@/components/Button";
import { useRoom } from "@/hooks/useRoom";
import { socket } from "@/hooks/useSocket";
import { Crown } from "lucide-react-native";
import {
  Alert,
  Image,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Player } from "shared";

export default function WaitingScreen({ isHost }: { isHost: boolean }) {
  const room = useRoom((s) => s.room);

  const startGame = () => {
    if (room) {
      socket.emit("startGame", { roomCode: room.code });
    }
  };

  const managePlayer = (player: Player) => {
    if (isHost && room) {
      Alert.alert(`${player.username}`, "", [
        {
          text: "Expulser",
          style: "destructive",
          onPress: () => {
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
  if (!room) return;
  return (
    <View className="m-4 flex-1 justify-between">
      <ScrollView>
        <View className="flex flex-col gap-2">
          {room.players.map((value, index) => (
            <TouchableOpacity
              key={index}
              className="bg-white/10 rounded-3xl p-2 flex flex-row items-center justify-between"
              disabled={!isHost || value.socketId === room.hostSocketId}
              onPress={() => managePlayer(value)}
            >
              <View className="flex flex-row gap-3 items-center">
                <Image
                  className="w-14 h-14 rounded-full"
                  source={{ uri: value.cover }}
                />
                <Text className="text-white font-semibold text-xl">
                  {value.username}
                </Text>
              </View>
              {value.socketId === room.hostSocketId && (
                <View className="mr-2">
                  <Crown color="#FCC800" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <View className="flex gap-4">
        <Text className="text-white text-center text-xl font-semibold">
          En attente de joueurs : {room.players.length} / {room.seats}
        </Text>
        <Button
          backgroundColor="info"
          onClick={async () => {
            await Share.share({
              url: `${process.env.EXPO_PUBLIC_SERVER_URL}/share/${room.code}`,
            });
          }}
        >
          Inviter des amis
        </Button>
        {isHost && <Button onClick={startGame}>Lancer la partie</Button>}
      </View>
    </View>
  );
}

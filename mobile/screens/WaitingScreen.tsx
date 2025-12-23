import Button from "@/components/Button";
import { Crown } from "lucide-react-native";
import {
  Image,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Room } from "shared";

export default function WaitingScreen({
  room,
  isHost,
}: {
  room: Room;
  isHost: boolean;
}) {
  return (
    <View className="m-2 flex-1 justify-between mb-10">
      <ScrollView>
        <View className="flex flex-col gap-2">
          {room.players.map((value, index) => (
            <TouchableOpacity
              key={index}
              className="bg-white/10 rounded-3xl p-2 flex flex-row items-center justify-between"
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
          En attente de joueurs : {room.players.length} / 10
        </Text>
        <Button
          backgroundColor="info"
          onClick={async () => {
            await Share.share(
              {
                url: `http://localhost:3000/share/${room.code}`,
              },
              { dialogTitle: "Room" }
            );
          }}
        >
          Inviter des amis
        </Button>
        {isHost && <Button>Lancer la partie</Button>}
      </View>
    </View>
  );
}

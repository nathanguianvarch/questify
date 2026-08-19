import { Text, TouchableOpacity, View } from "react-native";
import { Room } from "shared";

type ActiveRoomRowProps = {
  room: Room;
  onPress: () => void;
};

export default function ActiveRoomRow({ room, onPress }: ActiveRoomRowProps) {
  const host = room.players.find((p) => p.socketId === room.hostSocketId);

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white/10 w-full p-4 rounded-2xl flex flex-row justify-between"
      accessibilityRole="button"
      accessibilityLabel={`Rejoindre la partie de ${host?.username ?? "un joueur"}`}
    >
      <View className="flex flex-row gap-1.5">
        <Text className="text-white font-semibold text-xl">
          {host?.username ?? "Partie"}
        </Text>
        <Text className="text-white font-semibold text-xl">-</Text>
        <Text className="text-white/60 font-semibold text-xl">
          {room.code}
        </Text>
      </View>
      <Text className="text-white/60 font-semibold text-xl">
        {room.players.length} / {room.settings.seats}
      </Text>
    </TouchableOpacity>
  );
}

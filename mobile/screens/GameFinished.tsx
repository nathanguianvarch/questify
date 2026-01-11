import Button from "@/components/Button";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
import { PlayerScore, Room } from "shared";

type GameFinishedProps = {
  room: Room;
  score: PlayerScore;
};

export default function GameFinished({ room, score }: GameFinishedProps) {
  return (
    <View className="m-4 flex-1 justify-between">
      <View></View>
      <View className="flex flex-col gap-4">
        <Text className="text-center text-white font-bold text-3xl">
          Résultats
        </Text>
        <View className="flex flex-col gap-2">
          {Object.entries(score).map(([playerId, playerScore]) => {
            const player = room.players.find((p) => p.socketId === playerId);
            return (
              <TouchableOpacity
                key={playerId}
                className="bg-white/10 rounded-3xl p-2 flex flex-row items-center justify-between"
                disabled={true}
              >
                <View className="flex flex-row gap-3 items-center">
                  <Image
                    className="w-14 h-14 rounded-full"
                    source={{ uri: player?.cover }}
                  />
                  <Text className="text-white font-semibold text-xl">
                    {player?.username}
                  </Text>
                </View>
                <View className="mr-2">
                  <Text className="text-white font-semibold text-xl">
                    {playerScore} point{playerScore !== 1 ? "s" : ""}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      <Button backgroundColor="info" onClick={() => Alert.alert("Bientôt")}>
        Rejouer
      </Button>
    </View>
  );
}

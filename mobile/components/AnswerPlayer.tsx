import { Image, Text, TouchableOpacity, View } from "react-native";
import { Player } from "shared";

type AnswerPlayerProps = {
  player: Player;
  state: "waiting" | "answered" | "correct" | "wrong";
  onPress?: () => void;
};

export default function AnswerPlayer({
  player,
  state,
  onPress,
}: AnswerPlayerProps) {
  let buttonStateStyle = "";
  if (state === "waiting") {
    buttonStateStyle = "bg-white/10";
  } else if (state === "answered") {
    buttonStateStyle = "bg-amber-600";
  } else if (state === "correct") {
    buttonStateStyle = "bg-green-600";
  } else if (state === "wrong") {
    buttonStateStyle = "bg-red-600";
  }
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`${buttonStateStyle} rounded-3xl p-2 flex flex-row items-center justify-between`}
    >
      <View className="flex flex-row gap-3 items-center">
        <Image
          className="w-14 h-14 rounded-full"
          source={{ uri: player.cover }}
        />
        <Text className="text-white font-semibold text-xl">
          {player.username}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

import { Image, Text, TouchableOpacity, View } from "react-native";
import { Player } from "shared";

type AnswerPlayerProps = {
  type: "player";
  data: Player;
};

type AnswerArtistProps = {
  type: "artist";
  data: any;
};

type AnswerProps = (AnswerPlayerProps | AnswerArtistProps) & {
  type: "player" | "artist";
  state: "waiting" | "answered" | "correct" | "wrong";
  onPress?: () => void;
};

export default function Answer({ type, data, state, onPress }: AnswerProps) {
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

  if (type === "artist") {
    return (
      <TouchableOpacity
        onPress={onPress}
        className={`${buttonStateStyle} rounded-3xl p-2 flex flex-row items-center justify-between`}
      >
        <View className="flex flex-row gap-3 items-center">
          <Image
            className="w-14 h-14 rounded-full"
            source={{ uri: data.cover }}
          />
          <View>
            <Text className="text-white font-semibold text-xl">
              {data.name}
            </Text>
            <Text className="text-white/50 font-semibold text-xl">
              {data.popularity}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  } else if (type === "player") {
    return (
      <TouchableOpacity
        onPress={onPress}
        className={`${buttonStateStyle} rounded-3xl p-2 flex flex-row items-center justify-between`}
      >
        <View className="flex flex-row gap-3 items-center">
          <Image
            className="w-14 h-14 rounded-full"
            source={{ uri: data.cover }}
          />
          <Text className="text-white font-semibold text-xl">
            {data.username}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }
  return <Text className="text-white">Null</Text>;
}

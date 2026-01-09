import * as Haptics from "expo-haptics";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { AnswerState, Artist, Player, Track } from "shared";

type AnswerByType = {
  artist: Artist;
  player: Player;
  track: Track;
};

type AnswerProps<T extends keyof AnswerByType> = {
  type: T;
  data: AnswerByType[T];
  state: AnswerState;
  onPress?: () => void;
};

export default function Answer<T extends keyof AnswerByType>({
  type,
  data,
  state,
  onPress,
}: AnswerProps<T>) {
  let buttonStateStyle = "";
  if (state === "unanswered") {
    buttonStateStyle = "bg-white/10";
  } else if (state === "answered") {
    buttonStateStyle = "bg-amber-600";
  } else if (state === "correct") {
    buttonStateStyle = "bg-green-600";
  } else if (state === "wrong") {
    buttonStateStyle = "bg-red-600";
  }

  if (type === "artist") {
    const artist = data as Artist;
    return (
      <TouchableOpacity
        onPress={() => {
          Haptics.selectionAsync();
          onPress?.();
        }}
        className={`${buttonStateStyle} rounded-3xl p-2 flex flex-row items-center justify-between`}
      >
        <View className="flex flex-row gap-3 items-center">
          <Image
            className="w-14 h-14 rounded-full"
            source={{ uri: data.cover }}
          />
          <View>
            <Text className="text-white font-semibold text-xl">
              {artist.name}
            </Text>
            <Text className="text-white/50 font-semibold text-xl">
              {artist.popularity}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  } else if (type === "player") {
    const player = data as Player;
    return (
      <TouchableOpacity
        onPress={() => {
          Haptics.selectionAsync();
          onPress?.();
        }}
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
  } else if (type === "track") {
    const track = data as Track;
    return (
      <TouchableOpacity
        onPress={() => {
          Haptics.selectionAsync();
          onPress?.();
        }}
        className={`${buttonStateStyle} rounded-3xl p-2 flex flex-row items-center justify-between overflow-hidden`}
      >
        <View className="flex flex-row gap-3 items-center">
          <Image
            className="rounded-2xl w-14 h-14"
            source={{ uri: track.cover }}
          />
          <View>
            <Text className="text-white font-semibold text-xl">
              {track.title}
            </Text>
            <Text className="text-white/50 font-semibold text-xl">
              {track.artists.map((artist) => artist.name).join(", ")}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
  return <Text className="text-white">Null</Text>;
}

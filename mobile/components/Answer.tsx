import { formatNumber } from "@/utils/format";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import { useTranslation } from "react-i18next";
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
  disabled?: boolean;
  players?: Player[];
};

const MAX_VISIBLE_AVATARS = 3;

function AnswerVoters({ players }: { players: Player[] }) {
  if (players.length === 0) return null;

  const visible = players.slice(0, MAX_VISIBLE_AVATARS);
  const overflow = players.length - visible.length;

  return (
    <View className="flex flex-row items-center shrink-0">
      {visible.map((voter, index) => {
        const initial = voter.username.trim().charAt(0).toUpperCase() || "?";
        return (
          <MotiView
            key={voter.socketId ?? index}
            from={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "timing", duration: 220, delay: index * 70 }}
            className={`w-6 h-6 rounded-full bg-[#1c1c1c] border-2 border-black items-center justify-center shrink-0 ${index > 0 ? "-ml-2" : ""}`}
          >
            <Text className="text-white text-[10px] font-bold">{initial}</Text>
          </MotiView>
        );
      })}
      {overflow > 0 && (
        <MotiView
          from={{ opacity: 0, scale: 0.4, translateY: 6 }}
          animate={{ opacity: 1, scale: 1, translateY: 0 }}
          transition={{
            type: "timing",
            duration: 220,
            delay: visible.length * 70,
          }}
          className="w-6 h-6 rounded-full bg-[#1c1c1c] border-2 border-black items-center justify-center shrink-0 -ml-2"
        >
          <Text className="text-white text-[10px] font-bold">+{overflow}</Text>
        </MotiView>
      )}
    </View>
  );
}

export default function Answer<T extends keyof AnswerByType>({
  type,
  data,
  state,
  onPress,
  disabled,
  players = [],
}: AnswerProps<T>) {
  const { t } = useTranslation();
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
        className={`${buttonStateStyle} rounded-3xl p-2 pr-3 flex flex-row items-center justify-between`}
        disabled={disabled}
      >
        <View className="flex flex-row gap-3 items-center flex-1 mr-2">
          <Image
            className="w-14 h-14 rounded-full"
            source={{ uri: data.cover }}
          />
          <View className="flex-1">
            <Text className="text-white font-bold text-xl" numberOfLines={1}>
              {artist.name}
            </Text>
            <Text
              className="text-white/50 font-semibold text-xl"
              numberOfLines={1}
            >
              {t("game.followers", { value: formatNumber(artist.followers) })}
            </Text>
          </View>
        </View>
        <AnswerVoters players={players} />
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
        className={`${buttonStateStyle} rounded-3xl p-2 pr-3 flex flex-row items-center justify-between`}
        disabled={disabled}
      >
        <View className="flex flex-row gap-3 items-center flex-1 mr-2">
          <Image
            className="w-14 h-14 rounded-full"
            source={{ uri: player.cover }}
          />
          <Text
            className="text-white font-bold text-xl flex-1"
            numberOfLines={1}
          >
            {player.username}
          </Text>
        </View>
        <AnswerVoters players={players} />
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
        className={`${buttonStateStyle} rounded-3xl p-2 pr-3 flex flex-row items-center justify-between`}
        disabled={disabled}
      >
        <View className="flex flex-row gap-3 items-center flex-1 mr-2">
          <Image
            className="rounded-2xl w-14 h-14"
            source={{ uri: track.cover }}
          />
          <View className="flex-1">
            <Text className="text-white font-bold text-xl" numberOfLines={1}>
              {track.title}
            </Text>
            <Text
              className="text-white/50 font-semibold text-xl"
              numberOfLines={1}
            >
              {track.artists.map((artist) => artist.name).join(", ")}
            </Text>
          </View>
        </View>
        <AnswerVoters players={players} />
      </TouchableOpacity>
    );
  }
  return <Text className="text-white">Null</Text>;
}

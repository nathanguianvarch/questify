import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";

type ScoreRowProps = {
  username: string;
  score: number;
  rank: number;
};

const MEDALS: Record<number, string> = {
  1: "🥇",
  2: "🥈",
  3: "🥉",
};

export default function ScoreRow({ username, score, rank }: ScoreRowProps) {
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      className="bg-white/10 rounded-3xl p-2 flex flex-row items-center justify-between"
      disabled={true}
    >
      <View className="flex flex-row gap-3 items-center h-14 ml-4">
        <Text className="text-white/50 font-semibold text-xl w-8">
          {MEDALS[rank] ?? rank}
        </Text>
        <Text className="text-white font-semibold text-xl">{username}</Text>
      </View>
      <View className="mr-2">
        <Text className="text-white font-semibold text-xl">
          {t("game.points", { count: score })}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

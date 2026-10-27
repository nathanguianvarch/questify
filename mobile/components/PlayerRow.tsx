import { ChevronRight, Crown } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";
import { Player } from "shared";

type PlayerRowProps = {
  player: Player;
  isHost: boolean;
  disabled?: boolean;
  canManage?: boolean;
  onPress?: () => void;
};

export default function PlayerRow({
  player,
  isHost,
  disabled,
  canManage = false,
  onPress,
}: PlayerRowProps) {
  const { t } = useTranslation();
  const initial = player.username.trim().charAt(0).toUpperCase() || "?";

  return (
    <TouchableOpacity
      className="bg-white/5 rounded-2xl p-2 pr-4 flex flex-row items-center justify-between"
      disabled={disabled}
      onPress={onPress}
      accessibilityRole={canManage ? "button" : undefined}
      accessibilityLabel={
        canManage
          ? t("room.managePlayer", { username: player.username })
          : player.username
      }
    >
      <View className="flex flex-row gap-3 items-center">
        <View className="w-11 h-11 rounded-full bg-[#00D560]/15 border border-[#00D560]/40 items-center justify-center">
          <Text className="text-[#00D560] text-base font-bold">{initial}</Text>
        </View>
        <Text className="text-white font-semibold text-lg">
          {player.username}
        </Text>
      </View>
      <View className="flex flex-row items-center gap-1">
        {isHost && <Crown color="#FCC800" size={20} />}
        {canManage && <ChevronRight color="rgba(255,255,255,0.3)" size={20} />}
      </View>
    </TouchableOpacity>
  );
}

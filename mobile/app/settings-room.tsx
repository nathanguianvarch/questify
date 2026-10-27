import NavBar from "@/components/NavBar";
import Button from "@/components/ui/Button";
import SegmentedControl from "@/components/ui/SegmentedControl";
import { COLORS } from "@/constants/theme";
import { useRoom } from "@/hooks/useRoom";
import { socket } from "@/hooks/useSocket";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";
import { Room } from "shared";
import SelectPlaylistModal from "../components/SelectPlaylistModal";

const numberOfQuestionsPossibility = [5, 10, 15];
const timePerQuestionPossibility = [10, 15, 20];
const visibilityPossibility = ["private", "public"] as const;

export default function SettingsPage() {
  const { t } = useTranslation();
  const room = useRoom((s) => s.room);
  const [playlistModalVisible, setPlaylistModalVisible] = useState(false);
  const [musicSourceTitle, setMusicSourceTitle] = useState<string | null>(null);

  const handleChangeSettings = (settings: Partial<Room["settings"]>) => {
    if (!room) return;

    socket.emit("changeSettings", { roomCode: room.code, settings });
  };

  const handleSelectMusicSource = (
    musicSource: Room["settings"]["musicSource"],
    title?: string,
  ) => {
    setMusicSourceTitle(title ?? null);
    handleChangeSettings({ musicSource });
  };

  if (!room) return;

  return (
    <>
      <NavBar
        title={t("settings.title")}
        leftContent={
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft height={28} width={28} color={COLORS.white} />
          </TouchableOpacity>
        }
      />
      <View className="bg-black flex-1">
        <View className="p-5 gap-3">
          <Text className="text-white/40 text-sm font-semibold uppercase tracking-wider px-1">
            {t("settings.section")}
          </Text>
          <View className="bg-[#141414] rounded-3xl px-4">
            <View className="flex flex-row justify-between items-center gap-3 py-4 border-b border-white/5">
              <View className="flex-1">
                <Text className="font-semibold text-white text-xl">
                  {t("settings.musicTheme")}
                </Text>
                <Text
                  className="text-white/50 font-semibold text-base"
                  numberOfLines={1}
                >
                  {room.settings.musicSource
                    ? (musicSourceTitle ?? t("settings.selectedTheme"))
                    : t("settings.defaultTheme")}
                </Text>
              </View>
              <Button
                size="small"
                backgroundColor="white/10"
                onClick={() => setPlaylistModalVisible(true)}
              >
                {t("settings.change")}
              </Button>
            </View>
            <View className="flex flex-row justify-between items-center py-4 border-b border-white/5">
              <Text className="font-semibold text-white text-xl">
                {t("settings.visibility")}
              </Text>
              <SegmentedControl
                options={[...visibilityPossibility]}
                value={room.settings.isPrivate ? "private" : "public"}
                getLabel={(option) => t(`settings.${option}`)}
                onChange={(visibility) =>
                  handleChangeSettings({ isPrivate: visibility === "private" })
                }
              />
            </View>
            <View className="flex flex-row justify-between items-center py-4 border-b border-white/5">
              <Text className="font-semibold text-white text-xl">
                {t("settings.numberOfQuestions")}
              </Text>
              <SegmentedControl
                options={numberOfQuestionsPossibility}
                value={room.settings.numberOfQuestions}
                onChange={(numberOfQuestions) =>
                  handleChangeSettings({ numberOfQuestions })
                }
              />
            </View>
            <View className="flex flex-row justify-between items-center py-4">
              <View className="flex-1">
                <Text className="font-semibold text-white text-xl">
                  {t("settings.timePerQuestion")}
                </Text>
              </View>
              <SegmentedControl
                options={timePerQuestionPossibility}
                value={
                  room.settings.timePerQuestion === 0
                    ? undefined
                    : room.settings.timePerQuestion
                }
                getLabel={(seconds) =>
                  t("settings.seconds", { count: seconds })
                }
                deselectable
                onChange={(timePerQuestion) =>
                  handleChangeSettings({
                    timePerQuestion: timePerQuestion ?? 0,
                  })
                }
              />
            </View>
          </View>
        </View>
        <SelectPlaylistModal
          visible={playlistModalVisible}
          setVisible={setPlaylistModalVisible}
          selectedMusicSource={room.settings.musicSource}
          onSelect={handleSelectMusicSource}
        />
      </View>
    </>
  );
}

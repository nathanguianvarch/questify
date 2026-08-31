import { COLORS } from "@/constants/theme";
import LeaveGameModal from "@/components/LeaveGameModal";
import NavBar from "@/components/NavBar";
import { useRoomSocket } from "@/hooks/useRoomSocket";
import { socket } from "@/hooks/useSocket";
import GameFinished from "@/screens/GameFinished";
import GameInProgress from "@/screens/GameInProgress";
import WaitingScreen from "@/screens/WaitingScreen";
import { router } from "expo-router";
import { LogOut, Settings } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RoomPage() {
  const { t } = useTranslation();
  const { room, score, leaveRoom } = useRoomSocket();
  const [leaveModalVisible, setLeaveModalVisible] = useState(false);

  const confirmLeaveRoom = () => {
    setLeaveModalVisible(false);
    leaveRoom();
  };

  if (!room) return;

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-black">
      <LeaveGameModal
        visible={leaveModalVisible}
        onCancel={() => setLeaveModalVisible(false)}
        onConfirm={confirmLeaveRoom}
      />
      <NavBar
        title={t("room.title", { code: room.code })}
        rightContent={
          <TouchableOpacity
            onPress={() => setLeaveModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel={t("room.leaveAccessibility")}
          >
            <LogOut height={28} width={28} color={COLORS.error} />
          </TouchableOpacity>
        }
        leftContent={
          room.status === "waiting" && room.hostSocketId === socket.id ? (
            <TouchableOpacity
              onPress={() => router.push("/settings-room")}
              accessibilityRole="button"
              accessibilityLabel={t("room.settingsAccessibility")}
            >
              <Settings height={28} width={28} color={COLORS.white} />
            </TouchableOpacity>
          ) : (
            <></>
          )
        }
      />
      {room.status === "waiting" ? (
        <WaitingScreen
          isHost={room.hostSocketId === socket.id}
          numberOfQuestions={room.settings.numberOfQuestions}
        />
      ) : room.status === "in_progress" ? (
        <GameInProgress room={room} />
      ) : room.status === "finished" ? (
        score && <GameFinished room={room} score={score} />
      ) : (
        ""
      )}
    </SafeAreaView>
  );
}

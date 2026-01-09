import LeaveGameModal from "@/components/LeaveGameModal";
import NavBar from "@/components/NavBar";
import { useRoom } from "@/hooks/useRoom";
import { socket } from "@/hooks/useSocket";
import GameFinished from "@/screens/GameFinished";
import GameInProgress from "@/screens/GameInProgress";
import WaitingScreen from "@/screens/WaitingScreen";
import { router } from "expo-router";
import { LogOut } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Alert, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PlayerScore, Room } from "shared";

export default function RoomPage() {
  const [score, setScore] = useState<PlayerScore | null>(null);

  const room = useRoom((s) => s.room);

  const updateRoom = useRoom((s) => s.updateRoom);
  const clearRoom = useRoom((s) => s.clearRoom);

  useEffect(() => {
    const onRoomUpdated = (room: Room) => {
      updateRoom(room);
    };

    socket.on("roomUpdated", onRoomUpdated);

    return () => {
      socket.off("roomUpdated", onRoomUpdated);
    };
  }, [updateRoom, room]);

  useEffect(() => {
    socket.once("gameStarted", (room) => {
      updateRoom(room);
    });
  }, [updateRoom]);

  useEffect(() => {
    const onDisconnect = () => {
      Alert.alert("Connexion perdue", "Tu as quitté la partie");
      router.replace("/");
    };

    socket.on("disconnect", onDisconnect);

    socket.once("gameFinished", (room, score) => {
      updateRoom(room);
      setScore(score);
      console.log(room, score);
    });

    return () => {
      socket.off("disconnect", onDisconnect);
      socket.off("gameFinished");
    };
  }, [room]);

  const leaveRoomDialog = async () => {
    Alert.alert(
      "Quitter la partie",
      "Voulez-vous vraiment quitter la partie ?",
      [
        {
          text: "Non",
          style: "cancel",
        },
        {
          text: "Oui",
          onPress: leaveRoom,
          style: "destructive",
        },
      ]
    );
  };

  const leaveRoom = async () => {
    socket.once("roomLeft", () => {
      clearRoom();
      router.push({
        pathname: "/",
      });
    });

    if (!room) return;

    socket.emit("leaveRoom", { roomCode: room.code });
  };

  if (!room) return;

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-black">
      <LeaveGameModal />
      <NavBar
        title={`Room ${room.code}`}
        rightContent={
          <TouchableOpacity onPress={leaveRoomDialog}>
            <LogOut height={28} width={28} color="#FF6367" />
          </TouchableOpacity>
        }
      />
      {room.status === "waiting" ? (
        <WaitingScreen room={room} isHost={room.hostSocketId === socket.id} />
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

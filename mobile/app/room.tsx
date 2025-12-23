import NavBar from "@/components/NavBar";
import { useRoom } from "@/hooks/useRoom";
import { socket } from "@/hooks/useSocket";
import WaitingScreen from "@/screens/WaitingScreen";
import { router } from "expo-router";
import { LogOut } from "lucide-react-native";
import { useEffect } from "react";
import { Alert, TouchableOpacity } from "react-native";
import { Room } from "shared";

export default function RoomPage() {
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
    const onDisconnect = () => {
      Alert.alert("Connexion perdue", "Tu as quitté la partie");
      router.replace("/");
    };

    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("disconnect", onDisconnect);
    };
  }, [room]);

  const leaveRoomDialog = async () => {
    Alert.alert("Voulez-vous vraiment quitter la partie ?", "", [
      {
        text: "Non",
        style: "cancel",
      },
      {
        text: "Oui",
        onPress: leaveRoom,
        style: "destructive",
      },
    ]);
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
    <>
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
      ) : (
        ""
      )}
    </>
  );
}

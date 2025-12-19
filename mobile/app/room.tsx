import Button from "@/components/Button";
import NavBar from "@/components/NavBar";
import { usePlayer } from "@/hooks/usePlayer";
import { useRoom } from "@/hooks/useRoom";
import { socket } from "@/hooks/useSocket";
import { Room } from "@/types/room";
import { router, useLocalSearchParams } from "expo-router";
import { Crown, LogOut } from "lucide-react-native";
import { useEffect } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function RoomPage() {
  const room = useRoom((s) => s.room);
  const isHost = room?.hostSocketId === socket.id;
  const params = useLocalSearchParams();

  const player = usePlayer((s) => s.player);
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
    console.log("leave");
    socket.once("roomLeft", () => {
      clearRoom();
      router.push({
        pathname: "/",
      });
    });

    socket.emit("leaveRoom", { roomCode: room?.code });
  };

  return (
    <>
      <NavBar
        title={`Room ${room?.code ?? params.roomCode ?? ""}`}
        rightContent={
          <TouchableOpacity onPress={leaveRoomDialog}>
            <LogOut height={28} width={28} color="#FF6367" />
          </TouchableOpacity>
        }
      />
      <View className="m-2 flex-1 justify-between mb-10">
        <ScrollView>
          <View className="flex flex-col gap-2">
            {room?.players.map((value, index) => (
              <TouchableOpacity
                key={index}
                className="bg-white/10 rounded-3xl p-2 flex flex-row items-center justify-between"
              >
                <View className="flex flex-row gap-3 items-center">
                  <Image
                    className="w-14 h-14 rounded-full"
                    source={{ uri: value.cover }}
                  />
                  <Text className="text-white font-semibold text-xl">
                    {value.username}
                  </Text>
                </View>
                {value.socketId === room.hostSocketId && (
                  <View className="mr-2">
                    <Crown color="#FCC800" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        <View className="flex gap-4">
          <Text className="text-white text-center text-xl font-semibold">
            En attente de joueurs : {room?.players.length} / 10
          </Text>
          <Button backgroundColor="info">Inviter des amis</Button>
          {isHost && <Button>Lancer la partie</Button>}
        </View>
      </View>
    </>
  );
}

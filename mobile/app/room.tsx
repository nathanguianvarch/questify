import Button from "@/components/Button";
import NavBar from "@/components/NavBar";
import { socket } from "@/hooks/useSocket";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Text, View } from "react-native";

export default function Room() {
  const [room, setRoom] = useState<any>(null);
  const isHost = room?.hostSocketId === socket.id;
  const params = useLocalSearchParams();

  useEffect(() => {
    const onRoomUpdated = (room: any) => {
      router.push({
        pathname: "/room",
        params: { roomCode: room.code },
      });
    };

    const onRoomNotFound = () => {
      Alert.alert("Room introuvable", "Aucune partie ne correspond à ce code");
    };

    socket.on("roomUpdated", onRoomUpdated);
    socket.on("roomNotFound", onRoomNotFound);

    return () => {
      socket.off("roomUpdated", onRoomUpdated);
      socket.off("roomNotFound", onRoomNotFound);
    };
  }, []);

  useEffect(() => {
    const onRoomCreated = (createdRoom: any) => {
      setRoom(createdRoom);
      console.log(createdRoom);
    };

    socket.on("roomCreated", onRoomCreated);

    return () => {
      socket.off("roomCreated", onRoomCreated);
    };
  }, []);

  useEffect(() => {
    const onDisconnect = () => {
      Alert.alert("Connexion perdue", "Tu as quitté la partie");
      router.replace("/");
    };

    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  useEffect(() => {
    if (params.roomCode) {
      socket.once("roomJoined", (joinedRoom: any) => {
        if (!joinedRoom) {
          Alert.alert(
            "Room introuvable",
            "Aucune partie ne correspond à ce code"
          );
          router.replace("/");
          return;
        }
        setRoom(joinedRoom);
      });

      socket.emit("joinRoom", { roomCode: params.roomCode });
    }
  }, [params.roomCode]);

  return (
    <View>
      <NavBar title={`Room ${room?.code ?? params.roomCode ?? ""}`} />
      {room?.players.map((p: any, index: any) => (
        <Text key={index}>Joueur {index + 1}</Text>
      ))}
      {isHost && <Button>Lancer la partie</Button>}
    </View>
  );
}

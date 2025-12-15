import Input from "@/components/Input";
import NavBar from "@/components/NavBar";
import { UserData } from "@/types/spotify";
import { requestServer } from "@/utils/server";
import { requestAccountInformations } from "@/utils/spotify";
import { router } from "expo-router";
import { CircleAlert, User } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import Bouton from "../components/Button";
import { socket } from "../hooks/useSocket";

const createRoom = () => {
  socket.once("roomCreated", (room: any) => {
    router.push({
      pathname: "/room",
      params: { roomCode: room.code },
    });
  });

  socket.emit("createRoom");
};

export default function Index() {
  const [refreshing, setRefreshing] = useState(false);
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);
  const [roomCode, setRoomCode] = useState("");
  const [userData, setUserData] = useState<UserData | null>(null);

  const joinRoom = () => {
    if (!roomCode) {
      Alert.alert("Erreur", "Veuillez entrer un code de room");
      return;
    }

    socket.once("roomJoined", (room: any) => {
      if (!room) {
        Alert.alert("Erreur", "La room n'existe pas ou n'a pas pu être jointe");
        return;
      }

      router.push({
        pathname: "/room",
        params: { roomCode: room.code },
      });
    });

    socket.emit("joinRoom", { roomCode });
  };

  const getServerStatus = async () => {
    setRefreshing(true);
    setServerOnline(await requestServer());
    setRefreshing(false);
  };

  useEffect(() => {
    const getUserData = async () => {
      setUserData(await requestAccountInformations());
    };
    getUserData();
    getServerStatus();
  }, []);

  useEffect(() => {
    socket.on("connect", () => console.log("connected"));
  }, []);
  return (
    <View className="bg-black">
      <NavBar
        title="Accueil"
        leftContent={
          <View>
            {serverOnline === null ? (
              <ActivityIndicator />
            ) : !serverOnline ? (
              <TouchableOpacity
                onPress={() => Alert.alert("Erreur", "Serveurs offline")}
              >
                <CircleAlert strokeWidth={2.7} size={30} color="#FF6367" />
              </TouchableOpacity>
            ) : (
              ""
            )}
          </View>
        }
        rightContent={
          <View className="flex-1 flex flex-row gap-5 items-center justify-end">
            {userData && (
              <TouchableOpacity
                className="border border-white/20 rounded-full"
                onPress={() => router.push("/profile")}
              >
                {userData.images ? (
                  <Image
                    className="h-10 w-10 rounded-full"
                    source={{ uri: userData.images[0].url }}
                  />
                ) : (
                  <User color="#ffff" />
                )}
              </TouchableOpacity>
            )}
          </View>
        }
      />
      <ScrollView className="h-full">
        <RefreshControl refreshing={refreshing} onRefresh={getServerStatus} />
        <View className="flex gap-4 m-4">
          <View className="flex gap-2.5">
            <Input
              value={roomCode}
              onChangeText={(value) => setRoomCode(value)}
            ></Input>
            <Bouton onClick={joinRoom}>Rejoindre une partie</Bouton>
          </View>
          <Bouton onClick={createRoom}>Créer une partie</Bouton>
        </View>
      </ScrollView>
    </View>
  );
}

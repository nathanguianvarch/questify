import Input from "@/components/Input";
import NavBar from "@/components/NavBar";
import { usePlayer } from "@/hooks/usePlayer";
import { useRoom } from "@/hooks/useRoom";
import { requestServer } from "@/utils/server";
import { requestAccountInformations, requestTopArtists } from "@/utils/spotify";
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
import { Room } from "shared";
import Bouton from "../components/Button";
import { socket } from "../hooks/useSocket";

export default function Index() {
  const [refreshing, setRefreshing] = useState(false);
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);
  const [roomCode, setRoomCode] = useState("");

  const setPlayer = usePlayer((s) => s.setPlayer);
  const player = usePlayer((s) => s.player);

  const setRoom = useRoom((s) => s.setRoom);

  const createRoom = async () => {
    socket.once("roomCreated", (room: Room) => {
      setRoom(room);
      router.push({
        pathname: "/room",
      });
    });

    if (!player) return;

    setRefreshing(true);
    player.playerStats!.topArtists = await requestTopArtists("long_term", 5);
    setRefreshing(false);
    console.log(player);
    socket.emit("createRoom", { player });
  };

  const joinRoom = async () => {
    if (!roomCode) {
      Alert.alert("Erreur", "Veuillez entrer un code de room");
      return;
    }
    if (!player) return;

    socket.once("roomJoined", (room: Room) => {
      if (!room) {
        Alert.alert("Erreur", "La room n'existe pas ou n'a pas pu être jointe");
        return;
      }

      setRoom(room);
      router.push({
        pathname: "/room",
        params: { roomCode: room.code },
      });
    });

    socket.emit("joinRoom", { roomCode, player });
  };

  const getServerStatus = async () => {
    setRefreshing(true);
    setServerOnline(await requestServer());
    setRefreshing(false);
  };

  useEffect(() => {
    const getPlayerData = async () => {
      const playerInformations = await requestAccountInformations();
      const playerStats = {
        topArtists: await requestTopArtists("long_term", 5),
      };
      setPlayer({ ...playerInformations, playerStats });
    };
    getPlayerData();
    getServerStatus();
  }, [setPlayer]);

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
            {player && (
              <TouchableOpacity
                className="border border-white/20 rounded-full"
                onPress={() => router.push("/profile")}
              >
                {player.cover ? (
                  <Image
                    className="h-10 w-10 rounded-full"
                    source={{ uri: player.cover }}
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
              maxLength={4}
            ></Input>
            <Bouton onClick={joinRoom}>Rejoindre une partie</Bouton>
          </View>
          <Bouton onClick={createRoom}>Créer une partie</Bouton>
        </View>
      </ScrollView>
    </View>
  );
}

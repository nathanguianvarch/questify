import Input from "@/components/Input";
import NavBar from "@/components/NavBar";
import { usePlayer } from "@/hooks/usePlayer";
import { useRoom } from "@/hooks/useRoom";
import {
  logout,
  requestAccountInformations,
  requestTopArtists,
  requestTopTracks,
} from "@/services/spotify";
import { router } from "expo-router";
import { ArrowRight, CircleAlert, User } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Player, Room } from "shared";
import Bouton from "../components/Button";
import { socket } from "../hooks/useSocket";

export default function Index() {
  const [refreshing, setRefreshing] = useState(false);
  const [connected, setConnected] = useState(socket.connected);
  const [roomCode, setRoomCode] = useState("");
  const [activeRoomsNumber, setActiveRoomsNumber] = useState(0);

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
    socket.emit("createRoom", { player });
  };

  const joinRoom = async () => {
    if (!roomCode) {
      Alert.alert("Erreur", "Veuillez entrer un code de room");
      return;
    }
    if (!player) return;

    socket.once("roomFull", (room: Room) => {
      Alert.alert("Erreur", `La room ${roomCode} est pleine`);
      return;
    });
    socket.once("roomNotExists", (room: Room) => {
      Alert.alert("Erreur", `La room ${roomCode} n'existe pas`);
      return;
    });

    socket.once("roomJoined", (room: Room) => {
      setRoom(room);
      router.push({
        pathname: "/room",
        params: { roomCode: room.code },
      });
    });

    socket.emit("joinRoom", { roomCode, player });
  };

  useEffect(() => {
    const getPlayerData = async () => {
      const playerInformations = await requestAccountInformations();
      const playerStats: Player["playerStats"] = {
        topArtists: {
          longTerm: await requestTopArtists("long_term", 5),
          mediumTerm: await requestTopArtists("medium_term", 5),
          shortTerm: await requestTopArtists("short_term", 5),
        },
        topTracks: {
          longTerm: await requestTopTracks("long_term", 5),
          mediumTerm: await requestTopTracks("medium_term", 5),
          shortTerm: await requestTopTracks("short_term", 5),
        },
      };
      setPlayer({
        ...playerInformations,
        playerStats,
        cover: playerInformations.cover,
      });
    };
    getPlayerData();
  }, [setPlayer]);

  useEffect(() => {
    setConnected(socket.connected);
    socket.on("activeRooms", (activeRooms: number) => {
      setActiveRoomsNumber(activeRooms);
    });
  }, []);

  useEffect(() => {
    socket.on("connect", () => console.log("connected"));
  }, []);
  return (
    <View>
      <NavBar
        title="Accueil"
        leftContent={
          <View>
            {refreshing ? (
              <ActivityIndicator />
            ) : connected ? (
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
            {player ? (
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
            ) : (
              <TouchableOpacity onPress={logout}>
                <ActivityIndicator />
              </TouchableOpacity>
            )}
          </View>
        }
      />
      <ScrollView className="h-full">
        <RefreshControl refreshing={refreshing} />
        <View className="flex-col gap-4 my-4 mx-2">
          <View className="flex flex-col">
            <View className="bg-white/10 rounded-full px-4 py-2">
              <Text className="text-white font-semibold text-center text-xl">
                {activeRoomsNumber} partie{activeRoomsNumber > 1 ? "s" : ""} en
                cours
              </Text>
            </View>
          </View>
          <View className="flex gap-4">
            <View className="flex flex-row gap-2.5">
              <Input
                value={roomCode}
                placeholder="----"
                onChangeText={(value) => setRoomCode(value)}
                maxLength={4}
                className="flex-1"
              ></Input>
              <Bouton onClick={joinRoom} disabled={roomCode.length !== 4}>
                <ArrowRight className="mr-2" size={24} color="black" />
              </Bouton>
            </View>
            <Bouton onClick={createRoom}>Créer une partie</Bouton>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { PlayerScore } from "shared";
import { toast } from "sonner-native";
import { useRoom } from "./useRoom";
import { socket } from "./useSocket";
import { useSocketEvent } from "./useSocketEvent";

export function useRoomSocket() {
  const { t } = useTranslation();
  const [score, setScore] = useState<PlayerScore | null>(null);

  const room = useRoom((s) => s.room);
  const updateRoom = useRoom((s) => s.updateRoom);
  const clearRoom = useRoom((s) => s.clearRoom);

  useSocketEvent("roomUpdated", (room) => {
    // Ne réinitialise le score que pour une nouvelle partie (retour à
    // "waiting"), sinon un joueur qui quitte pendant l'écran de résultats
    // efface le score affiché et laisse l'écran noir.
    if (room.status === "waiting") {
      setScore(null);
    }
    updateRoom(room);
  });

  useSocketEvent("playerLeft", (player) => {
    toast.info(t("room.playerLeft", { username: player.username }));
  });

  useSocketEvent("playerKicked", (player) => {
    toast.info(t("room.playerKicked", { username: player.username }));
  });

  useSocketEvent("gameStarted", (room) => {
    updateRoom(room);
  });

  useSocketEvent("gameFinished", (room, score) => {
    updateRoom(room);
    setScore(score);
  });

  useSocketEvent("disconnect", () => {
    router.replace("/");
  });

  useSocketEvent("kicked", () => {
    clearRoom();
    router.replace("/");
  });

  const leaveRoom = () => {
    socket.once("roomLeft", () => {
      clearRoom();
      router.replace({
        pathname: "/",
      });
    });

    if (!room) return;

    socket.emit("leaveRoom", { roomCode: room.code });
  };

  return { room, score, leaveRoom };
}

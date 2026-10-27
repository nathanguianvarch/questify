import { router } from "expo-router";
import { Room } from "shared";
import { toast } from "sonner-native";
import { usePlayer } from "./usePlayer";
import { useRoom } from "./useRoom";
import { socket } from "./useSocket";
import { useSocketEvent } from "./useSocketEvent";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const CREATE_ROOM_TIMEOUT_MS = 8000;

export function useLobby() {
  const { t } = useTranslation();
  const [activeRooms, setActiveRooms] = useState<Room[]>([]);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);

  const player = usePlayer((s) => s.player);
  const setRoom = useRoom((s) => s.setRoom);

  useSocketEvent("activeRooms", (rooms) => {
    setActiveRooms(rooms);
  });

  const goToRoom = (room: Room) => {
    setRoom(room);
    router.replace({ pathname: "/room" });
  };

  const requirePseudo = () => {
    if (!player.username.trim()) {
      toast.error(t("lobby.errors.missingUsername"));
      router.push("/profile");
      return false;
    }
    return true;
  };

  const createRoom = () => {
    if (!requirePseudo()) return;
    if (isCreatingRoom) return;

    setIsCreatingRoom(true);

    const onRoomCreated = (room: Room) => {
      clearTimeout(timeout);
      setIsCreatingRoom(false);
      goToRoom(room);
    };

    const timeout = setTimeout(() => {
      socket.off("roomCreated", onRoomCreated);
      setIsCreatingRoom(false);
      toast.error(t("lobby.errors.createFailed"));
    }, CREATE_ROOM_TIMEOUT_MS);

    socket.once("roomCreated", onRoomCreated);
    socket.emit("createRoom", { player });
  };

  const joinRoom = (code: string, options?: { onFail?: () => void }) => {
    if (!code) {
      toast.error(t("lobby.errors.missingCode"));
      return;
    }
    if (!requirePseudo()) return;
    if (!player) return;
    if (isJoiningRoom) return;

    setIsJoiningRoom(true);

    const cleanup = () => {
      clearTimeout(timeout);
      setIsJoiningRoom(false);
      socket.off("roomFull", onRoomFull);
      socket.off("roomNotExists", onRoomNotExists);
      socket.off("roomJoined", onRoomJoined);
    };

    const onRoomFull = (fullRoomCode: string) => {
      cleanup();
      toast.error(t("lobby.errors.roomFull", { code: fullRoomCode }));
      options?.onFail?.();
    };

    const onRoomNotExists = (missingRoomCode: string) => {
      cleanup();
      toast.error(t("lobby.errors.roomNotFound", { code: missingRoomCode }));
      options?.onFail?.();
    };

    const onRoomJoined = (room: Room) => {
      cleanup();
      goToRoom(room);
    };

    const timeout = setTimeout(() => {
      cleanup();
      toast.error(t("lobby.errors.joinFailed"));
      options?.onFail?.();
    }, CREATE_ROOM_TIMEOUT_MS);

    socket.once("roomFull", onRoomFull);
    socket.once("roomNotExists", onRoomNotExists);
    socket.once("roomJoined", onRoomJoined);

    socket.emit("joinRoom", { roomCode: code, player });
  };

  return {
    activeRooms,
    createRoom,
    joinRoom,
    isCreatingRoom,
    isJoiningRoom,
  };
}

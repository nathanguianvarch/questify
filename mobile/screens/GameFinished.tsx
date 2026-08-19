import Confetti from "@/components/Confetti";
import ScoreRow from "@/components/ScoreRow";
import Button from "@/components/ui/Button";
import { socket } from "@/hooks/useSocket";
import { Text, View } from "react-native";
import { PlayerScore, Room } from "shared";

type GameFinishedProps = {
  room: Room;
  score: PlayerScore;
};

export default function GameFinished({ room, score }: GameFinishedProps) {
  const isHost = room.hostSocketId === socket.id;

  const topScore = Math.max(...Object.values(score));
  const ownScore = socket.id !== undefined ? score[socket.id] : undefined;
  const isWinner = ownScore !== undefined && ownScore === topScore;

  const replayGame = () => {
    socket.emit("replayGame", room.code);
  };

  return (
    <View className="m-4 flex-1 justify-between">
      <Confetti active={isWinner} />
      <View></View>
      <View className="flex flex-col gap-4">
        <Text className="text-center text-white font-bold text-3xl">
          Résultats
        </Text>
        <View className="flex flex-col gap-2">
          {Object.entries(score)
            .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
            .map(([playerId, playerScore], index) => {
              const player = room.players.find((p) => p.socketId === playerId);
              if (!player) return null;
              return (
                <ScoreRow
                  key={playerId}
                  username={player.username}
                  score={playerScore}
                  rank={index + 1}
                />
              );
            })}
        </View>
      </View>
      {isHost ? (
        <Button backgroundColor="info" onClick={replayGame}>
          Rejouer
        </Button>
      ) : (
        <Text className="text-center text-white/50 font-semibold text-lg">
          En attente de l&apos;hôte pour relancer une partie
        </Text>
      )}
    </View>
  );
}

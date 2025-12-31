import AnswerPlayer from "@/components/AnswerPlayer";
import { socket } from "@/hooks/useSocket";
import type { AudioPlayer } from "expo-audio";
import { createAudioPlayer } from "expo-audio";
import * as Haptics from "expo-haptics";
import { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Player, Room } from "shared";

export default function GameInProgress({ room }: { room: Room }) {
  const [answer, setAnswer] = useState<Player | null>(null);
  const [questionStatus, setQuestionStatus] = useState<"waiting" | "result">(
    "waiting"
  );

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  const playerRef = useRef<AudioPlayer | null>(null);
  const audioCache = useRef<Map<string, AudioPlayer>>(new Map());
  const currentAudioUrl = useRef<string | null>(null);

  const QUESTION_DURATION = 15;
  const [timeLeft, setTimeLeft] = useState(QUESTION_DURATION);

  useEffect(() => {
    if (!room.currentQuestion) return;

    setTimeLeft(QUESTION_DURATION);

    (async () => {
      try {
        const audioUrl = room.currentQuestion?.audioUrl;
        if (!audioUrl) return;

        if (currentAudioUrl.current === audioUrl) return;
        currentAudioUrl.current = audioUrl;

        if (playerRef.current) {
          playerRef.current.pause();
          playerRef.current = null;
        }

        let player = audioCache.current.get(audioUrl);

        if (!player) {
          player = createAudioPlayer({ uri: audioUrl });
          audioCache.current.set(audioUrl, player);
        }

        playerRef.current = player;
        player.play();
      } catch (error) {
        console.warn("Erreur audio :", error);
      }
    })();

    opacity.value = 0;
    translateY.value = 20;

    opacity.value = withTiming(1, {
      duration: 400,
      easing: Easing.out(Easing.ease),
    });
    translateY.value = withTiming(0, {
      duration: 400,
      easing: Easing.out(Easing.ease),
    });

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      if (playerRef.current) {
        playerRef.current.pause();
        playerRef.current = null;
      }
    };
  }, [opacity, room.currentQuestion, translateY]);

  useEffect(() => {
    if (!room.questions) return;

    room.questions.forEach((q) => {
      if (!q.audioUrl) return;
      if (audioCache.current.has(q.audioUrl)) return;

      try {
        const player = createAudioPlayer({ uri: q.audioUrl });
        audioCache.current.set(q.audioUrl, player);
      } catch (e) {
        console.warn("Préchargement audio échoué", e);
      }
    });
  }, [room.questions]);

  useEffect(() => {
    return () => {
      audioCache.current.forEach((player) => {
        player.pause();
      });
      audioCache.current.clear();
    };
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const answerQuestion = (value: Player) => {
    setAnswer(value);
    Haptics.selectionAsync();
    socket.emit("answerQuestion", {
      roomCode: room.code,
      answerIndex: room.currentQuestion!.answers.indexOf(value),
    });
    // socket.once("answerReceived", () => {

    // });
  };

  if (!room.currentQuestion) return null;

  return (
    <Animated.View className="m-2 flex-1 justify-between" style={animatedStyle}>
      <Text className="text-center text-white font-bold text-3xl">
        {room.currentQuestion.question}
      </Text>
      <View className="p-2">
        {room.currentQuestion.answers.map((value, index) => (
          <AnswerPlayer
            key={index}
            player={value}
            onPress={() => answerQuestion(value)}
            state={
              answer === null
                ? "waiting"
                : questionStatus === "result" &&
                    index === room.currentQuestion?.correctAnswer
                  ? "correct"
                  : "wrong"
            }
          />
        ))}
      </View>
      <View className="p-2 bg-white/10 mb-10">
        <Text className="text-white text-center text-xl font-bold">
          ⏱️ {timeLeft}s
        </Text>
      </View>
    </Animated.View>
  );
}

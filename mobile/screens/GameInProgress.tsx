import Answer from "@/components/Answer";
import { usePlayer } from "@/hooks/usePlayer";
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
import { AnswerState, GameQuestion, Room } from "shared";

export default function GameInProgress({ room }: { room: Room }) {
  const [answerIndex, setAnswerIndex] = useState<number | null>(null);
  const [questionState, setQuestionState] = useState<AnswerState>("unanswered");

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const player = usePlayer((s) => s.player);

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

  const answerQuestion = (value: GameQuestion["answers"][number]) => {
    if (!room.currentQuestion) return;
    Haptics.selectionAsync();
    setQuestionState("answered");
    const answerIndex = currentQuestion.answers.findIndex(
      (answer) => answer === value
    );
    setAnswerIndex(answerIndex);
    socket.emit("answerQuestion", {
      roomCode: room.code,
      answerIndex,
    });
    socket.once("answerResult", ({ result }) => {
      console.log(result);
      setQuestionState(result);
    });
    socket.once("nextQuestion", (question) => {
      setQuestionState("unanswered");
      setAnswerIndex(null);
      room.currentQuestion = question;
    });
  };

  if (!room.currentQuestion || !player) return null;
  const currentQuestion = room.currentQuestion;
  return (
    <Animated.View className="m-2 flex-1 justify-between" style={animatedStyle}>
      <View>
        <Text className="text-center text-white font-bold text-3xl">
          {currentQuestion.question}
        </Text>
        <Text className="text-white/50 text-center text-xl font-bold">
          {timeLeft}s
        </Text>
      </View>
      <View className="p-2 flex gap-3">
        {currentQuestion.answers.map((value, index) => (
          <Answer
            key={index}
            type={currentQuestion.type}
            data={value}
            onPress={() => answerQuestion(value)}
            state={answerIndex === index ? questionState : "unanswered"}
          />
        ))}
      </View>
      <View className="p-2 bg-white/10 rounded-3xl"></View>
    </Animated.View>
  );
}

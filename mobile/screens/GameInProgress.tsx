import Answer from "@/components/Answer";
import { usePlayer } from "@/hooks/usePlayer";
import { socket } from "@/hooks/useSocket";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import Animated, { useSharedValue } from "react-native-reanimated";
import { AnswerState, GameQuestion, Room } from "shared";

export default function GameInProgress({ room }: { room: Room }) {
  const [answerIndex, setAnswerIndex] = useState<number | null>(null);
  const [questionState, setQuestionState] = useState<AnswerState>("unanswered");

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const player = usePlayer((s) => s.player);

  const QUESTION_DURATION = 15;
  const [timeLeft, setTimeLeft] = useState(QUESTION_DURATION);

  useEffect(() => {
    if (!room.currentQuestion) return;

    setTimeLeft(QUESTION_DURATION);
  }, [opacity, room.currentQuestion, translateY]);

  const answerQuestion = (value: GameQuestion["answers"][number]) => {
    if (!room.currentQuestion) return;
    if (questionState === "answered") return;
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
      setQuestionState(result);
      if (result === "correct") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
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
    <Animated.View className="m-4 flex-1 justify-between">
      <View>
        <Text className="text-white/50 text-center text-xl font-bold">
          Question {room.questions!.indexOf(currentQuestion) + 2} sur{" "}
          {room.questions!.length}
        </Text>
        <Text className="mx-2 text-white font-bold text-3xl">
          {currentQuestion.question}
        </Text>
      </View>
      <View className="flex gap-3">
        {currentQuestion.answers.map((value, index) => (
          <Answer
            key={index}
            type={currentQuestion.type}
            data={value}
            onPress={() => answerQuestion(value)}
            state={answerIndex === index ? questionState : "unanswered"}
            disabled={answerIndex !== null}
          />
        ))}
      </View>
      <View className="p-2 bg-white/10 rounded-3xl">
        <Text className="text-white/50 text-center text-xl font-bold">
          {timeLeft}s
        </Text>
      </View>
    </Animated.View>
  );
}

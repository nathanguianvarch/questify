import Answer from "@/components/Answer";
import TimerRing from "@/components/TimerRing";
import { useCrossfadeAudioPlayer } from "@/hooks/useCrossfadeAudioPlayer";
import { usePlayer } from "@/hooks/usePlayer";
import { useServerTime } from "@/hooks/useServerTime";
import { socket } from "@/hooks/useSocket";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Text, View } from "react-native";
import { AnswerState, GameQuestion, Room } from "shared";

export default function GameInProgress({ room }: { room: Room }) {
  const { t } = useTranslation();
  const [endQuestionAt, setEndQuestionAt] = useState<number | null>(
    room.currentQuestionEndsAt ?? null,
  );
  const now = useServerTime();
  const [answerIndex, setAnswerIndex] = useState<number | null>(null);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState<number | null>(
    null,
  );
  const [currentQuestion, setCurrentQuestion] = useState(room.currentQuestion);
  const [questionState, setQuestionState] = useState<AnswerState>("unanswered");
  const [playersAnswers, setPlayersAnswers] = useState<Record<string, number>>(
    {},
  );

  const remainingSeconds = endQuestionAt
    ? Math.max(0, Math.ceil((endQuestionAt - now) / 1000))
    : null;
  const isTimeUp = endQuestionAt !== null && now >= endQuestionAt;
  const totalMs = room.settings.timePerQuestion * 1000;
  const remainingFraction = endQuestionAt
    ? Math.min(1, Math.max(0, (endQuestionAt - now) / totalMs))
    : 0;

  useCrossfadeAudioPlayer(currentQuestion?.previewTrack?.previewUrl);

  const player = usePlayer((s) => s.player);

  const answerResult = ({
    result,
    correctAnswerIndex,
    playersAnswers,
  }: {
    result: AnswerState;
    correctAnswerIndex: number | undefined;
    playersAnswers: Record<string, number>;
  }) => {
    setCorrectAnswerIndex(correctAnswerIndex ?? null);
    setQuestionState(result);
    setPlayersAnswers(playersAnswers);
    if (result === "correct") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const answerQuestion = (value: GameQuestion["answers"][number]) => {
    if (currentQuestion === undefined) return;
    if (questionState === "answered") return;
    if (isTimeUp) return;
    Haptics.selectionAsync();
    setQuestionState("answered");
    const answerIndex = currentQuestion.answers.findIndex(
      (answer) => answer === value,
    );
    setAnswerIndex(answerIndex);
    socket.emit("answerQuestion", {
      roomCode: room.code,
      answerIndex,
    });
  };

  useEffect(() => {
    const nextQuestion = (
      question: GameQuestion,
      endQuestionAt: number | undefined,
    ) => {
      setQuestionState("unanswered");
      setCorrectAnswerIndex(null);
      setAnswerIndex(null);
      setPlayersAnswers({});
      setEndQuestionAt(endQuestionAt ?? null);
      room.currentQuestion = question;
      setCurrentQuestion(question);
    };

    socket.on("answerResult", answerResult);
    socket.on("nextQuestion", nextQuestion);
    return () => {
      socket.off("answerResult", answerResult);
      socket.off("nextQuestion", nextQuestion);
    };
  }, [room]);

  if (currentQuestion === undefined || !room.questions || !player) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color="#ffffff" size="large" />
      </View>
    );
  }
  return (
    <View className="flex-1">
      <View className="m-4 flex-1 justify-between">
        <View className="flex flex-col gap-3">
          <Text className="text-white/50 text-center text-xl font-bold leading-none">
            {t("game.progress", {
              current: currentQuestion.id + 1,
              total: room.questions.length,
            })}
          </Text>
          <Text className="text-white font-bold text-3xl text-center leading-none">
            {currentQuestion.questionKey
              ? t(`game.questions.${currentQuestion.questionKey}`)
              : currentQuestion.question}
          </Text>
          {remainingSeconds !== null && (
            <View className="my-2">
              <TimerRing
                remainingSeconds={remainingSeconds}
                fraction={remainingFraction}
              />
            </View>
          )}
        </View>
        <View className="gap-2">
          {currentQuestion.answers.map((value, index) => (
            <Answer
              key={index}
              type={currentQuestion.type}
              data={value}
              onPress={() => answerQuestion(value)}
              players={room.players.filter(
                (p) =>
                  p.socketId !== undefined &&
                  playersAnswers[p.socketId] === index,
              )}
              state={
                answerIndex === index
                  ? questionState
                  : correctAnswerIndex === index
                    ? "correct"
                    : "unanswered"
              }
              disabled={
                answerIndex !== null ||
                questionState === "correct" ||
                questionState === "wrong" ||
                isTimeUp
              }
            />
          ))}
        </View>
      </View>
    </View>
  );
}

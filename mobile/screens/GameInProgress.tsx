import Answer from "@/components/Answer";
import { usePlayer } from "@/hooks/usePlayer";
import { socket } from "@/hooks/useSocket";
import { useAudioPlayer } from "expo-audio";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import { Image, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { AnswerState, GameQuestion, Room, Track } from "shared";

export default function GameInProgress({ room }: { room: Room }) {
  const [endQuestionAt, setEndQuestionAt] = useState<number | null>(null);
  const [seconds, setSeconds] = useState<number>(room.timePerQuestion);
  const [answerIndex, setAnswerIndex] = useState<number | null>(null);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState<number | null>(
    null,
  );
  const [currentQuestion, setCurrentQuestion] = useState(room.currentQuestion);
  const [previewTrack, setPreviewTrack] = useState<Track | null>(null);
  const [questionState, setQuestionState] = useState<AnswerState>("unanswered");

  const translateX = useSharedValue(0);
  const glowProgress = useSharedValue(0);

  const audioPreview = useAudioPlayer(
    currentQuestion?.previewTrack?.previewUrl
      ? { uri: currentQuestion?.previewTrack.previewUrl }
      : undefined,
  );

  const player = usePlayer((s) => s.player);

  useEffect(() => {
    if (!endQuestionAt) return;

    const intervalId = setInterval(() => {
      const remainingMs = endQuestionAt - new Date().getTime();
      const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
      setSeconds(remainingSeconds);

      if (remainingMs <= 0) {
        clearInterval(intervalId);
      }
    }, 200);
    return () => clearInterval(intervalId);
  }, [endQuestionAt]);

  const answerResult = ({
    result,
    correctAnswerIndex,
  }: {
    result: AnswerState;
    correctAnswerIndex: number;
  }) => {
    console.log(result, correctAnswerIndex);
    setCorrectAnswerIndex(correctAnswerIndex);
    setQuestionState(result);
    console.log("Answer result:", result);
    if (result === "correct") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      triggerSuccess();
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      triggerShake();
    }
  };

  const answerQuestion = (value: GameQuestion["answers"][number]) => {
    if (currentQuestion === undefined) return;
    if (questionState === "answered") return;
    if (endQuestionAt && new Date().getTime() >= endQuestionAt) return;
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

  const nextQuestion = (question: GameQuestion, endQuestionAt: number) => {
    setQuestionState("unanswered");
    setSeconds(room.timePerQuestion);
    setCorrectAnswerIndex(null);
    setAnswerIndex(null);
    setEndQuestionAt(endQuestionAt);
    room.currentQuestion = question;
    setCurrentQuestion(question);
  };

  useEffect(() => {
    socket.on("answerResult", answerResult);
    socket.on("nextQuestion", nextQuestion);
    return () => {
      socket.off("answerResult", answerResult);
      socket.off("nextQuestion", nextQuestion);
    };
  }, []);

  useEffect(() => {
    const fetchTrackInfos = async () => {
      if (room.currentQuestion && room.currentQuestion.previewTrack) {
        setPreviewTrack(room.currentQuestion.previewTrack);
        console.log(room.currentQuestion.previewTrack);
      }
    };
    if (!room.questions) return;
    fetchTrackInfos();
  }, [room.currentQuestion, room.questions]);

  useEffect(() => {
    if (!audioPreview) return;
    audioPreview.play();
  }, [audioPreview]);

  useEffect(() => {
    if (room.currentQuestion && (room as any).endQuestionAt) {
      setEndQuestionAt((room as any).endQuestionAt);
    }
  }, []);

  const triggerShake = () => {
    console.log("ok");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

    const OFFSET = 10;
    const TIME = 60;

    translateX.value = withSequence(
      withTiming(-OFFSET, { duration: TIME }),
      withTiming(OFFSET, { duration: TIME }),
      withSpring(0, { mass: 0.5, damping: 5, stiffness: 200 }),
    );
  };

  const animatedStyleError = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const animatedStyleSuccess = useAnimatedStyle(() => {
    return {
      shadowColor: "#4ade80",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: glowProgress.value * 0.8,
      shadowRadius: glowProgress.value * 15,
      elevation: glowProgress.value * 10,
    };
  });

  const triggerSuccess = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    glowProgress.value = withSequence(
      withTiming(1, { duration: 300 }),
      withRepeat(withTiming(0.7, { duration: 400 }), 3, true),
      withTiming(0, { duration: 300 }),
    );
  };

  if (currentQuestion === undefined || !room.questions || !player) return null;
  return (
    <View className="m-4 flex-1 justify-between">
      <View>
        <Text className="text-white/50 text-center text-xl font-bold">
          Question {currentQuestion.id + 1} sur {room.questions.length}
        </Text>
        <Text className="mx-2 text-white font-bold text-3xl">
          {currentQuestion.question}
        </Text>
      </View>
      <View className="flex gap-3">
        {currentQuestion.answers.map((value, index) => (
          <Animated.View
            className="rounded-3xl"
            key={index}
            style={
              answerIndex === index
                ? questionState === "wrong"
                  ? animatedStyleError
                  : animatedStyleSuccess
                : {}
            }
          >
            <Answer
              type={currentQuestion.type}
              data={value}
              onPress={() => answerQuestion(value)}
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
                questionState === "wrong"
              }
            />
          </Animated.View>
        ))}
      </View>
      <View className="p-2 bg-white/10 rounded-3xl p-2 flex-row justify-between items-center pr-6">
        {previewTrack ? (
          <View className="flex-1 flex-row gap-3 items-center">
            <Image
              className="rounded-2xl w-14 h-14"
              source={{ uri: previewTrack.cover }}
            />
            <View>
              <Text className="text-white font-bold text-xl" numberOfLines={1}>
                {previewTrack.title}
              </Text>
              <Text
                className="text-white/50 font-semibold text-xl"
                numberOfLines={1}
              >
                {previewTrack.artists.map((artist) => artist.name).join(", ")}
              </Text>
            </View>
          </View>
        ) : (
          ""
        )}
        <View className="w-fit h-full bg-red-500">
          <Text
            className={`${seconds <= 5 ? "text-red-500" : "text-white/50"} text-xl font-bold`}
          >
            {seconds}s
          </Text>
        </View>
      </View>
    </View>
  );
}

import * as Haptics from "expo-haptics";
import { useEffect, useMemo, useState } from "react";
import { useWindowDimensions } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const COLORS = [
  "#00D560",
  "#F59E0B",
  "#FF6367",
  "#4F9DFF",
  "#C084FC",
  "#FFFFFF",
];
const PIECE_COUNT = 60;
const HOLD_MS = 5000;
const FADE_MS = 800;
const HAPTIC_PULSES_MS = [150, 450, 850, 1300];

type Piece = {
  id: number;
  left: number;
  color: string;
  size: number;
  fallDuration: number;
  fallDelay: number;
  swayDuration: number;
  rotateDuration: number;
};

function ConfettiPiece({
  piece,
  screenHeight,
}: {
  piece: Piece;
  screenHeight: number;
}) {
  const fall = useSharedValue(0);
  const sway = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    fall.value = withDelay(
      piece.fallDelay,
      withRepeat(
        withTiming(1, {
          duration: piece.fallDuration,
          easing: Easing.linear,
        }),
        -1,
        false,
      ),
    );
    sway.value = withRepeat(
      withTiming(1, {
        duration: piece.swayDuration,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true,
    );
    rotate.value = withRepeat(
      withTiming(360, {
        duration: piece.rotateDuration,
        easing: Easing.linear,
      }),
      -1,
      false,
    );
  }, [piece, fall, sway, rotate]);

  const style = useAnimatedStyle(() => {
    const translateY = fall.value * (screenHeight + 60) - 30;
    const translateX = (sway.value - 0.5) * 24;
    return {
      transform: [
        { translateY },
        { translateX },
        { rotate: `${rotate.value}deg` },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        style,
        {
          position: "absolute",
          left: piece.left,
          top: 0,
          width: piece.size,
          height: piece.size * 1.6,
          backgroundColor: piece.color,
          borderRadius: 2,
        },
      ]}
    />
  );
}

export default function Confetti({ active }: { active: boolean }) {
  const { width, height } = useWindowDimensions();
  const opacity = useSharedValue(0);
  const [visible, setVisible] = useState(false);
  const [runId, setRunId] = useState(0);

  const pieces = useMemo<Piece[]>(() => {
    return Array.from({ length: PIECE_COUNT }, (_, i) => ({
      id: i,
      left: Math.random() * width,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 6 + Math.random() * 5,
      fallDuration: 2200 + Math.random() * 1800,
      fallDelay: Math.random() * 1200,
      swayDuration: 900 + Math.random() * 900,
      rotateDuration: 1200 + Math.random() * 1400,
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }));
  }, [width, runId]);

  useEffect(() => {
    if (!active) return;

    setRunId((id) => id + 1);
    setVisible(true);
    opacity.value = 1;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const pulseTimeouts = HAPTIC_PULSES_MS.map((delay) =>
      setTimeout(
        () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
        delay,
      ),
    );

    const fadeTimeout = setTimeout(() => {
      opacity.value = withTiming(0, { duration: FADE_MS }, (finished) => {
        if (finished) {
          runOnJS(setVisible)(false);
        }
      });
    }, HOLD_MS);

    return () => {
      pulseTimeouts.forEach(clearTimeout);
      clearTimeout(fadeTimeout);
    };
  }, [active, opacity]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        containerStyle,
        {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height,
          overflow: "hidden",
        },
      ]}
    >
      {pieces.map((piece) => (
        <ConfettiPiece key={piece.id} piece={piece} screenHeight={height} />
      ))}
    </Animated.View>
  );
}

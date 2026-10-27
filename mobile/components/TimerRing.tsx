import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const BAR_HEIGHT = 8;

// Paliers de fraction restante -> couleur. interpolateColor fait un fondu
// continu entre ces points plutôt qu'un changement brusque.
const COLOR_STOPS = [0, 0.2, 0.5, 1];
const COLORS = ["#FF6367", "#F59E0B", "#F59E0B", "#00D560"];

export default function TimerRing({
  remainingSeconds,
  fraction,
}: {
  remainingSeconds: number;
  fraction: number;
}) {
  const progress = useSharedValue(fraction);

  useEffect(() => {
    progress.value = withTiming(fraction, {
      duration: 260,
      easing: Easing.linear,
    });
  }, [fraction, progress]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
    backgroundColor: interpolateColor(progress.value, COLOR_STOPS, COLORS),
  }));

  return (
    <View className="w-full gap-2">
      <View
        className="w-full rounded-full bg-white/10 overflow-hidden"
        style={{ height: BAR_HEIGHT }}
      >
        <Animated.View
          style={[
            barStyle,
            {
              height: BAR_HEIGHT,
              borderRadius: BAR_HEIGHT / 2,
            },
          ]}
        />
      </View>
    </View>
  );
}

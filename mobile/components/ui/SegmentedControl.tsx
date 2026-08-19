import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  LayoutChangeEvent,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const iosEasing = Easing.bezier(0.25, 0.1, 0.25, 1);

type PillLayout = { x: number; width: number };

type SegmentedControlProps<T extends string | number> = {
  options: T[];
  value: T | undefined;
  onChange: (value: T | undefined) => void;
  getLabel?: (option: T) => string;
  className?: string;
  deselectable?: boolean;
};

export default function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  getLabel = (option) => String(option),
  className = "",
  deselectable = false,
}: SegmentedControlProps<T>) {
  const [layouts, setLayouts] = useState<Record<string, PillLayout>>({});

  const [pillX] = useState(() => new Animated.Value(0));
  const [pillWidth] = useState(() => new Animated.Value(0));
  const [pillOpacity] = useState(() => new Animated.Value(0));
  const pillInitialized = useRef(false);

  const handleLayout = (option: T) => (event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    setLayouts((prev) => ({ ...prev, [String(option)]: { x, width } }));
  };

  const handlePress = (option: T) => {
    if (deselectable && option === value) {
      onChange(undefined);
      return;
    }
    onChange(option);
  };

  useEffect(() => {
    const selectedLayout =
      value !== undefined ? layouts[String(value)] : undefined;

    if (!selectedLayout) {
      Animated.timing(pillOpacity, {
        toValue: 0,
        duration: 150,
        easing: iosEasing,
        useNativeDriver: false,
      }).start();
      return;
    }

    if (!pillInitialized.current) {
      pillX.setValue(selectedLayout.x);
      pillWidth.setValue(selectedLayout.width);
      pillOpacity.setValue(1);
      pillInitialized.current = true;
      return;
    }

    Animated.parallel([
      Animated.timing(pillX, {
        toValue: selectedLayout.x,
        duration: 250,
        easing: iosEasing,
        useNativeDriver: false,
      }),
      Animated.timing(pillWidth, {
        toValue: selectedLayout.width,
        duration: 250,
        easing: iosEasing,
        useNativeDriver: false,
      }),
      Animated.timing(pillOpacity, {
        toValue: 1,
        duration: 150,
        easing: iosEasing,
        useNativeDriver: false,
      }),
    ]).start();
  }, [value, layouts, pillX, pillWidth, pillOpacity]);

  return (
    <View
      className={`bg-white/10 px-1 py-1.5 rounded-2xl flex flex-row gap-1 relative ${className}`}
      accessibilityRole="radiogroup"
    >
      <Animated.View
        pointerEvents="none"
        className="absolute top-1 bottom-1 bg-white/20 rounded-xl"
        style={{ left: pillX, width: pillWidth, opacity: pillOpacity }}
      />
      {options.map((option) => (
        <TouchableOpacity
          key={String(option)}
          onLayout={handleLayout(option)}
          onPress={() => handlePress(option)}
          className="px-2 rounded-full"
          accessibilityRole="radio"
          accessibilityState={{ selected: option === value }}
          accessibilityLabel={getLabel(option)}
        >
          <Text className="text-white text-xl text-center font-semibold">
            {getLabel(option)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

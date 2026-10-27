import { COLORS } from "@/constants/theme";
import { BottomTabBarHeightCallbackContext } from "expo-router/js-tabs";
import type { BottomTabBarProps } from "expo-router/js-tabs";
import { useContext, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  LayoutChangeEvent,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const iosEasing = Easing.bezier(0.25, 0.1, 0.25, 1);

const TAB_BAR_BACKGROUND = "#1A1A1A";
const TAB_BAR_ACTIVE_BACKGROUND = "#484848";

type PillLayout = { x: number; width: number };

export default function TabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const reportHeight = useContext(BottomTabBarHeightCallbackContext);
  const [layouts, setLayouts] = useState<Record<string, PillLayout>>({});

  const [pillX] = useState(() => new Animated.Value(0));
  const [pillWidth] = useState(() => new Animated.Value(0));
  const [pillOpacity] = useState(() => new Animated.Value(0));
  const pillInitialized = useRef(false);

  const handleLayout = (key: string) => (event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    setLayouts((prev) => ({ ...prev, [key]: { x, width } }));
  };

  const activeKey = state.routes[state.index]?.key;

  useEffect(() => {
    const selectedLayout = activeKey ? layouts[activeKey] : undefined;

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
  }, [activeKey, layouts, pillX, pillWidth, pillOpacity]);

  return (
    <View
      pointerEvents="box-none"
      className="absolute inset-x-0 bottom-0 px-4 pt-2 items-center"
      style={{ paddingBottom: insets.bottom || 12 }}
      onLayout={(event) => reportHeight?.(event.nativeEvent.layout.height)}
    >
      <View
        className="flex flex-row gap-1 relative rounded-full p-1.5"
        style={{ backgroundColor: TAB_BAR_BACKGROUND }}
        accessibilityRole="tablist"
      >
        <Animated.View
          pointerEvents="none"
          className="absolute top-1.5 bottom-1.5 rounded-full"
          style={{
            left: pillX,
            width: pillWidth,
            opacity: pillOpacity,
            backgroundColor: TAB_BAR_ACTIVE_BACKGROUND,
          }}
        />
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const label =
            typeof options.tabBarLabel === "string"
              ? options.tabBarLabel
              : (options.title ?? route.name);
          const color = isFocused ? COLORS.primary : COLORS.white;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: "tabLongPress", target: route.key });
          };

          return (
            <TouchableOpacity
              key={route.key}
              onLayout={handleLayout(route.key)}
              onPress={onPress}
              onLongPress={onLongPress}
              activeOpacity={0.7}
              className="items-center justify-center gap-1 px-10 py-2 rounded-full"
              accessibilityRole="tab"
              accessibilityState={{ selected: isFocused }}
              accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
              testID={options.tabBarButtonTestID}
            >
              {options.tabBarIcon?.({ focused: isFocused, color, size: 28 })}
              <Text
                className="text-sm font-semibold"
                style={{ color }}
                numberOfLines={1}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

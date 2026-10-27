import { COLORS } from "@/constants/theme";
import { ActivityIndicator, Text, TouchableOpacity } from "react-native";

const BACKGROUND_COLORS: Record<string, string> = {
  primary: COLORS.primary,
  error: COLORS.error,
  info: COLORS.info,
  "white/10": "rgba(255,255,255,0.1)",
};

const TEXT_COLORS: Record<string, string> = {
  "white/10": "text-white",
};

const SIZE_CLASSES: Record<string, { container: string; text: string }> = {
  default: {
    container: "rounded-2xl px-4 py-3 min-h-14",
    text: "text-2xl",
  },
  small: {
    container: "rounded-xl px-3 py-1.5 min-h-0",
    text: "text-lg",
  },
};

export default function Button({
  children,
  backgroundColor = "primary",
  size = "default",
  onClick,
  disabled = false,
  loading = false,
  className = "",
  accessibilityLabel,
}: {
  children: string | React.ReactNode;
  backgroundColor?: string;
  size?: "default" | "small";
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  accessibilityLabel?: string;
}) {
  const resolvedColor = BACKGROUND_COLORS[backgroundColor] ?? backgroundColor;
  const textColor = TEXT_COLORS[backgroundColor] ?? "text-black";
  const isDisabled = disabled || loading;
  const sizeClasses = SIZE_CLASSES[size];

  return (
    <TouchableOpacity
      className={`${sizeClasses.container} flex-row items-center justify-center ${className}`}
      activeOpacity={0.7}
      style={{ backgroundColor: resolvedColor, opacity: isDisabled ? 0.5 : 1 }}
      disabled={isDisabled}
      onPress={onClick}
      accessibilityRole="button"
      accessibilityLabel={
        accessibilityLabel ?? (typeof children === "string" ? children : undefined)
      }
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator color="black" />
      ) : typeof children === "string" ? (
        <Text className={`${textColor} font-semibold text-center ${sizeClasses.text}`}>
          {children}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}

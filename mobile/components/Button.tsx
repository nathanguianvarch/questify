import { Text, TouchableOpacity } from "react-native";

export default function Button({
  children,
  backgroundColor = "primary",
  onClick,
  disabled = false,
  className = "",
}: {
  children: string | React.ReactNode;
  backgroundColor?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  if (backgroundColor === "primary") {
    backgroundColor = "#00D560";
  } else if (backgroundColor === "error") {
    backgroundColor = "#FF6367";
  } else if (backgroundColor === "info") {
    backgroundColor = "#51A2FF";
  }
  return (
    <TouchableOpacity
      className={`bg-[${backgroundColor}] rounded-2xl px-4 py-3 ${className} disabled:opacity-50`}
      activeOpacity={0.7}
      style={{ backgroundColor }}
      disabled={disabled}
      onPress={onClick}
    >
      <Text className="text-black text-2xl font-semibold text-center">
        {children}
      </Text>
    </TouchableOpacity>
  );
}

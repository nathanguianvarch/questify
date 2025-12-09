import { Text, TouchableOpacity } from "react-native";

export default function Button({
  children,
  backgroundColor = "primary",
  onClick,
}: {
  children: string;
  backgroundColor?: string;
  onClick?: () => void;
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
      className={`bg-[${backgroundColor}] rounded-2xl px-4 py-3`}
      activeOpacity={0.7}
      style={{ backgroundColor }}
      onPress={onClick}
    >
      <Text className="text-black text-2xl font-semibold text-center">
        {children}
      </Text>
    </TouchableOpacity>
  );
}

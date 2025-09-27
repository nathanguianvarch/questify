import { Pressable, Text, TouchableOpacity, View } from "react-native";

type ButtonProps = {
  text: string;
  onPress?: () => void;
};

export default function Button({ text, onPress }: ButtonProps) {
  return (
    <TouchableOpacity
      className="bg-green-500 px-3.5 py-3 rounded-2xl"
      onPress={onPress}
    >
      <Text className="text-2xl font-semibold text-center">{text}</Text>
    </TouchableOpacity>
  );
}

import { TextInput } from "react-native";

export default function Input({
  value,
  placeholder,
  keyboard,
  maxLength,
  onChangeText,
}: {
  value: string;
  placeholder?: string;
  keyboard?: "numeric";
  maxLength?: number;
  onChangeText: (text: string) => void;
}) {
  return (
    <TextInput
      className={`bg-white/10 rounded-2xl px-4 py-3 text-2xl text-white font-semibold text-center`}
      onChangeText={onChangeText}
      value={value}
      maxLength={maxLength}
      placeholder={placeholder}
      keyboardType="numeric"
      inputMode="numeric"
    ></TextInput>
  );
}

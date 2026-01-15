import { TextInput } from "react-native";

export default function Input({
  value,
  placeholder,
  keyboard,
  maxLength,
  onChangeText,
  className,
}: {
  value: string;
  placeholder?: string;
  keyboard?: "numeric";
  maxLength?: number;
  className?: string;
  onChangeText: (text: string) => void;
}) {
  return (
    <TextInput
      className={`${className} bg-white/10 rounded-2xl px-4 py-3 text-2xl text-white font-semibold text-center`}
      onChangeText={onChangeText}
      value={value}
      maxLength={maxLength}
      placeholder={placeholder}
      keyboardType="numeric"
      inputMode="numeric"
    ></TextInput>
  );
}

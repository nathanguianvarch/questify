import { KeyboardTypeOptions, TextInput } from "react-native";

export default function Input({
  value,
  placeholder,
  keyboard,
  maxLength,
  onChangeText,
  className,
  autoFocus,
  autoCorrect,
  onSubmitEditing,
}: {
  value: string;
  placeholder?: string;
  keyboard?: KeyboardTypeOptions;
  maxLength?: number;
  className?: string;
  onChangeText: (text: string) => void;
  autoFocus?: boolean;
  autoCorrect?: boolean;
  onSubmitEditing?: () => void;
}) {
  return (
    <TextInput
      className={`${className} bg-white/10 rounded-2xl px-4 py-3 text-2xl text-white font-semibold text-center`}
      onChangeText={onChangeText}
      value={value}
      maxLength={maxLength}
      placeholder={placeholder}
      keyboardType={keyboard}
      autoFocus={autoFocus}
      autoCorrect={autoCorrect}
      onSubmitEditing={onSubmitEditing}
    ></TextInput>
  );
}

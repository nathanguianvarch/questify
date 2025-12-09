import { useState } from "react";
import { Text, TextInput } from "react-native";

export default function Input({
  value,
  placeholder,
  keyboard,
  onChangeText,
}: {
  value: string;
  placeholder?: string;
  keyboard?: "numeric";
  onChangeText: (text: string) => void;
}) {
  return (
    <TextInput
      className={`bg-white/10 rounded-2xl px-4 py-3 text-2xl text-white font-semibold`}
      onChangeText={onChangeText}
      value={value}
      placeholder={placeholder}
      keyboardType="numeric"
      inputMode="numeric"
      
    ></TextInput>
  );
}

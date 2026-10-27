import { ReactNode } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Props {
  title: string;
  leftContent?: ReactNode;
  rightContent?: ReactNode;
}

export default function NavBar(props: Props) {
  return (
    <SafeAreaView
      edges={["top"]}
      className="border-b-2 border-white/10 bg-black"
    >
      <View className="flex items-center justify-between flex-row my-4 mx-5 relative">
        <View className="min-h-[26px]">{props.leftContent}</View>
        <View className="min-h-[26px]">{props.rightContent}</View>
        <View className="absolute inset-x-0 flex items-center justify-center">
          <View className="flex flex-row gap-2">
            <Text className="text-3xl font-bold text-white">{props.title}</Text>
            {/* <Text className="bg-white/10 text-2xl py-1 px-2 rounded-xl font-semibold text-white">
              Beta
            </Text> */}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

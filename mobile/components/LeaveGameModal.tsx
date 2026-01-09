import { useState } from "react";
import { Modal, Text, View } from "react-native";
import Button from "./Button";

export default function LeaveGameModal() {
  const [visible, setVisible] = useState(false);
  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View className="m-4 p-6 flex flex-col gap-4 bg-black border border-gray-800 rounded-[40px] mt-20">
        <View className="flex flex-col gap-2">
          <Text className="text-center text-white text-2xl font-bold">
            Quitter la partie
          </Text>
          <Text className="font-semibold text-xl text-white">
            Êtes-vous sûr de vouloir quitter la partie ?
          </Text>
        </View>
        <View className="flex flex-row justify-between">
          <Button backgroundColor="info">Annuler</Button>
          <Button backgroundColor="error">Quitter</Button>
        </View>
      </View>
    </Modal>
  );
}

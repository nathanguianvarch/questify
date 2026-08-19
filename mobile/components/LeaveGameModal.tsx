import { Modal, Text, View } from "react-native";
import Button from "./ui/Button";

type LeaveGameModalProps = {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function LeaveGameModal({
  visible,
  onCancel,
  onConfirm,
}: LeaveGameModalProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View className="m-4 p-6 flex flex-col gap-4 bg-black border border-gray-800 rounded-[40px] mt-20">
        <View className="flex flex-col gap-2">
          <Text className="text-center text-white text-2xl font-bold">
            Quitter la partie
          </Text>
          <Text className="font-semibold text-xl text-white">
            Êtes-vous sûr de vouloir quitter la partie ?
          </Text>
        </View>
        <View className="flex flex-row justify-between gap-3">
          <Button backgroundColor="info" onClick={onCancel} className="flex-1">
            Annuler
          </Button>
          <Button backgroundColor="error" onClick={onConfirm} className="flex-1">
            Quitter
          </Button>
        </View>
      </View>
    </Modal>
  );
}

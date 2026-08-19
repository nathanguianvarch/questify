import TabBar from "@/components/ui/TabBar";
import { COLORS } from "@/constants/theme";
import Tabs from "expo-router/js-tabs";
import { Gamepad2, UserRound } from "lucide-react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: COLORS.background },
      }}
      tabBar={(props) => <TabBar {...props} />}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Game",
          tabBarIcon: ({ color, size }) => (
            <Gamepad2 color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <UserRound color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}

import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#16a34a",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: { borderTopColor: "#f3f4f6" },
        headerStyle: { backgroundColor: "#16a34a" },
        headerTintColor: "#ffffff",
        headerTitleStyle: { fontWeight: "700" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "#Vendo", tabBarLabel: "#Vendo", tabBarIcon: ({ color }) => <TabIcon emoji="🛍️" color={color} /> }}
      />
      <Tabs.Screen
        name="busco"
        options={{ title: "#Busco", tabBarLabel: "#Busco", tabBarIcon: ({ color }) => <TabIcon emoji="🔍" color={color} /> }}
      />
      <Tabs.Screen
        name="publicar"
        options={{ title: "Publicar", tabBarLabel: "Publicar", tabBarIcon: ({ color }) => <TabIcon emoji="✍️" color={color} /> }}
      />
      <Tabs.Screen
        name="chats"
        options={{ title: "Chats", tabBarLabel: "Chats", tabBarIcon: ({ color }) => <TabIcon emoji="💬" color={color} /> }}
      />
      <Tabs.Screen
        name="perfil"
        options={{ title: "Mi perfil", tabBarLabel: "Perfil", tabBarIcon: ({ color }) => <TabIcon emoji="👤" color={color} /> }}
      />
    </Tabs>
  );
}

function TabIcon({ emoji, color }: { emoji: string; color: string }) {
  const { Text } = require("react-native");
  return <Text style={{ fontSize: 20 }}>{emoji}</Text>;
}

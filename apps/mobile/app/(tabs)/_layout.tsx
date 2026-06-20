import { Tabs } from "expo-router";
import { useAuth } from "@mercadovivo/hooks";
import { useChats } from "@mercadovivo/hooks";
import { View, Text } from "react-native";

function TabIcon({ emoji }: { emoji: string }) {
  return <Text style={{ fontSize: 20 }}>{emoji}</Text>;
}

function BadgeIcon({ emoji, count }: { emoji: string; count: number }) {
  return (
    <View>
      <Text style={{ fontSize: 20 }}>{emoji}</Text>
      {count > 0 && (
        <View style={{
          position: "absolute", top: -4, right: -8,
          backgroundColor: "#ef4444", borderRadius: 10,
          minWidth: 18, height: 18, alignItems: "center", justifyContent: "center", paddingHorizontal: 3,
        }}>
          <Text style={{ color: "white", fontSize: 10, fontWeight: "700" }}>
            {count > 9 ? "9+" : count}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function TabsLayout() {
  const { usuario } = useAuth();
  const { unreadCount } = useChats(usuario?.id);

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
        options={{ title: "Inicio", tabBarLabel: "Inicio", tabBarIcon: () => <TabIcon emoji="🏠" /> }}
      />
      <Tabs.Screen
        name="vendo"
        options={{ title: "Vendo", tabBarLabel: "Vendo", tabBarIcon: () => <TabIcon emoji="🛍️" /> }}
      />
      <Tabs.Screen
        name="busco"
        options={{ title: "Busco", tabBarLabel: "Busco", tabBarIcon: () => <TabIcon emoji="🔍" /> }}
      />
      <Tabs.Screen
        name="publicar"
        options={{ title: "Publicar", tabBarLabel: "Publicar", tabBarIcon: () => <TabIcon emoji="✍️" /> }}
      />
      <Tabs.Screen
        name="chats"
        options={{ title: "Chats", tabBarLabel: "Chats", tabBarIcon: () => <BadgeIcon emoji="💬" count={unreadCount} /> }}
      />
      <Tabs.Screen
        name="perfil"
        options={{ title: "Mi perfil", tabBarLabel: "Perfil", tabBarIcon: () => <TabIcon emoji="👤" /> }}
      />
    </Tabs>
  );
}

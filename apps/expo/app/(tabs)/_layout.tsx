import { Tabs } from "expo-router";
import { Home, Bookmark, Users, User } from "lucide-react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#0f172a",
        tabBarInactiveTintColor: "#64748b",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopColor: "#e2e8f0",
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: "500" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home size={size ?? 24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: "Library",
          tabBarIcon: ({ color, size }) => <Bookmark size={size ?? 24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="following"
        options={{
          title: "Following",
          tabBarIcon: ({ color, size }) => <Users size={size ?? 24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User size={size ?? 24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

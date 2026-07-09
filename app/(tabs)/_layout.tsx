import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";

export default function TabLayout() {
  return (
    <LinearGradient
      colors={["#0E1514", "#4D4639"]}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarButton: HapticTab,
            tabBarActiveTintColor: "#FFFFFF",
            tabBarInactiveTintColor: "rgba(255,255,255,0.45)",
            tabBarStyle: {
              backgroundColor: "rgba(15, 17, 16, 0.75)",
              borderTopWidth: 0,
              elevation: 0,
              shadowOpacity: 0,
              height: 92,
              paddingBottom: 18,
              paddingTop: 10,
            },
            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: "600",
              letterSpacing: 0.3,
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: "Home",
              tabBarIcon: ({ color }) => (
                <Ionicons size={26} name="home-outline" color={color} />
              ),
            }}
          />

          <Tabs.Screen
            name="chat"
            options={{
              title: "Scan",
              tabBarIcon: ({ color }) => (
                <View style={{
                    width: 60,
                    height: 60,
                    backgroundColor: '#416834',
                    borderRadius: 30,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 30,
                    borderWidth: 4,
                    borderColor: '#0F1110'
                }}>
                    <Ionicons size={30} name="scan-outline" color="#FFFFFF" />
                </View>
              ),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: "Analysis",
              tabBarIcon: ({ color }) => (
                <Ionicons
                  size={26}
                  name="stats-chart-outline"
                  color={color}
                />
              ),
            }}
          />
        </Tabs>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
});


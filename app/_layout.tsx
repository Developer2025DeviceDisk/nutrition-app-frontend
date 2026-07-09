import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { StatusBar } from "expo-status-bar";
import Toast, { ToastConfig } from 'react-native-toast-message';
import { Ionicons } from "@expo/vector-icons";
import { AuthProvider, useAuth } from "../context/AuthContext";
import "../global.css";

const toastConfig: ToastConfig = {
  otp: ({ text1, props, text2 }) => (
    <View className="w-[90%] bg-white border border-primary/30 rounded-2xl p-4 flex-row items-center shadow-lg shadow-black/10 mt-10">
      <View className="bg-primary/10 rounded-full p-2 mr-4">
        <Ionicons name="shield-checkmark" size={28} color="#416834" />
      </View>
      <View className="flex-1">
        <Text className="text-muted text-sm mb-1">{text1 || 'Verification Code'}</Text>
        <Text className="text-text text-3xl font-bold tracking-[8px]">{text2}</Text>
      </View>
    </View>
  )
};

function InitialLayout() {
  const { token, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Redirection is now handled by the root index.tsx to avoid route collisions
  }, [token, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#416834" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="match-success" options={{ presentation: 'transparentModal', animation: 'fade' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <InitialLayout />
      <Toast config={toastConfig} />
    </AuthProvider>
  );
}





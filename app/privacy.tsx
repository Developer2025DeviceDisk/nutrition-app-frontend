import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function PrivacyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#FFFFFF]">
      {/* Header */}
      <View className="flex-row items-center px-6 pt-10 pb-4 border-b border-[#3A4A55]">
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace("/")} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#DDE6F0" />
        </TouchableOpacity>
        <Text className="text-[#DDE6F0] text-xl font-bold">Privacy Policy</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24 }} showsVerticalScrollIndicator={false}>
        <Text className="text-[#416834] text-2xl font-bold mb-6">Privacy & Data Policy</Text>
        
        <View className="mb-8">
          <Text className="text-[#416834] text-lg font-semibold mb-2">1. Information We Collect</Text>
          <Text className="text-[#888] text-[15px] leading-6 mb-4">
            We collect information you provide directly to us when you create an account, build a pet profile, or communicate with other users. This includes your phone number, location data, pet images, and chat logs.
          </Text>

          <Text className="text-[#416834] text-lg font-semibold mb-2">2. How We Use Your Information</Text>
          <Text className="text-[#888] text-[15px] leading-6 mb-4">
            The data we collect is utilized to provide, maintain, and improve the Pet App ecosystem. Specifically, we use location data to show you nearby matching pet profiles and use your preferences to refine matching algorithms. We do not sell your personal data to third parties.
          </Text>

          <Text className="text-[#416834] text-lg font-semibold mb-2">3. Data Security</Text>
          <Text className="text-[#888] text-[15px] leading-6 mb-4">
            We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access. Conversations in our chat platform are securely stored and tied only to your authenticated sessions.
          </Text>

          <Text className="text-[#416834] text-lg font-semibold mb-2">4. Your Control and Choices</Text>
          <Text className="text-[#888] text-[15px] leading-6 mb-10">
            You maintain full control over your profile data. You can delete your account, images, or chat history at any time through the app settings. Revoking location permissions may limit the app's functionality but is fully within your rights.
          </Text>
        </View>

        <Text className="text-[#3A4A55] text-center text-sm font-semibold mb-6">Last Updated: March 2026</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

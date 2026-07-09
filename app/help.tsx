import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function HelpScreen() {
  const router = useRouter();

  const FAQs = [
    {
      q: "How does the matching system work?",
      a: "Our algorithm calculates compatibility based on your pet's breed, distance, and the goals you selected (Find Mate or Play Date). It suggests the best profiles closest to you."
    },
    {
      q: "How can I update my pet's details?",
      a: "You can update your pet's profile anytime by visiting the 'Profile' tab and tapping on 'Update Pet Profiles' under your current pet list."
    },
    {
      q: "Why can't I see any new pets to swipe?",
      a: "If you've run out of profiles, try expanding your distance filter on the Home screen or adjusting the preferred gender/breed."
    },
    {
      q: "Is it completely free to use?",
      a: "Yes! The core matching and messaging features are 100% free for all pet owners to help build a healthy pet community."
    }
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#FFFFFF]">
      {/* Header */}
      <View className="flex-row items-center px-6 pt-10 pb-4 border-b border-[#3A4A55]">
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace("/")} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#DDE6F0" />
        </TouchableOpacity>
        <Text className="text-[#DDE6F0] text-xl font-bold">Help & Support</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24 }} showsVerticalScrollIndicator={false}>
        <Text className="text-[#416834] text-2xl font-bold mb-2">How can we help?</Text>
        <Text className="text-[#888] text-base mb-8 leading-6">
          Find answers to the most frequently asked questions below. If you need further assistance, please contact our support team.
        </Text>

        <View className="mb-6">
          <Text className="text-[#416834] text-lg font-semibold mb-4 tracking-wide uppercase">Frequently Asked Questions</Text>

          {FAQs.map((faq, index) => (
            <View key={index} className="bg-[#1C2C35] rounded-2xl p-5 mb-4 border border-[#3A4A55]">
              <Text className="text-[#DDE6F0] text-[16px] font-semibold mb-2">{faq.q}</Text>
              <Text className="text-[#888] text-[14px] leading-5">{faq.a}</Text>
            </View>
          ))}
        </View>

        {/* Contact Support Button */}
        {/* <TouchableOpacity className="bg-[#416834]/20 border border-[#416834]/40 rounded-full py-4 items-center mt-4 mb-10">
          <Text className="text-[#416834] font-semibold text-[16px]">Contact Support Team</Text>
        </TouchableOpacity> */}
      </ScrollView>
    </SafeAreaView>
  );
}

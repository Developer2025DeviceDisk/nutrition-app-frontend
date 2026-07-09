import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';

export default function AboutUsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#FFFFFF]">
      {/* Header */}
      <View className="flex-row items-center px-6 pt-10 pb-4 border-b border-[#3A4A55]">
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace("/")} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#DDE6F0" />
        </TouchableOpacity>
        <Text className="text-[#DDE6F0] text-xl font-bold">About Us</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, alignItems: 'center' }} showsVerticalScrollIndicator={false}>
        
        {/* App Logo Placeholder */}
        <View className="w-28 h-28 bg-[#1C2C35] rounded-full items-center justify-center mb-6 border-2 border-[#416834]">
          <Ionicons name="paw" size={60} color="#416834" />
        </View>

        <Text className="text-[#DDE6F0] text-3xl font-bold mb-2">Pet App</Text>
        <Text className="text-[#416834] text-base font-medium mb-8">Version 1.0.0</Text>

        <View className="bg-[#1C2C35] p-6 rounded-3xl border border-[#3A4A55] mb-8 w-full">
          <Text className="text-[#416834] text-xl font-bold mb-3 text-center">Our Mission</Text>
          <Text className="text-[#888] text-[15px] leading-6 text-center">
            We started Pet App because we realized how difficult it was for pet owners to find genuine play dates and ideal mates for their furry best friends. Our mission is to create a safe, engaging, and localized community entirely dedicated to pets and the people who love them.
          </Text>
        </View>

        <View className="w-full">
          <Text className="text-[#DDE6F0] text-lg font-semibold mb-4 text-center">Connect With Us</Text>
          
          <TouchableOpacity className="flex-row items-center bg-[#FFFFFF] border border-[#3A4A55] rounded-xl p-4 mb-3">
            <Ionicons name="logo-instagram" size={24} color="#416834" />
            <Text className="text-[#DDE6F0] text-base font-medium ml-4">@petapp_official</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="flex-row items-center bg-[#FFFFFF] border border-[#3A4A55] rounded-xl p-4 mb-3">
            <Ionicons name="mail-outline" size={24} color="#416834" />
            <Text className="text-[#DDE6F0] text-base font-medium ml-4">hello@petapp.com</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="flex-row items-center bg-[#FFFFFF] border border-[#3A4A55] rounded-xl p-4">
            <Ionicons name="globe-outline" size={24} color="#416834" />
            <Text className="text-[#DDE6F0] text-base font-medium ml-4">www.petapp.com</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-[#3A4A55] text-xs font-semibold mt-10">© 2026 Pet App. All Rights Reserved.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

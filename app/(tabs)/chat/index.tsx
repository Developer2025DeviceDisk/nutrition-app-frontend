import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import { API_URL } from '../../../constants/api';
import { getUploadableUri } from '../../../utils/fileUpload';

export default function ScanScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [uploading, setUploading] = useState(false);

  const openCamera = () => {
    router.push('/camera' as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScrollView className="flex-1 px-8 pt-10">
        <Text className="text-[#191D17] text-3xl font-bold mb-4">Scan Food</Text>
        <Text className="text-[#8C8C8C] text-base mb-10 leading-6">
          Capture a clear photo of your meal to automatically detect nutrition facts and track your daily intake.
        </Text>

        {/* Scan Button Area */}
        <TouchableOpacity 
            onPress={openCamera}
            activeOpacity={0.8}
            className="w-full aspect-square bg-[#F8F9F5] border-2 border-dashed border-[#416834]/30 rounded-[40px] items-center justify-center mb-10"
        >
            <View className="w-24 h-24 bg-[#416834] rounded-full items-center justify-center shadow-lg shadow-[#416834]/30">
                <Ionicons name="camera" size={48} color="white" />
            </View>
            <Text className="text-[#416834] text-lg font-bold mt-6">Open Camera</Text>
        </TouchableOpacity>

        {/* Tips */}
        <View className="bg-[#F0F2EB] p-6 rounded-[24px]">
            <Text className="text-[#191D17] text-lg font-bold mb-4">Scanning Tips</Text>
            <TipItem icon="sunny-outline" text="Ensure good lighting for better accuracy" />
            <TipItem icon="resize-outline" text="Center the food in the frame" />
            <TipItem icon="phone-portrait-outline" text="Hold your phone steady" />
        </View>

        {uploading && (
          <View className="absolute inset-0 bg-white/70 justify-center items-center rounded-3xl">
            <ActivityIndicator size="large" color="#416834" />
            <Text className="mt-4 text-[#416834] font-bold text-lg">Analyzing Food...</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const TipItem = ({ icon, text }: any) => (
    <View className="flex-row items-center mb-4">
        <View className="w-8 h-8 rounded-full bg-white justify-center items-center mr-3">
            <Ionicons name={icon} size={16} color="#416834" />
        </View>
        <Text className="text-[#191D17] text-sm font-medium flex-1">{text}</Text>
    </View>
);

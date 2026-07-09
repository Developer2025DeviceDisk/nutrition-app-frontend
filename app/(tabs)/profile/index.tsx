import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import { BASE_URL, API_URL } from '../../../constants/api';

export default function AnalysisScreen() {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  
  const [dailyStats, setDailyStats] = useState({
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
  });

  useFocusEffect(
    useCallback(() => {
        if (token) {
            fetchDailyStats();
        }
    }, [token])
  );

  const fetchDailyStats = async () => {
      try {
          const response = await fetch(`${API_URL}/scan/daily`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          const data = await response.json();
          if (data.success && data.totals) {
              setDailyStats({
                  calories: data.totals.calories || 0,
                  protein: data.totals.protein || 0,
                  carbs: data.totals.carbs || 0,
                  fat: data.totals.fat || 0
              });
          }
      } catch (error) {
          console.error("Failed to fetch daily stats", error);
      }
  };

  const handleLogout = async () => {
    try {
        await logout();
        // Force navigation to onboarding
        router.replace('/(auth)/' as any);
    } catch (error) {
        console.error("Logout failed", error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScrollView className="flex-1 px-6 pt-10">
        <Text className="text-[#191D17] text-3xl font-bold mb-8">Analysis</Text>
        
        {/* User Card */}
        <View className="flex-row items-center bg-[#F8F9F5] p-6 rounded-[24px] mb-8">
          <Image
            source={{ uri: user?.profileImage ? `${BASE_URL}${user.profileImage}` : "https://images.unsplash.com/photo-1633332755192-727a05c4013d" }}
            className="w-20 h-20 rounded-2xl"
            contentFit="cover"
          />
          <View className="ml-4">
            <Text className="text-[#191D17] text-xl font-bold">{user?.fullName || "User"}</Text>
            <Text className="text-[#8C8C8C] text-sm">Member since Mar 2026</Text>
          </View>
        </View>

        {/* Daily Stats */}
        <Text className="text-[#191D17] text-xl font-bold mb-4">Today's Intake</Text>
        <View className="gap-y-4">
           <AnalysisItem icon="flame-outline" label="Calories" value={`${dailyStats.calories} kcal`} color="#FF8C00" />
           <AnalysisItem icon="fitness-outline" label="Protein" value={`${dailyStats.protein} g`} color="#416834" />
           <AnalysisItem icon="water-outline" label="Carbs" value={`${dailyStats.carbs} g`} color="#3297FF" />
           <AnalysisItem icon="restaurant-outline" label="Fat" value={`${dailyStats.fat} g`} color="#FF4D4D" />
        </View>

        {dailyStats.calories === 0 && (
            <View className="mt-10 p-10 bg-[#F0F2EB] rounded-[32px] items-center">
                <Ionicons name="stats-chart" size={48} color="#416834" opacity={0.3} />
                <Text className="text-[#8C8C8C] text-center mt-4">
                    Scan your meals today to track your nutrition analysis.
                </Text>
            </View>
        )}

        {/* Logout Button */}
        <TouchableOpacity 
            activeOpacity={0.7}
            onPress={handleLogout}
            className="mt-10 mb-20 flex-row items-center justify-center p-5 bg-[#FFF0F0] rounded-[24px] border border-[#FFDADA]"
        >
            <Ionicons name="log-out-outline" size={24} color="#FF4D4D" />
            <Text className="text-[#FF4D4D] text-lg font-bold ml-3">Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const AnalysisItem = ({ icon, label, value, color }: any) => (
    <View className="flex-row items-center justify-between bg-white border border-[#F0F0F0] p-5 rounded-[20px]">
        <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full justify-center items-center" style={{ backgroundColor: color + '15' }}>
                <Ionicons name={icon} size={20} color={color} />
            </View>
            <Text className="text-[#191D17] text-base font-medium ml-3">{label}</Text>
        </View>
        <Text className="text-[#191D17] text-lg font-bold">{value}</Text>
    </View>
);

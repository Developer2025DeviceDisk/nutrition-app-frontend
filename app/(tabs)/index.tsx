import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { BASE_URL, API_URL } from '../../constants/api';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { user, token, updateUser } = useAuth();
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Refresh history and user profile every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (token) {
        fetchScanHistory();
        if (!user?.fullName || user.fullName === "Username") {
          fetchUserProfile();
        }
      }
    }, [token, user])
  );

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        await updateUser(data.user);
      }
    } catch (error) {
      console.error("Error fetching user profile", error);
    }
  };

  const fetchScanHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/scan/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setScans(data.scans);
      }
    } catch (error) {
      console.error("Error fetching scan history", error);
    } finally {
      setLoading(false);
    }
  };

  const openCamera = () => {
    router.push('/camera' as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row justify-between items-center mb-10">
          <TouchableOpacity
            className="flex-row items-center"
            activeOpacity={0.7}
            onPress={() => router.push('/(tabs)/profile' as any)}
          >
            <Image
              source={{ uri: user?.profileImage ? `${BASE_URL}${user.profileImage}` : "https://images.unsplash.com/photo-1633332755192-727a05c4013d" }}
              className="w-14 h-14 rounded-lg"
              contentFit="cover"
            />
            <View className="ml-3">
              <Text className="text-[#8C8C8C] text-sm font-medium">Welcome back!!</Text>
              <Text className="text-[#191D17] text-lg font-bold">{user?.fullName || "Username"}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity className="w-12 h-12 bg-white border border-[#F0F0F0] rounded-full justify-center items-center">
            <Ionicons name="notifications-outline" size={24} color="#191D17" />
            <View className="absolute top-3 right-3 w-2.5 h-2.5 bg-[#FF4D4D] rounded-full border-2 border-white" />
          </TouchableOpacity>
        </View>

        {/* Scan Card */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={openCamera}
          className="bg-[#F8F9F5] border border-[#E8ECE0] rounded-[32px] p-10 items-center justify-center mb-10"
        >
          <View className="mb-6">
            <View className="w-20 h-20 bg-white rounded-2xl justify-center items-center border border-[#E8ECE0]">
              <Ionicons name="scan-outline" size={40} color="#416834" />
            </View>
          </View>
          <Text className="text-[#191D17] text-xl font-bold text-center mb-1">
            Scan food to get nutrition value
          </Text>
          <Text className="text-[#8C8C8C] text-sm text-center">
            {scans.length > 0 ? `Last scanned ${new Date(scans[0].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : "No scans yet"}
          </Text>
        </TouchableOpacity>

        {/* Recently Scanned */}
        <View className="mb-6">
          <Text className="text-[#191D17] text-2xl font-bold mb-6">Recently Scanned</Text>

          {loading ? (
            <ActivityIndicator color="#416834" />
          ) : (
            <View className="flex-row flex-wrap justify-start">
              {scans.map((scan, index) => (
                <View key={scan._id} style={{ width: (width - 40 - 30) / 4, marginBottom: 20, marginRight: (index + 1) % 4 === 0 ? 0 : 10 }}>
                  <View style={{ width: '100%', height: 64, backgroundColor: '#F0F0F0', borderRadius: 12, overflow: 'hidden', marginBottom: 8 }}>
                    <Image
                      source={{ uri: `${BASE_URL}${scan.image}` }}
                      style={{ width: '100%', height: '100%', backgroundColor: '#E0E0E0' }}
                      contentFit="cover"
                      transition={200}
                    />
                  </View>
                  <Text className="text-[#191D17] text-[10px] font-medium text-center" numberOfLines={1}>
                    {scan.foodName}
                  </Text>
                </View>
              ))}
              {scans.length === 0 && (
                <Text className="text-[#8C8C8C] text-center w-full mt-10">Your recent scans will appear here.</Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

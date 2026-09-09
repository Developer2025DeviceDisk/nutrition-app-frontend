import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import Toast from 'react-native-toast-message';
import { API_URL } from "../../constants/api";
import { useAuth } from "../../context/AuthContext";

export default function VerifyOtp() {
  const router = useRouter();
  const { phone } = useLocalSearchParams();
  const { setAuth } = useAuth();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerifyOtp = async () => {
    Keyboard.dismiss();
    if (otp.length < 6) {
      Alert.alert("Error", "Please enter a 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });

      const data = await response.json();

      if (data.success) {
        await setAuth(data.token, data.user);

        if (data.user && data.user.fullName) {
          router.replace("/(tabs)/" as any);
        } else {
          router.replace("/(auth)/owner-details" as any);
        }
      } else {
        Alert.alert("Error", data.message || "Invalid OTP");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Something went wrong. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await response.json();
      if (data.success) {
        Toast.show({
          type: 'otp',
          text1: 'OTP Resent',
          text2: String(data.otp),
          visibilityTime: 10000,
          autoHide: true,
          topOffset: 10,
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View className="flex-1 px-6 pt-16">
          {/* Back Button */}
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace("/(auth)/" as any)}>
            <Ionicons name="arrow-back" size={24} color="#43483F" />
          </TouchableOpacity>

          {/* Title */}
          <Text className="text-[#191D17] text-[24px] font-semibold my-10 leading-tight">
            Please enter the verification code
          </Text>

          {/* OTP Input */}
          <TextInput
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            returnKeyType="done"
            onSubmitEditing={handleVerifyOtp}
            maxLength={6}
            className="text-text text-[32px] tracking-[15px] border-b border-secondary pb-3"
          />

          {/* Info Text */}
          <View className="flex-row flex-wrap items-center pt-5">
            <Text className="text-[#43483F] text-[13px] leading-5">
              We have sent verification code to the phone number{" "}
            </Text>

            <Text className="text-text font-medium text-[13px] leading-5">
              +91 {phone}.
            </Text>

            <TouchableOpacity
              onPress={() =>
                router.canGoBack()
                  ? router.back()
                  : router.replace("/(auth)/" as any)
              }
            >
              <Text className="text-primary font-medium text-[13px] leading-5 ml-1">
                Change phone number?
              </Text>
            </TouchableOpacity>
          </View>

          {/* Resend Code */}
          <TouchableOpacity className="mt-16 items-center" onPress={handleResendOtp}>
            <Text className="text-primary font-medium text-base">Resend Code</Text>
          </TouchableOpacity>

          {/* Continue Button */}
          <View className="mt-auto mb-16">
            <TouchableOpacity
              className="bg-primary py-2 rounded-[12px] items-center shadow-sm"
              onPress={handleVerifyOtp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white font-semibold text-base">Continue</Text>
              )}
            </TouchableOpacity>

            <Text className="text-[#43483F] text-[11px] leading-[18px] font-medium text-center mt-3 px-4">
              By Login, you are accepting our{" "}
              <Text className="text-primary font-medium">Terms & Condition</Text> and{" "}
              <Text className="text-primary font-medium">Privacy & Policy</Text>
            </Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

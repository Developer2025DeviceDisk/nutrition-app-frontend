import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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

export default function PhoneNumber() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    Keyboard.dismiss();
    if (phone.length < 10) {
      Alert.alert("Error", "Please enter a valid phone number");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (data.success) {
        Toast.show({
          type: 'otp',
          text1: 'Verification Code',
          text2: String(data.otp),
          visibilityTime: 10000,
          autoHide: true,
          topOffset: 10,
        });

        router.push({
          pathname: "/(auth)/verify-otp",
          params: { phone },
        });
      } else {
        Alert.alert("Error", data.message || "Failed to send OTP");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Something went wrong. Please check your connection.");
    } finally {
      setLoading(false);
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

          <Text className="text-text text-[32px] font-semibold my-10 leading-tight">
            Can we get your{"\n"}number?
          </Text>

          {/* Input Row */}
          <View className="flex-row items-center border-b border-secondary pb-3">
            <Text className="text-text mr-4 font-medium">IND +91</Text>
            <TextInput
              placeholder="Phone Number"
              placeholderTextColor="#888888"
              keyboardType="phone-pad"
              returnKeyType="done"
              onSubmitEditing={handleSendOtp}
              className="flex-1 text-text text-lg"
              value={phone}
              onChangeText={setPhone}
              maxLength={10}
            />
          </View>

          <Text className="text-muted text-[13px] mt-5 leading-5">
            We'll send you a code to verify you are really you.{"\n"}
            Message and data rates may apply
          </Text>

          {/* Bottom Container for Button and Legal Text */}
          <View className="mt-auto mb-10 gap-6">
            <TouchableOpacity
              className="bg-primary py-2 rounded-[12px] items-center shadow-sm"
              onPress={handleSendOtp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white font-semibold text-base">
                  Send verification code
                </Text>
              )}
            </TouchableOpacity>

            <Text className="text-muted text-center text-sm px-4">
              By Login, you are accepting our{" "}
              <Text className="text-primary font-medium" onPress={() => { }}>Terms & Condition</Text> and{" "}
              <Text className="text-primary font-medium" onPress={() => { }}>Privacy & Policy</Text>
            </Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

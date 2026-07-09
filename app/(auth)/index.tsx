import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AntDesign } from "@expo/vector-icons";

export default function Index() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false}>
        {/* Top Image Section */}
        <View className="items-center justify-center pt-10">
          <Image
            source={require("../../assets/images/salad_bowl_auth.png")}
            style={{ width: '100%', height: 350 }}
            resizeMode="contain"
          />
        </View>

        {/* Text Section */}
        <View className="px-8 mt-8 items-center">
          <Text className="text-text text-xl font-bold text-center leading-tight">
            Getting nutrition value is now easy
          </Text>
          <Text className="text-muted text-[13px] text-center mt-4 leading-6">
            With our new features, you can easily access detailed information about the nutrients in your food, helping you make healthier choices effortlessly.
          </Text>
        </View>


        {/* Buttons Section */}
        <View className="px-6 mt-24 mb-6 gap-4">
          <TouchableOpacity
            className="bg-primary py-3 rounded-[12px] items-center"
            onPress={() => router.push("/(auth)/phone-number")}
          >
            <Text className="text-white font-semibold text-lg">
              Continue with phone number
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white py-2 rounded-[12px] items-center border border-border flex-row justify-center gap-3"
            onPress={() => { }} // Handle Google Login
          >
            <AntDesign name="google" size={20} color="#416834" />
            <Text className="text-primary font-semibold text-lg">
              Continue with google
            </Text>
          </TouchableOpacity>
        </View>

        {/* Legal Disclaimer */}
        <View className="px-6 mb-10 items-center">
          <Text className="text-muted text-center text-sm">
            By Login, you are accepting our{" "}
            <Text className="text-primary font-medium" onPress={() => { }}>Terms & Condition</Text> and{" "}
            <Text className="text-primary font-medium" onPress={() => { }}>Privacy & Policy</Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

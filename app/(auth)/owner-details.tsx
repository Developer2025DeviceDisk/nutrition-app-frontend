import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ScrollView,
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
import { API_URL } from "../../constants/api";
import { useAuth } from "../../context/AuthContext";

export default function OwnerDetails() {
    const router = useRouter();
    const { token, updateUser } = useAuth();

    const [fullName, setFullName] = useState("");
    const [loading, setLoading] = useState(false);

    const handleNext = async () => {
        if (!fullName) {
            Alert.alert("Error", "Please fill in your username.");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("fullName", fullName);

            const response = await fetch(`${API_URL}/user/profile`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                // Update global state with the full user object
                await updateUser(data.user);
                router.replace("/(tabs)/" as any);
            } else {
                Alert.alert("Error", data.message || "Failed to save profile details");
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
            className="flex-1 bg-white"
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 60, paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header Title */}
                <Text className="text-[#191D17] text-[24px] font-bold text-center mb-10">
                    Create Profile
                </Text>

                {/* Input Fields */}
                <View className="gap-y-6">
                    {/* Username */}
                    <View className="border-b border-[#C1C1C1]">
                        <TextInput
                            className="text-black text-[16px] py-1"
                            placeholder="Username*"
                            placeholderTextColor="#8C8C8C"
                            returnKeyType="done"
                            onSubmitEditing={Keyboard.dismiss}
                            value={fullName}
                            onChangeText={setFullName}
                        />
                    </View>
                </View>
            </ScrollView>
            </TouchableWithoutFeedback>

            {/* Bottom Button */}
            <View className="absolute bottom-10 left-5 right-5">
                <TouchableOpacity
                    className="bg-[#416834] py-3 rounded-[10px] items-center"
                    onPress={handleNext}
                    disabled={loading}
                    activeOpacity={0.8}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text className="text-white font-semibold text-[16px]">Get started</Text>
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}


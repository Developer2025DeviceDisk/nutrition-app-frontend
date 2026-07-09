import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform
} from "react-native";
import { Image } from "expo-image";
import { API_URL } from "../../constants/api";
import { useAuth } from "../../context/AuthContext";
import { getUploadableUri, appendFormFile } from "../../utils/fileUpload";

const GENDERS = ["Male", "Female", "Other"];

export default function OwnerDetails() {
    const router = useRouter();
    const { token, updateUser } = useAuth();

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [age, setAge] = useState("");
    const [gender, setGender] = useState("");
    const [height, setHeight] = useState("");
    const [weight, setWeight] = useState("");
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert("Permission Denied", "We need your permission to access your gallery.");
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setImage(result.assets[0].uri);
        }
    };

    const handleNext = async () => {
        if (!fullName || !email || !age || !gender || !height || !weight) {
            Alert.alert("Error", "Please fill in all required fields.");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            Alert.alert("Error", "Please enter a valid email address.");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("fullName", fullName);
            formData.append("email", email);
            formData.append("phone", phone);
            formData.append("age", age);
            formData.append("gender", gender);
            formData.append("height", height);
            formData.append("weight", weight);

            if (image) {
                await appendFormFile(formData, "profileImage", image);
            }

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

    const toggleDropdown = (field: string) =>
        setOpenDropdown(openDropdown === field ? null : field);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1 bg-white"
        >
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

                {/* Profile Image Picker */}
                <View className="items-center mb-10">
                    <TouchableOpacity
                        className="w-24 h-24 bg-[#E5E8E1] rounded-[20px] justify-center items-center overflow-hidden"
                        activeOpacity={0.8}
                        onPress={pickImage}
                    >
                        {image ? (
                            <Image
                                source={{ uri: image }}
                                style={{ width: '100%', height: '100%' }}
                                contentFit="cover"
                            />
                        ) : (
                            <Ionicons name="camera-outline" size={32} color="#43483F" />
                        )}
                    </TouchableOpacity>
                </View>

                {/* Input Fields */}
                <View className="gap-y-6">
                    {/* Full Name */}
                    <View className="border-b border-[#C1C1C1]">
                        <TextInput
                            className="text-black text-[16px] py-1"
                            placeholder="Full Name*"
                            placeholderTextColor="#8C8C8C"
                            value={fullName}
                            onChangeText={setFullName}
                        />
                    </View>

                    {/* Email */}
                    <View className="border-b border-[#C1C1C1]">
                        <TextInput
                            className="text-black text-[16px] py-1"
                            placeholder="Email*"
                            placeholderTextColor="#8C8C8C"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>

                    {/* Phone Number */}
                    <View className="flex-row items-center ">
                        <TouchableOpacity className="flex-row items-center pb-1 mr-3">
                            <Text className="text-[#191D17] text-[16px] border-b border-[#C1C1C1]">IND +91</Text>
                        </TouchableOpacity>
                        <TextInput
                            className="flex-1 text-[#191D17] text-[16px] py-1 border-b border-[#C1C1C1] pl- 3"
                            placeholder="Phone Number"
                            placeholderTextColor="#8C8C8C"
                            keyboardType="phone-pad"
                            value={phone}
                            onChangeText={setPhone}
                        />
                    </View>

                    {/* Age */}
                    <View className="border-b border-[#C1C1C1]">
                        <TextInput
                            className="text-black text-[16px] py-1"
                            placeholder="Age (In Years)*"
                            placeholderTextColor="#8C8C8C"
                            keyboardType="numeric"
                            value={age}
                            onChangeText={setAge}
                        />
                    </View>

                    {/* Gender */}
                    <View className="border-b border-[#C1C1C1]">
                        <TouchableOpacity
                            className="flex-row justify-between items-center py-1"
                            onPress={() => toggleDropdown("gender")}
                        >
                            <Text className={gender ? "text-black text-[16px]" : "text-[#8C8C8C] text-[16px]"}>
                                {gender || "Gender*"}
                            </Text>
                            <Ionicons name="chevron-down" size={18} color="#000" />
                        </TouchableOpacity>
                        {openDropdown === "gender" && (
                            <View className="bg-white border border-[#C1C1C1] rounded-lg mt-1 absolute top-10 left-0 right-0 z-50">
                                {GENDERS.map((g) => (
                                    <TouchableOpacity
                                        key={g}
                                        className="px-4 py-3 border-b border-[#F0F0F0]"
                                        onPress={() => {
                                            setGender(g);
                                            setOpenDropdown(null);
                                        }}
                                    >
                                        <Text className="text-black">{g}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Height */}
                    <View className="border-b border-[#C1C1C1]">
                        <TextInput
                            className="text-black text-[16px] py-1"
                            placeholder="Height (In CMM)*"
                            placeholderTextColor="#8C8C8C"
                            keyboardType="numeric"
                            value={height}
                            onChangeText={setHeight}
                        />
                    </View>

                    {/* Weight */}
                    <View className="border-b border-[#C1C1C1]">
                        <TextInput
                            className="text-black text-[16px] py-1"
                            placeholder="Weight (In KG)*"
                            placeholderTextColor="#8C8C8C"
                            keyboardType="numeric"
                            value={weight}
                            onChangeText={setWeight}
                        />
                    </View>
                </View>
            </ScrollView>

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


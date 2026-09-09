import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
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
    Modal,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Keyboard,
} from "react-native";
import { Image } from "expo-image";
import { API_URL } from "../../constants/api";
import { useAuth } from "../../context/AuthContext";
import { DOG_BREEDS } from "../../constants/breeds";
import { getUploadableUri, appendFormFile } from "../../utils/fileUpload";

const GOALS = ["Find Mate", "Play Date", "Both"];
const GENDERS = ["Male", "Female"];
const AGES = ["< 1 year", "1 year", "2 years", "3 years", "4 years", "5+ years"];
const HEALTH_BADGES = ["Vaccinated", "Neutered", "Healthy", "Special Care"];
const TEMPERAMENTS = ["Calm", "Playful", "Aggressive", "Friendly", "Shy"];
const MIN_PHOTOS = 2;

export default function PetDetails() {
    const router = useRouter();
    const { token } = useAuth();

    const [selectedGoal, setSelectedGoal] = useState("Find Mate");
    const [petName, setPetName] = useState("");
    const [breed, setBreed] = useState("");
    const [gender, setGender] = useState("");
    const [age, setAge] = useState("");
    // Multi-select health badges
    const [healthBadges, setHealthBadges] = useState<string[]>([]);
    const [temperament, setTemperament] = useState("");
    const [images, setImages] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [breedModalVisible, setBreedModalVisible] = useState(false);
    const [breedSearch, setBreedSearch] = useState("");
    // Photo validation error state
    const [photoError, setPhotoError] = useState(false);

    const toggleHealthBadge = (badge: string) => {
        setHealthBadges(prev =>
            prev.includes(badge) ? prev.filter(b => b !== badge) : [...prev, badge]
        );
    };

    const pickImage = async () => {
        if (images.length >= 4) {
            Alert.alert("Limit Reached", "You can only upload up to 4 images.");
            return;
        }

        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("Permission Denied", "Gallery permission is required.");
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            quality: 0.8,
        });

        if (!result.canceled && result.assets?.length > 0) {
            const newImages = [...images, result.assets[0].uri];
            setImages(newImages);
            // Clear photo error once 2+ images added
            if (newImages.length >= MIN_PHOTOS) setPhotoError(false);
        }
    };

    const handleNext = async () => {
        if (!petName || !breed || !gender || !age) {
            Alert.alert("Error", "Please fill in all required fields.");
            return;
        }

        const nameRegex = /^[A-Za-z\s]+$/;
        if (!nameRegex.test(petName.trim())) {
            Alert.alert("Error", "Pet name should not contain numbers or special characters.");
            return;
        }

        // ── Minimum photo validation ──
        if (images.length < MIN_PHOTOS) {
            setPhotoError(true);
            // Scroll to top is implicit since the image row is at the top
            Alert.alert(
                "Photos Required",
                `Please upload at least ${MIN_PHOTOS} photos of your pet so others can see them! 🐾`,
                [{ text: "Add Photos", style: "default" }]
            );
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("petName", petName);
            formData.append("breed", breed);
            formData.append("gender", gender);
            formData.append("age", age);
            // Send healthBadges as JSON string
            formData.append("healthBadges", JSON.stringify(healthBadges));
            formData.append("temperament", temperament);
            formData.append("goal", selectedGoal);

            for (const uri of images) {
                await appendFormFile(formData, "images", uri);
            }

            const response = await fetch(`${API_URL}/pet`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                router.push("/(auth)/owner-details");
            } else {
                Alert.alert("Error", data.message || "Failed to save pet details");
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

    const selectOption = (field: string, value: string) => {
        if (field === "breed") setBreed(value);
        if (field === "gender") setGender(value);
        if (field === "age") setAge(value);
        if (field === "temperament") setTemperament(value);
        setOpenDropdown(null);
    };

    const renderDropdown = (
        field: string,
        placeholder: string,
        value: string,
        options: string[]
    ) => (
        <View className="mb-4">
            <TouchableOpacity
                className="flex-row justify-between items-center py-3"
                onPress={() => {
                    if (field === "breed") {
                        setBreedSearch("");
                        setBreedModalVisible(true);
                    } else {
                        toggleDropdown(field);
                    }
                }}
                activeOpacity={0.8}
            >
                <Text className={value ? "text-text text-[15px]" : "text-muted text-[15px]"}>
                    {value || placeholder}
                </Text>
                <Ionicons
                    name={openDropdown === field ? "chevron-up" : "chevron-down"}
                    size={18}
                    color="#888"
                />
            </TouchableOpacity>
            <View className="h-px bg-secondary" />
            {openDropdown === field && field !== "breed" && (
                <View className="bg-secondary/20 rounded-lg mt-1 overflow-hidden border border-secondary">
                    {options.map((opt) => (
                        <TouchableOpacity
                            key={opt}
                            className="px-4 py-3 border-b border-secondary/30"
                            onPress={() => selectOption(field, opt)}
                        >
                            <Text className="text-text text-sm">{opt}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );

    const filteredBreeds = DOG_BREEDS.filter(b => b.toLowerCase().includes(breedSearch.toLowerCase()));

    const renderBreedModal = () => (
        <Modal
            visible={breedModalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setBreedModalVisible(false)}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1 bg-black/60 justify-end"
            >
                <View className="bg-background h-[80%] rounded-t-3xl p-5 border-t border-secondary">
                    <View className="flex-row justify-between items-center mb-5">
                        <Text className="text-primary text-xl font-bold">Select Breed</Text>
                        <TouchableOpacity onPress={() => setBreedModalVisible(false)}>
                            <Ionicons name="close" size={28} color="#43483F" />
                        </TouchableOpacity>
                    </View>

                    <View className="flex-row items-center bg-secondary/10 rounded-xl px-4 py-2 mb-4 border border-secondary">
                        <Ionicons name="search" size={20} color="#888" />
                        <TextInput
                            className="flex-1 text-text text-base ml-2 py-2"
                            placeholder="Search breed..."
                            placeholderTextColor="#888"
                            value={breedSearch}
                            onChangeText={setBreedSearch}
                            returnKeyType="search"
                            autoCorrect={false}
                        />
                        {breedSearch.length > 0 && (
                            <TouchableOpacity onPress={() => setBreedSearch("")}>
                                <Ionicons name="close-circle" size={18} color="#888" />
                            </TouchableOpacity>
                        )}
                    </View>

                    <FlatList
                        data={filteredBreeds}
                        keyExtractor={(item) => item}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                className={`py-4 border-b border-secondary/30 flex-row justify-between items-center`}
                                onPress={() => {
                                    selectOption("breed", item);
                                    setBreedModalVisible(false);
                                }}
                            >
                                <Text className={breed === item ? "text-primary font-semibold text-base" : "text-text text-base"}>
                                    {item}
                                </Text>
                                {breed === item && <Ionicons name="checkmark" size={20} color="#416834" />}
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={() => (
                            <View className="py-10 items-center">
                                <Text className="text-muted text-base text-center">No breeds found</Text>
                            </View>
                        )}
                    />
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1 bg-background"
        >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View className="flex-1 bg-background">
            <ScrollView
                contentContainerStyle={{ padding: 25, paddingTop: 60 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Title */}
                <Text className="text-primary text-[28px] font-bold mb-2 leading-9">
                    Please share some{"\n"}details of pet
                </Text>

                <Text className="text-muted text-[13px] mb-1">
                    Add at least {MIN_PHOTOS} clear photos of your pet*
                </Text>

                {/* Image Upload Row */}
                <View className="flex-row gap-3 mb-2">
                    {images.map((uri, i) => (
                        <View key={i} className="relative">
                            <Image
                                source={{ uri }}
                                style={{ width: 70, height: 70, borderRadius: 12 }}
                                contentFit="cover"
                            />
                            <TouchableOpacity
                                className="absolute -top-1 -right-1 bg-red-500 rounded-full"
                                onPress={() => {
                                    const updated = images.filter((_, idx) => idx !== i);
                                    setImages(updated);
                                    if (updated.length < MIN_PHOTOS) setPhotoError(true);
                                }}
                            >
                                <Ionicons name="close-circle" size={20} color="white" />
                            </TouchableOpacity>
                        </View>
                    ))}
                    {images.length < 4 && (
                        <TouchableOpacity
                            style={[
                                styles.addPhotoBtn,
                                photoError && images.length < MIN_PHOTOS ? styles.addPhotoBtnError : null
                            ]}
                            activeOpacity={0.8}
                            onPress={pickImage}
                        >
                            <Ionicons name="add-circle-outline" size={28} color={photoError && images.length < MIN_PHOTOS ? "#FF6B6B" : "#888"} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Inline photo validation error */}
                {photoError && images.length < MIN_PHOTOS && (
                    <View style={styles.photoErrorBox}>
                        <Ionicons name="alert-circle" size={16} color="#FF6B6B" />
                        <Text style={styles.photoErrorText}>
                            Please add at least {MIN_PHOTOS} photos ({images.length}/{MIN_PHOTOS} added)
                        </Text>
                    </View>
                )}

                {/* Photo count indicator */}
                {images.length > 0 && images.length < MIN_PHOTOS && !photoError && (
                    <Text style={styles.photoCountHint}>
                        {images.length}/{MIN_PHOTOS} photos — add {MIN_PHOTOS - images.length} more
                    </Text>
                )}
                {images.length >= MIN_PHOTOS && (
                    <Text style={styles.photoCountOk}>
                        ✓ {images.length} photos added
                    </Text>
                )}

                <View className="h-6" />

                {/* Primary Goal */}
                <Text className="text-primary text-base font-semibold mb-4">
                    Primary Goal
                </Text>
                <View className="flex-row gap-3 mb-7">
                    {GOALS.map((g) => (
                        <TouchableOpacity
                            key={g}
                            className={`px-4 py-2 rounded-full border ${selectedGoal === g
                                ? "border-primary bg-primary/5"
                                : "border-secondary bg-transparent"
                                }`}
                            onPress={() => setSelectedGoal(g)}
                        >
                            <Text className={selectedGoal === g ? "text-primary font-semibold text-sm" : "text-muted text-sm"}>
                                {g}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Pet Name */}
                <View className="mb-5">
                    <TextInput
                        className="text-text text-[15px] py-2"
                        placeholder="Pet Name*"
                        placeholderTextColor="#888"
                        returnKeyType="done"
                        onSubmitEditing={Keyboard.dismiss}
                        value={petName}
                        onChangeText={(text) => setPetName(text.replace(/[^a-zA-Z\s]/g, ""))}
                    />
                    <View className="h-px bg-secondary" />
                </View>

                {renderDropdown("breed", "Pet Breed*", breed, DOG_BREEDS)}
                {renderDropdown("gender", "Pet Gender*", gender, GENDERS)}
                {renderDropdown("age", "Pet Age*", age, AGES)}

                {/* ── Multi-select Health Badges ── */}
                <View className="mb-5">
                    <Text className="text-primary text-base font-semibold mb-3">
                        Health Badges
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                        {HEALTH_BADGES.map((badge) => {
                            const selected = healthBadges.includes(badge);
                            return (
                                <TouchableOpacity
                                    key={badge}
                                    onPress={() => toggleHealthBadge(badge)}
                                    style={[
                                        styles.badgeChip,
                                        selected ? styles.badgeChipSelected : styles.badgeChipUnselected,
                                    ]}
                                    activeOpacity={0.7}
                                >
                                    {selected && (
                                        <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" style={{ marginRight: 5 }} />
                                    )}
                                    <Text style={[
                                        styles.badgeChipText,
                                        selected ? styles.badgeChipTextSelected : styles.badgeChipTextUnselected,
                                    ]}>
                                        {badge}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                    {healthBadges.length > 0 && (
                        <Text style={styles.selectedBadgesHint}>
                            Selected: {healthBadges.join(", ")}
                        </Text>
                    )}
                </View>

                {renderDropdown("temperament", "Pet Temperament*", temperament, TEMPERAMENTS)}

                <View className="h-24" />
            </ScrollView>

            {/* Next Button */}
            <View className="absolute bottom-0 left-0 right-0 px-6 pb-10 bg-background/95">
                <TouchableOpacity
                    className="bg-primary py-4 rounded-full items-center shadow-sm"
                    onPress={handleNext}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text className="text-white font-bold text-base">Next</Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Modals */}
            {renderBreedModal()}
        </View>
        </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    addPhotoBtn: {
        width: 70,
        height: 70,
        backgroundColor: '#F2F4F7',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#DDE6F0',
    },
    addPhotoBtnError: {
        borderColor: '#FF6B6B',
        borderWidth: 2,
        backgroundColor: 'rgba(255, 107, 107, 0.08)',
    },
    photoErrorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 7,
        marginTop: 4,
        marginBottom: 2,
        borderWidth: 1,
        borderColor: 'rgba(255, 107, 107, 0.3)',
        gap: 6,
    },
    photoErrorText: {
        color: '#FF6B6B',
        fontSize: 13,
        flex: 1,
    },
    photoCountHint: {
        color: '#416834',
        fontSize: 12,
        marginTop: 4,
        marginBottom: 2,
    },
    photoCountOk: {
        color: '#416834',
        fontSize: 12,
        marginTop: 4,
        marginBottom: 2,
    },
    // Health badge chips
    badgeChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1.5,
    },
    badgeChipSelected: {
        backgroundColor: '#416834',
        borderColor: '#416834',
    },
    badgeChipUnselected: {
        backgroundColor: 'transparent',
        borderColor: '#DDE6F0',
    },
    badgeChipText: {
        fontSize: 13,
        fontWeight: '600',
    },
    badgeChipTextSelected: {
        color: '#FFFFFF',
    },
    badgeChipTextUnselected: {
        color: '#888',
    },
    selectedBadgesHint: {
        color: '#416834',
        fontSize: 12,
        marginTop: 8,
        opacity: 0.8,
    },
});

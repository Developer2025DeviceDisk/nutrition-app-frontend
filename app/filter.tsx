import { View, Text, TouchableOpacity, ScrollView, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useRef, useEffect, useState } from "react";
import { Modal, FlatList, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { DOG_BREEDS } from "../constants/breeds";

export default function FilterScreen() {
    const router = useRouter();
    const searchParams = useLocalSearchParams();

    const defaultFilters = {
        male: false,
        female: false,

        age1: false,
        age2: false,
        age3: false,
        age4: false,
        age5: false,

        vaccinated: false,
        notVaccinated: false,

        friendly: false,
        social: false,
        gentle: false,
        affectionate: false,
        goodWithKids: false,
    };

    // Initialize from searchParams
    const initialDistance = searchParams.distance ? parseInt(String(searchParams.distance)) : 125;
    const initialBreeds = searchParams.breed ? String(searchParams.breed).split('|') : [];
    const genders = searchParams.gender ? String(searchParams.gender).split('|') : [];
    const healths = searchParams.healthBadge ? String(searchParams.healthBadge).split('|') : [];
    const ageRanges = searchParams.ageRange ? String(searchParams.ageRange).split(',') : [];
    const temps = searchParams.temperament ? String(searchParams.temperament).split('|') : [];

    const initialFilters = {
        ...defaultFilters,
        male: genders.includes("Male"),
        female: genders.includes("Female"),
        age1: ageRanges.includes("0-2"),
        age2: ageRanges.includes("2-5"),
        age3: ageRanges.includes("5-8"),
        age4: ageRanges.includes("8-10"),
        age5: ageRanges.includes("10-12"),
        vaccinated: healths.includes("Vaccinated"),
        notVaccinated: healths.includes("Not Vaccinated"),
        friendly: temps.includes("Friendly"),
        social: temps.includes("Social"),
        gentle: temps.includes("Gentle"),
        affectionate: temps.includes("Affectionate"),
        goodWithKids: temps.includes("Good With Kids"),
    };

    const [distance, setDistance] = useState(initialDistance);
    const [filters, setFilters] = useState(initialFilters);
    const [selectedBreeds, setSelectedBreeds] = useState<string[]>(initialBreeds);
    
    // Modal states
    const [breedModalVisible, setBreedModalVisible] = useState(false);
    const [breedSearch, setBreedSearch] = useState("");

    const toggle = (key: string) => {
        setFilters((prev) => {
            const next = { ...prev };
            
            // Radio button logic for Gender
            if (key === "male") {
                next.male = !prev.male;
                if (next.male) next.female = false;
            } else if (key === "female") {
                next.female = !prev.female;
                if (next.female) next.male = false;
            }
            // Radio button logic for Health Badge
            else if (key === "vaccinated") {
                next.vaccinated = !prev.vaccinated;
                if (next.vaccinated) next.notVaccinated = false;
            } else if (key === "notVaccinated") {
                next.notVaccinated = !prev.notVaccinated;
                if (next.notVaccinated) next.vaccinated = false;
            }
            // Default toggle for everything else
            else {
                next[key as keyof typeof filters] = !prev[key as keyof typeof filters];
            }
            
            return next;
        });
    };

    const clearFilters = () => {
        setFilters(defaultFilters);
        setDistance(125);
        setSelectedBreeds([]);
    };

    const applyFilters = () => {
        // Collect active filters to pass back
        const activeFilters: any = { distance: String(distance) };

        // Breed - dynamic multiple
        if (selectedBreeds.length > 0) activeFilters.breed = selectedBreeds.join("|");

        // Gender - allow multiple
        const genders = [];
        if (filters.male) genders.push("Male");
        if (filters.female) genders.push("Female");
        if (genders.length > 0) activeFilters.gender = genders.join("|");

        // Age Range - collect all selected ranges
        const ageRanges = [];
        if (filters.age1) ageRanges.push("0-2");
        if (filters.age2) ageRanges.push("2-5");
        if (filters.age3) ageRanges.push("5-8");
        if (filters.age4) ageRanges.push("8-10");
        if (filters.age5) ageRanges.push("10-12");
        if (ageRanges.length > 0) activeFilters.ageRange = ageRanges.join(",");

        // Health - allow multiple
        const healths = [];
        if (filters.vaccinated) healths.push("Vaccinated");
        if (filters.notVaccinated) healths.push("Not Vaccinated");
        if (healths.length > 0) activeFilters.healthBadge = healths.join("|");

        // Temperament - allow multiple
        const temps = [];
        if (filters.friendly) temps.push("Friendly");
        if (filters.social) temps.push("Social");
        if (filters.gentle) temps.push("Gentle");
        if (filters.affectionate) temps.push("Affectionate");
        if (filters.goodWithKids) temps.push("Good With Kids");
        if (temps.length > 0) activeFilters.temperament = temps.join("|");

        // Navigate back to Home with parameters
        router.replace({
            pathname: "/(tabs)",
            params: activeFilters
        });
    };

    const CheckBox = ({ label, value, onPress }: any) => {
        const scaleAnim = useRef(new Animated.Value(value ? 1 : 0)).current;

        useEffect(() => {
            Animated.spring(scaleAnim, {
                toValue: value ? 1 : 0,
                useNativeDriver: true,
                friction: 5,
            }).start();
        }, [value]);

        return (
            <View className="flex-row justify-between items-center py-2">
                <Text className="text-[#DDE6F0] text-[15px]">{label}</Text>

                <TouchableOpacity
                    onPress={onPress}
                    className={`w-6 h-6 rounded-md border items-center justify-center ${value ? "bg-[#416834] border-[#416834]" : "border-gray-500"
                        }`}
                >
                    <Animated.View
                        style={{
                            transform: [{ scale: scaleAnim }],
                        }}
                    >
                        <Ionicons name="checkmark" size={16} color="black" />
                    </Animated.View>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-black pt-14 px-5">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-5">
                <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace("/(tabs)/" as any)}>
                    <Ionicons name="arrow-back" size={24} color="#DDE6F0" />
                </TouchableOpacity>

                <Text className="text-[#DDE6F0] text-xl font-bold">Filters</Text>

                <TouchableOpacity onPress={clearFilters}>
                    <Text className="text-[#416834] text-sm font-semibold">Clear Filter</Text>
                </TouchableOpacity>
            </View>

            {/* Scrollable Content */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
            >
                {/* Distance */}
                <Text className="text-[#8CAAB9] text-base mt-3 mb-2">
                    Distance from you
                </Text>

                <View className="items-center mb-2">
                    <View className="bg-[#416834] px-3 py-1 rounded-md mb-1">
                        <Text className="text-[#3B2F15] font-semibold">{distance} km</Text>
                    </View>
                </View>

                <Slider
                    minimumValue={0}
                    maximumValue={200}
                    step={1}
                    value={distance}
                    onValueChange={setDistance}
                    minimumTrackTintColor="#416834"
                    maximumTrackTintColor="#555"
                    thumbTintColor="#416834"
                />

                <View className="flex-row justify-between mt-1">
                    <Text className="text-[#8CAAB9] text-xs">0 km</Text>
                    <Text className="text-[#8CAAB9] text-xs">200 km</Text>
                </View>

                {/* Pet Breed */}
                <View className="flex-row justify-between items-center mt-6 mb-2">
                    <Text className="text-[#8CAAB9] text-base">Pet Breed</Text>
                    <TouchableOpacity onPress={() => {
                        setBreedSearch("");
                        setBreedModalVisible(true);
                    }}>
                        <Text className="text-[#416834] font-semibold text-sm">+ Select Breeds</Text>
                    </TouchableOpacity>
                </View>
                
                {/* Selected Breed Chips */}
                {selectedBreeds.length > 0 && (
                    <View className="flex-row flex-wrap gap-2 mb-2">
                        {selectedBreeds.map(breed => (
                            <View key={breed} className="flex-row items-center bg-[#416834]/10 border border-[#416834]/30 px-3 py-1.5 rounded-full">
                                <Text className="text-[#416834] text-sm mr-2">{breed}</Text>
                                <TouchableOpacity onPress={() => setSelectedBreeds(prev => prev.filter(b => b !== breed))}>
                                    <Ionicons name="close-circle" size={16} color="#416834" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}
                <View className="h-px bg-[#2A3A45] mt-2 mb-1" />

                {/* Pet Gender */}
                <Text className="text-[#8CAAB9] text-base mt-6 mb-2">Pet Gender</Text>
                <CheckBox
                    label="Male"
                    value={filters.male}
                    onPress={() => toggle("male")}
                />
                <CheckBox
                    label="Female"
                    value={filters.female}
                    onPress={() => toggle("female")}
                />

                {/* Pet Age */}
                <Text className="text-[#8CAAB9] text-base mt-6 mb-2">Pet Age</Text>
                <CheckBox
                    label="0-2 Years"
                    value={filters.age1}
                    onPress={() => toggle("age1")}
                />
                <CheckBox
                    label="2-5 Years"
                    value={filters.age2}
                    onPress={() => toggle("age2")}
                />
                <CheckBox
                    label="5-8 Years"
                    value={filters.age3}
                    onPress={() => toggle("age3")}
                />
                <CheckBox
                    label="8-10 Years"
                    value={filters.age4}
                    onPress={() => toggle("age4")}
                />
                <CheckBox
                    label="10-12 Years"
                    value={filters.age5}
                    onPress={() => toggle("age5")}
                />

                {/* Health Badge */}
                <Text className="text-[#8CAAB9] text-base mt-6 mb-2">Health Badge</Text>
                <CheckBox
                    label="Vaccinated"
                    value={filters.vaccinated}
                    onPress={() => toggle("vaccinated")}
                />
                <CheckBox
                    label="Not Vaccinated"
                    value={filters.notVaccinated}
                    onPress={() => toggle("notVaccinated")}
                />

                {/* Temperament */}
                <Text className="text-[#8CAAB9] text-base mt-6 mb-2">
                    Pet Temperament
                </Text>
                <CheckBox
                    label="Friendly"
                    value={filters.friendly}
                    onPress={() => toggle("friendly")}
                />
                <CheckBox
                    label="Social"
                    value={filters.social}
                    onPress={() => toggle("social")}
                />
                <CheckBox
                    label="Gentle"
                    value={filters.gentle}
                    onPress={() => toggle("gentle")}
                />
                <CheckBox
                    label="Affectionate"
                    value={filters.affectionate}
                    onPress={() => toggle("affectionate")}
                />
                <CheckBox
                    label="Good With Kids"
                    value={filters.goodWithKids}
                    onPress={() => toggle("goodWithKids")}
                />
            </ScrollView>

            {/* Sticky Apply Button */}
            <View className="absolute bottom-0 left-0 right-0 px-5 pb-8 pt-3">
                <View
                    className="rounded-2xl overflow-hidden"
                    style={{
                        backgroundColor: "rgba(255, 255, 255, 0.1)", // Mimic glass effect without BlurView
                        borderWidth: 1,
                        borderColor: "rgba(255, 255, 255, 0.1)",
                    }}
                >
                    <TouchableOpacity
                        onPress={applyFilters}
                        className="bg-[#416834] rounded-2xl py-4 items-center justify-center"
                    >
                        <Text className="text-[#3B2F15] font-bold text-base">
                            Apply Filters
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
            {/* Modals */}
            <Modal
                visible={breedModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setBreedModalVisible(false)}
            >
                <KeyboardAvoidingView 
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    className="flex-1 bg-black/90 justify-end"
                >
                    <View className="bg-[#FFFFFF] h-[80%] rounded-t-3xl p-5 border-t border-[#3A4A55]">
                        <View className="flex-row justify-between items-center mb-5">
                            <Text className="text-[#416834] text-xl font-bold">Select Breeds</Text>
                            <TouchableOpacity onPress={() => setBreedModalVisible(false)}>
                                <Ionicons name="close" size={28} color="#888" />
                            </TouchableOpacity>
                        </View>
                        
                        <View className="flex-row items-center bg-[#F2F4F7] rounded-xl px-4 py-2 mb-4 border border-[#2A3A45]">
                            <Ionicons name="search" size={20} color="#888" />
                            <TextInput
                                className="flex-1 text-[#DDE6F0] text-base ml-2 py-2"
                                placeholder="Search breeds..."
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
                            data={DOG_BREEDS.filter(b => b.toLowerCase().includes(breedSearch.toLowerCase()))}
                            keyExtractor={(item) => item}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item }) => {
                                const isSelected = selectedBreeds.includes(item);
                                return (
                                    <TouchableOpacity
                                        className={`py-4 flex-row justify-between items-center border-b border-[#2A3A45]`}
                                        onPress={() => {
                                            if (isSelected) {
                                                setSelectedBreeds(prev => prev.filter(b => b !== item));
                                            } else {
                                                setSelectedBreeds(prev => [...prev, item]);
                                            }
                                        }}
                                    >
                                        <Text className={isSelected ? "text-[#416834] font-semibold text-base" : "text-[#DDE6F0] text-base"}>
                                            {item}
                                        </Text>
                                        <View className={`w-6 h-6 rounded-md border items-center justify-center ${isSelected ? "bg-[#416834] border-[#416834]" : "border-gray-500"}`}>
                                            {isSelected && <Ionicons name="checkmark" size={16} color="black" />}
                                        </View>
                                    </TouchableOpacity>
                                );
                            }}
                            ListEmptyComponent={() => (
                                <View className="py-10 items-center">
                                    <Text className="text-[#888] text-base text-center">No breeds found</Text>
                                </View>
                            )}
                        />
                        
                        <TouchableOpacity
                            onPress={() => setBreedModalVisible(false)}
                            className="bg-[#416834] rounded-2xl py-4 items-center justify-center mt-4"
                        >
                            <Text className="text-[#3B2F15] font-bold text-base">Done</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}

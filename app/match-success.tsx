import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL } from '../constants/api';

const { width, height } = Dimensions.get('window');

export default function MatchSuccessScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { matchedPetName, matchedPetImage, ownerName, matchId } = params;

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.imageRow}>
                    <View style={[styles.imageWrapper, styles.imageRotateLeft]}>
                        <Image
                            source={{ uri: "https://images.unsplash.com/photo-1552053831-71594a27632d" }} // User pet placeholder or logic to get user pet
                            style={styles.matchImage}
                        />
                        <View style={styles.pawBadgeLeft}>
                            <Ionicons name="paw" size={20} color="#416834" />
                        </View>
                    </View>
                    <View style={[styles.imageWrapper, styles.imageRotateRight]}>
                        <Image
                            source={{ uri: `${BASE_URL}${matchedPetImage}` }}
                            style={styles.matchImage}
                        />
                        <View style={styles.pawBadgeRight}>
                            <Ionicons name="paw" size={20} color="#416834" />
                        </View>
                    </View>
                </View>

                <View style={styles.infoContainer}>
                    <Text style={styles.congratsText}>CONGRATULATIONS</Text>
                    <Text style={styles.matchTitleText}>It’s a perfect match</Text>
                    <Text style={styles.subtitleText}>
                        Start conversation for <Text style={styles.boldText}>{matchedPetName}</Text> with {ownerName}(owner)
                    </Text>
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        className="bg-primary py-[18px] rounded-[30px] items-center"
                        onPress={() => router.push(`/chat/${matchId}` as any)}
                    >
                        <Text style={styles.sayHelloText}>Say hello</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.keepSwipingButton}
                        onPress={() => router.canGoBack() ? router.back() : router.replace("/(tabs)/" as any)}
                    >
                        <Text style={styles.keepSwipingText}>Keep swiping</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    imageRow: {
        flexDirection: 'row',
        height: 300,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
    },
    imageWrapper: {
        width: 180,
        height: 180,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 4,
        borderColor: '#1C2C35',
        position: 'absolute',
    },
    imageRotateLeft: {
        transform: [{ rotate: '-15deg' }],
        left: width / 2 - 140,
        zIndex: 1,
    },
    imageRotateRight: {
        transform: [{ rotate: '15deg' }],
        right: width / 2 - 140,
        zIndex: 2,
    },
    matchImage: {
        width: '100%',
        height: '100%',
    },
    pawBadgeLeft: {
        position: 'absolute',
        top: -10,
        right: -10,
        backgroundColor: '#1C2C35',
        borderRadius: 20,
        padding: 5,
    },
    pawBadgeRight: {
        position: 'absolute',
        bottom: -10,
        right: -10,
        backgroundColor: '#1C2C35',
        borderRadius: 20,
        padding: 5,
    },
    infoContainer: {
        alignItems: 'center',
        marginBottom: 60,
    },
    congratsText: {
        color: '#416834',
        fontSize: 18,
        letterSpacing: 2,
        fontWeight: '600',
        marginBottom: 10,
    },
    matchTitleText: {
        color: '#DDE6F0',
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    subtitleText: {
        color: '#DDE6F0',
        opacity: 0.7,
        fontSize: 16,
        textAlign: 'center',
    },
    boldText: {
        fontWeight: 'bold',
        fontStyle: 'italic',
    },
    buttonContainer: {
        width: '100%',
        gap: 15,
    },
    sayHelloText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    keepSwipingButton: {
        backgroundColor: '#3A4A55',
        paddingVertical: 18,
        borderRadius: 30,
        alignItems: 'center',
    },
    keepSwipingText: {
        color: '#DDE6F0',
        fontSize: 18,
        fontWeight: '600',
    },
});

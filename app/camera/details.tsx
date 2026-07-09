import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image as RNImage } from 'react-native';
import { BASE_URL } from '../../constants/api';

export default function NutritionDetailsScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [scan, setScan] = useState<any>(null);

  useEffect(() => {
    if (params.scan) {
      try {
        setScan(JSON.parse(params.scan as string));
      } catch (e) {
        console.error("Error parsing scan", e);
      }
    }
  }, [params.scan]);

  if (!scan) return <View style={styles.container} />;

  const nutrition = scan.nutrition || { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const items = scan.items || [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nutrition Details</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
            <RNImage 
                source={{ uri: `${BASE_URL}${scan.image}` }} 
                style={styles.foodImage} 
                resizeMode="cover"
            />
        </View>

        <Text style={styles.foodName}>{scan.foodName}</Text>

        {/* Main Macro Card */}
        <View style={styles.macroCard}>
            <View style={styles.macroItem}>
                <Ionicons name="flame" size={24} color="#FF8C00" />
                <Text style={styles.macroValue}>{nutrition.calories} kcal</Text>
                <Text style={styles.macroLabel}>Calories</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.macroItem}>
                <Ionicons name="fitness" size={24} color="#416834" />
                <Text style={styles.macroValue}>{nutrition.protein}g</Text>
                <Text style={styles.macroLabel}>Protein</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.macroItem}>
                <Ionicons name="water" size={24} color="#3297FF" />
                <Text style={styles.macroValue}>{nutrition.carbs}g</Text>
                <Text style={styles.macroLabel}>Carbs</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.macroItem}>
                <Ionicons name="restaurant" size={24} color="#FF4D4D" />
                <Text style={styles.macroValue}>{nutrition.fat}g</Text>
                <Text style={styles.macroLabel}>Fat</Text>
            </View>
        </View>

        {/* Breakdown List */}
        <Text style={styles.sectionTitle}>Item Breakdown</Text>
        <View style={styles.itemsList}>
            {items.map((item: any, idx: number) => (
                <View key={idx} style={styles.listItem}>
                    <View style={styles.listItemLeft}>
                        <Text style={styles.listItemName}>{item.quantity}x {item.name}</Text>
                        <Text style={styles.listItemMacros}>
                            P: {item.nutrition?.protein}g • C: {item.nutrition?.carbs}g • F: {item.nutrition?.fat}g
                        </Text>
                    </View>
                    <Text style={styles.listItemCals}>{(item.nutrition?.calories || 0) * (item.quantity || 1)} kcal</Text>
                </View>
            ))}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.homeButton} 
          onPress={() => router.replace('/(tabs)/' as any)}
        >
          <Text style={styles.homeButtonText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#191D17',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  imageContainer: {
    width: '100%',
    height: 220,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#E0E0E0'
  },
  foodImage: {
    width: '100%',
    height: '100%',
  },
  foodName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#191D17',
    marginBottom: 20,
    textAlign: 'center',
  },
  macroCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 10,
    justifyContent: 'space-around',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8ECE0',
    marginBottom: 30,
  },
  macroItem: {
    alignItems: 'center',
    flex: 1,
  },
  macroValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#191D17',
    marginTop: 8,
  },
  macroLabel: {
    fontSize: 12,
    color: '#8C8C8C',
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#F0F0F0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#191D17',
    marginBottom: 15,
  },
  itemsList: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E8ECE0',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  listItemLeft: {
    flex: 1,
  },
  listItemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#191D17',
    marginBottom: 4,
  },
  listItemMacros: {
    fontSize: 12,
    color: '#8C8C8C',
  },
  listItemCals: {
    fontSize: 15,
    fontWeight: '700',
    color: '#416834',
  },
  footer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  homeButton: {
    backgroundColor: '#416834',
    paddingVertical: 18,
    borderRadius: 100,
    alignItems: 'center',
  },
  homeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});

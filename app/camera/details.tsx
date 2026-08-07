import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
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
        console.error('Error parsing scan', e);
      }
    }
  }, [params.scan]);

  if (!scan)
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="leaf-outline" size={48} color="#416834" />
          <Text style={styles.loadingText}>Loading results...</Text>
        </View>
      </View>
    );

  const nutrition = scan.nutrition || { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
  const items: any[] = scan.items || [];

  /** Calorie breakdown by macro */
  const proteinCals = (nutrition.protein || 0) * 4;
  const carbsCals = (nutrition.carbs || 0) * 4;
  const fatCals = (nutrition.fat || 0) * 9;
  const totalMacroCals = proteinCals + carbsCals + fatCals || 1;

  const proteinPct = Math.round((proteinCals / totalMacroCals) * 100);
  const carbsPct = Math.round((carbsCals / totalMacroCals) * 100);
  const fatPct = 100 - proteinPct - carbsPct;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backIcon}
          onPress={() => router.replace('/(tabs)/' as any)}
        >
          <Ionicons name="arrow-back" size={22} color="#191D17" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nutrition Details</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Food image */}
        {scan.image ? (
          <View style={styles.imageContainer}>
            <RNImage
              source={{ uri: `${BASE_URL}${scan.image}` }}
              style={styles.foodImage}
              resizeMode="cover"
            />
            <View style={styles.imageBadge}>
              <Ionicons name="sparkles" size={12} color="white" />
              <Text style={styles.imageBadgeText}>AI Analyzed</Text>
            </View>
          </View>
        ) : null}

        <Text style={styles.foodName}>{scan.foodName || 'Scanned Meal'}</Text>

        {/* Calorie hero */}
        <View style={styles.calorieCard}>
          <Ionicons name="flame" size={32} color="#FF6B35" />
          <Text style={styles.calorieValue}>{Math.round(nutrition.calories)}</Text>
          <Text style={styles.calorieUnit}>kcal</Text>
          <Text style={styles.calorieLabel}>Total Calories</Text>
        </View>

        {/* Main macro row */}
        <View style={styles.macroCard}>
          <View style={styles.macroItem}>
            <View style={[styles.macroIcon, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="fitness" size={20} color="#2E7D32" />
            </View>
            <Text style={styles.macroValue}>{(nutrition.protein || 0).toFixed(1)}g</Text>
            <Text style={styles.macroLabel}>Protein</Text>
            <Text style={styles.macroPct}>{proteinPct}%</Text>
          </View>
          <View style={styles.macroDivider} />
          <View style={styles.macroItem}>
            <View style={[styles.macroIcon, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="water" size={20} color="#1565C0" />
            </View>
            <Text style={styles.macroValue}>{(nutrition.carbs || 0).toFixed(1)}g</Text>
            <Text style={styles.macroLabel}>Carbs</Text>
            <Text style={styles.macroPct}>{carbsPct}%</Text>
          </View>
          <View style={styles.macroDivider} />
          <View style={styles.macroItem}>
            <View style={[styles.macroIcon, { backgroundColor: '#FCE4EC' }]}>
              <Ionicons name="restaurant" size={20} color="#C62828" />
            </View>
            <Text style={styles.macroValue}>{(nutrition.fat || 0).toFixed(1)}g</Text>
            <Text style={styles.macroLabel}>Fat</Text>
            <Text style={styles.macroPct}>{fatPct}%</Text>
          </View>
        </View>

        {/* Macro bar */}
        <View style={styles.macroBar}>
          <View style={[styles.macroBarSegment, { flex: proteinPct, backgroundColor: '#2E7D32' }]} />
          <View style={[styles.macroBarSegment, { flex: carbsPct, backgroundColor: '#1565C0' }]} />
          <View style={[styles.macroBarSegment, { flex: fatPct, backgroundColor: '#C62828' }]} />
        </View>

        {/* Secondary nutrients */}
        {nutrition.fiber > 0 && (
          <View style={styles.secondaryCard}>
            <View style={styles.secondaryRow}>
              <View style={styles.secondaryLeft}>
                <Ionicons name="leaf-outline" size={18} color="#416834" />
                <Text style={styles.secondaryLabel}>Dietary Fiber</Text>
              </View>
              <Text style={styles.secondaryValue}>{(nutrition.fiber || 0).toFixed(1)}g</Text>
            </View>
          </View>
        )}

        {/* Item breakdown */}
        <Text style={styles.sectionTitle}>Item Breakdown</Text>
        <View style={styles.itemsList}>
          {items.map((item: any, idx: number) => {
            const q = item.quantity || 1;
            const itemCals = Math.round((item.nutrition?.calories || 0) * q);
            return (
              <View key={idx} style={[styles.listItem, idx === items.length - 1 && styles.listItemLast]}>
                <View style={styles.listItemLeft}>
                  <View style={styles.listItemHeader}>
                    <Text style={styles.listItemName}>{item.name}</Text>
                    <View style={styles.qtyBadge}>
                      <Text style={styles.qtyBadgeText}>×{q}</Text>
                    </View>
                  </View>
                  {item.servingSize ? (
                    <Text style={styles.listItemServing}>{item.servingSize}</Text>
                  ) : null}
                  <Text style={styles.listItemMacros}>
                    P: {((item.nutrition?.protein || 0) * q).toFixed(1)}g
                    {'  '}C: {((item.nutrition?.carbs || 0) * q).toFixed(1)}g
                    {'  '}F: {((item.nutrition?.fat || 0) * q).toFixed(1)}g
                  </Text>
                </View>
                <Text style={styles.listItemCals}>{itemCals} kcal</Text>
              </View>
            );
          })}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => router.replace('/(tabs)/' as any)}
        >
          <Ionicons name="home-outline" size={20} color="white" style={{ marginRight: 8 }} />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#8C8C8C',
    fontSize: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8F9F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8ECE0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#191D17',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  imageContainer: {
    width: '100%',
    height: 220,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#E0E0E0',
    position: 'relative',
  },
  foodImage: {
    width: '100%',
    height: '100%',
  },
  imageBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(65,104,52,0.9)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 4,
  },
  imageBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  foodName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#191D17',
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 30,
  },
  calorieCard: {
    backgroundColor: '#191D17',
    borderRadius: 24,
    paddingVertical: 24,
    alignItems: 'center',
    marginBottom: 12,
    gap: 4,
  },
  calorieValue: {
    fontSize: 48,
    fontWeight: '900',
    color: 'white',
    lineHeight: 56,
  },
  calorieUnit: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
  },
  calorieLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 2,
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
    marginBottom: 10,
  },
  macroItem: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  macroIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#191D17',
  },
  macroLabel: {
    fontSize: 11,
    color: '#8C8C8C',
  },
  macroPct: {
    fontSize: 11,
    color: '#AAAAAA',
    fontWeight: '500',
  },
  macroDivider: {
    width: 1,
    height: 50,
    backgroundColor: '#F0F0F0',
  },
  macroBar: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 16,
  },
  macroBarSegment: {
    height: '100%',
  },
  secondaryCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8ECE0',
    marginBottom: 20,
  },
  secondaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  secondaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  secondaryLabel: {
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
  },
  secondaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#191D17',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#191D17',
    marginBottom: 12,
  },
  itemsList: {
    backgroundColor: 'white',
    borderRadius: 24,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#E8ECE0',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  listItemLast: {
    borderBottomWidth: 0,
  },
  listItemLeft: {
    flex: 1,
    marginRight: 12,
  },
  listItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 3,
  },
  listItemName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#191D17',
  },
  qtyBadge: {
    backgroundColor: '#F0F4E8',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  qtyBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#416834',
  },
  listItemServing: {
    fontSize: 11,
    color: '#AAAAAA',
    marginBottom: 4,
  },
  listItemMacros: {
    fontSize: 12,
    color: '#8C8C8C',
    lineHeight: 18,
  },
  listItemCals: {
    fontSize: 15,
    fontWeight: '700',
    color: '#416834',
  },
  footer: {
    padding: 20,
    paddingBottom: 28,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  homeButton: {
    backgroundColor: '#416834',
    paddingVertical: 18,
    borderRadius: 100,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  homeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});

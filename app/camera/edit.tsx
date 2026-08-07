import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image as RNImage,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { API_URL, BASE_URL } from '../../constants/api';

export default function EditScanScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { token } = useAuth();

  const [items, setItems] = useState<any[]>([]);
  const [imagePath, setImagePath] = useState<string>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (params.items) {
      try {
        setItems(JSON.parse(params.items as string));
      } catch (e) {
        console.error('Error parsing items', e);
      }
    }
    if (params.imagePath) {
      setImagePath(params.imagePath as string);
    }
  }, [params.items, params.imagePath]);

  const updateQuantity = (index: number, delta: number) => {
    const newItems = [...items];
    const newQty = Math.max(1, (newItems[index].quantity || 1) + delta);
    newItems[index].quantity = newQty;
    setItems(newItems);
  };

  /** Compute total nutrition across all items (quantity × per-unit values) */
  const totalNutrition = items.reduce(
    (acc, item) => {
      const q = item.quantity || 1;
      return {
        calories: acc.calories + (item.nutrition?.calories || 0) * q,
        protein: acc.protein + (item.nutrition?.protein || 0) * q,
        carbs: acc.carbs + (item.nutrition?.carbs || 0) * q,
        fat: acc.fat + (item.nutrition?.fat || 0) * q,
        fiber: acc.fiber + (item.nutrition?.fiber || 0) * q,
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );

  const handleConfirm = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/scan/save`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imagePath, items }),
      });

      const data = await response.json();
      if (data.success) {
        router.replace({
          pathname: '/camera/details',
          params: { scan: JSON.stringify(data.scan) },
        });
      } else {
        Alert.alert('Error', data.message || 'Failed to save scan');
      }
    } catch (error: any) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Network Error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#191D17" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detected Food</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {imagePath ? (
          <RNImage
            source={{ uri: `${BASE_URL}${imagePath}` }}
            style={styles.previewImage}
            resizeMode="cover"
          />
        ) : null}

        {/* Live nutrition summary — updates as quantities change */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Total Nutrition</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{Math.round(totalNutrition.calories)}</Text>
              <Text style={styles.summaryLabel}>kcal</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{totalNutrition.protein.toFixed(1)}g</Text>
              <Text style={styles.summaryLabel}>Protein</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{totalNutrition.carbs.toFixed(1)}g</Text>
              <Text style={styles.summaryLabel}>Carbs</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{totalNutrition.fat.toFixed(1)}g</Text>
              <Text style={styles.summaryLabel}>Fat</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={16} color="#416834" style={{ marginRight: 6 }} />
          <Text style={styles.infoText}>
            Review detected items. Adjust quantities if needed — nutrition totals update automatically.
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Detected Items ({items.length})</Text>

        <View style={styles.itemsContainer}>
          {items.map((item, index) => (
            <View key={index} style={[styles.itemRow, index === items.length - 1 && styles.itemRowLast]}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                {item.servingSize ? (
                  <Text style={styles.servingSize}>Per serving: {item.servingSize}</Text>
                ) : null}
                <View style={styles.macroTagsRow}>
                  <View style={[styles.macroTag, { backgroundColor: '#FFF3E0' }]}>
                    <Text style={[styles.macroTagText, { color: '#E65100' }]}>
                      {item.nutrition?.calories || 0} kcal
                    </Text>
                  </View>
                  <View style={[styles.macroTag, { backgroundColor: '#E8F5E9' }]}>
                    <Text style={[styles.macroTagText, { color: '#2E7D32' }]}>
                      P {item.nutrition?.protein || 0}g
                    </Text>
                  </View>
                  <View style={[styles.macroTag, { backgroundColor: '#E3F2FD' }]}>
                    <Text style={[styles.macroTagText, { color: '#1565C0' }]}>
                      C {item.nutrition?.carbs || 0}g
                    </Text>
                  </View>
                  <View style={[styles.macroTag, { backgroundColor: '#FCE4EC' }]}>
                    <Text style={[styles.macroTagText, { color: '#C62828' }]}>
                      F {item.nutrition?.fat || 0}g
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => updateQuantity(index, -1)}
                >
                  <Ionicons name="remove" size={18} color="#191D17" />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{item.quantity || 1}</Text>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => updateQuantity(index, 1)}
                >
                  <Ionicons name="add" size={18} color="#191D17" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerSummary}>
          <Text style={styles.footerCalories}>{Math.round(totalNutrition.calories)} kcal total</Text>
          <Text style={styles.footerMacros}>
            P {totalNutrition.protein.toFixed(1)}g · C {totalNutrition.carbs.toFixed(1)}g · F {totalNutrition.fat.toFixed(1)}g
          </Text>
        </View>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirm}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={20} color="white" style={{ marginRight: 8 }} />
              <Text style={styles.confirmButtonText}>Confirm & Save</Text>
            </>
          )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: 'white',
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 20,
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: '#191D17',
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
  },
  summaryTitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  summaryLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
  },
  summaryDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  infoBox: {
    backgroundColor: '#F0F4E8',
    padding: 12,
    borderRadius: 12,
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    color: '#416834',
    fontSize: 13,
    lineHeight: 20,
    flex: 1,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#191D17',
    marginBottom: 10,
  },
  itemsContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E8ECE0',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  itemRowLast: {
    borderBottomWidth: 0,
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#191D17',
    marginBottom: 3,
  },
  servingSize: {
    fontSize: 11,
    color: '#AAAAAA',
    marginBottom: 6,
  },
  macroTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  macroTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  macroTagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9F5',
    borderRadius: 20,
    padding: 4,
  },
  qtyBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  qtyText: {
    width: 28,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
    color: '#191D17',
  },
  footer: {
    padding: 20,
    paddingBottom: 28,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 12,
  },
  footerSummary: {
    alignItems: 'center',
  },
  footerCalories: {
    fontSize: 16,
    fontWeight: '700',
    color: '#191D17',
  },
  footerMacros: {
    fontSize: 12,
    color: '#8C8C8C',
    marginTop: 2,
  },
  confirmButton: {
    backgroundColor: '#416834',
    paddingVertical: 18,
    borderRadius: 100,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});

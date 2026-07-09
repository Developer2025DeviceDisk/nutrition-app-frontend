import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, Image as RNImage } from 'react-native';
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
        console.error("Error parsing items", e);
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

  const handleConfirm = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/scan/save`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: imagePath,
          items: items
        }),
      });

      const data = await response.json();
      if (data.success) {
        router.replace({
            pathname: '/camera/details',
            params: {
                scan: JSON.stringify(data.scan)
            }
        });
      } else {
        Alert.alert("Error", data.message || "Failed to save scan");
      }
    } catch (error: any) {
      console.error("Save error:", error);
      Alert.alert("Error", "Network Error");
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

      <ScrollView style={styles.content}>
        {imagePath ? (
          <RNImage 
            source={{ uri: `${BASE_URL}${imagePath}` }} 
            style={styles.previewImage} 
            resizeMode="cover"
          />
        ) : null}

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Please review the detected items. Adjust the quantities if necessary.
          </Text>
        </View>

        <View style={styles.itemsContainer}>
          {items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemCalories}>
                  {item.nutrition?.calories || 0} kcal / unit
                </Text>
              </View>
              
              <View style={styles.quantityControls}>
                <TouchableOpacity 
                  style={styles.qtyBtn} 
                  onPress={() => updateQuantity(index, -1)}
                >
                  <Ionicons name="remove" size={20} color="#191D17" />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{item.quantity || 1}</Text>
                <TouchableOpacity 
                  style={styles.qtyBtn} 
                  onPress={() => updateQuantity(index, 1)}
                >
                  <Ionicons name="add" size={20} color="#191D17" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.confirmButton} 
          onPress={handleConfirm}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.confirmButtonText}>Confirm & Save</Text>
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
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'white',
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
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 24,
    marginBottom: 20,
  },
  infoBox: {
    backgroundColor: '#F0F4E8',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoText: {
    color: '#416834',
    fontSize: 14,
    lineHeight: 20,
  },
  itemsContainer: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E8ECE0',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#191D17',
    marginBottom: 4,
  },
  itemCalories: {
    fontSize: 13,
    color: '#8C8C8C',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9F5',
    borderRadius: 20,
    padding: 4,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  qtyText: {
    width: 30,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#191D17',
  },
  footer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  confirmButton: {
    backgroundColor: '#416834',
    paddingVertical: 18,
    borderRadius: 100,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});

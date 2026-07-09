import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Dimensions, Image as RNImage } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../constants/api';
import { getUploadableUri, appendFormFile } from '../../utils/fileUpload';

const { width, height } = Dimensions.get('window');

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [uploading, setUploading] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();
  const { token } = useAuth();

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center', marginBottom: 20, color: 'white' }}>We need your permission to show the camera</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const toggleFlash = () => {
    setFlash(current => (current === 'off' ? 'on' : 'off'));
  };

  const takePicture = async () => {
    if (cameraRef.current) {
        try {
            const capturedPhoto = await cameraRef.current.takePictureAsync();
            if (capturedPhoto) {
                setPhoto(capturedPhoto.uri);
            }
        } catch (error) {
            console.error("Capture error:", error);
            Alert.alert("Error", "Failed to capture photo.");
        }
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhoto(result.assets[0].uri);
    }
  };

  const retakePhoto = () => {
    setPhoto(null);
  };

  const analyzeFood = async () => {
    if (!photo) return;
    setUploading(true);
    
    try {
      const formData = new FormData();
      await appendFormFile(formData, "image", photo);

      const response = await fetch(`${API_URL}/scan/analyze`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        router.push({
            pathname: '/camera/edit',
            params: {
                items: JSON.stringify(data.items),
                imagePath: data.imagePath
            }
        });
      } else {
        Alert.alert("Error", data.message || "Failed to analyze scan");
      }
    } catch (error: any) {
      console.error("Upload error details:", error);
      Alert.alert("Error", `Upload failed: ${error.message || "Network Error"}`);
    } finally {
      setUploading(false);
    }
  };

  if (photo) {
    return (
      <View style={styles.container}>
        <RNImage source={{ uri: photo }} style={StyleSheet.absoluteFillObject} />
        
        <View style={styles.previewOverlay}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={retakePhoto}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.previewControls}>
            <TouchableOpacity style={styles.retakeButton} onPress={retakePhoto}>
              <Text style={styles.retakeButtonText}>Retake Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.analyzeButton} onPress={analyzeFood}>
              <Text style={styles.analyzeButtonText}>Analyze Food</Text>
              <Ionicons name="sparkles" size={20} color="white" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>
        </View>

        {uploading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#416834" />
            <Text style={styles.loadingText}>Analyzing Food...</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView 
        ref={cameraRef}
        style={StyleSheet.absoluteFill} 
        facing={facing}
        enableTorch={flash === 'on'}
      />
      
      <View style={styles.overlay}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSection}>
          <View style={styles.controlsContainer}>
            <TouchableOpacity 
              style={styles.sideButton} 
              onPress={toggleFlash}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons 
                  name={flash === 'on' ? "flashlight" : "flashlight-off"} 
                  size={26} 
                  color="white" 
              />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.scanButton} 
              onPress={takePicture}
              activeOpacity={0.8}
            >
              <Ionicons name="camera-outline" size={32} color="white" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.sideButton} 
              onPress={pickImage}
              activeOpacity={0.7}
            >
              <Ionicons name="image-outline" size={26} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    paddingBottom: 40,
  },
  previewOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    paddingBottom: 40,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  bottomSection: {
    paddingHorizontal: 30,
    paddingBottom: 30,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sideButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  scanButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#416834',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  permissionButton: {
    backgroundColor: '#416834',
    padding: 18,
    borderRadius: 15,
    alignSelf: 'center',
  },
  permissionButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  previewControls: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  retakeButton: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 18,
    borderRadius: 16,
    marginRight: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  retakeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  analyzeButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#416834',
    paddingVertical: 18,
    borderRadius: 16,
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  analyzeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    marginTop: 15,
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image as RNImage,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../constants/api';
import { appendFormFile } from '../../utils/fileUpload';

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [uploading, setUploading] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();
  const { token } = useAuth();

  // useIsFocused causes the CameraView to unmount when the screen loses focus
  // and remount (fully re-initializing the native camera) when focus returns.
  const isFocused = useIsFocused();

  // Reset state and re-request permissions every time the screen comes into focus.
  useFocusEffect(
    useCallback(() => {
      setPhoto(null);
      setUploading(false);
      setIsCameraReady(false);

      // Re-request camera permission in case it was revoked while backgrounded
      if (permission && !permission.granted && permission.canAskAgain) {
        requestPermission();
      }

      return () => {
        // Cleanup: reset camera ready state when leaving screen
        setIsCameraReady(false);
      };
    }, [permission])
  );

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#416834" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-outline" size={64} color="rgba(255,255,255,0.6)" />
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionSubtext}>
            Allow camera access to scan and analyze your food
          </Text>
          <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const toggleFlash = () => {
    setFlash(current => (current === 'off' ? 'on' : 'off'));
  };

  const takePicture = async () => {
    if (!isCameraReady) {
      Alert.alert('Camera Not Ready', 'Please wait for the camera to initialize.');
      return;
    }
    if (cameraRef.current) {
      try {
        const capturedPhoto = await cameraRef.current.takePictureAsync({ quality: 0.8 });
        if (capturedPhoto) {
          setPhoto(capturedPhoto.uri);
        }
      } catch (error) {
        console.error('Capture error:', error);
        Alert.alert(
          'Error',
          'Failed to capture photo. Please try again.\n\nError details: ' +
          (error instanceof Error ? error.message : String(error))
        );
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
    setIsCameraReady(false);
  };

  const analyzeFood = async () => {
    if (!photo) return;
    setUploading(true);

    try {
      const formData = new FormData();
      await appendFormFile(formData, 'image', photo);

      const response = await fetch(`${API_URL}/scan/analyze`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        router.push({
          pathname: '/camera/edit',
          params: {
            items: JSON.stringify(data.items),
            imagePath: data.imagePath,
          },
        });
      } else {
        Alert.alert('Analysis Failed', data.message || 'Could not analyze the food image.');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      Alert.alert('Error', `Upload failed: ${error.message || 'Network Error'}`);
    } finally {
      setUploading(false);
    }
  };

  // Preview screen (after capturing / picking a photo)
  if (photo) {
    return (
      <View style={styles.container}>
        <RNImage source={{ uri: photo }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />

        <View style={styles.previewOverlay}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={retakePhoto}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Food scan frame hint */}
          <View style={styles.scanFrame} pointerEvents="none">
            <Text style={styles.scanFrameLabel}>Food detected — ready to analyze</Text>
          </View>

          <View style={styles.previewControls}>
            <TouchableOpacity style={styles.retakeButton} onPress={retakePhoto}>
              <Ionicons name="camera-reverse-outline" size={20} color="white" style={{ marginRight: 8 }} />
              <Text style={styles.retakeButtonText}>Retake</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.analyzeButton} onPress={analyzeFood} disabled={uploading}>
              <Ionicons name="sparkles" size={20} color="white" style={{ marginRight: 8 }} />
              <Text style={styles.analyzeButtonText}>Analyze Food</Text>
            </TouchableOpacity>
          </View>
        </View>

        {uploading && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingCard}>
              <ActivityIndicator size="large" color="#416834" />
              <Text style={styles.loadingTitle}>Analyzing Food...</Text>
              <Text style={styles.loadingSubtext}>AI is detecting food items & calculating nutrition</Text>
            </View>
          </View>
        )}
      </View>
    );
  }

  // Live camera screen
  return (
    <View style={styles.container}>
      {/* Only render CameraView when screen is focused — forces re-init on resume */}
      {isFocused && (
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing={facing}
          enableTorch={flash === 'on'}
          onCameraReady={() => setIsCameraReady(true)}
        />
      )}

      <View style={styles.overlay}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Scan Food</Text>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setFacing(f => (f === 'back' ? 'front' : 'back'))}
            activeOpacity={0.7}
          >
            <Ionicons name="camera-reverse-outline" size={22} color="white" />
          </TouchableOpacity>
        </View>

        {/* Scanning guide frame */}
        <View style={styles.frameContainer} pointerEvents="none">
          <View style={styles.scanGuideFrame}>
            {/* Corner decorations */}
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
          <Text style={styles.guideText}>Point camera at your food</Text>
        </View>

        <View style={styles.bottomSection}>
          {!isCameraReady && isFocused && (
            <Text style={styles.initializingText}>Initializing camera...</Text>
          )}
          <View style={styles.controlsContainer}>
            <TouchableOpacity
              style={styles.sideButton}
              onPress={toggleFlash}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name={flash === 'on' ? 'flashlight' : 'flashlight-off'}
                size={26}
                color="white"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.scanButton, !isCameraReady && styles.scanButtonDisabled]}
              onPress={takePicture}
              activeOpacity={0.8}
              disabled={!isCameraReady}
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
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
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
  frameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanGuideFrame: {
    width: 260,
    height: 260,
    borderRadius: 20,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: 'rgba(255,255,255,0.9)',
    borderWidth: 3,
  },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 8 },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 8 },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 8 },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 8 },
  guideText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  scanFrameLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    textAlign: 'center',
    backgroundColor: 'rgba(65,104,52,0.8)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: 'hidden',
  },
  scanFrame: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 20,
  },
  bottomSection: {
    paddingHorizontal: 30,
    paddingBottom: 30,
  },
  initializingText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 12,
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
  scanButtonDisabled: {
    backgroundColor: 'rgba(65,104,52,0.4)',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
  },
  permissionSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 22,
  },
  permissionButton: {
    backgroundColor: '#416834',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 100,
    marginTop: 8,
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
    gap: 12,
  },
  retakeButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  retakeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  analyzeButton: {
    flex: 1.5,
    flexDirection: 'row',
    backgroundColor: '#416834',
    paddingVertical: 18,
    borderRadius: 16,
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
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginHorizontal: 40,
    gap: 12,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#191D17',
  },
  loadingSubtext: {
    fontSize: 13,
    color: '#8C8C8C',
    textAlign: 'center',
    lineHeight: 20,
  },
});

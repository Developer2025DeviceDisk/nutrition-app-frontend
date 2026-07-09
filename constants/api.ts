import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getBaseUrl = (): string => {
  // Check if an environment variable is defined
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Fallback to production URL when NOT in development mode
  if (!__DEV__) {
    return 'https://nutrition-app-backend-el86.onrender.com';
  }

  // Web browser check
  if (typeof window !== 'undefined' && window.location) {
    // If the browser is accessing the page, we can connect to the backend on the same host
    return `http://${window.location.hostname}:5000`;
  }

  // Mobile/native environment check
  // Constants.expoConfig?.hostUri contains the IP:port of the packager server (e.g. 192.168.x.x:8081)
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    return `http://${ip}:5000`;
  }

  // Default fallback (e.g., simulators)
  return Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';
};

export const BASE_URL = getBaseUrl();
export const API_URL = BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL}/api`;



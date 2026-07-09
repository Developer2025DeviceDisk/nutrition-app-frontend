import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

/**
 * On Android release/APK, ImagePicker returns content:// URIs.
 * FormData/fetch cannot read content:// URIs, so we copy to cache (file://) for upload.
 * If the URI is already file://, returns it as-is.
 */
export async function getUploadableUri(uri: string): Promise<string> {
  if (!uri) return uri;
  // file:// URIs work with FormData; no need to copy
  if (uri.startsWith('file://')) return uri;

  const cacheDir = FileSystem.cacheDirectory;
  if (!cacheDir) return uri;

  const ext = getExtension(uri);
  const destUri = `${cacheDir}upload_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;

  try {
    await FileSystem.copyAsync({ from: uri, to: destUri });
    return destUri;
  } catch (e) {
    console.warn('getUploadableUri copy failed, using original:', e);
    return uri;
  }
}

function getExtension(uri: string): string {
  const name = uri.split('/').pop() || '';
  const match = /\.(\w+)$/i.exec(name);
  if (match) return '.' + match[1].toLowerCase();
  return '.jpg';
}

/**
 * Appends a file URI to FormData properly depending on the platform (Web vs Native).
 */
export async function appendFormFile(formData: FormData, fieldName: string, uri: string) {
  if (!uri) return;

  const fileUri = await getUploadableUri(uri);
  const filename = fileUri.split('/').pop() || `file_${Date.now()}.jpg`;
  const match = /\.(\w+)$/.exec(filename);
  const ext = match ? match[1].toLowerCase() : "jpg";
  
  let type = "image/jpeg";
  if (['mp4', 'm4v', 'mov', 'avi', 'mkv', 'webm', '3gp'].includes(ext)) {
    type = `video/${ext === 'mov' ? 'quicktime' : ext}`;
  } else {
    type = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
  }

  if (Platform.OS === 'web') {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const file = new File([blob], filename, { type });
      formData.append(fieldName, file);
    } catch (err) {
      console.error('Failed to convert web URI to Blob:', err);
      // Fallback
      formData.append(fieldName, uri);
    }
  } else {
    formData.append(fieldName, ({
      uri: fileUri,
      name: filename,
      type
    } as any));
  }
}

import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, auth } from '../config/firebase';

export const pickImage = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    return { success: false, error: 'Photo permission denied' };
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });
  if (result.canceled) return { success: false, canceled: true };
  return { success: true, uri: result.assets[0].uri };
};

export const uploadProfilePhoto = async (uri) => {
  try {
    const user = auth.currentUser;
    if (!user) return { success: false, error: 'Not signed in' };

    // Compress
    const compressed = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 512 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );

    // Convert to blob
    const response = await fetch(compressed.uri);
    const blob = await response.blob();

    const path = `profilePhotos/${user.uid}/avatar-${Date.now()}.jpg`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, blob);
    const url = await getDownloadURL(storageRef);

    return { success: true, url };
  } catch (e) {
    return { success: false, error: e.message };
  }
};
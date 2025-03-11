

import React, { useState, useEffect } from 'react';
import {
  Platform,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import * as Font from 'expo-font';
import axios from 'axios';

const AnimalDetectionScreen = () => {
  const [image, setImage] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [fontLoaded, setFontLoaded] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadFontAndPermissions = async () => {
      await Font.loadAsync({
        Poppins: require('../assets/fonts/Poppins-Regular.ttf'),
      });
      setFontLoaded(true);

      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (cameraStatus.status !== 'granted' || galleryStatus.status !== 'granted') {
        Alert.alert('Permissions required', 'Please enable camera and gallery permissions.');
      } else {
        setHasPermission(true);
      }
    };

    loadFontAndPermissions();
  }, []);

  
  const getServerUrl = () => {
    return Platform.OS === 'android' && !__DEV__
      ? 'http://10.0.2.2:5000/predict' // Emulator
      : 'http://192.168.1.46:5000/predict'; // Replace with your local IP for physical devices
  };

  const uploadImage = async (uri) => {
    setIsLoading(true);
    setPrediction(null);

    const formData = new FormData();
    formData.append('image', {
      uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
      name: 'photo.jpg',
      type: 'image/jpeg',
    });

    const url = getServerUrl();
    console.log('Uploading to:', url);

    try {
      const response = await axios.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 10000, // Add timeout to avoid hanging
      });
      console.log('Response:', response.data);
      setPrediction(response.data);
    } catch (error) {
      console.error('Upload Error:', error.message);
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to connect to the server.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const takePhoto = async () => {
    if (!hasPermission) return Alert.alert('Camera permission required.');
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
      uploadImage(result.assets[0].uri);
    }
  };

  const pickImageFromGallery = async () => {
    if (!hasPermission) return Alert.alert('Gallery permission required.');
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
      uploadImage(result.assets[0].uri);
    }
  };

  const clearImage = () => {
    setImage(null);
    setPrediction(null);
  };

  if (!fontLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff6b6b" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔍 Animal Recognizer</Text>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#ff6b6b" />
          <Text style={styles.loadingText}>Processing...</Text>
        </View>
      )}

      {image && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: image }} style={styles.image} />
          {prediction && (
            <View style={styles.predictionContainer}>
              <Text style={styles.predictionText}>
                I think it's a {prediction.prediction}!
              </Text>
              <Text style={styles.confidenceText}>
                Confidence: {prediction.confidence.toFixed(2)}%
              </Text>
            </View>
          )}
          <TouchableOpacity style={styles.clearButton} onPress={clearImage}>
            <Ionicons name="trash" size={24} color="white" />
            <Text style={styles.buttonText}>Clear</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.button} onPress={takePhoto}>
          <Ionicons name="camera" size={24} color="white" />
          <Text style={styles.buttonText}>Take Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={pickImageFromGallery}>
          <Ionicons name="image" size={24} color="white" />
          <Text style={styles.buttonText}>Gallery</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f0f0', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  imageContainer: { alignItems: 'center', marginBottom: 20 },
  image: { width: 300, height: 300, borderRadius: 15 },
  predictionContainer: { marginTop: 15, alignItems: 'center' },
  predictionText: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  confidenceText: { fontSize: 16, color: '#666', marginTop: 5 },
  buttonGroup: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  button: {
    backgroundColor: '#ff6b6b',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    width: '48%',
    justifyContent: 'center',
  },
  buttonText: { color: 'white', marginLeft: 10, fontWeight: 'bold' },
  clearButton: {
    backgroundColor: '#ff6b6b',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  loadingText: { color: 'white', marginTop: 10, fontSize: 18 },
});

export default AnimalDetectionScreen;

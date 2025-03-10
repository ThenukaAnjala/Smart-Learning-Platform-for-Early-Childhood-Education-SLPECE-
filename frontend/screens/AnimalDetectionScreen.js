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

  // Load custom font and request permissions on app start
  useEffect(() => {
    const loadFontAndPermissions = async () => {
      await Font.loadAsync({
        Poppins: require('../assets/fonts/Poppins-Regular.ttf'),
      });
      setFontLoaded(true);

      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (cameraStatus.status === 'granted' && galleryStatus.status === 'granted') {
        setHasPermission(true);
      } else {
        Alert.alert('Permissions not granted. Enable permissions in settings.');
      }
    };

    loadFontAndPermissions();
  }, []);

  const getServerUrl = () => {
    // For Android emulator
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:5000/predict'; // Use the Android emulator's special IP
    }

    // For physical devices
    const localIP = '192.168.1.6'; // Replace with your actual local IP
    return `http://${localIP}:5000/predict`;
  };

  const uploadImage = async (uri) => {
    setIsLoading(true);
    setPrediction(null);

    const formData = new FormData();
    formData.append('image', {
      uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
      name: 'photo.jpg',
      type: 'image/jpeg',
    });

    const url = getServerUrl();
    console.log('Sending request to:', url);

    try {
      const response = await axios.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Server Response:', response.data);
      setPrediction(response.data);
    } catch (error) {
      console.error('Network Error:', error);
      Alert.alert(
        'Connection Error',
        'Unable to connect to the server. Check network settings.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const takePhoto = async () => {
    if (!hasPermission) {
      Alert.alert('Camera permission is required to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.uri);
      uploadImage(result.uri);
    }
  };

  const pickImageFromGallery = async () => {
    if (!hasPermission) {
      Alert.alert('Gallery permission is required to pick photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.uri);
      uploadImage(result.uri);
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
        <Text style={{ marginTop: 10, fontSize: 18 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔍 Animal Recognizer </Text>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#ff6b6b" />
          <Text style={styles.loadingText}>Thinking...</Text>
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
                I'm {prediction.confidence.toFixed(2)}% sure! 🌟
              </Text>
            </View>
          )}

          <TouchableOpacity style={styles.clearButton} onPress={clearImage}>
            <Ionicons name="trash" size={24} color="white" />
            <Text style={styles.buttonText}>Clear Picture</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.button} onPress={takePhoto}>
          <Ionicons name="camera" size={24} color="white" />
          <Text style={styles.buttonText}>Take a Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={pickImageFromGallery}>
          <Ionicons name="image" size={24} color="white" />
          <Text style={styles.buttonText}>Pick from Gallery</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: 300,
    height: 300,
    borderRadius: 15,
  },
  predictionContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  predictionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  confidenceText: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    backgroundColor: '#ff6b6b',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    width: '48%',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    marginLeft: 10,
    fontWeight: 'bold',
  },
  clearButton: {
    backgroundColor: '#ff6b6b',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1,
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 18,
  },
});

export default AnimalDetectionScreen;

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
import * as ScreenOrientation from 'expo-screen-orientation';
import { useNavigation } from '@react-navigation/native'; // Import navigation hook

const AnimalDetectionScreen = () => {
  const [image, setImage] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [fontLoaded, setFontLoaded] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation(); // Hook to access navigation

  useEffect(() => {
    const lockToPortrait = async () => {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };

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

    lockToPortrait();
    loadFontAndPermissions();

    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE).catch((error) =>
        console.error('Error reverting to landscape:', error)
      );
    };
  }, []);

  const getServerUrl = () => {
    return Platform.OS === 'android' && !__DEV__
      ? 'http://10.0.2.2:5050/predict'
      : 'http://192.168.1.46:5050/predict';
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
        timeout: 10000,
      });
      console.log('Response:', response.data);
      setPrediction(response.data);

      // Navigate if confidence > 90
      if (response.data.confidence > 90) {
        navigation.navigate('AnimalDetailsScreen', {
          animalName: response.data.prediction,
          confidence: response.data.confidence,
          imageUri: uri,
        });
      }
    } catch (error) {
      console.error('Upload Error:', error.message);
      Alert.alert('Error', error.response?.data?.error || 'Failed to connect to the server.');
    } finally {
      setIsLoading(false);
    }
  };

  const takePhoto = async () => {
    if (!hasPermission) return Alert.alert('Camera permission required.');
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
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
      aspect: [3, 4],
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
          {prediction && prediction.confidence <= 90 && (
            <View style={styles.tryAgainContainer}>
              <Text style={styles.tryAgainText}>
                Hmm, I’m only {prediction.confidence.toFixed(2)}% sure. Let’s try again!
              </Text>
              <View style={styles.retryButtonGroup}>
                <TouchableOpacity style={styles.retryButton} onPress={takePhoto}>
                  <Ionicons name="camera" size={20} color="white" />
                  <Text style={styles.retryButtonText}>Retake Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.retryButton} onPress={pickImageFromGallery}>
                  <Ionicons name="image" size={20} color="white" />
                  <Text style={styles.retryButtonText}>New Gallery</Text>
                </TouchableOpacity>
              </View>
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
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    color: '#333',
    textAlign: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  image: {
    width: 250,
    height: 333,
    borderRadius: 15,
  },
  tryAgainContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  tryAgainText: {
    fontSize: 18,
    color: '#ff6b6b',
    textAlign: 'center',
    marginBottom: 10,
  },
  retryButtonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  retryButton: {
    backgroundColor: '#ff6b6b',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    width: '48%',
    justifyContent: 'center',
  },
  retryButtonText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
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
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 18,
  },
});

export default AnimalDetectionScreen;
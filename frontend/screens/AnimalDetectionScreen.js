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
  Animated,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import * as Font from 'expo-font';
import axios from 'axios';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useNavigation } from '@react-navigation/native';

const AnimalDetectionScreen = () => {
  const [image, setImage] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [fontLoaded, setFontLoaded] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  const fadeAnim = useState(new Animated.Value(0))[0]; // Animation for fade-in
  const scaleAnim = useState(new Animated.Value(1))[0]; // Animation for scaling

  useEffect(() => {
    const lockToPortrait = async () => {
      try {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      } catch (error) {
        console.error('Error locking orientation to portrait:', error);
      }
    };

    const loadFontAndPermissions = async () => {
      await Font.loadAsync({
        Poppins: require('../assets/fonts/Poppins-Regular.ttf'),
      });
      setFontLoaded(true);

      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (cameraStatus.status !== 'granted' || galleryStatus.status !== 'granted') {
        Alert.alert('Permissions!', 'We need camera and gallery access to play with animals! 🐾');
      } else {
        setHasPermission(true);
        // Start fade-in animation when permissions are granted
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000, // Slow 1-second fade
          useNativeDriver: true,
        }).start();
      }
    };

    lockToPortrait();
    loadFontAndPermissions();

    // Cleanup: Reset orientation when component unmounts
    return () => {
      ScreenOrientation.unlockAsync().catch((error) =>
        console.error('Error unlocking orientation:', error)
      );
    };
  }, [fadeAnim]);

  const getServerUrl = () => {
    return Platform.OS === 'android' && !__DEV__
      ? 'http://10.0.2.2:5050/predict'
      : 'http://172.28.9.160:5050/predict';
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
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 10000,
      });
      console.log('Response:', response.data);
      setPrediction(response.data);

      if (response.data.confidence > 90) {
        // Animate image scale before navigation
        Animated.timing(scaleAnim, {
          toValue: 1.1, // Slight zoom
          duration: 500, // Slow 0.5-second scale
          useNativeDriver: true,
        }).start(() => {
          navigation.navigate('AnimalDetailsScreen', {
            animalName: response.data.prediction,
            confidence: response.data.confidence,
            imageUri: uri,
          });
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }).start();
        });
      }
    } catch (error) {
      console.error('Upload Error:', error.message);
      Alert.alert('Oops!', error.response?.data?.error || 'Can’t talk to the animal server! 😿');
    } finally {
      setIsLoading(false);
    }
  };

  const takePhoto = async () => {
    if (!hasPermission) return Alert.alert('Camera!', 'We need camera access to snap animals! 🐾');
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
    if (!hasPermission) return Alert.alert('Gallery!', 'We need gallery access to see animals! 🐾');
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
    Animated.timing(scaleAnim, {
      toValue: 0.9, // Slight shrink
      duration: 500, // Slow 0.5-second scale
      useNativeDriver: true,
    }).start(() => {
      setImage(null);
      setPrediction(null);
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    });
  };

  if (!fontLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F4A261" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Text style={styles.title}>Find an Animal! 🐾</Text>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#F4A261" />
          <Text style={styles.loadingText}>Looking...</Text>
        </View>
      )}

      {image && (
        <Animated.View style={[styles.imageContainer, { transform: [{ scale: scaleAnim }] }]}>
          <Image source={{ uri: image }} style={styles.image} />
          {prediction && prediction.confidence <= 90 && (
            <View style={styles.tryAgainContainer}>
              <Text style={styles.tryAgainText}>
                I’m {prediction.confidence.toFixed(2)}% sure. Try again? 🐱
              </Text>
              <View style={styles.retryButtonGroup}>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={takePhoto}
                  activeOpacity={0.7}
                >
                  <Ionicons name="camera" size={24} color="#FFF" />
                  <Text style={styles.retryButtonText}>Camera</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={pickImageFromGallery}
                  activeOpacity={0.7}
                >
                  <Ionicons name="image" size={24} color="#FFF" />
                  <Text style={styles.retryButtonText}>Gallery</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          <TouchableOpacity style={styles.clearButton} onPress={clearImage} activeOpacity={0.7}>
            <Ionicons name="trash" size={24} color="#FFF" />
            <Text style={styles.buttonText}>Clear</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.button} onPress={takePhoto} activeOpacity={0.7}>
          <Ionicons name="camera" size={28} color="#FFF" />
          <Text style={styles.buttonText}>Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={pickImageFromGallery} activeOpacity={0.7}>
          <Ionicons name="image" size={28} color="#FFF" />
          <Text style={styles.buttonText}>Gallery</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#A3D8A1', // Vibrant green
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  title: {
    fontSize: 40,
    fontWeight: '600',
    color: '#FFF',
    textAlign: 'center',
    marginTop: 20,
    fontFamily: 'Poppins',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  image: {
    width: 300,
    height: 400,
    borderRadius: 40,
    borderWidth: 6,
    borderColor: '#FFF',
  },
  tryAgainContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  tryAgainText: {
    fontSize: 24,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Poppins',
  },
  retryButtonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  retryButton: {
    backgroundColor: '#FFC107', // Bright yellow
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 30,
    width: '48%',
    justifyContent: 'center',
  },
  retryButtonText: {
    color: '#FFF',
    marginLeft: 10,
    fontSize: 22,
    fontFamily: 'Poppins',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#FFC107', // Bright yellow
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 30,
    width: '48%',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFF',
    marginLeft: 10,
    fontSize: 22,
    fontFamily: 'Poppins',
  },
  clearButton: {
    backgroundColor: '#FFC107',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 30,
    marginTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#A3D8A1',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  loadingText: {
    color: '#FFF',
    marginTop: 10,
    fontSize: 24,
    fontFamily: 'Poppins',
  },
});

export default AnimalDetectionScreen;
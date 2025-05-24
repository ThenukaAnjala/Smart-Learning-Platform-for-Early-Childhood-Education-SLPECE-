import React, { useState, useEffect } from 'react';
import {
  Platform,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Animated,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import * as Font from 'expo-font';
import axios from 'axios';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useNavigation } from '@react-navigation/native';
import * as ImageManipulator from 'expo-image-manipulator';
import LottieView from 'lottie-react-native'; // Import LottieView

// Import the camera and gallery images
const cameraImage = require('../assets/images/Button-Icons/camara-image.png');
const galleryImage = require('../assets/images/Button-Icons/gallery.png');

// Import the background image
const backgroundImage = require('../assets/images/Background/Animal-DiscovererBG.jpg');

// Import the Lottie animation
const loadingAnimation = require('../assets/Animations/Animal-Animation/loading.json');

const AnimalDetectionScreen = () => {
  const [image, setImage] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [fontLoaded, setFontLoaded] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(1))[0];

  // Animation values for pulsing effect
  const cameraPulseAnim = useState(new Animated.Value(1))[0]; // For camera button
  const galleryPulseAnim = useState(new Animated.Value(1))[0]; // For gallery button
  const textFadeAnim = useState(new Animated.Value(0))[0]; // For try again text
  const buttonPopAnim = useState(new Animated.Value(0))[0]; // For pop-in effect on buttons

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
        Schoolbell: require('../assets/fonts/Schoolbell-Regular.ttf'),
      });
      setFontLoaded(true);

      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (cameraStatus.status !== 'granted' || galleryStatus.status !== 'granted') {
        Alert.alert('Permissions!', 'We need camera and gallery access to play with animals! 🐾');
      } else {
        setHasPermission(true);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }).start();
      }
    };

    // Start the pulsing animations for camera and gallery buttons
    const startPulsing = (animValue) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    startPulsing(cameraPulseAnim);
    startPulsing(galleryPulseAnim);

    lockToPortrait();
    loadFontAndPermissions();

    return () => {
      ScreenOrientation.unlockAsync().catch((error) =>
        console.error('Error unlocking orientation:', error)
      );
    };
  }, [fadeAnim, cameraPulseAnim, galleryPulseAnim]);

  // Animate the "Try again" text and buttons when prediction confidence is low
  useEffect(() => {
    if (prediction && prediction.confidence <= 90) {
      Animated.sequence([
        Animated.timing(textFadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(buttonPopAnim, {
          toValue: 1,
          friction: 5,
          tension: 60,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [prediction, textFadeAnim, buttonPopAnim]);

  const getServerUrl = () => {
    return 'https://dinith01-animal-recognition-app.hf.space/predict';
  };

  const uploadImage = async (uri) => {
    setIsLoading(true);
    setPrediction(null);

    // Resize and compress the image before uploading
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 800 } }], // Resize to a maximum width of 800 pixels
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG } // Compress to 70% quality
    );
    const resizedUri = manipResult.uri;

    const formData = new FormData();
    formData.append('file', {
      uri: Platform.OS === 'ios' ? resizedUri.replace('file://', '') : resizedUri,
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

      if (response.data.confidence > 90) {
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 500,
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
      Alert.alert(
        'Oops!',
        error.response?.data?.error || 'Can’t talk to the animal server! 😿'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const takePhoto = async () => {
    if (!hasPermission) return Alert.alert('Camera!', 'We need camera access to snap animals! 🐾');
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7, // Compress the image during capture
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
      quality: 0.7, // Compress the image during selection
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
      uploadImage(result.assets[0].uri);
    }
  };

  const clearImage = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.9,
      duration: 500,
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
      {/* Background image layer */}
      <View style={styles.background}>
        <Image source={backgroundImage} style={styles.backgroundImage} />
      </View>

      {/* Dedicated header for the title */}
      <View style={styles.header}>
        <Text style={styles.title}>Lets Find Animals !!!</Text>
      </View>

      {image && isLoading && (
        <View style={styles.loadingOverlay}>
          <LottieView
            source={loadingAnimation}
            autoPlay
            loop
            style={styles.loadingAnimation}
          />
          <Text style={styles.loadingText}>Looking for Animals...</Text>
        </View>
      )}

      {image && !isLoading && (
        <Animated.View style={[styles.imageContainer, { transform: [{ scale: scaleAnim }] }]}>
          <Image source={{ uri: image }} style={styles.image} />
          {prediction && prediction.confidence <= 90 && (
            <View style={styles.tryAgainContainer}>
              {/* Add a playful emoji with a slight bounce animation */}
              <Animated.Text style={[styles.emoji, { transform: [{ scale: buttonPopAnim }] }]}>
                🐾🤔
              </Animated.Text>
              <Animated.Text style={[styles.tryAgainText, { opacity: textFadeAnim }]}>
                Hmm, I’m only {prediction.confidence.toFixed(2)}% sure! Let’s try another photo! 📸
              </Animated.Text>
              <View style={styles.retryButtonGroup}>
                <Animated.View style={{ transform: [{ scale: buttonPopAnim }] }}>
                  <TouchableOpacity
                    style={styles.retryButton}
                    onPress={takePhoto}
                    activeOpacity={0.7}
                  >
                    <Image source={cameraImage} style={styles.buttonIcon} />
                  </TouchableOpacity>
                </Animated.View>
                <Animated.View style={{ transform: [{ scale: buttonPopAnim }] }}>
                  <TouchableOpacity
                    style={styles.retryButton}
                    onPress={pickImageFromGallery}
                    activeOpacity={0.7}
                  >
                    <Image source={galleryImage} style={styles.buttonIcon} />
                  </TouchableOpacity>
                </Animated.View>
              </View>
            </View>
          )}
          <TouchableOpacity style={styles.clearButton} onPress={clearImage} activeOpacity={0.7}>
            <Ionicons name="trash" size={24} color="#FFF" />
            <Text style={styles.buttonText}>Clear</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Show initial buttons only when no image is selected and not in "try again" state */}
      {!image && (
        <View style={styles.centeredButtonContainer}>
          <View style={styles.initialButtonGroup}>
            <Animated.View style={{ transform: [{ scale: cameraPulseAnim }] }}>
              <TouchableOpacity style={styles.button} onPress={takePhoto} activeOpacity={0.7}>
                <Image source={cameraImage} style={styles.buttonIcon} />
              </TouchableOpacity>
            </Animated.View>
            <Animated.View style={{ transform: [{ scale: galleryPulseAnim }] }}>
              <TouchableOpacity style={styles.button} onPress={pickImageFromGallery} activeOpacity={0.7}>
                <Image source={galleryImage} style={styles.buttonIcon} />
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      )}

      {/* Show bottom buttons only when an image is selected, prediction is not in "try again" state, and before navigation */}
      {image && !isLoading && prediction && prediction.confidence > 90 && (
        <View style={styles.bottomButtonContainer}>
          <View style={styles.buttonGroup}>
            <Animated.View style={{ transform: [{ scale: cameraPulseAnim }] }}>
              <TouchableOpacity style={styles.button} onPress={takePhoto} activeOpacity={0.7}>
                <Image source={cameraImage} style={styles.buttonIcon} />
              </TouchableOpacity>
            </Animated.View>
            <Animated.View style={{ transform: [{ scale: galleryPulseAnim }] }}>
              <TouchableOpacity style={styles.button} onPress={pickImageFromGallery} activeOpacity={0.7}>
                <Image source={galleryImage} style={styles.buttonIcon} />
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  header: {
    width: '100%',
    paddingTop: 100,
    paddingBottom: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 50,
    fontWeight: '900',
    color: '#8B4513',
    textAlign: 'center',
    marginTop: 0,
    fontFamily: 'Schoolbell',
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
    letterSpacing: 2,
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  image: {
    width: 300,
    height: 400,
    borderRadius: 40,
    resizeMode: 'contain',
  },
  tryAgainContainer: {
    position: 'absolute',
    bottom: 20,
    width: '90%',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 20,
    padding: 20,
    zIndex: 2,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  emoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  tryAgainText: {
    fontSize: 20,
    color: '#8B4513',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Poppins',
    lineHeight: 28,
  },
  retryButtonGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: 40,
  },
  retryButton: {
    backgroundColor: '#D2691E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 100,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  retryButtonText: {
    color: '#FFF',
    marginLeft: 10,
    fontSize: 24,
    fontFamily: 'Poppins',
  },
  centeredButtonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  initialButtonGroup: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    gap: 30,
  },
  button: {
    backgroundColor: '#D2691E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 140,
    height: 140,
    borderRadius: 35,
  },
  buttonText: {
    color: '#FFF',
    marginLeft: 10,
    fontSize: 24,
    fontFamily: 'Poppins',
  },
  buttonIcon: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  clearButton: {
    backgroundColor: '#D2691E',
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
  loadingAnimation: {
    width: 200,
    height: 200,
  },
  loadingText: {
    color: '#FFF',
    marginTop: 10,
    fontSize: 24,
    fontFamily: 'Poppins',
  },
});

export default AnimalDetectionScreen;
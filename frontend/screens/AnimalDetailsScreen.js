import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import * as ScreenOrientation from 'expo-screen-orientation';

// Import all 17 animal images
const animalImages = {
  'cat.jpg': require('../assets/images/Animals/cat.jpg'),
  'cock.jpg': require('../assets/images/Animals/cock.jpg'),
  'cockroach.jpg': require('../assets/images/Animals/cockroach.jpg'),
  'crocodile.jpg': require('../assets/images/Animals/crocodile.jpg'),
  'deer.jpg': require('../assets/images/Animals/deer.jpg'),
  'dog.jpg': require('../assets/images/Animals/dog.jpg'),
  'elephant.jpg': require('../assets/images/Animals/elephant.jpg'),
  'giraffe.jpg': require('../assets/images/Animals/giraffe.jpg'),
  'horse.jpg': require('../assets/images/Animals/horse.jpg'),
  'lion.jpg': require('../assets/images/Animals/lion.jpg'),
  'monkey.jpg': require('../assets/images/Animals/monkey.jpg'),
  'panda.jpg': require('../assets/images/Animals/panda.jpg'),
  'scorpion.jpg': require('../assets/images/Animals/scorpion.jpg'),
  'snake.jpg': require('../assets/images/Animals/snake.jpg'),
  'spider.jpg': require('../assets/images/Animals/spider.jpg'),
  'squirrel.jpg': require('../assets/images/Animals/squirrel.jpg'),
  'tiger.jpg': require('../assets/images/Animals/tiger.jpg'),
};

// Helper function to determine if a color is light or dark
const isLightColor = (hexColor) => {
  if (!hexColor) return true; // Default to light if color is undefined
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128; // Return true if light, false if dark
};

const AnimalDetailsScreen = ({ route }) => {
  const { animalName, confidence } = route.params;
  const navigation = useNavigation();
  const [animalDetails, setAnimalDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useState(new Animated.Value(0))[0]; // Fade-in animation
  const bounceAnim = useState(new Animated.Value(0))[0]; // Bounce animation for image

  useEffect(() => {
    const lockToPortrait = async () => {
      try {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      } catch (error) {
        console.error('Error locking orientation to portrait:', error);
      }
    };

    const fetchAnimalDetails = async () => {
      try {
        const response = await axios.get(`http://192.168.1.46:5050/animal-details/${animalName.toLowerCase()}`);
        setAnimalDetails(response.data);
      } catch (error) {
        console.error('Error fetching details:', error);
        setAnimalDetails({
          name: animalName,
          fact: 'This is a cool animal! Let’s learn more! 🌟',
          color: '#FFF', // Default to white for minimalism
          habitat: 'Somewhere fun!',
          imagePath: 'elephant.jpg',
        });
      } finally {
        setLoading(false);
        // Start fade-in animation after data is loaded
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000, // Slow 1-second fade
          useNativeDriver: true,
        }).start();
        // Start bounce animation
        Animated.spring(bounceAnim, {
          toValue: 1,
          friction: 3, // Slower bounce
          tension: 40,
          useNativeDriver: true,
        }).start();
      }
    };

    lockToPortrait();
    fetchAnimalDetails();

    // Cleanup: Reset orientation when component unmounts
    return () => {
      ScreenOrientation.unlockAsync().catch((error) =>
        console.error('Error unlocking orientation:', error)
      );
    };
  }, [animalName, fadeAnim, bounceAnim]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F4A261" />
        <Text style={styles.loadingText}>Finding Facts...</Text>
      </View>
    );
  }

  const selectedImage = animalImages[animalDetails.imagePath] || animalImages['elephant.jpg'];
  
  // Determine if the background is light or dark
  const isBackgroundLight = isLightColor(animalDetails.color);
  const textColor = isBackgroundLight ? '#333' : '#FFF'; // Dark text on light background, white on dark
  const buttonColor = isBackgroundLight ? '#FFCA28' : '#A3D8A1'; // Orange on light, green on dark

  return (
    <Animated.View style={[styles.container, { backgroundColor: animalDetails.color, opacity: fadeAnim }]}>
      <Text style={[styles.title, { color: textColor }]}>It’s a {animalDetails.name.toUpperCase()}!</Text>
      <Animated.View style={{ transform: [{ scale: bounceAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.9, 1.1], // Slight bounce
      })}] }}>
        <Image source={selectedImage} style={styles.image} />
      </Animated.View>
      <Text style={[styles.confidence, { color: textColor }]}>{confidence.toFixed(0)}% Sure! 🐾</Text>
      <Text style={[styles.fact, { color: textColor }]}>{animalDetails.fact}</Text>
      <Text style={[styles.habitat, { color: textColor }]}>Lives in: {animalDetails.habitat}</Text>
      <TouchableOpacity
        style={[styles.backButton, { backgroundColor: buttonColor }]}
        onPress={() => {
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }).start(() => navigation.navigate('AnimalDetectionScreen'));
        }}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={28} color={isBackgroundLight ? '#FFF' : '#333'} />
        <Text style={[styles.backButtonText, { color: isBackgroundLight ? '#FFF' : '#333' }]}>Back</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 10,
    fontFamily: 'Poppins',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  image: {
    width: 200,
    height: 266,
    borderRadius: 25,
    resizeMode: 'contain', // Added to prevent cropping and maintain aspect ratio
  },
  confidence: {
    fontSize: 18,
    textAlign: 'center',
    fontFamily: 'Poppins',
  },
  fact: {
    fontSize: 20,
    textAlign: 'center',
    paddingHorizontal: 15,
    fontFamily: 'Poppins',
  },
  habitat: {
    fontSize: 18,
    textAlign: 'center',
    fontFamily: 'Poppins',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 25,
    marginBottom: 20,
  },
  backButtonText: {
    marginLeft: 10,
    fontSize: 20,
    fontFamily: 'Poppins',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF', // Default white while loading
  },
  loadingText: {
    fontSize: 20,
    color: '#333',
    marginTop: 10,
    fontFamily: 'Poppins',
  },
});

export default AnimalDetailsScreen;
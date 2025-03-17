import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated, Platform, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ScreenOrientation from 'expo-screen-orientation';

// Import all 17 animal images as PNG
const animalImages = {
  'cat.png': require('../assets/images/Animals/cat.png'),
  'cock.png': require('../assets/images/Animals/cock.png'),
  'cockroach.png': require('../assets/images/Animals/cockroach.png'),
  'crocodile.png': require('../assets/images/Animals/crocodile.png'),
  'deer.png': require('../assets/images/Animals/deer.png'),
  'dog.png': require('../assets/images/Animals/dog.png'),
  'elephant.png': require('../assets/images/Animals/elephant.png'),
  'giraffe.png': require('../assets/images/Animals/giraffe.png'),
  'horse.png': require('../assets/images/Animals/horse.png'),
  'lion.png': require('../assets/images/Animals/lion.png'),
  'monkey.png': require('../assets/images/Animals/monkey.png'),
  'panda.png': require('../assets/images/Animals/panda.png'),
  'scorpion.png': require('../assets/images/Animals/scorpion.png'),
  'snake.png': require('../assets/images/Animals/snake.png'),
  'spider.png': require('../assets/images/Animals/spider.png'),
  'squirrel.png': require('../assets/images/Animals/squirrel.png'),
  'tiger.png': require('../assets/images/Animals/tiger.png'),
};

// Import animal data from JSON file
import animalData from '../assets/data/animalData.json';

// Helper function to determine if a color is light or dark
const isLightColor = (hexColor) => {
  if (!hexColor) return true;
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128;
};

const AnimalDetailsScreen = ({ route }) => {
  const { animalName, confidence } = route.params;
  const navigation = useNavigation();
  const [animalDetails, setAnimalDetails] = useState(null);
  const [currentDetailIndex, setCurrentDetailIndex] = useState(0); // Start with diet
  const fadeAnim = useState(new Animated.Value(0))[0]; // For container fade-in
  const bounceAnim = useState(new Animated.Value(0))[0]; // For image bounce
  const flashcardFadeAnim = useState(new Animated.Value(0))[0]; // For flashcard fade-in
  const flashcardBounceAnim = useState(new Animated.Value(0))[0]; // For flashcard slight bounce
  const promptFadeAnim = useState(new Animated.Value(0))[0]; // For tap prompt fade-in

  // Define the order of details to cycle through
  const detailKeys = [
    { key: 'diet', label: 'What They Eat' },
    { key: 'dangerLevel', label: 'Safety Fun Fact' },
    { key: 'speed', label: 'How Fast' },
    { key: 'sleep', label: 'Sleep Time' },
    { key: 'specialAbility', label: 'Special Skill' },
    { key: 'lifespan', label: 'How Long They Live' },
    { key: 'sound', label: 'What They Say' },
  ];

  // Animation for flashcard on load (fade-in with slight bounce)
  const startFlashcardLoadAnimation = () => {
    Animated.parallel([
      Animated.timing(flashcardFadeAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.spring(flashcardBounceAnim, {
        toValue: 1,
        friction: 5,
        tension: 30,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Animation for flashcard on tap (subtle fade)
  const startFlashcardTapAnimation = () => {
    Animated.sequence([
      Animated.timing(flashcardFadeAnim, {
        toValue: 0.5,
        duration: 500,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(flashcardFadeAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    const lockToPortrait = async () => {
      try {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      } catch (error) {
        console.error('Error locking orientation to portrait:', error);
      }
    };

    const fetchAnimalDetails = () => {
      const data = animalData[animalName.toLowerCase()] || {
        name: animalName,
        fact: 'This is a cool animal! Let’s learn more! 🌟',
        color: '#FFC107',
        habitat: 'Somewhere fun!',
        imagePath: 'deer.png',
        dangerLevel: 'Deer are gentle friends! 🦌',
        speed: 'They run super fast! 🏃‍♂️',
        diet: 'They eat plants! 🌱',
        sleep: 'Active in day! ☀️',
        specialAbility: 'Great at jumping! 🦘',
        lifespan: 'Live a long time! ⏳',
        sound: 'They make soft sounds! 🔊',
      };
      setAnimalDetails(data);

      // Container fade-in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();

      // Image bounce
      Animated.spring(bounceAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }).start();

      // Flashcard fade-in with slight bounce on load
      startFlashcardLoadAnimation();

      // Prompt fade-in
      Animated.timing(promptFadeAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();
    };

    lockToPortrait();
    fetchAnimalDetails();

    return () => {
      ScreenOrientation.unlockAsync().catch((error) =>
        console.error('Error unlocking orientation:', error)
      );
    };
  }, [animalName, fadeAnim, bounceAnim]);

  const handleFlashcardTap = () => {
    // Cycle to the next detail
    setCurrentDetailIndex((prevIndex) => (prevIndex + 1) % detailKeys.length);

    // Trigger subtle fade animation on tap
    startFlashcardTapAnimation();
  };

  if (!animalDetails) {
    return null;
  }

  const selectedImage = animalImages[animalDetails.imagePath] || animalImages['deer.png'];
  const isBackgroundLight = isLightColor(animalDetails.color);
  const textColor = '#000000';
  const buttonColor = isBackgroundLight ? '#FFCA28' : '#A3D8A1';
  const flashcardColor = '#FFFFFF';

  const currentDetail = detailKeys[currentDetailIndex];
  const detailLabel = currentDetail.label;
  const detailValue = animalDetails[currentDetail.key] || `${currentDetail.label}: Fun to learn!`;

  return (
    <Animated.View style={[styles.container, { backgroundColor: animalDetails.color, opacity: fadeAnim }]}>
      {/* Image at the top with rounded corners */}
      <Animated.View
        style={{
          transform: [
            {
              scale: bounceAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1.1],
              }),
            },
          ],
        }}
      >
        <View style={styles.imageContainer}>
          <Image source={selectedImage} style={styles.image} />
        </View>
      </Animated.View>

      <Text style={[styles.title, { color: textColor, fontSize: 32 }]}>It’s a {animalDetails.name.toUpperCase()}!</Text>
      <Text style={[styles.confidence, { color: textColor, fontSize: 18 }]}>{confidence.toFixed(0)}% Sure! 🐾</Text>
      <Text style={[styles.fact, { color: textColor, fontSize: 22 }]}>{animalDetails.fact}</Text>
      <Text style={[styles.habitat, { color: textColor, fontSize: 18 }]}>Lives in: {animalDetails.habitat} 🌿</Text>

      {/* Flashcard with Tap Prompt */}
      <View style={styles.flashcardWrapper}>
        <Animated.Text
          style={[
            styles.tapPrompt,
            { color: textColor, opacity: promptFadeAnim, fontSize: 18 },
          ]}
        >
          Tap me to learn more! 🌟
        </Animated.Text>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleFlashcardTap}
          style={styles.flashcardContainer}
        >
          <Animated.View
            style={[
              styles.flashcard,
              {
                backgroundColor: flashcardColor,
                opacity: flashcardFadeAnim,
                transform: [
                  {
                    scale: flashcardBounceAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.95, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={[styles.flashcardLabel, { color: textColor, fontSize: 20 }]}>
              {detailLabel}
            </Text>
            <Text style={[styles.flashcardText, { color: textColor, fontSize: 18 }]}>
              {detailValue} {currentDetail.key === 'sleep' ? '☀️' : currentDetail.key === 'habitat' ? '🌿' : ''}
            </Text>
          </Animated.View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.backButton, { backgroundColor: buttonColor, height: 60, width: 120, padding: 15 }]}
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
        <Text style={[styles.backButtonText, { color: isBackgroundLight ? '#FFF' : '#333', fontSize: 20 }]}>Go Back! 🚪</Text>
      </TouchableOpacity>
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
  title: {
    fontSize: 32,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 10,
    fontFamily: 'Poppins',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  imageContainer: {
    width: 200,
    height: 266,
    borderRadius: 25,
    overflow: 'hidden',
    // Removed border properties
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    ...(Platform.OS === 'android' && { overflow: 'hidden' }),
  },
  confidence: {
    fontSize: 18,
    textAlign: 'center',
    fontFamily: 'Poppins',
  },
  fact: {
    fontSize: 22,
    textAlign: 'center',
    paddingHorizontal: 15,
    fontFamily: 'Poppins',
  },
  habitat: {
    fontSize: 18,
    textAlign: 'center',
    fontFamily: 'Poppins',
  },
  flashcardWrapper: {
    alignItems: 'center',
    marginVertical: 10,
  },
  tapPrompt: {
    fontSize: 18,
    fontFamily: 'Poppins',
    marginBottom: 10,
    textAlign: 'center',
  },
  flashcardContainer: {
    alignItems: 'center',
  },
  flashcard: {
    width: 300,
    height: 150,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FF6F61',
    borderStyle: 'dashed',
  },
  flashcardLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Poppins',
    marginBottom: 10,
  },
  flashcardText: {
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
    height: 60,
    width: 120,
  },
  backButtonText: {
    marginLeft: 10,
    fontSize: 20,
    fontFamily: 'Poppins',
  },
});

export default AnimalDetailsScreen;
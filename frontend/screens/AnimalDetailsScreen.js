import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Simple animal facts database (expand as needed)
const animalFacts = {
  dog: {
    fact: 'Dogs are super friendly and love to play fetch! 🐾',
    color: '#FFD700', // Gold
  },
  cat: {
    fact: 'Cats love to nap and chase shiny things! 😺',
    color: '#FF69B4', // Hot Pink
  },
  elephant: {
    fact: 'Elephants have big ears and never forget! 🐘',
    color: '#87CEEB', // Sky Blue
  },
  // Add more animals as needed
};

const AnimalDetailsScreen = ({ route }) => {
  const { animalName, confidence, imageUri } = route.params;
  const navigation = useNavigation();
  const animalInfo = animalFacts[animalName.toLowerCase()] || {
    fact: 'This is a cool animal! Let’s learn more about it! 🌟',
    color: '#FFA500', // Orange fallback
  };

  return (
    <View style={[styles.container, { backgroundColor: animalInfo.color }]}>
      <Text style={styles.title}>Yay! It’s a {animalName}!</Text>
      <Image source={{ uri: imageUri }} style={styles.image} />
      <Text style={styles.confidence}>
        I’m {confidence.toFixed(2)}% sure of this!
      </Text>
      <Text style={styles.fact}>{animalInfo.fact}</Text>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate('AnimalDetection')}
      >
        <Ionicons name="arrow-back" size={24} color="white" />
        <Text style={styles.backButtonText}>Find Another Animal!</Text>
      </TouchableOpacity>
    </View>
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
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
  },
  image: {
    width: 250,
    height: 333,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#fff',
  },
  confidence: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
  },
  fact: {
    fontSize: 22,
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  backButton: {
    backgroundColor: '#ff6b6b',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  backButtonText: {
    color: 'white',
    marginLeft: 10,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default AnimalDetailsScreen;
// frontend/screens/FishScreen.js
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute } from '@react-navigation/native';

export default function FishScreen() {
  const route = useRoute();
  // The base64 string with transparent background from the backend
  const fishImageBase64 = route.params?.fishImageBase64;

  return (
    <LinearGradient
      colors={['#B3E5FC', '#81D4FA', '#4FC3F7']}
      style={styles.container}
    >
      <Text style={styles.title}>Underwater Adventure!</Text>
      <Text style={styles.subtitle}>Explore the deep ocean!</Text>

      {fishImageBase64 && (
        <Image
          source={{ uri: `data:image/png;base64,${fishImageBase64}` }}
          style={styles.fishImage}
          resizeMode="contain"
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 20,
    color: '#fff',
    marginTop: 10,
  },
  fishImage: {
    width: 200,
    height: 200,
    marginTop: 20,
  },
});

// frontend/screens/RabbitBodyScreen.js
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View, ImageBackground, Image } from 'react-native';
import { useRoute } from '@react-navigation/native';

export default function RabbitBodyScreen() {
  const route = useRoute();
  const { rabbitImageBase64, initialHeadSide } = route.params;

  // Set dimensions for the full-body rabbit.
  const imageWidth = 200;
  const imageHeight = 300;

  // Fade-in animation.
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // If head is on left, flip the image horizontally.
  const flipStyle = initialHeadSide === 'left' ? { transform: [{ scaleX: -1 }] } : {};

  return (
    <ImageBackground
      source={require('../assets/rabbitBackground.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <Text style={styles.title}>Rabbit Full Body</Text>
      {rabbitImageBase64 && (
        <Animated.Image
          source={{ uri: `data:image/png;base64,${rabbitImageBase64}` }}
          style={[styles.rabbitImage, { width: imageWidth, height: imageHeight, opacity: fadeAnim }, flipStyle]}
          resizeMode="contain"
        />
      )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    position: 'absolute',
    top: 40,
    fontSize: 24,
    color: '#8B4513',
    fontWeight: 'bold',
  },
  rabbitImage: {
    // Additional styling if needed.
  },
});

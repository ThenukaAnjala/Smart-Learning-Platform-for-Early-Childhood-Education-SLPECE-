// frontend/screens/FishScreen.js
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, StyleSheet, Easing, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute } from '@react-navigation/native';
import OxygenBubbles from '../components/OxygenBubbles';

export default function FishScreen() {
  const route = useRoute();
  const fishImageBase64 = route.params?.fishImageBase64;
  const initialHeadSide = route.params?.initialHeadSide || 'right'; // "left" or "right"

  // Screen ("tank") dimensions
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const fishWidth = 100;  // adjust as needed
  const fishHeight = 100; // adjust as needed

  // Animated values for position, rotation, and bobbing (vertical oscillation)
  const xAnim = useRef(new Animated.Value(0)).current;
  const yAnim = useRef(new Animated.Value(0)).current;
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const bobbingAnim = useRef(new Animated.Value(0)).current;
  const [flip, setFlip] = useState(1);

  // Helper function to generate random numbers between min and max.
  const randomBetween = (min, max) => Math.random() * (max - min) + min;

  // Start bobbing animation (gentle up/down movement)
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bobbingAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
        Animated.timing(bobbingAnim, {
          toValue: -1,
          duration: 6000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
        Animated.timing(bobbingAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
      ])
    ).start();
  }, [bobbingAnim]);

  // Initial setup: position the fish based on initialHeadSide.
  useEffect(() => {
    if (!fishImageBase64) return;
    const initialX = initialHeadSide === 'right' ? -fishWidth : screenWidth;
    xAnim.setValue(initialX);
    const initialY = randomBetween(0, screenHeight - fishHeight);
    yAnim.setValue(initialY);
    rotationAnim.setValue(0);

    // Animate to a central target position
    const initialTargetX = screenWidth / 2;
    const initialTargetY = randomBetween(0, screenHeight - fishHeight);
    const deltaX = initialTargetX - initialX;
    const deltaY = initialTargetY - initialY;
    const angleRad = Math.atan2(deltaY, deltaX);
    const targetRotation = angleRad * (180 / Math.PI);
    setFlip(deltaX >= 0 ? 1 : -1);

    Animated.timing(rotationAnim, {
      toValue: targetRotation,
      duration: 3000,
      useNativeDriver: true,
      easing: Easing.inOut(Easing.quad),
    }).start(() => {
      Animated.parallel([
        Animated.timing(xAnim, {
          toValue: initialTargetX,
          duration: 6000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.quad),
        }),
        Animated.timing(yAnim, {
          toValue: initialTargetY,
          duration: 6000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.quad),
        }),
      ]).start(() => {
        moveFish();
      });
    });
  }, [fishImageBase64, initialHeadSide, xAnim, yAnim, rotationAnim]);

  // Function for continuous random movement
  const moveFish = () => {
    const currentX = xAnim.__getValue();
    const currentY = yAnim.__getValue();
    const targetX = randomBetween(0, screenWidth - fishWidth);
    const targetY = randomBetween(0, screenHeight - fishHeight);
    const deltaX = targetX - currentX;
    const deltaY = targetY - currentY;
    const angleRad = Math.atan2(deltaY, deltaX);
    const targetRotation = angleRad * (180 / Math.PI);
    setFlip(deltaX >= 0 ? 1 : -1);

    // Rotate first
    Animated.timing(rotationAnim, {
      toValue: targetRotation,
      duration: 3000,
      useNativeDriver: true,
      easing: Easing.inOut(Easing.quad),
    }).start(() => {
      const moveDuration = randomBetween(10000, 15000);
      Animated.parallel([
        Animated.timing(xAnim, {
          toValue: targetX,
          duration: moveDuration,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.quad),
        }),
        Animated.timing(yAnim, {
          toValue: targetY,
          duration: moveDuration,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.quad),
        }),
      ]).start(() => {
        moveFish();
      });
    });
  };

  // Interpolate rotation to string format
  const rotationInterpolate = rotationAnim.interpolate({
    inputRange: [-180, 180],
    outputRange: ['-180deg', '180deg'],
  });

  // Interpolate bobbing value to a vertical offset (±15 pixels)
  const bobOffset = bobbingAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-15, 15],
  });

  return (
    <LinearGradient
      colors={['#B3E5FC', '#81D4FA', '#4FC3F7']}
      style={styles.container}
    >
      {/* Render oxygen bubbles */}
      <OxygenBubbles />
      <Text style={styles.title}>Underwater Adventure!</Text>
      {fishImageBase64 && (
        <Animated.Image
          source={{ uri: `data:image/png;base64,${fishImageBase64}` }}
          style={[
            styles.fishImage,
            {
              width: fishWidth,
              height: fishHeight,
              transform: [
                { translateX: xAnim },
                { translateY: Animated.add(yAnim, bobOffset) },
                { rotate: rotationInterpolate },
                { scaleX: flip },
              ],
            },
          ]}
          resizeMode="contain"
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    position: 'absolute',
    top: 40,
    alignSelf: 'center',
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  fishImage: {
    position: 'absolute',
  },
});

// frontend/screens/FishScreen.js
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, StyleSheet, Easing, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute } from '@react-navigation/native';
import OxygenBubbles from '../components/OxygenBubbles';

export default function FishScreen() {
  const route = useRoute();
  // Processed fish image (base64 string without white background)
  const fishImageBase64 = route.params?.fishImageBase64;

  // Get screen dimensions ("tank")
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const fishWidth = 100;  // adjust as needed
  const fishHeight = 100; // adjust as needed

  // Animated values for position and rotation
  const xAnim = useRef(new Animated.Value(0)).current;
  const yAnim = useRef(new Animated.Value(0)).current;
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const [flip, setFlip] = useState(1);

  // Helper: generate a random number between min and max
  const randomBetween = (min, max) => Math.random() * (max - min) + min;

  // Function to move the fish:
  // 1. Pick a random target within screen bounds.
  // 2. Compute the direction and target rotation.
  // 3. First rotate the fish so it faces the target, then move.
  const moveFish = () => {
    const currentX = xAnim.__getValue();
    const currentY = yAnim.__getValue();

    // Choose target position so the fish stays fully visible
    const targetX = randomBetween(0, screenWidth - fishWidth);
    const targetY = randomBetween(0, screenHeight - fishHeight);

    // Calculate movement vector and angle
    const deltaX = targetX - currentX;
    const deltaY = targetY - currentY;
    const angleRad = Math.atan2(deltaY, deltaX);
    const targetRotation = angleRad * (180 / Math.PI);

    // Flip the fish horizontally if moving left
    setFlip(deltaX >= 0 ? 1 : -1);

    // First animate rotation (turning to face the target)
    Animated.timing(rotationAnim, {
      toValue: targetRotation,
      duration: 2500, // slower rotation (2.5 seconds)
      useNativeDriver: true,
      easing: Easing.inOut(Easing.quad),
    }).start(() => {
      // Then animate movement after the fish has turned
      const moveDuration = randomBetween(8000, 12000); // slow movement (8-12 seconds)
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
        moveFish(); // Repeat
      });
    });
  };

  useEffect(() => {
    moveFish();
  }, [xAnim, yAnim, rotationAnim]);

  const rotationInterpolate = rotationAnim.interpolate({
    inputRange: [-180, 180],
    outputRange: ['-180deg', '180deg'],
  });

  return (
    <LinearGradient
      colors={['#B3E5FC', '#81D4FA', '#4FC3F7']}
      style={styles.container}
    >
      {/* Oxygen bubbles float upward from the sides */}
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
                { translateY: yAnim },
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

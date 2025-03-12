// frontend/screens/FishScreen.js
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, StyleSheet, Easing, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute } from '@react-navigation/native';

export default function FishScreen() {
  const route = useRoute();
  // Base64 processed fish image (with transparent background) from the backend
  const fishImageBase64 = route.params?.fishImageBase64;

  // Get screen dimensions (the "tank")
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const fishWidth = 100; // adjust as needed
  const fishHeight = 100; // adjust as needed

  // Animated values for position and rotation
  const xAnim = useRef(new Animated.Value(0)).current;
  const yAnim = useRef(new Animated.Value(0)).current;
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const [flip, setFlip] = useState(1); // scaleX: 1 means normal, -1 means flipped horizontally

  // Helper function: generate random number between min and max
  const randomBetween = (min, max) => Math.random() * (max - min) + min;

  // Function to move the fish:
  // 1. Pick a random target position (ensuring the fish stays fully visible).
  // 2. Calculate the target rotation (angle) based on the movement direction.
  // 3. First animate the fish rotating to face the target direction, then animate the movement.
  const moveFish = () => {
    // Get current position using __getValue (for demo purposes)
    const currentX = xAnim.__getValue();
    const currentY = yAnim.__getValue();

    // Choose a new random target ensuring the fish remains fully visible
    const targetX = randomBetween(0, screenWidth - fishWidth);
    const targetY = randomBetween(0, screenHeight - fishHeight);

    // Calculate movement vector and angle
    const deltaX = targetX - currentX;
    const deltaY = targetY - currentY;
    const angleRad = Math.atan2(deltaY, deltaX);
    const targetRotation = angleRad * (180 / Math.PI);

    // Determine flip: if moving right, keep normal; if moving left, flip horizontally.
    setFlip(deltaX >= 0 ? 1 : -1);

    // Animate rotation first (fish turns to face the target)
    Animated.timing(rotationAnim, {
      toValue: targetRotation,
      duration: 1000, // 1 second for rotation
      useNativeDriver: true,
      easing: Easing.inOut(Easing.quad),
    }).start(() => {
      // After turning, animate movement to the new position.
      const moveDuration = randomBetween(3000, 6000);
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
        // Repeat the process
        moveFish();
      });
    });
  };

  useEffect(() => {
    // Start the movement loop
    moveFish();
  }, [xAnim, yAnim, rotationAnim]);

  // Interpolate rotation to convert to a string value (e.g., "45deg")
  const rotationInterpolate = rotationAnim.interpolate({
    inputRange: [-180, 180],
    outputRange: ['-180deg', '180deg'],
  });

  return (
    <LinearGradient
      colors={['#B3E5FC', '#81D4FA', '#4FC3F7']}  // Child-friendly underwater gradient
      style={styles.container}
    >
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    position: 'absolute',
    top: 40,
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  fishImage: {
    position: 'absolute',
  },
});

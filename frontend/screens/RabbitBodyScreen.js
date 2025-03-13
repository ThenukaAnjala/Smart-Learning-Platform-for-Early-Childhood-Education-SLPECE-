// frontend/screens/RabbitBodyScreen.js
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View, ImageBackground, Image, Dimensions, Easing } from 'react-native';
import { useRoute } from '@react-navigation/native';

export default function RabbitBodyScreen() {
  const route = useRoute();
  const { rabbitImageBase64, initialHeadSide } = route.params;

  // Dimensions for the rabbit drawing.
  const imageWidth = 200;
  const imageHeight = 300;
  const { width: screenWidth } = Dimensions.get('window');

  // Determine direction based on head side.
  // If head is "right", the rabbit moves from left to right.
  // If head is "left", the rabbit moves from right to left.
  const isRight = initialHeadSide === 'right';
  const startX = isRight ? 0 : screenWidth + imageWidth;
  const targetPositions = isRight
    ? [screenWidth * 0.25, screenWidth * 0.50, screenWidth * 0.75, screenWidth + imageWidth]
    : [screenWidth + imageWidth - screenWidth * 0.25, screenWidth + imageWidth - screenWidth * 0.50, screenWidth + imageWidth - screenWidth * 0.75, 0];

  // Animated values:
  // horizontalAnim: controls horizontal position.
  // verticalAnim: controls vertical jump (parabolic arc).
  // fadeAnim: controls opacity for a fade-in effect.
  const horizontalAnim = useRef(new Animated.Value(startX)).current;
  const verticalAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Jump parameters.
  const maxJumpHeight = 120;  // Maximum upward displacement (in pixels)
  const jumpDuration = 1000;  // Duration for horizontal movement per segment
  const jumpUpDuration = 400; // Duration of upward phase in each jump
  const jumpDownDuration = 600; // Duration of downward phase in each jump

  useEffect(() => {
    // Fade in the rabbit.
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();

    // Build an array of jump segments.
    const jumpSegments = targetPositions.map((target) =>
      Animated.parallel([
        Animated.timing(horizontalAnim, {
          toValue: target,
          duration: jumpDuration,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(verticalAnim, {
            toValue: -maxJumpHeight,
            duration: jumpUpDuration,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(verticalAnim, {
            toValue: 0,
            duration: jumpDownDuration,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    Animated.sequence(jumpSegments).start();
  }, [
    fadeAnim,
    horizontalAnim,
    verticalAnim,
    targetPositions,
    jumpDuration,
    jumpUpDuration,
    jumpDownDuration,
    maxJumpHeight,
  ]);

  // Flip the image horizontally if the rabbit's head is on the left.
  // This ensures the rabbit's face is always toward its direction of travel.
  const flipStyle = !isRight ? { transform: [{ scaleX: -1 }] } : {};

  return (
    <ImageBackground
      source={require('../assets/rabbitBackground.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <Text style={styles.title}>Rabbit Full Body</Text>
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.rabbitContainer,
            { transform: [{ translateX: horizontalAnim }, { translateY: verticalAnim }] },
          ]}
        >
          {rabbitImageBase64 && (
            <Animated.Image
              source={{ uri: `data:image/png;base64,${rabbitImageBase64}` }}
              style={[
                styles.rabbitImage,
                { width: imageWidth, height: imageHeight, opacity: fadeAnim },
                flipStyle,
              ]}
              resizeMode="contain"
            />
          )}
        </Animated.View>
        {/* Rabbit bush always appears on top */}
        <Image
          source={require('../assets/rabbitbush.png')}
          style={[styles.rabbitBush, { width: imageWidth, height: imageHeight }]}
          resizeMode="contain"
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  title: {
    position: 'absolute',
    top: 40,
    alignSelf: 'center',
    fontSize: 24,
    color: '#8B4513',
    fontWeight: 'bold',
    zIndex: 10,
  },
  container: {
    flex: 1,
    position: 'relative',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },
  rabbitContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  rabbitImage: {
    // Additional styling if needed.
  },
  rabbitBush: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    zIndex: 3, // Ensure the bush is always rendered on top.
  },
});

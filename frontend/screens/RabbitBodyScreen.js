// frontend/screens/RabbitBodyScreen.js
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
  ImageBackground,
  Image,
  Dimensions,
  Easing,
} from 'react-native';
import { useRoute } from '@react-navigation/native';

export default function RabbitBodyScreen() {
  const route = useRoute();
  const { rabbitImageBase64, initialHeadSide } = route.params;

  // Dimensions for the rabbit drawing.
  const imageWidth = 200;
  const imageHeight = 300;
  const { width: screenWidth } = Dimensions.get('window');

  // If head is "right", rabbit starts off-screen to the left and moves to the right.
  // If head is "left", rabbit starts off-screen to the right and moves left.
  const isRight = initialHeadSide === 'right';

  // Starting x-position for the rabbit.
  const startX = isRight ? -imageWidth : screenWidth;

  // Four horizontal target positions:
  // For "right" branch, we move from negative x to screenWidth + imageWidth.
  // For "left" branch, we move from screenWidth down to -imageWidth.
  const targetPositions = isRight
    ? [
        screenWidth * 0.25,
        screenWidth * 0.50,
        screenWidth * 0.75,
        screenWidth + imageWidth,
      ]
    : [
        screenWidth * 0.75,
        screenWidth * 0.50,
        screenWidth * 0.25,
        -imageWidth,
      ];

  // Animated Values
  const horizontalAnim = useRef(new Animated.Value(startX)).current;
  const verticalAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Jump parameters (tweak as desired).
  const maxJumpHeight = 120;  // Vertical jump height
  const jumpDuration = 1000;  // Horizontal movement per segment
  const jumpUpDuration = 400; // Upward phase
  const jumpDownDuration = 600; // Downward phase

  useEffect(() => {
    // Fade in the rabbit image
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();

    // Build an array of jump segments. Each segment moves horizontally in parallel
    // with an up/down sequence in the vertical direction.
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

    // Run these segments in sequence.
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

  // Flip the image horizontally if the rabbit's head is "left".
  // That ensures that if the rabbit is traveling from right to left,
  // the image is mirrored so the rabbit faces the direction of travel.
  const flipStyle = !isRight
    ? { transform: [{ scaleX: -1 }] }
    : {};

  return (
    <ImageBackground
      source={require('../assets/rabbitBackground.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <Text style={styles.title}>Rabbit Full Body</Text>
      <View style={styles.container}>
        {/* The jumping rabbit */}
        <Animated.View
          style={[
            styles.rabbitContainer,
            {
              transform: [
                { translateX: horizontalAnim },
                { translateY: verticalAnim },
              ],
            },
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

        {/* Bush on left if isRight => true, bush on right otherwise */}
        <Image
          source={require('../assets/rabbitbush.png')}
          style={[
            styles.rabbitBush,
            {
              width: imageWidth,
              height: imageHeight,
              left: isRight ? 0 : 'auto',
              right: isRight ? 'auto' : 0,
            },
          ]}
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
    // Additional styling if needed
  },
  rabbitBush: {
    position: 'absolute',
    bottom: 0,
    zIndex: 3,
  },
});

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

  // Rabbit image dimensions.
  const imageWidth = 200;
  const imageHeight = 300;
  const { width: screenWidth } = Dimensions.get('window');

  // Branch animation configuration:
  // If answer is "right": rabbit moves from left to right with bush on left.
  // If answer is "left": bush is placed on the right and the rabbit jumps from right to left in 4 segments.
  let startX, targetPositions, bushPositionStyle, initialScale;
  if (initialHeadSide === 'right') {
    // "Right" branch configuration.
    startX = 0;
    targetPositions = [
      screenWidth * 0.25,
      screenWidth * 0.50,
      screenWidth * 0.75,
      screenWidth + imageWidth,
    ];
    bushPositionStyle = { left: 0 }; // bush on left
    initialScale = 1;
  } else {
    // "Left" branch: new animation.
    // Rabbit starts at the right bush.
    startX = screenWidth - imageWidth;
    targetPositions = [
      startX - screenWidth * 0.25,
      startX - screenWidth * 0.50,
      startX - screenWidth * 0.75,
      -imageWidth, // Ends off-screen left.
    ];
    bushPositionStyle = { right: 0 }; // bush on right
    // Rabbit image will be flipped initially so its face points left.
    initialScale = -1;
  }

  // Animated values.
  const horizontalAnim = useRef(new Animated.Value(startX)).current;
  const verticalAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(initialScale)).current;

  // Jump parameters.
  const maxJumpHeight = 120;      // Maximum upward displacement (pixels)
  const jumpDuration = 1000;      // Horizontal duration per segment (ms)
  const jumpUpDuration = 400;     // Upward phase duration (ms)
  const jumpDownDuration = 600;   // Downward phase duration (ms)

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

    // For the "left" branch, run the new animation in 4 segments.
    if (initialHeadSide === 'left') {
      Animated.sequence(jumpSegments).start();
    } else {
      // Standard "right" branch animation.
      Animated.sequence(jumpSegments).start();
    }
  }, [
    fadeAnim,
    horizontalAnim,
    verticalAnim,
    scaleAnim,
    targetPositions,
    initialHeadSide,
    jumpDuration,
    jumpUpDuration,
    jumpDownDuration,
    maxJumpHeight,
  ]);

  // Build the rabbit image style.
  const rabbitStyle = {
    width: imageWidth,
    height: imageHeight,
    opacity: fadeAnim,
    transform: [{ scaleX: scaleAnim }],
  };

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
              style={[styles.rabbitImage, rabbitStyle]}
              resizeMode="contain"
            />
          )}
        </Animated.View>
        {/* Place the rabbit bush based on the branch.
            For "right" branch, bush is on left; for "left" branch, bush is on right. */}
        <Image
          source={require('../assets/rabbitbush.png')}
          style={[styles.rabbitBush, { width: imageWidth, height: imageHeight }, bushPositionStyle]}
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
    zIndex: 3, // Ensure the bush is always rendered on top.
  },
});
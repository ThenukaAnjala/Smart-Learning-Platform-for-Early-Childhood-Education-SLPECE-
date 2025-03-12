// frontend/components/OxygenBubbles.js
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Easing, View } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

function Bubble({ startX, delay, duration, size }) {
  // Animated values for vertical movement, scaling, and opacity.
  const translateY = useRef(new Animated.Value(screenHeight)).current;
  const scale = useRef(new Animated.Value(0.5)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const oscillation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start a looping animation for the bubble:
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          // Bubble rises upward
          Animated.timing(translateY, {
            toValue: -size,
            duration: duration,
            useNativeDriver: true,
            easing: Easing.out(Easing.quad),
          }),
          // Bubble scales up slightly as it rises
          Animated.timing(scale, {
            toValue: 1.2,
            duration: duration,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          // Bubble fades out gradually
          Animated.timing(opacity, {
            toValue: 0,
            duration: duration,
            useNativeDriver: true,
            easing: Easing.linear,
          }),
          // Bubble oscillates horizontally for a gentle sway
          Animated.timing(oscillation, {
            toValue: 1,
            duration: duration,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.sin),
          }),
        ]),
        // Reset values instantly
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: screenHeight,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 0.5,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(oscillation, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, [translateY, scale, opacity, oscillation, delay, duration, size]);

  // Use oscillation value to simulate horizontal sway around startX.
  // The bubble will move from (startX - 10) to (startX + 10)
  const horizontalMovement = oscillation.interpolate({
    inputRange: [0, 1],
    outputRange: [startX - 10, startX + 10],
  });

  return (
    <Animated.View
      style={[
        styles.bubble,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          opacity: opacity,
          transform: [{ translateY }, { translateX: horizontalMovement }, { scale }],
        },
      ]}
    />
  );
}

export default function OxygenBubbles() {
  const bubbles = [];
  // Create a set of bubbles on both sides of the screen.
  const bubblesPerSide = 4;
  for (let i = 0; i < bubblesPerSide; i++) {
    // For left side: startX between 10 and 50
    const leftX = Math.random() * 40 + 10;
    // For right side: startX between (screenWidth - 50) and (screenWidth - 10)
    const rightX = screenWidth - (Math.random() * 40 + 10);
    const delay = Math.random() * 3000; // Random delay up to 3 seconds
    const duration = Math.random() * 4000 + 8000; // Duration between 8-12 seconds
    const size = Math.random() * 20 + 10; // Size between 10 and 30 pixels

    bubbles.push(<Bubble key={`left-${i}`} startX={leftX} delay={delay} duration={duration} size={size} />);
    bubbles.push(<Bubble key={`right-${i}`} startX={rightX} delay={delay} duration={duration} size={size} />);
  }

  return <View style={styles.container}>{bubbles}</View>;
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  bubble: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
});

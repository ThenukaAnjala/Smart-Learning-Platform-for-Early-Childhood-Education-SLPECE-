// frontend/screens/LionScreen.js
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View, ImageBackground, Dimensions, Easing, Image } from 'react-native';
import { useRoute } from '@react-navigation/native';

export default function LionScreen() {
  const route = useRoute();
  const { lionImageBase64, initialHeadSide } = route.params;

  // Dimensions for the lion image.
  const imageWidth = 160;
  const imageHeight = 180;
  const { width: screenWidth } = Dimensions.get('window');

  // Determine if the lion's head is on the left.
  // If so, flip the lion image so its face points left.
  const isFacingLeft = initialHeadSide === 'left';
  const flipStyle = isFacingLeft ? { transform: [{ scaleX: -1 }] } : {};

  // Animated values: fade in and horizontal movement.
  const fadeAnim = useRef(new Animated.Value(0)).current;
  // Start completely off-screen (to the left if facing right, or to the right if facing left).
  const translateXAnim = useRef(new Animated.Value(isFacingLeft ? screenWidth : -imageWidth)).current;

  useEffect(() => {
    // Fade in and slide the lion to a peek position.
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 3000, // slower fade in
        useNativeDriver: true,
      }),
      Animated.timing(translateXAnim, {
        toValue: -imageWidth / 2, // half of the lion is visible
        duration: 3000, // slower slide in
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {
      // After initial animation, start a looping "peek" animation.
      Animated.loop(
        Animated.sequence([
          Animated.timing(translateXAnim, {
            toValue: -imageWidth / 2 - 20, // slide further out a bit
            duration: 15000, // slower peek retract
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(translateXAnim, {
            toValue: -imageWidth / 2 - 20, // slide back to peek position
            duration: 15000, // slower peek return
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, [fadeAnim, translateXAnim, imageWidth, screenWidth, isFacingLeft]);

  return (
    <ImageBackground
      source={require('../assets/lionBackground.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <Text style={styles.title}>Lion</Text>
      <View style={styles.container}>
        {/* Lion image container (zIndex: 1) */}
        {lionImageBase64 && (
          <Animated.Image
            source={{ uri: `data:image/png;base64,${lionImageBase64}` }}
            style={[
              styles.lionImage,
              {
                width: imageWidth,
                height: imageHeight,
                opacity: fadeAnim,
                transform: [{ translateX: translateXAnim }],
              },
              flipStyle,
            ]}
            resizeMode="contain"
          />
        )}
        {/* Overlay Object 1: lionobject.png */}
        <Image
          source={require('../assets/lionobject.png')}
          style={styles.lionObject}
          resizeMode="contain"
        />
        {/* Overlay Object 2: lionobject2.png */}
        <Image
          source={require('../assets/lionobject2.png')}
          style={styles.lionObject2}
          resizeMode="contain"
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    position: 'absolute',
    top: 40,
    left: 10,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    zIndex: 10,
  },
  container: {
    flex: 1,
    position: 'relative',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lionImage: {
    position: 'absolute',
    bottom: 0,
    right: 420,
    width: 500,
    height: 500,
    zIndex: 1,
  },
  lionObject: {
    position: 'absolute',
    bottom: 122,
    left: -50,
    width: 100,
    height: 100,
    zIndex: 2,
  },
  lionObject2: {
    position: 'absolute',
    bottom: -90,
    right: 550,
    width: 500,
    height: 500,
    zIndex: 2,
  },
});

// frontend/components/AquaticPlant.js
import React, { useRef, useEffect } from 'react';
import { Animated, StyleSheet, Easing } from 'react-native';
import { Image } from 'react-native';

export default function AquaticPlant({ position, size, style }) {
  // position: an object containing position style (e.g., { left: 10, bottom: 0 })
  // size: an object with { width, height } for the plant
  const swingAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Loop a gentle swing animation (swaying left and right)
    Animated.loop(
      Animated.sequence([
        Animated.timing(swingAnim, {
          toValue: 1,
          duration: 5000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
        Animated.timing(swingAnim, {
          toValue: -1,
          duration: 5000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
      ])
    ).start();
  }, [swingAnim]);

  // Interpolate the swing value to rotation (e.g. -10deg to 10deg)
  const rotation = swingAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-10deg', '10deg'],
  });

  return (
    <Animated.View style={[styles.container, position, size, { transform: [{ rotate: rotation }] }, style]}>
      {/* 
        Replace 'aquaticPlant.png' with your own image asset.
        Place the image in your frontend/assets folder.
      */}
      <Image
        source={require('../assets/aquaticPlant.png')}
        style={styles.image}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

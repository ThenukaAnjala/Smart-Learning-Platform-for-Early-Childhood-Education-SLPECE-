// frontend/components/GrassGrowing.js
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, Image, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

export default function GrassGrowing({ finalHeightRatio = 0.35 }) {
  const grassHeight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(grassHeight, {
      toValue: Dimensions.get('window').height * finalHeightRatio,
      duration: 2000,
      useNativeDriver: false,
    }).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('../assets/grass.png')}
        style={[styles.grass, { height: grassHeight }]}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    width: screenWidth,
    alignItems: 'center',
  },
  grass: {
    width: screenWidth,
  },
});

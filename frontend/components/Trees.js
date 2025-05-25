// frontend/components/Trees.js
import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Helper to generate a random number in [min, max)
function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

// How many grass images to scatter
const NUM_TREES = 10;

export default function Trees() {
  const trees = [];

  for (let i = 0; i < NUM_TREES; i++) {
    // Random position
    const randX = randomBetween(0, screenWidth - 100);
    const randY = randomBetween(0, screenHeight - 100);

    // Random scale
    const scale = randomBetween(0.5, 1.2);

    trees.push(
      <Image
        key={`grass-${i}`}
        source={require('../assets/grass.png')} // place your grass image in /assets/grass.png
        style={[
          styles.treeImage,
          {
            left: randX,
            top: randY,
            transform: [{ scale }],
          },
        ]}
        resizeMode="contain"
      />
    );
  }

  return <View style={styles.container}>{trees}</View>;
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    // pointerEvents="none" so they don't block touches
    pointerEvents: 'none',
  },
  treeImage: {
    position: 'absolute',
    width: 100,
    height: 100,
  },
});

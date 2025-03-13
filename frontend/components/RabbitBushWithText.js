// frontend/components/RabbitBushWithText.js
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Helper to generate random positions within a given area.
function getRandomPosition(maxWidth, maxHeight) {
  return {
    left: Math.random() * (maxWidth - 50),
    top: Math.random() * (maxHeight - 50),
  };
}

export default function RabbitBushWithText({ numItems = 10 }) {
  // Define an array of random text strings.
  const randomTexts = [
    "Hello", "Rabbit", "Nature", "Magic", "Joy",
    "Dream", "Hop", "Play", "Smile", "Wonder"
  ];
  
  // Generate an array of random text items with random positions.
  const items = Array.from({ length: numItems }).map((_, i) => {
    const pos = getRandomPosition(screenWidth, screenHeight);
    const text = randomTexts[Math.floor(Math.random() * randomTexts.length)];
    return { key: i.toString(), text, pos };
  });
  
  return (
    <View style={styles.container}>
      {items.map(item => (
        <Text
          key={item.key}
          style={[styles.randomText, { left: item.pos.left, top: item.pos.top }]}
        >
          {item.text}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject, // fills entire screen
    pointerEvents: 'none', // allows touches to pass through
  },
  randomText: {
    position: 'absolute',
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
});

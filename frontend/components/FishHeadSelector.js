// frontend/components/FishHeadSelector.js
import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Text } from 'react-native';

export default function FishHeadSelector({ onSelect }) {
  // onSelect is a callback that receives "left" or "right"

  return (
    <View style={styles.container}>
      {/* The circular background (just for visualization) */}
      <View style={styles.circle}>
        {/* Left half arc */}
        <TouchableOpacity style={[styles.halfArc, styles.leftArc]} onPress={() => onSelect('left')}>
          <Text style={styles.arcText}>Left</Text>
        </TouchableOpacity>

        {/* Right half arc */}
        <TouchableOpacity style={[styles.halfArc, styles.rightArc]} onPress={() => onSelect('right')}>
          <Text style={styles.arcText}>Right</Text>
        </TouchableOpacity>

        {/* Fish image in the center */}
        <Image
          source={require('../assets/fishPlaceholder.png')} // Replace with your fish image or placeholder
          style={styles.fishImage}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

const SIZE = 300; // diameter of the circle

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    // fill the screen or parent container as you prefer
  },
  circle: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: '#ccc',
    position: 'relative',
    overflow: 'hidden',
  },
  halfArc: {
    position: 'absolute',
    width: SIZE / 2,
    height: SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftArc: {
    left: 0,
    backgroundColor: 'rgba(255,255,255,0.2)', // semi-transparent overlay
  },
  rightArc: {
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.1)', // different overlay for the right side
  },
  arcText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 18,
  },
  fishImage: {
    position: 'absolute',
    top: SIZE * 0.25,
    left: SIZE * 0.25,
    width: SIZE * 0.5,
    height: SIZE * 0.5,
  },
});

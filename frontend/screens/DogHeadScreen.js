import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ImageBackground, Animated, Easing } from 'react-native';

export default function DogHeadScreen({ route }) {
  const { dogImageBase64, isHeadOnly } = route.params;

  // Animation value for tilting the object
  const tiltAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Loop an animation from 0 -> 1 -> 0, which we map to 0deg -> 10deg -> 0deg
    Animated.loop(
      Animated.sequence([
        Animated.timing(tiltAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(tiltAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    ).start();
  }, [tiltAnim]);

  // Map tiltAnim [0..1] to a rotation from 0deg..10deg
  const tilt = tiltAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '10deg'],
  });

  return (
    <ImageBackground
      source={require('../assets/dogBackground.png')}
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Dog Head Screen</Text>
        {dogImageBase64 ? (
          <Image
            source={{ uri: `data:image/png;base64,${dogImageBase64}` }}
            style={styles.image}
            resizeMode="contain"
          />
        ) : (
          <Text>No image available</Text>
        )}
        <Text style={styles.caption}>
          {isHeadOnly ? "Showing Dog's Head" : "Full Dog"}
        </Text>
      </View>

      {/* The fence at the bottom */}
      <Image
        source={require('../assets/dogWall.png')}
        style={styles.wallImage}
        resizeMode="cover"
      />

      {/* The tilting object on top of the fence */}
      <Animated.Image
        source={require('../assets/dogWallObject.png')}
        style={[
          styles.wallObject,
          { transform: [{ rotate: tilt }] },
        ]}
        resizeMode="contain"
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 20 
  },
  image: { 
    width: 300, 
    height: 300 
  },
  caption: {
    marginTop: 20,
    fontSize: 18,
  },
  wallImage: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 100, // adjust as needed
  },
  wallObject: {
    position: 'absolute',
    width: 60,    // adjust as needed
    height: 60,   // adjust as needed
    bottom: 100,  // place it above the fence
    left: '50%',  // horizontally center
    // pivot from the top corner: shift left by half the width
    marginLeft: -30, 
  },
});

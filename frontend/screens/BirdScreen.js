// frontend/screens/BirdScreen.js
import React, { useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  ImageBackground, 
  Image, 
  View, 
  Animated, 
  Easing 
} from 'react-native';
import { useRoute } from '@react-navigation/native';

export default function BirdScreen() {
  const route = useRoute();
  const { birdImageBase64, initialHeadSide } = route.params;

  const imageWidth = 150;
  const imageHeight = 100;

  // Flip the image if the bird is facing left.
  const flipStyle = initialHeadSide === 'left' ? { transform: [{ scaleX: -1 }] } : {};

  // Animation refs for movement
  const verticalAnim = useRef(new Animated.Value(0)).current; // Vertical movement (flying up)
  const horizontalAnim = useRef(new Animated.Value(0)).current; // Horizontal movement (left or right)
  const fadeAnim = useRef(new Animated.Value(1)).current; // Fading effect
  // New animated value for stride oscillation
  const strideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Determine movement direction
    let finalX = 1000; // Default: Moves towards the upper right corner (south)
    let finalY = -500; // Always flies up

    if (initialHeadSide === 'south') {
      finalX = 300;
    } else if (initialHeadSide === 'left') {
      finalX = -300;
    }

    const animateBird = () => {
      // Random duration between 8000ms and 15000ms (step 1000ms)
      const randomDuration = (8 + Math.floor(Math.random() * 8)) * 1000;
      const cycles = randomDuration / 1000; // Each stride cycle lasts 1000ms

      let strideAnimations = [];
      for (let i = 0; i < cycles; i++) {
        strideAnimations.push(
          Animated.timing(strideAnim, {
            toValue: -5,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(strideAnim, {
            toValue: 5,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(strideAnim, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          })
        );
      }

      Animated.parallel([
        Animated.timing(verticalAnim, {
          toValue: finalY,
          duration: randomDuration,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(horizontalAnim, {
          toValue: finalX,
          duration: randomDuration,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: randomDuration,
          useNativeDriver: true,
        }),
        Animated.sequence(strideAnimations)
      ]).start(() => {
        verticalAnim.setValue(0);
        horizontalAnim.setValue(0);
        fadeAnim.setValue(1);
        // strideAnim is already at 0; restart the entire animation loop
        animateBird();
      });
    };

    animateBird();
  }, [verticalAnim, horizontalAnim, fadeAnim, strideAnim, initialHeadSide]);

  return (
    <ImageBackground
      source={require('../assets/birdBackground.png')}
      style={styles.background}
      resizeMode="cover"
    >
      {/* <Text style={styles.title}>Bird</Text> */}

      {/* Container for layering: Bird will be in the middle */}
      <View style={styles.container}>

        {/* Bird Image (Recognized from Drawing) - Positioned in the middle layer */}
        {birdImageBase64 && (
          <Animated.Image
            source={{ uri: `data:image/png;base64,${birdImageBase64}` }}
            style={[
              styles.birdImage,
              flipStyle,
              {
                transform: [
                  { translateY: verticalAnim },
                  { translateY: strideAnim },
                  { translateX: horizontalAnim }
                ],
                opacity: fadeAnim, // Fading effect
              }
            ]}
            resizeMode="contain"
          />
        )}

        {/* Foreground Object (Bird Object on top of the bird) */}
        <Image
          source={require('../assets/birdobject.png')}  // Ensure this file exists in the assets folder
          style={styles.birdObject}
          resizeMode="contain"
        />

      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#87CEFA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    position: 'absolute',
    top: 40,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    zIndex: 10,
  },
  container: {
    position: 'relative',
    alignItems: 'center',
  },
  birdImage: {
    width: 150,
    height: 100,
    marginTop: -70,
    position: 'absolute',
    zIndex: 1,  // Ensures the bird appears **behind** the object
  },
  birdObject: {
    width: 100,
    height: 100,
    marginTop: 30,
    marginTop: -70,  // Adjust position to be on top of the bird
    zIndex: 2,  // Higher zIndex so object appears **above** the bird
  },
});

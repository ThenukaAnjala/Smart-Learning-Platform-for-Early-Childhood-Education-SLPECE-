// frontend/screens/BirdScreen.js
import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  ImageBackground,
  Image,
  View,
  Animated,
  Easing,
} from 'react-native';
import { useRoute } from '@react-navigation/native';

export default function BirdScreen() {
  const route = useRoute();
  const { birdImageBase64, initialHeadSide } = route.params;

  // Flip image if bird faces left
  const flipStyle = initialHeadSide === 'left' ? { transform: [{ scaleX: -1 }] } : {};

  /* animated refs */
  const vertical   = useRef(new Animated.Value(0)).current;
  const horizontal = useRef(new Animated.Value(0)).current;
  const fade       = useRef(new Animated.Value(1)).current;
  const stride     = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // pick target direction
    let finalX = 1000;   // default → up-right
    let finalY = -500;   // always up
    if (initialHeadSide === 'south')      finalX =  300;
    else if (initialHeadSide === 'left')  finalX = -300;

    /* helper to animate bird continuously */
    const animateBird = () => {
      /* NEW: slower overall duration 16-30 s */
      const randomDuration = (16 + Math.floor(Math.random() * 15)) * 1000;

      /* NEW: stride cycle lasts 1.6 s instead of 1 s */
      const strideCycle   = 1600;
      const cycles        = Math.round(randomDuration / strideCycle);

      const strideSeq = [];
      for (let i = 0; i < cycles; i++) {
        strideSeq.push(
          Animated.timing(stride, { toValue: -5, duration: 400, useNativeDriver: true }),
          Animated.timing(stride, { toValue:  5, duration: 800, useNativeDriver: true }),
          Animated.timing(stride, { toValue:  0, duration: 400, useNativeDriver: true }),
        );
      }

      Animated.parallel([
        Animated.timing(vertical, {
          toValue: finalY,
          duration: randomDuration,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.quad),
        }),
        Animated.timing(horizontal, {
          toValue: finalX,
          duration: randomDuration,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.quad),
        }),
        Animated.timing(fade, {
          toValue: 0,
          duration: randomDuration,
          useNativeDriver: true,
        }),
        Animated.sequence(strideSeq),
      ]).start(() => {
        // reset & loop
        vertical.setValue(0);
        horizontal.setValue(0);
        fade.setValue(1);
        animateBird();
      });
    };

    animateBird();
  }, [vertical, horizontal, fade, stride, initialHeadSide]);

  return (
    <ImageBackground
      source={require('../assets/birdBackground.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        {birdImageBase64 && (
          <Animated.Image
            source={{ uri: `data:image/png;base64,${birdImageBase64}` }}
            style={[
              styles.birdImage,
              flipStyle,
              {
                transform: [
                  { translateY: vertical },
                  { translateY: stride },
                  { translateX: horizontal },
                ],
                opacity: fade,
              },
            ]}
            resizeMode="contain"
          />
        )}

        {/* foreground perch / object */}
        <Image
          source={require('../assets/birdobject.png')}
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
  container: { position: 'relative', alignItems: 'center' },
  birdImage: {
    width: 150,
    height: 100,
    marginTop: 260,
    position: 'absolute',
    zIndex: 1,
  },
  birdObject: {
    width: 250,
    height: 250,
    marginTop: 200,
    zIndex: 2,
  },
});

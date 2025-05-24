// frontend/screens/BirdScreen.js
import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  ImageBackground,
  Image,
  View,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { useRoute } from '@react-navigation/native';

export default function BirdScreen() {
  const route = useRoute();
  const { birdImageBase64, initialHeadSide } = route.params;

  const { width: SCREEN_W } = Dimensions.get('window');
  const CLOUD_W = 200;
  const CLOUD_H = 100;

  // Animated refs
  const vertical   = useRef(new Animated.Value(0)).current;
  const horizontal = useRef(new Animated.Value(0)).current;
  const fade       = useRef(new Animated.Value(1)).current;
  const stride     = useRef(new Animated.Value(0)).current;
  const cloudX     = useRef(new Animated.Value(-CLOUD_W)).current;

  // Flip image if bird faces left
  const flipStyle = initialHeadSide === 'left' ? { transform: [{ scaleX: -1 }] } : {};

  useEffect(() => {
    // Cloud animation: loop left→right in 25s
    Animated.loop(
      Animated.timing(cloudX, {
        toValue: SCREEN_W,
        duration: 25000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [cloudX, SCREEN_W]);

  useEffect(() => {
    // pick target direction
    let finalX = 1000;   // default → up-right
    let finalY = -500;   // always up
    if (initialHeadSide === 'south')      finalX =  300;
    else if (initialHeadSide === 'left')  finalX = -300;

    /* helper to animate bird continuously */
    const animateBird = () => {
      /* slower overall duration 16–30s */
      const randomDuration = (16 + Math.floor(Math.random() * 15)) * 1000;
      const strideCycle    = 1600;
      const cycles         = Math.round(randomDuration / strideCycle);

      const strideSeq = [];
      for (let i = 0; i < cycles; i++) {
        strideSeq.push(
          Animated.timing(stride, { toValue: -5, duration: 400, useNativeDriver: true }),
          Animated.timing(stride, { toValue:  5, duration: 800, useNativeDriver: true }),
          Animated.timing(stride, { toValue:   0, duration: 400, useNativeDriver: true })
        );
      }

      Animated.parallel([
        Animated.timing(vertical, {
          toValue: finalY,
          duration: randomDuration,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(horizontal, {
          toValue: finalX,
          duration: randomDuration,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
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
      {/* drifting cloud */}
      <Animated.Image
        source={require('../assets/birdscreenclode.png')}
        style={[
          styles.cloud,
          {
            transform: [{ translateX: cloudX }],
          },
        ]}
        resizeMode="contain"
      />

      <View style={styles.container}>
        {/* animated bird */}
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
  cloud: {
    position: 'absolute',
    marginLeft: -100,
    top: 5,
    width: 200,
    height: 100,
    zIndex: 0,
  },
  container: {
    position: 'relative',
    alignItems: 'center',
    flex: 1,
  },
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

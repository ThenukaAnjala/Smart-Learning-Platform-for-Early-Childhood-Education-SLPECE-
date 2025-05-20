// frontend/screens/FishScreen.js
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Easing,
  Text,
  ImageBackground,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import OxygenBubbles from '../components/OxygenBubbles';

export default function FishScreen() {
  /* ─────────────── params & constants ─────────────── */
  const route = useRoute();
  const fishImageBase64 = route.params?.fishImageBase64;
  const initialHeadSide = route.params?.initialHeadSide || 'right'; // "left" or "right"

  const { width: W, height: H } = Dimensions.get('window');
  const FISH_W = 100, FISH_H = 100;

  /* ─────────────── animated refs ─────────────── */
  const x = useRef(new Animated.Value(-FISH_W)).current;  // start off-screen left
  const y = useRef(new Animated.Value(0)).current;        // will be reset for each run
  const bob = useRef(new Animated.Value(0)).current;      // gentle vertical bob

  //  flipX: 1 = normal, -1 = mirrored
  const flipX = initialHeadSide === 'left' ? -1 : 1;

  /* ─────────────── helper ─────────────── */
  const randY = () =>
    Math.random() * (H - FISH_H); // pick a random depth in the tank

  /* ─────────────── bobbing (loop forever) ─────────────── */
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: 3500, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        Animated.timing(bob, { toValue: -1, duration: 7000, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        Animated.timing(bob, { toValue: 0, duration: 3500, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
      ])
    ).start();
  }, []);

  /* ─────────────── left-to-right swim loop ─────────────── */
  useEffect(() => {
    if (!fishImageBase64) return;

    const swimOnce = () => {
      // reset position (teleport) to left & pick a new depth
      x.setValue(-FISH_W);
      y.setValue(randY());

      Animated.timing(x, {
        toValue: W,                    // swim all the way to the right edge
        duration: 14000,               // ~14 s feels fairly “fish-like”
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }).start(() => swimOnce());      // when finished, start again
    };

    swimOnce();
  }, [fishImageBase64]);

  /* ─────────────── interpolations ─────────────── */
  const bobOffset = bob.interpolate({ inputRange: [-1, 1], outputRange: [-12, 12] });

  /* ─────────────── render ─────────────── */
  return (
    <ImageBackground
      source={require('../assets/fishBackground.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <OxygenBubbles />
      {/* <Text style={styles.title}>Underwater Adventure!</Text> */}

      {fishImageBase64 && (
        <Animated.Image
          source={{ uri: `data:image/png;base64,${fishImageBase64}` }}
          style={[
            styles.fish,
            {
              width: FISH_W,
              height: FISH_H,
              transform: [
                { translateX: x },
                { translateY: Animated.add(y, bobOffset) },
                { scaleX: flipX },
              ],
            },
          ]}
          resizeMode="contain"
        />
      )}
    </ImageBackground>
  );
}

/* ─────────────── styles ─────────────── */
const styles = StyleSheet.create({
  background: { flex: 1 },
  title: {
    position: 'absolute', top: 40, alignSelf: 'center',
    fontSize: 24, color: '#fff', fontWeight: 'bold', zIndex: 1,
  },
  fish: { position: 'absolute', zIndex: 2 },
});

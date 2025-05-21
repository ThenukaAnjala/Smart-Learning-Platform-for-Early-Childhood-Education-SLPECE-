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
import { Audio } from 'expo-av';
import { useRoute } from '@react-navigation/native';
import OxygenBubbles from '../components/OxygenBubbles';

export default function FishScreen() {
  /* ───────────────── params ───────────────── */
  const route = useRoute();
  const fishImageBase64 = route.params?.fishImageBase64;
  const initialHeadSide = route.params?.initialHeadSide || 'right'; // "left" or "right"

  const { width: W, height: H } = Dimensions.get('window');
  const FISH_W = 100;
  const FISH_H = 100;

  /* ───────────────── animated refs ───────────────── */
  const x   = useRef(new Animated.Value(-FISH_W)).current; // start off-screen left
  const y   = useRef(new Animated.Value(0)).current;
  const bob = useRef(new Animated.Value(0)).current;
  const flipX = initialHeadSide === 'left' ? -1 : 1;

  const randY = () => Math.random() * (H - FISH_H);

  /* ───────────────── background audio ───────────────── */
  const soundRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const loadAndPlay = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require('../assets/ad/videoplayback.m4a'), // ← your audio file
          { shouldPlay: true, isLooping: true }
        );
        if (mounted) soundRef.current = sound;
      } catch (err) {
        console.warn('Fish audio load error:', err);
      }
    };

    if (fishImageBase64) loadAndPlay();

    return () => {
      mounted = false;
      if (soundRef.current) soundRef.current.unloadAsync();
    };
  }, [fishImageBase64]);

  /* ───────────────── bobbing loop ───────────────── */
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1,  duration: 3500, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        Animated.timing(bob, { toValue: -1, duration: 7000, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        Animated.timing(bob, { toValue: 0,  duration: 3500, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
      ])
    ).start();
  }, []);

  /* ───────────────── swim loop ───────────────── */
  useEffect(() => {
    if (!fishImageBase64) return;

    const swimOnce = () => {
      x.setValue(-FISH_W); // teleport left
      y.setValue(randY()); // new depth

      Animated.timing(x, {
        toValue: W,
        duration: 14000,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }).start(swimOnce); // loop forever
    };

    swimOnce();
  }, [fishImageBase64]);

  /* ───────────────── interpolations ───────────────── */
  const bobOffset = bob.interpolate({
    inputRange: [-1, 1],
    outputRange: [-12, 12],
  });

  /* ───────────────── render ───────────────── */
  return (
    <ImageBackground
      source={require('../assets/fishBackground.png')}
      style={styles.bg}
      resizeMode="cover"
    >
      <OxygenBubbles />
      <Text style={styles.title}>Underwater Adventure!</Text>

      {fishImageBase64 && (
        <Animated.Image
          source={{ uri: `data:image/png;base64,${fishImageBase64}` }}
          resizeMode="contain"
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
        />
      )}
    </ImageBackground>
  );
}

/* ───────────────── styles ───────────────── */
const styles = StyleSheet.create({
  bg:    { flex: 1 },
  title: { position: 'absolute', top: 40, alignSelf: 'center', fontSize: 24, color: '#fff', fontWeight: 'bold', zIndex: 1 },
  fish:  { position: 'absolute', zIndex: 2 },
});

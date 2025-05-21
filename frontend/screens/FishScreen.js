// frontend/screens/FishScreen.js
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Easing,
  Text,
  ImageBackground,
  Image,
  View,
} from 'react-native';
import { Audio } from 'expo-av';
import { useRoute } from '@react-navigation/native';
import OxygenBubbles from '../components/OxygenBubbles';
import AquaticPlants from '../components/AquaticPlants';

export default function FishScreen() {
  const route           = useRoute();
  const fishImageBase64 = route.params?.fishImageBase64;
  const initialHeadSide = route.params?.initialHeadSide || 'right';

  const { width: W, height: H } = Dimensions.get('window');
  const FISH_W = 150, FISH_H = 150;

  // Animated values
  const xAnim   = useRef(new Animated.Value(-FISH_W)).current;
  const yAnim   = useRef(new Animated.Value(0)).current;
  const bobAnim = useRef(new Animated.Value(0)).current;
  const flipX   = initialHeadSide === 'left' ? -1 : 1;

  const randY = () => Math.random() * (H - FISH_H);

  // Play background audio
  const soundRef = useRef(null);
  useEffect(() => {
    let mounted = true;
    const loadAndPlay = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require('../assets/ad/videoplayback.m4a'),
          { shouldPlay: true, isLooping: true }
        );
        if (mounted) soundRef.current = sound;
      } catch (e) {
        console.warn('Audio load error', e);
      }
    };
    if (fishImageBase64) loadAndPlay();
    return () => {
      mounted = false;
      soundRef.current?.unloadAsync();
    };
  }, [fishImageBase64]);

  // Bubble bobbing
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bobAnim, { toValue: 1, duration: 3500, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        Animated.timing(bobAnim, { toValue: -1, duration: 7000, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        Animated.timing(bobAnim, { toValue: 0, duration: 3500, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
      ])
    ).start();
  }, []);

  // Swim loop (left → right)
  useEffect(() => {
    if (!fishImageBase64) return;
    const swim = () => {
      xAnim.setValue(-FISH_W);
      yAnim.setValue(randY());
      Animated.timing(xAnim, {
        toValue: W,
        duration: 14000,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }).start(swim);
    };
    swim();
  }, [fishImageBase64]);

  const bobOffset = bobAnim.interpolate({ inputRange: [-1,1], outputRange: [-12,12] });

  return (
    <ImageBackground
      source={require('../assets/fishBackground.png')}
      style={styles.background}
      resizeMode="cover"
    >
      {/* Full-screen bubbles */}
      <OxygenBubbles />

      {/* Central bubble cloud */}
      <View style={styles.centerBubbleContainer}>
        <OxygenBubbles />
      </View>

      {/* Swaying plants at bottom */}
      <AquaticPlants count={8} />

      {/* <Text style={styles.title}>Underwater Adventure!</Text> */}

      {/* Fixed corner objects */}
      <Image
        source={require('../assets/fishObject1.png')}
        style={[styles.cornerObj, styles.bottomLeft]}
        resizeMode="contain"
      />
      <Image
        source={require('../assets/fishObject1.png')}
        style={[styles.cornerObj, styles.bottomRight]}
        resizeMode="contain"
      />

      {/* Swimming fish */}
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
                { translateX: xAnim },
                { translateY: Animated.add(yAnim, bobOffset) },
                { scaleX: flipX },
              ],
            },
          ]}
        />
      )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  title: {
    position: 'absolute',
    top: 40,
    alignSelf: 'center',
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    zIndex: 5,
  },
  centerBubbleContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 200,
    height: 200,
    marginLeft: -100,
    marginTop: -100,
    overflow: 'hidden',
    zIndex: 4,
  },
  cornerObj: {
    position: 'absolute',
    width: 400,
    height: 400,
    zIndex: 7,
  },
  bottomLeft: {
    left: -50,
    bottom: -150,
  },
  bottomRight: {
    right: -50,
    bottom: -210,
  },
  fish: {
    position: 'absolute',
    zIndex: 6,
  },
});

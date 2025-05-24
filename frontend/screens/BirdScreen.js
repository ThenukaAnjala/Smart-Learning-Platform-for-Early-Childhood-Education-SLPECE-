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
  TouchableOpacity,
  Text,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';

export default function BirdScreen() {
  const route      = useRoute();
  const navigation = useNavigation();
  const { birdImageBase64, initialHeadSide } = route.params;

  const SCREEN_W = Dimensions.get('window').width;

  // Animated values
  const vertical   = useRef(new Animated.Value(0)).current;
  const horizontal = useRef(new Animated.Value(0)).current;
  const fade       = useRef(new Animated.Value(1)).current;
  const stride     = useRef(new Animated.Value(0)).current;
  const cloudX     = useRef(new Animated.Value(-200)).current;  // start off-screen left

  // Flip if needed
  const flipStyle = initialHeadSide === 'left'
    ? { transform: [{ scaleX: -1 }] }
    : {};

  // Audio
  const soundRef = useRef(null);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require('../assets/ad/bird.m4a'),
          { shouldPlay: true, isLooping: true }
        );
        if (mounted) soundRef.current = sound;
      } catch (e) {
        console.warn('Failed to load bird audio', e);
      }
    })();
    return () => {
      mounted = false;
      soundRef.current?.unloadAsync();
    };
  }, []);

  // Cloud drift
  useEffect(() => {
    Animated.loop(
      Animated.timing(cloudX, {
        toValue: SCREEN_W,
        duration: 25000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [cloudX, SCREEN_W]);

  // Bird flight + stride
  useEffect(() => {
    let finalX = 1000, finalY = -500;
    if (initialHeadSide === 'south')     finalX = 300;
    else if (initialHeadSide === 'left') finalX = -300;

    const animateBird = () => {
      const randomDuration = (16 + Math.floor(Math.random() * 15)) * 1000;
      const cycles = Math.round(randomDuration / 1600);

      const strideSeq = [];
      for (let i = 0; i < cycles; i++) {
        strideSeq.push(
          Animated.timing(stride, { toValue: -5, duration: 400, useNativeDriver: true }),
          Animated.timing(stride, { toValue:  5, duration: 800, useNativeDriver: true }),
          Animated.timing(stride, { toValue:  0, duration: 400, useNativeDriver: true })
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
        vertical.setValue(0);
        horizontal.setValue(0);
        fade.setValue(1);
        animateBird();
      });
    };

    animateBird();
  }, [initialHeadSide, vertical, horizontal, fade, stride]);

  // Back button handler
  const handleBack = () => {
    soundRef.current?.unloadAsync();
    navigation.navigate('DrawingBoard');
  };

  return (
    <ImageBackground
      source={require('../assets/birdBackground.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
        <Text style={styles.backTxt}>🐤 Back to Drawing!</Text>
      </TouchableOpacity>

      {/* drifting cloud */}
      <Animated.Image
        source={require('../assets/birdscreenclode.png')}
        style={[
          styles.cloud,
          {
            transform: [{ translateX: cloudX }],
            width: 200,   // concrete values here
            height: 100,
          },
        ]}
        resizeMode="contain"
      />

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
  backBtn: {
    position: 'absolute',
    top: 40,
    left: 12,
    backgroundColor: '#FFE066',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFC107',
    elevation: 4,
    zIndex: 20,
  },
  backTxt: {
    color: '#6A1B9A',
    fontWeight: '700',
    fontSize: 16,
  },
  cloud: {
    position: 'absolute',
    top: 50,
    zIndex: 10,
  },
  container: {
    flex: 1,
    position: 'relative',
    alignItems: 'center',
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

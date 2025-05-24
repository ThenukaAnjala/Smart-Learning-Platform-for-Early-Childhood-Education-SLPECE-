// frontend/screens/RabbitBodyScreen.js
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
  ImageBackground,
  Image,
  Dimensions,
  Easing,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Audio } from 'expo-av';

export default function RabbitBodyScreen() {
  const { rabbitImageBase64, initialHeadSide } = useRoute().params;
  const { width: screenWidth } = Dimensions.get('window');

  /* ─── basic sizing ────────────────────────────────────────────────────── */
  const RABBIT_W = 200;
  const RABBIT_H = 300;

  /* ─── direction & positions ───────────────────────────────────────────── */
  const goRight = initialHeadSide === 'right';
  const startX  = goRight ? -RABBIT_W : screenWidth;
  const endX    = goRight ? screenWidth : -RABBIT_W;

  /* ─── animated values ─────────────────────────────────────────────────── */
  const horiz  = useRef(new Animated.Value(startX)).current;
  const vert   = useRef(new Animated.Value(0)).current;
  const fade   = useRef(new Animated.Value(0)).current;

  /* ─── hop parameters ──────────────────────────────────────────────────── */
  const HOPS          = 4;
  const HOP_HEIGHT    = 120;
  const TOTAL_MS      = 4000;
  const HOP_MS        = TOTAL_MS / HOPS;        // 1000 ms each
  const UP_MS         = HOP_MS * 0.4;           // 40 % up, 60 % down
  const DOWN_MS       = HOP_MS * 0.6;

  /* ─── jump-sound ──────────────────────────────────────────────────────── */
  const soundRef = useRef(null);
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/ad/rabbitJump.mp3'),
        { shouldPlay: false, isLooping: false },
      );
      if (mounted) soundRef.current = sound;
    })();
    return () => {
      mounted = false;
      soundRef.current?.unloadAsync();
    };
  }, []);

  /* ─── master animation loop ───────────────────────────────────────────── */
  useEffect(() => {
    // fade-in
    Animated.timing(fade, { toValue: 1, duration: 2000, useNativeDriver: true }).start();

    const totalDist  = endX - startX;
    const segment    = totalDist / HOPS;
    const hopTargets = Array.from({ length: HOPS }, (_, i) => startX + segment * (i + 1));

    /* recursive hop runner */
    const doHop = (idx = 0) => {
      if (idx >= HOPS) {
        // reached the end; reset and start again
        horiz.setValue(startX);
        vert.setValue(0);
        doHop(0);
        return;
      }

      // play the hop sound at the START of this hop
      soundRef.current?.replayAsync();

      Animated.parallel([
        Animated.timing(horiz, {
          toValue: hopTargets[idx],
          duration: HOP_MS,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(vert, {
            toValue: -HOP_HEIGHT,
            duration: UP_MS,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(vert, {
            toValue: 0,
            duration: DOWN_MS,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => doHop(idx + 1));
    };

    /* kick things off */
    doHop();
  }, [
    horiz,
    vert,
    fade,
    startX,
    endX,
    HOP_HEIGHT,
    HOP_MS,
    UP_MS,
    DOWN_MS,
  ]);

  return (
    <ImageBackground
      source={require('../assets/rabbitBackground.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <Text style={styles.title}>Rabbit Full Body</Text>

      <View style={styles.container}>
        {/* hopping rabbit */}
        <Animated.View
          style={[
            styles.rabbitContainer,
            {
              transform: [
                { translateX: horiz },
                { translateY: vert },
              ],
            },
          ]}
        >
          {rabbitImageBase64 && (
            <Animated.Image
              source={{ uri: `data:image/png;base64,${rabbitImageBase64}` }}
              style={[
                styles.rabbitImage,
                { width: RABBIT_W, height: RABBIT_H, opacity: fade },
              ]}
              resizeMode="contain"
            />
          )}
        </Animated.View>

        {/* bush on the starting side */}
        <Image
          source={require('../assets/rabbitbush.png')}
          style={[
            styles.rabbitBush,
            {
              width: RABBIT_W,
              height: RABBIT_H,
              left:  goRight ? 0 : undefined,
              right: goRight ? undefined : 0,
            },
          ]}
          resizeMode="contain"
        />
      </View>
    </ImageBackground>
  );
}

/* ─── styles ─────────────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  background: { flex: 1 },
  title: {
    position: 'absolute',
    top: 40,
    alignSelf: 'center',
    fontSize: 24,
    color: '#8B4513',
    fontWeight: 'bold',
    zIndex: 10,
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },
  rabbitContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  rabbitImage: {},
  rabbitBush: {
    position: 'absolute',
    bottom: 0,
    zIndex: 3,
  },
});

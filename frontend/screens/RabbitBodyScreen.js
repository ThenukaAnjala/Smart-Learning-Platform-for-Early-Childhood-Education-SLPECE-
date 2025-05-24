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

export default function RabbitBodyScreen() {
  const { rabbitImageBase64, initialHeadSide } = useRoute().params;
  const { width: screenWidth } = Dimensions.get('window');

  // Rabbit size
  const imageWidth  = 200;
  const imageHeight = 300;

  // Direction flag
  const goRight = initialHeadSide === 'right';

  // Off-screen start and end positions
  const startX = goRight ? -imageWidth : screenWidth;
  const endX   = goRight ? screenWidth : -imageWidth;

  // Animated values
  const horizontal = useRef(new Animated.Value(startX)).current;
  const vertical   = useRef(new Animated.Value(0)).current;
  const fade       = useRef(new Animated.Value(0)).current;

  // Hop parameters
  const hops       = 4;
  const hopHeight  = 120;
  const totalDuration = 4000; // total ms for all hops
  const perHopDuration = totalDuration / hops; // e.g. 1000ms each
  const upDuration   = perHopDuration * 0.4; // 40% up
  const downDuration = perHopDuration * 0.6; // 60% down

  useEffect(() => {
    // Fade in
    Animated.timing(fade, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();

    // Compute the four intermediate X targets
    const totalDistance = endX - startX;
    const segment = totalDistance / hops;
    const targets = Array.from({ length: hops }, (_, i) => startX + segment * (i + 1));

    // Build an array of hop animations
    const hopAnimations = targets.map(targetX =>
      Animated.parallel([
        // horizontal move
        Animated.timing(horizontal, {
          toValue: targetX,
          duration: perHopDuration,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        // vertical hop up/down
        Animated.sequence([
          Animated.timing(vertical, {
            toValue: -hopHeight,
            duration: upDuration,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(vertical, {
            toValue: 0,
            duration: downDuration,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    // Sequence them and loop forever
    const runLoop = () => {
      Animated.sequence(hopAnimations).start(() => {
        // reset positions
        horizontal.setValue(startX);
        vertical.setValue(0);
        // loop
        runLoop();
      });
    };

    runLoop();
  }, [fade, horizontal, vertical, startX, endX, hops]);

  return (
    <ImageBackground
      source={require('../assets/rabbitBackground.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <Text style={styles.title}>Rabbit Full Body</Text>

      <View style={styles.container}>
        {/* Hopping rabbit */}
        <Animated.View
          style={[
            styles.rabbitContainer,
            {
              transform: [
                { translateX: horizontal },
                { translateY: vertical },
              ],
            },
          ]}
        >
          {rabbitImageBase64 && (
            <Animated.Image
              source={{ uri: `data:image/png;base64,${rabbitImageBase64}` }}
              style={[
                styles.rabbitImage,
                { width: imageWidth, height: imageHeight, opacity: fade },
              ]}
              resizeMode="contain"
            />
          )}
        </Animated.View>

        {/* Static bush at the start side */}
        <Image
          source={require('../assets/rabbitbush.png')}
          style={[
            styles.rabbitBush,
            {
              width: imageWidth,
              height: imageHeight,
              left:  goRight ? 0       : undefined,
              right: goRight ? undefined : 0,
            },
          ]}
          resizeMode="contain"
        />
      </View>
    </ImageBackground>
  );
}

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
    left: 0, // we'll animate translateX on top of this
  },
  rabbitImage: {},
  rabbitBush: {
    position: 'absolute',
    bottom: 0,
    zIndex: 3,
  },
});

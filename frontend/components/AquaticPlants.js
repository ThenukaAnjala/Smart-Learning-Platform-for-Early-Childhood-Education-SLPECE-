// frontend/components/AquaticPlants.js
import React, { useEffect, useRef, useMemo } from 'react';
import { Animated, Dimensions, StyleSheet, Easing, View, Image } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

function Plant({ left, width, height, delay, swayRange }) {
  const sway = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Loop a gentle sway: left → right → left
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(sway, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
        Animated.timing(sway, {
          toValue: -1,
          duration: 2000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
        Animated.timing(sway, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
      ])
    ).start();
  }, [sway, delay]);

  const rotate = sway.interpolate({
    inputRange: [-1, 1],
    outputRange: [`-${swayRange}deg`, `${swayRange}deg`],
  });

  return (
    <Animated.View
      style={[
        styles.plant,
        {
          left,
          width,
          height,
          transform: [
            { translateY: height / 2 },      // pivot around bottom
            { rotate },
            { translateY: -height / 2 },
          ],
        },
      ]}
    >
      <Image
        source={require('../assets/aquaticPlant.png')}
        style={{ width, height }}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

export default function AquaticPlants({ count = 6 }) {
  const plants = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      const w = 40 + Math.random() * 30;             // width 40–70px
      const h = w * 2;                               // height twice width
      const left = Math.random() * (screenWidth - w);
      const delay = Math.random() * 2000;            // staggered start
      const swayRange = 10 + Math.random() * 15;     // sway 10–25deg
      arr.push({ key: `plant-${i}`, left, width: w, height: h, delay, swayRange });
    }
    return arr;
  }, [count]);

  return (
    <View style={styles.container}>
      {plants.map((p) => (
        <Plant {...p} key={p.key} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    width: screenWidth,
    height: screenHeight * 0.4,  // plants occupy bottom 40% of screen
    overflow: 'hidden',
  },
  plant: {
    position: 'absolute',
    bottom: 0,
  },
});

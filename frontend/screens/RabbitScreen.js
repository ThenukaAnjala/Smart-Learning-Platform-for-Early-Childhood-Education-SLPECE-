// frontend/screens/RabbitScreen.js
import React, { useEffect, useRef, useMemo } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  ImageBackground,
  Image,
  View,
  Easing,
} from 'react-native';
import { useRoute } from '@react-navigation/native';

export default function RabbitScreen() {
  const route = useRoute();
  const rabbitImageBase64 = route.params?.rabbitImageBase64;
  const isHeadOnly = route.params?.isHeadOnly;

  // Define dimensions for the rabbit image.
  const imageWidth = isHeadOnly ? 150 : 200;
  const imageHeight = isHeadOnly ? 150 : 300;

  // Get screen dimensions.
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  // Calculate a random base position near the bottom.
  const basePosition = useMemo(() => {
    const containerWidth = imageWidth;
    const containerHeight = imageHeight;
    const left = Math.random() * (screenWidth - containerWidth);
    const topMin = screenHeight * 0.7;
    const topMax = screenHeight - containerHeight;
    const top = topMin + Math.random() * (topMax - topMin);
    return { left, top };
  }, [screenWidth, screenHeight, imageWidth, imageHeight]);

  // Jump animation for the rabbit drawing.
  const jumpAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    let timeoutId;
    const startJumpLoop = () => {
      // Random delay between 2000ms and 5000ms.
      const delay = Math.random() * 3000 + 2000;
      timeoutId = setTimeout(() => {
        Animated.sequence([
          Animated.timing(jumpAnim, {
            toValue: -50, // jump up by 50 pixels
            duration: 500,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(jumpAnim, {
            toValue: 0, // come back down
            duration: 500,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]).start(() => {
          startJumpLoop(); // schedule the next jump
        });
      }, delay);
    };
    if (rabbitImageBase64) {
      startJumpLoop();
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [jumpAnim, rabbitImageBase64]);

  return (
    <ImageBackground
      source={require('../assets/rabbitBackground.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <Text style={styles.title}>Rabbit's World</Text>

      {/* Container for both the rabbit drawing and the bush */}
      <View style={[styles.rabbitContainer, { left: basePosition.left, top: basePosition.top }]}>
        {/* Rabbit image is rendered first */}
        {rabbitImageBase64 && (
          <Animated.Image
            source={{ uri: `data:image/png;base64,${rabbitImageBase64}` }}
            style={[
              styles.rabbitImage,
              {
                width: imageWidth,
                height: imageHeight,
                transform: [{ translateY: jumpAnim }],
              },
            ]}
            resizeMode="contain"
          />
        )}
        {/* Rabbit bush is rendered on top */}
        <Image
          source={require('../assets/rabbitbush.png')}
          style={[styles.rabbitBush, { width: imageWidth, height: imageHeight }]}
          resizeMode="contain"
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    position: 'absolute',
    top: 40,
    alignSelf: 'center',
    fontSize: 24,
    color: '#8B4513',
    fontWeight: 'bold',
  },
  rabbitContainer: {
    position: 'absolute',
  },
  rabbitImage: {
    position: 'absolute',
  },
  rabbitBush: {
    position: 'absolute',
    // Setting a higher zIndex ensures that the bush is in front.
    zIndex: 1,
  },
});

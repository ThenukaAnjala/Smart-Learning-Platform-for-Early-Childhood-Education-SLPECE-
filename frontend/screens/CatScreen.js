// frontend/screens/CatScreen.js
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View, ImageBackground } from 'react-native';
import { useRoute } from '@react-navigation/native';

export default function CatScreen() {
  const route = useRoute();
  const { catImageBase64, initialHeadSide } = route.params;
  const imageWidth = 180;
  const imageHeight = 150;
  const flipStyle = initialHeadSide === 'left' ? { transform: [{ scaleX: -1 }] } : {};

  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <ImageBackground
    //   source={require('../assets/catBackground.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <Text style={styles.title}>Cat</Text>
      <View style={styles.container}>
        {catImageBase64 && (
          <Animated.Image
            source={{ uri: `data:image/png;base64,${catImageBase64}` }}
            style={[styles.catImage, { width: imageWidth, height: imageHeight, opacity: fadeAnim }, flipStyle]}
            resizeMode="contain"
          />
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { position: 'absolute', top: 40, fontSize: 24, fontWeight: 'bold', color: '#FFF', zIndex: 10 },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  catImage: { position: 'absolute', bottom: 0 },
});

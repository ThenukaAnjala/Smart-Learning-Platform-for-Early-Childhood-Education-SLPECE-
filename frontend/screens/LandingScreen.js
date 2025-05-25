import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useFonts } from 'expo-font';

const LandingScreen = ({ navigation }) => {
  const [fontsLoaded] = useFonts({
    'Schoolbell-Regular': require('../assets/fonts/Schoolbell-Regular.ttf'),
  });

  if (!fontsLoaded) return null; // Just render nothing until fonts are loaded

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to SLPECE</Text>
      <Text style={styles.subtitle}>
        Smart Learning Platform for Early Childhood Education
      </Text>

      <TouchableOpacity
        style={[styles.button, styles.getStarted]}
        onPress={() => navigation.navigate('Login')}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.signUp]}
        onPress={() => navigation.navigate('Signup')}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LandingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7ED', // soft warm background
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontFamily: 'Schoolbell-Regular',
    fontSize: 36,
    color: '#E94E77', // rich pink from photo
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: 'Schoolbell-Regular',
    fontSize: 20,
    color: '#4F6D7A', // steel-blue accent
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 26,
  },
  button: {
    width: '70%',
    paddingVertical: 14,
    borderRadius: 28,
    marginVertical: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  getStarted: {
    backgroundColor: '#E94E77',
  },
  signUp: {
    backgroundColor: '#4F6D7A',
  },
  buttonText: {
    fontFamily: 'Schoolbell-Regular',
    fontSize: 18,
    color: '#FFF',
  },
});
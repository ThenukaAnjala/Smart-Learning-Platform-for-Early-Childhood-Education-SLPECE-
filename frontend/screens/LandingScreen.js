// src/screens/LandingScreen.js
import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

const LandingScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to SLPECE</Text>
      <Text style={styles.subtitle}>
        Smart Learning Platform for Early Childhood Education
      </Text>
      <Button
        title="Get Started"
        onPress={() => navigation.navigate('Home')} // Navigates to the Home screen
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,    
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6200EE',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default LandingScreen;

// src/screens/HomeScreen.js
import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>This is the Home Screen</Text>
      <Button title="Open Drawing Board" onPress={() => navigation.navigate('DrawingBoard')} />

      <Text style={styles.title}>This is the Animal Discoverer Screen</Text>
      <Button title="Open Animal Discoverer" onPress={() => navigation.navigate('AnimalDetectionScreen')} />


      <Text style={styles.title}>This is the Animal Quiz Screen</Text>
      <Button title="Open Animal Quiz" onPress={() => navigation.navigate('AnimalQuizScreen')} />
    </View>

    

    




  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',   
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6200EE',
    marginBottom: 20,
  },
});

export default HomeScreen;

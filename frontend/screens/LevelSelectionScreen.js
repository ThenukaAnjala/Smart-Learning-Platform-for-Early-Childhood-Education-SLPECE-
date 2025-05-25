import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ScreenOrientation from 'expo-screen-orientation';

// Background image
const backgroundImage = require('../assets/images/Background/Animal-DiscovererBG.jpg');

const LevelSelectionScreen = ({ navigation }) => {
  const [unlockedLevels, setUnlockedLevels] = useState({ easy: true, medium: false, hard: false });

  useEffect(() => {
    // Lock screen orientation to portrait
    const lockOrientation = async () => {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    };
    lockOrientation();

    // Load unlocked levels from AsyncStorage
    const loadUnlockedLevels = async () => {
      try {
        const savedLevels = await AsyncStorage.getItem('unlockedLevels');
        if (savedLevels) {
          const parsedLevels = JSON.parse(savedLevels);
          setUnlockedLevels({
            easy: true, // Easy is always unlocked
            medium: !!parsedLevels.level2, // Check if level2 is unlocked
            hard: !!parsedLevels.level3, // Check if level3 is unlocked
          });
          console.log('Loaded unlockedLevels:', { easy: true, medium: !!parsedLevels.level2, hard: !!parsedLevels.level3 });
        }
      } catch (error) {
        console.error('Error loading unlocked levels:', error);
      }
    };
    loadUnlockedLevels();

    // Refresh levels when screen is focused
    const unsubscribe = navigation.addListener('focus', () => {
      loadUnlockedLevels();
    });

    return () => {
      unsubscribe();
      ScreenOrientation.unlockAsync();
    };
  }, [navigation]);

  const handleLevelSelect = (level) => {
    if (unlockedLevels[level]) {
      navigation.navigate('AnimalQuizScreen', { selectedLevel: level });
    } else {
      alert(`Complete the previous level with a score of 8/8 to unlock ${level}!`);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={backgroundImage} style={styles.backgroundImage} />
      <Text style={styles.title}>Choose Your Level!</Text>
      <TouchableOpacity
        style={[styles.levelButton, !unlockedLevels.easy && styles.lockedButton]}
        onPress={() => handleLevelSelect('easy')}
        disabled={!unlockedLevels.easy}
      >
        <Text style={styles.levelButtonText}>Easy (Level 1)</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.levelButton, !unlockedLevels.medium && styles.lockedButton]}
        onPress={() => handleLevelSelect('medium')}
        disabled={!unlockedLevels.medium}
      >
        <Text style={styles.levelButtonText}>Medium (Level 2)</Text>
        {!unlockedLevels.medium && <Text style={styles.lockedText}>Locked</Text>}
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.levelButton, !unlockedLevels.hard && styles.lockedButton]}
        onPress={() => handleLevelSelect('hard')}
        disabled={!unlockedLevels.hard}
      >
        <Text style={styles.levelButtonText}>Hard (Level 3)</Text>
        {!unlockedLevels.hard && <Text style={styles.lockedText}>Locked</Text>}
      </TouchableOpacity>
      <TouchableOpacity style={styles.backButton} onPress={async () => {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        navigation.navigate('Home');
      }}>
        <Text style={styles.backButtonText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  title: {
    fontSize: 40,
    color: '#333',
    fontFamily: 'Schoolbell',
    textAlign: 'center',
    marginBottom: 20,
  },
  levelButton: {
    backgroundColor: '#D2691E',
    padding: 15,
    borderRadius: 30,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  lockedButton: {
    backgroundColor: '#A9A9A9',
  },
  levelButtonText: {
    color: '#FFF',
    fontSize: 20,
    fontFamily: 'Poppins',
  },
  lockedText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Poppins',
    marginTop: 5,
  },
  backButton: {
    backgroundColor: '#D2691E',
    padding: 15,
    borderRadius: 30,
    marginTop: 20,
    width: '60%',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 20,
    fontFamily: 'Poppins',
  },
});

export default LevelSelectionScreen;
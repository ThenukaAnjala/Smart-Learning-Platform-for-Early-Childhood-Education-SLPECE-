import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, FlatList } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import * as Font from 'expo-font';
import LottieView from 'lottie-react-native';
import { AuthContext } from '../../frontend/App'; // Adjust path if needed

// Import assets
const backgroundImage = require('../assets/images/Background/Animal-DiscovererBG.jpg');
const drawingIcon = require('../assets/images/HomeScreen/drawing.png');
const animalIcon = require('../assets/images/HomeScreen/animal.png');
const quizIcon = require('../assets/images/HomeScreen/quiz.png');
const counterIcon = require('../assets/images/HomeScreen/counter.png');
const logoutIcon = require('../assets/images/HomeScreen/logout.png');
// const retryIcon = require('../assets/images/HomeScreen/retry.png'); // Uncommented retry icon
const loadingAnimation = require('../assets/Animations/HomeAnimations/HomeLoading.json');

const api = axios.create({
  baseURL: 'http://192.168.1.46:5000/api', // Replace with your backend URL
});

api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  } catch (err) {
    console.error('Error setting auth token:', err.message);
    return config;
  }
});

const HomeScreen = ({ navigation }) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [fontLoaded, setFontLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { setIsAuthenticated } = useContext(AuthContext);

  // Animation values
  const fadeAnim = useState(new Animated.Value(1))[0]; // Start at 1 to avoid opacity issues
  const buttonScaleAnims = {
    drawing: useState(new Animated.Value(1))[0],
    animal: useState(new Animated.Value(1))[0],
    quiz: useState(new Animated.Value(1))[0],
    counter: useState(new Animated.Value(1))[0],
    logout: useState(new Animated.Value(1))[0],
    retry: useState(new Animated.Value(1))[0],
  };

  const loadFontAndData = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Load font
      await Font.loadAsync({
        Schoolbell: require('../assets/fonts/Schoolbell-Regular.ttf'),
      });
      setFontLoaded(true);

      // Fetch protected data
      console.log('Attempting to fetch data from:', api.defaults.baseURL + '/protected');
      const response = await api.get('/protected', { timeout: 10000 });
      console.log('API Response:', response.data);
      if (response.data && response.data.user && response.data.user.username) {
        setData(response.data);
      } else {
        throw new Error('Invalid API response format');
      }
    } catch (err) {
      console.error('Error in loadFontAndData:', err.message);
      if (err.message.includes('Network Error')) {
        setError('Oh no! Our animal server is hiding! 🐒 Try again?');
      } else if (err.response?.status === 401) {
        console.log('Unauthorized, clearing token');
        await SecureStore.deleteItemAsync('jwt_token');
        setIsAuthenticated(false);
        setError('Oops! Please log in again! 🦒');
      } else {
        setError('Something went wrong! Try again, little explorer! 🐾');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Start pulsing animations for buttons
    const startPulsing = (animValue) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    Object.values(buttonScaleAnims).forEach(startPulsing);
    loadFontAndData();
  }, [setIsAuthenticated]);

  const handleLogout = async () => {
    try {
      await SecureStore.deleteItemAsync('jwt_token');
      setIsAuthenticated(false);
    } catch (err) {
      console.error('Logout error:', err.message);
      setError('Uh-oh! Trouble logging out. Try again! 🐾');
    }
  };

  const handleRetry = () => {
    loadFontAndData();
  };

  const handleButtonPress = (animValue, callback) => {
    Animated.sequence([
      Animated.spring(animValue, {
        toValue: 0.9,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.spring(animValue, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start(() => callback());
  };

  if (!fontLoaded || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LottieView
          source={loadingAnimation}
          autoPlay
          loop
          style={styles.loadingAnimation}
          onError={(e) => console.error('Loading animation error:', e)}
        />
        <Text style={styles.loadingText}>Getting ready for fun... 🦁</Text>
      </View>
    );
  }

  const buttons = [
    {
      title: 'Draw Animals! ✍️',
      icon: drawingIcon,
      onPress: () => navigation.navigate('DrawingBoard'),
      scale: buttonScaleAnims.drawing,
      color: '#F4A261',
    },
    {
      title: 'Find Animals! 📸',
      icon: animalIcon,
      onPress: () => navigation.navigate('AnimalDetectionScreen'),
      scale: buttonScaleAnims.animal,
      color: '#66BB6A',
    },
    {
      title: 'Animal Quiz! 🧠',
      icon: quizIcon,
      onPress: () => navigation.navigate('LevelSelectionScreen'),
      scale: buttonScaleAnims.quiz,
      color: '#42A5F5',
    },
    {
      title: 'Count Animals! 🐾',
      icon: counterIcon,
      onPress: () => navigation.navigate('SmartCounter'),
      scale: buttonScaleAnims.counter,
      color: '#AB47BC',
    },
    {
      title: 'Bye Bye! 👋',
      icon: logoutIcon,
      onPress: handleLogout,
      scale: buttonScaleAnims.logout,
      color: '#FF6F61',
    },
  ];

  return (
    <View style={styles.container}>
      {/* Background image with fallback */}
      <Image
        source={backgroundImage}
        style={styles.backgroundImage}
        onError={(e) => {
          console.error('Background image load error:', e.nativeEvent.error);
          setError('Oops! Background image is shy! 🦒 Try again later.');
        }}
      />

      <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
        {/* Welcome message with decorative container */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>
            {data && data.user && data.user.username
              ? `Hi, ${data.user.username}! 🐘 Let’s Play!`
              : 'Welcome to Animal Adventures! 🦒'}
          </Text>
        </View>

        {/* Error message with retry button
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.error}>{error}</Text>
            <Animated.View style={{ transform: [{ scale: buttonScaleAnims.retry }] }}>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => handleButtonPress(buttonScaleAnims.retry, handleRetry)}
                activeOpacity={0.7}
              >
                <Image
                  source={retryIcon}
                  style={styles.buttonIcon}
                  onError={(e) => console.error('Retry icon load error:', e.nativeEvent.error)}
                />
                <Text style={styles.buttonText}>Try Again! 🔄</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        ) : null} */}

        {/* Button grid */}
        <FlatList
          data={buttons}
          renderItem={({ item }) => (
            <Animated.View style={{ transform: [{ scale: item.scale }] }}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: item.color }]}
                onPress={() => handleButtonPress(item.scale, item.onPress)}
                activeOpacity={0.7}
              >
                <Image
                  source={item.icon}
                  style={styles.buttonIcon}
                  onError={(e) => console.error(`${item.title} icon load error:`, e.nativeEvent.error)}
                />
                <Text style={styles.buttonText}>{item.title}</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
          keyExtractor={(item) => item.title}
          numColumns={2}
          contentContainerStyle={styles.buttonContainer}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#A3D8A1', // Fallback background color
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: 'cover',
    zIndex: -1,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.2)', // Semi-transparent overlay for readability
  },
  titleContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFD54F',
  },
  title: {
    fontSize: 32,
    fontFamily: 'Schoolbell',
    color: '#FF6F61',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  errorContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  error: {
    fontSize: 20,
    fontFamily: 'Schoolbell',
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 10,
    borderRadius: 10,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 200,
    height: 60,
    borderRadius: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: '#388E3C',
  },
  buttonContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 160,
    height: 100,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    margin: 10,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  buttonIcon: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
    marginRight: 5,
  },
  buttonText: {
    fontSize: 20,
    fontFamily: 'Schoolbell',
    color: '#FFF',
    textAlign: 'center',
    flexShrink: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#A3D8A1',
  },
  loadingAnimation: {
    width: 150,
    height: 150,
  },
  loadingText: {
    fontSize: 24,
    fontFamily: 'Schoolbell',
    color: '#FFF',
    marginTop: 10,
  },
});

export default HomeScreen;
import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import AppNavigator from './navigation/AppNavigator';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import { Text } from 'react-native';

// Create AuthContext
export const AuthContext = createContext();

export default function App() {
  // Font loading
  const [fontsLoaded] = useFonts({
    'LoveYaLikeASister': require('./assets/fnts/LoveYaLikeASister-Regular.ttf'),
  });

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing token on app start
  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await SecureStore.getItemAsync('jwt_token');
        if (token) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error checking token:', error);
      } finally {
        setIsLoading(false);
      }
    };
    checkToken();
  }, []);

  if (!fontsLoaded) {
    return <Text>Loading...</Text>;
  }

  if (isLoading) {
    return null; // Loading screen while checking authentication
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AppNavigator />
      </GestureHandlerRootView>
    </AuthContext.Provider>
  );
}
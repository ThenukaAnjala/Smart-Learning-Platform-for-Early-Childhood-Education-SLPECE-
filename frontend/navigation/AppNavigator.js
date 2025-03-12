import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from '../screens/HomeScreen';
import LandingScreen from '../screens/LandingScreen';
import DrawingBoard from '../screens/DrawingBoard';
import AnimalDetectionScreen from '../screens/AnimalDetectionScreen'
import AnimalDetailsScreen from '../screens/AnimalDetailsScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Landing" component={LandingScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="DrawingBoard" component={DrawingBoard} />
        <Stack.Screen name="AnimalDetectionScreen" component={AnimalDetectionScreen} />
        <Stack.Screen name="AnimalDetailsScreen" component={AnimalDetailsScreen} options={{ title: 'Animal Fun Facts' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

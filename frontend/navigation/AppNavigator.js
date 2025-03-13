// frontend/navigation/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import DrawingBoard from '../screens/DrawingBoard';
import FishScreen from '../screens/FishScreen';
import RabbitScreen from '../screens/RabbitScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="DrawingBoard" component={DrawingBoard} />
        <Stack.Screen name="FishScreen" component={FishScreen} />
        <Stack.Screen name="RabbitScreen" component={RabbitScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

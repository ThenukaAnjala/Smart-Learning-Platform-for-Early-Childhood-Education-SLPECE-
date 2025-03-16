// frontend/navigation/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import DrawingBoard from '../screens/DrawingBoard';
import FishScreen from '../screens/FishScreen';
import RabbitScreen from '../screens/RabbitScreen';
import RabbitBodyScreen from '../screens/RabbitBodyScreen';
import DogHeadScreen from '../screens/DogHeadScreen';
import DogScreen from '../screens/DogScreen';
import LionScreen from '../screens/LionScreen';
import BirdScreen from '../screens/BirdScreen';
const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="DrawingBoard" component={DrawingBoard} />
        <Stack.Screen name="FishScreen" component={FishScreen} />
        <Stack.Screen name="RabbitBodyScreen" component={RabbitBodyScreen} />
        <Stack.Screen name="RabbitScreen" component={RabbitScreen} />
        <Stack.Screen name="DogHeadScreen" component={DogHeadScreen} />
        <Stack.Screen name="BirdScreen" component={BirdScreen} />
        <Stack.Screen name="LionScreen" component={LionScreen} />
        <Stack.Screen name="DogScreen" component={DogScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

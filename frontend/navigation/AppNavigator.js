import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from '../screens/HomeScreen';
import LandingScreen from '../screens/LandingScreen';
import DrawingBoard from '../screens/DrawingBoard';
import SmartCounter from '../screens/SmartCounter';
import StackingElements from '../screens/CountingSkills/Stacking Elements';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Landing" component={LandingScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="DrawingBoard" component={DrawingBoard} />
        <Stack.Screen name="SmartCounter" component={SmartCounter} />
        <Stack.Screen name="Stacking Elements" component={StackingElements} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

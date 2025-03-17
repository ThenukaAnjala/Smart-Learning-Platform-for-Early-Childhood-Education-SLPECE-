import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from '../screens/HomeScreen';
import LandingScreen from '../screens/LandingScreen';
import DrawingBoard from '../screens/DrawingBoard';
import SmartCounter from '../screens/SmartCounter';
import StackingElements from '../screens/CountingSkills/Stacking Elements';
import ReverseCounting from '../screens/CountingSkills/Reverse Counting';
import MidrangeCounting from '../screens/CountingSkills/Mid-Range Counting';
import OrderIrrelevance from '../screens/CountingSkills/Order Irrelevance Principle';
import SingleRowElements from '../screens/CountingSkills/Stable Order Principle';

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
        <Stack.Screen name="Reverse Counting" component={ReverseCounting} />
        <Stack.Screen name="Mid-Range Counting" component={MidrangeCounting} />
        <Stack.Screen name="Order Irrelevance Principle" component={OrderIrrelevance} />
       <Stack.Screen name="Stable Order Principle" component={SingleRowElements} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

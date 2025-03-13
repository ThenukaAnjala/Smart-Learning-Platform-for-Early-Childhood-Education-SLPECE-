import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from '../screens/HomeScreen';
import LandingScreen from '../screens/LandingScreen';
import DrawingBoard from '../screens/DrawingBoard';
// import ImageGenerator from '../screens/storyTellingComponent/ImageGenerator';
import TextToSpeech from '../screens/storyTellingComponent/TextToSpeech';
import StoryTellingHome from '../screens/storyTellingComponent/storyTellingHome';
import StoryAbout from '../screens/storyTellingComponent/storyAbout';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Landing" component={LandingScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="DrawingBoard" component={DrawingBoard} />
        {/* <Stack.Screen name="ImageGenerator" component={ImageGenerator} /> */}
        <Stack.Screen name="TextToSpeech" component={TextToSpeech} />
        <Stack.Screen name="StoryTellingHome" component={StoryTellingHome} />
        <Stack.Screen name="StoryAbout" component={StoryAbout} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from '../screens/HomeScreen';
import LandingScreen from '../screens/LandingScreen';
import DrawingBoard from '../screens/DrawingBoard';
import TextToSpeech from '../screens/storyTellingComponent/TextToSpeech';
import StoryHome from '../screens/storyTellingComponent/storyTellingHome';
import StoryAbout from '../screens/storyTellingComponent/storyAbout';
import GenerateStory from '../screens/storyTellingComponent/GenerateStory';
import SingleStory from '../screens/storyTellingComponent/singleStory'; // Ensure the case matches the file name
import StoryQuiz from '../screens/storyTellingComponent/storyQuiz';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Landing" component={LandingScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="DrawingBoard" component={DrawingBoard} />
        <Stack.Screen name="TextToSpeech" component={TextToSpeech} />
        <Stack.Screen name="StoryTellingHome" component={StoryHome} />
        <Stack.Screen name="StoryAbout" component={StoryAbout} />
        <Stack.Screen name="GenerateStory" component={GenerateStory} />
        <Stack.Screen name="SingleStory" component={SingleStory} />
        <Stack.Screen name="StoryQuiz" component={StoryQuiz} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
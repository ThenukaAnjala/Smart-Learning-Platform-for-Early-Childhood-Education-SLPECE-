// frontend/navigation/AppNavigator.js
import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import DrawingBoard from '../screens/DrawingBoard';
import TextToSpeech from '../screens/storyTellingComponent/TextToSpeech';
import StoryHome from '../screens/storyTellingComponent/storyTellingHome';
import StoryAbout from '../screens/storyTellingComponent/storyAbout';
import GenerateStory from '../screens/storyTellingComponent/GenerateStory';
import SingleStory from '../screens/storyTellingComponent/singleStory'; // Ensure the case matches the file name
import StoryQuiz from '../screens/storyTellingComponent/storyQuiz';
import FishScreen from '../screens/FishScreen';
import RabbitScreen from '../screens/RabbitScreen';
import RabbitBodyScreen from '../screens/RabbitBodyScreen';
import DogHeadScreen from '../screens/DogHeadScreen';
import DogScreen from '../screens/DogScreen';
import LionScreen from '../screens/LionScreen';
import BirdScreen from '../screens/BirdScreen';import SmartCounter from '../screens/SmartCounter';
import StackingObjects from '../screens/CountingSkills/Stacking Objects';
import ReverseCounting from '../screens/CountingSkills/Reverse Counting';
import MidrangeCounting from '../screens/CountingSkills/Mid-Range Counting';
import OrderIrrelevance from '../screens/CountingSkills/Order Irrelevance Principle';
import SingleRowElements from '../screens/CountingSkills/Stable Order Principle';
import AnimalDetectionScreen from '../screens/AnimalDetectionScreen'
import AnimalDetailsScreen from '../screens/AnimalDetailsScreen';
import AnimalQuizScreen from '../screens/AnimalQuizScreen';
import LevelSelectionScreen from '../screens/LevelSelectionScreen'
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen'; // Add SignupScreen
import { AuthContext } from '../App';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="DrawingBoard" component={DrawingBoard} />
        <Stack.Screen name="TextToSpeech" component={TextToSpeech} />
        <Stack.Screen name="StoryTellingHome" component={StoryHome} />
        <Stack.Screen name="StoryAbout" component={StoryAbout} />
        <Stack.Screen name="GenerateStory" component={GenerateStory} />
        <Stack.Screen name="SingleStory" component={SingleStory} />
        <Stack.Screen name="StoryQuiz" component={StoryQuiz} />
            <Stack.Screen name="FishScreen" component={FishScreen} />
        <Stack.Screen name="RabbitBodyScreen" component={RabbitBodyScreen} />
        <Stack.Screen name="RabbitScreen" component={RabbitScreen} />
        <Stack.Screen name="DogHeadScreen" component={DogHeadScreen} />
        <Stack.Screen name="BirdScreen" component={BirdScreen} />
        <Stack.Screen name="LionScreen" component={LionScreen} />
        <Stack.Screen name="DogScreen" component={DogScreen} />
        <Stack.Screen name="SmartCounter" component={SmartCounter} />
        <Stack.Screen name="Stacking Objects" component={StackingObjects} />
        <Stack.Screen name="Reverse Counting" component={ReverseCounting} />
        <Stack.Screen name="Mid-Range Counting" component={MidrangeCounting} />
        <Stack.Screen name="Order Irrelevance Principle" component={OrderIrrelevance} />
       <Stack.Screen name="Stable Order Principle" component={SingleRowElements} />
        <Stack.Screen name="AnimalQuizScreen" component={AnimalQuizScreen} />
        <Stack.Screen name="LevelSelectionScreen" component={LevelSelectionScreen} />
        <Stack.Screen name="AnimalDetectionScreen" component={AnimalDetectionScreen} />
        <Stack.Screen name="AnimalDetailsScreen" component={AnimalDetailsScreen} options={{ title: 'Animal Fun Facts' }}
        
        
        

        />
          </>
        ) : (
          <>
            <Stack.Screen name="Landing" component={LandingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;
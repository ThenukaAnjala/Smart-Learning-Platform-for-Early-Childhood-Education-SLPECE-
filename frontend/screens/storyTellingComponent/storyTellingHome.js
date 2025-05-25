import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, ImageBackground } from "react-native";
import { useIsFocused, useNavigationState } from '@react-navigation/native';
import CreateStorySection from "./CreateStorySection";
import StoryLibrary from "./StoryLibrary";
import GenerateStory from "./GenerateStory";
import * as ScreenOrientation from 'expo-screen-orientation';

const StoryHome = ({ navigation }) => {
  const [showGenerateStory, setShowGenerateStory] = useState(false);
  const [stories, setStories] = useState([]);
  const isFocused = useIsFocused();

 const handleStoryCreation = (newStory) => {
    setStories((prevStories) => [...prevStories, newStory]);
    setShowGenerateStory(false);
  };

  
  useEffect(() => {
    const setOrientation = async () => {
      if (isFocused) {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
      }
    };

    setOrientation();

    return () => {
      // Set back to landscape when leaving this screen
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    };
  }, [isFocused]);

  return (
    <ImageBackground
  source={require("../../assets/storyAnimation/StoryHomeBGimage.jpg")}
  style={styles.background}
  resizeMode="cover"
>
    <View style={styles.mainContainer}>
      <View style={styles.portraitContainer}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {!showGenerateStory && (
            <CreateStorySection onCreateStory={() => setShowGenerateStory(true)} />
          )}
          {showGenerateStory && (
            <GenerateStory
              onStoryGenerated={handleStoryCreation}
              onCancel={() => setShowGenerateStory(false)}
            />
          )}
          {!showGenerateStory && <StoryLibrary stories={stories} />}
        </ScrollView>
      </View>
    </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#fffff",
    paddingTop: 20,
  },
  portraitContainer: {
    flex: 1,
    
    borderRadius: 0,
    margin: 5,
    shadowColor: "#000",
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
   
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 0,
    paddingTop: 40,
  },
  background: {
// paddingTop: 100,
  flex: 1,
  width: '100%',
  height: '100%',
},
overlay: {
  flex: 1,
  backgroundColor: 'rgba(255,255,255,0.0)', // transparent, or adjust for overlay effect
},
});

export default StoryHome;
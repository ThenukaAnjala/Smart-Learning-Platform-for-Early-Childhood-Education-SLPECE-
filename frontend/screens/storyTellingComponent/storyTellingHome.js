import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, ImageBackground, TouchableOpacity, Text } from "react-native";
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
      {/* Back Button */}
      <TouchableOpacity
        style={styles.childBackButton}
        onPress={async () => {
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
          navigation.navigate('Home');
        }}
        activeOpacity={0.85}
      >
        <Text style={styles.childBackButtonIcon}>⬅️</Text>
        <Text style={styles.childBackButtonLabel}>Back</Text>
      </TouchableOpacity>
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
childBackButton: {
  position: 'absolute',
  top: 40,
  left: 20,
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#ffe082', // Soft yellow
  borderRadius: 18, // smaller
  paddingVertical: 6, // smaller
  paddingHorizontal: 14, // smaller
  zIndex: 100,
  shadowColor: '#fbc02d',
  shadowOffset: { width: 0, height: 2 }, // smaller
  shadowOpacity: 0.22,
  shadowRadius: 4, // smaller
  elevation: 6,
  borderWidth: 2,
  borderColor: '#ffd54f',
},
childBackButtonIcon: {
  fontSize: 24, // smaller
  marginRight: 7, // smaller
  color: '#f57c00',
  textShadowColor: '#fffde7',
  textShadowOffset: { width: 1, height: 1 },
  textShadowRadius: 2,
},
childBackButtonLabel: {
  fontSize: 18, // smaller
  color: '#f57c00',
  fontWeight: 'bold',
  letterSpacing: 1,
  textShadowColor: '#fffde7',
  textShadowOffset: { width: 1, height: 1 },
  textShadowRadius: 2,
},
});

export default StoryHome;
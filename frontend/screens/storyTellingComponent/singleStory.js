import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  FlatList,
  Button,
} from "react-native";
import * as ScreenOrientation from "expo-screen-orientation";
import * as Speech from "expo-speech";
import { Audio } from "expo-av";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { api4010 } from "../storyTellingComponent/axiosInstance";
import { useFonts } from "expo-font";

const SingleStory = ({ route }) => {
  const [screenWidth, setScreenWidth] = useState(
    Dimensions.get("window").width
  );
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { storyId } = route?.params;
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sound, setSound] = useState(null);
  const soundRef = useRef(null); // <-- Add this line

  const [fontStyle, setFontStyle] = useState("LoveYaLikeASister"); // Default font style

  const [fontsLoaded] = useFonts({
    LoveYaLikeASister: require("../../assets/fnts/LoveYaLikeASister-Regular.ttf"),
  });

  // Listen for screen width changes
  useEffect(() => {
    const onChange = ({ window }) => setScreenWidth(window.width);
    const subscription = Dimensions.addEventListener("change", onChange);
    return () => subscription.remove();
  }, []);

  // Orientation lock: always lock to portrait when focused
  useEffect(() => {
    const setupOrientation = async () => {
      if (isFocused) {
        await ScreenOrientation.unlockAsync();
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.PORTRAIT
        );
      }
    };
    setupOrientation();
    // No cleanup: let the next screen handle its own orientation
  }, [isFocused]);

  // Update soundRef whenever sound changes
useEffect(() => {
  soundRef.current = sound;
}, [sound]);

  // Clean up function to stop all audio
  const stopAllAudio = async () => {
  console.log("Cleaning up audio!");
  Speech.stop();
  if (soundRef.current) { // <-- Use ref here
    await soundRef.current.stopAsync();
    await soundRef.current.unloadAsync();
    setSound(null);
  }
};

  // Fetch story data
useEffect(() => {
  const fetchStory = async () => {
    try {
      const response = await api4010.get(
        `/story-liabrary/stories/${storyId}`
      );
      setStory(response.data);
    } catch (error) {
      console.error("Error fetching story:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchStory();

  // No navigation listeners here!
}, [storyId]);

  useEffect(() => {
    // Cleanup when navigating away (back, tab change, etc.)
    const unsubscribeBlur = navigation.addListener("blur", () => {
      // Your cleanup code here
      stopAllAudio();
    });

    // Cleanup before removing the screen (back gesture, etc.)
    const unsubscribeBeforeRemove = navigation.addListener(
      "beforeRemove",
      () => {
        // Your cleanup code here
        stopAllAudio();
      }
    );

    return () => {
      unsubscribeBlur();
      unsubscribeBeforeRemove();
    };
  }, [navigation]);

  // Handle initial story audio
  useEffect(() => {
    if (story && story.storySection && story.storySection.length > 0) {
      const timer = setTimeout(() => {
        Speech.speak(story.storySection[0].storyText);
      }, 500);

      if (story.backgroundMusicURL) {
        playMusic(story.backgroundMusicURL);
      }
      return () => clearTimeout(timer);
    }
  }, [story]);

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const item = viewableItems[0].item;
      Speech.stop();
      Speech.speak(item.storyText);
    }
  });

  const convertS3UrlToPresigned = async (s3Uri) => {
    try {
      if (s3Uri.includes("X-Amz-Algorithm")) {
        return s3Uri;
      }
      const response = await api4010.get(`/s3/get-presigned-url`, {
        params: { s3Uri },
      });
      return response.data.url;
    } catch (error) {
      console.error("Error converting S3 URL:", error);
      throw error;
    }
  };

  const playMusic = async (url) => {
    try {
      const presignedUrl = await convertS3UrlToPresigned(url);

      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: presignedUrl },
        { shouldPlay: true, isLooping: true }
      );
      await newSound.setVolumeAsync(0.2);
      setSound(newSound);
    } catch (error) {
      console.error("Playback Error:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles({ screenWidth }).container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!story) {
    return (
      <View style={styles({ screenWidth }).container}>
        <Text>Story not found.</Text>
      </View>
    );
  }

  const renderItem = ({ item, index }) => {
    if (index === story.storySection.length) {
      return (
        <View style={styles({ screenWidth }).lastpage}>
          <Text style={styles({ screenWidth }).text}>End of Story</Text>
          <Button
            title="Start the Quiz"
            onPress={() => {
              Speech.stop(); // Stop TTS before navigating
              navigation.navigate("StoryQuiz", { storyId });
            }}
          />
        </View>
      );
    }

    const fontSize =
      typeof story.storyTextSize === "string"
        ? parseInt(story.storyTextSize.replace("px", ""), 10)
        : story.storyTextSize;
    const fontColor = story.storyTextColor;
    const fontfam = story.storyTextStyle;
    //storyTextStyle

    return (
      <View style={styles({ screenWidth }).page}>
        <Image
          style={styles({ screenWidth }).image}
          source={{ uri: item.storyImage }}
        />
        <Text
          style={[
            styles({ screenWidth }).textsegments,
            {
              fontSize: fontSize,
              color: fontColor,
              fontFamily: fontStyle,
              lineHeight: fontSize * 1.5,
            },
          ]}
        >
          {item.storyText}
        </Text>
      </View>
    );
  };

  if (fontsLoaded) {
    return (
      <View style={styles({ screenWidth }).container}>
        <FlatList
          data={[...story.storySection, { end: true }]}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          snapToInterval={screenWidth}
          decelerationRate="fast"
          onViewableItemsChanged={viewableItemsChanged.current}
          viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          getItemLayout={(_, index) => ({
            length: screenWidth,
            offset: screenWidth * index,
            index,
          })}
        />
      </View>
    );
  }
};

// Move styles into a function to use screenWidth
const styles = ({ screenWidth }) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#f5f7fa",
    },
    title: {
      fontSize: 32,
      fontWeight: "bold",
      color: "#333",
      textAlign: "center",
      marginVertical: 10,
      backgroundColor: "red",
    },
    lastpage: {
      flex: 1,
      width: screenWidth,
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
      borderColor: "#ccc",
      borderWidth: 1,
    },
    page: {
      flex: 1,
      width: screenWidth,
      height: "100%",
      alignItems: "center",
      borderColor: "#ccc",
      borderWidth: 1,
    },
    image: {
      width: "100%",
      height: "42%",
      borderRadius: 1,
      marginBottom: 60,
      marginTop: 100,
      resizeMode: "contain",
    },
    textsegments: {
      textAlign: "center",
    },
    text: {
      fontSize: 28,
      marginBottom: 20,
      // fontFamily: "LoveYaLikeASister"
    },
  });

export default SingleStory;

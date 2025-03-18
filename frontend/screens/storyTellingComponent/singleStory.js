import React, { useState, useEffect, useRef} from "react";
import { View, Text, Image, StyleSheet, Dimensions, FlatList,Button } from "react-native";
import axios from "axios";
import * as ScreenOrientation from "expo-screen-orientation";
import * as Speech from "expo-speech";
import { Audio } from "expo-av";
import { useFocusEffect, useNavigation } from '@react-navigation/native'; 


const { width, height } = Dimensions.get("window");

const SingleStory = ({ route }) => {
  const navigation = useNavigation();
  const { storyId } = route?.params;
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sound, setSound] = useState(null);
  const viewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const item = viewableItems[0].item;
      Speech.stop(); // Stop any ongoing speech
      Speech.speak(item.storyText); // Speak the text of the currently visible item
    }
  });
  const [isReady, setIsReady] = useState(false);

   // Clean up function to stop all audio
   const stopAllAudio = async () => {
    Speech.stop();
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
    }
  };

  // Handle screen focus and blur events
  useFocusEffect(
    React.useCallback(() => {
      // Component is focused (on screen)
      
      // Clean up when screen loses focus
      return () => {
        stopAllAudio();
      };
    }, [sound])
  );

  useEffect(() => {
    // Lock the screen orientation to landscape
    // ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      stopAllAudio();
    });

    const fetchStory = async () => {
      try {
        const response = await axios.get(`http://192.168.8.144:4010/story-liabrary/stories/${storyId}`);
        setStory(response.data);
      } catch (error) {
        console.error("Error fetching story:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStory();

    // Unlock the screen orientation when the component unmounts
    return () => {
      stopAllAudio();
      unsubscribe();
    };
  }, [storyId, navigation]);

  useEffect(() => {
    if (story && story.storySection && story.storySection.length > 0) {
      // Speak the first story section when the story is loaded
      const timer = setTimeout(() => {
        Speech.speak(story.storySection[0].storyText);
      }, 500);

      if (story.backgroundMusicURL) {
        playMusic(story.backgroundMusicURL);
      }
      return () => clearTimeout(timer);
    }
    
  }, [story]);

  console.log(story);

  const convertS3UrlToPresigned = async (s3Uri, baseURL = "http://192.168.8.144:4010") => {
    try {
      // Check if the s3Uri already contains a presigned URL
      if (s3Uri.includes("X-Amz-Algorithm")) {
        console.log("URL already presigned, returning as is");
        return s3Uri;
      }

      const response = await axios.get(`${baseURL}/s3/get-presigned-url`, {
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
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!story) {
    return (
      <View style={styles.container}>
        <Text>Story not found.</Text>
      </View>
    );
  }

  const renderItem = ({ item, index }) => {
    if (index === story.storySection.length) {
      return (
        <View style={styles.page}>
          <Text style={styles.text}>End of Story</Text>
          <Button title="Start the Quiz" onPress={() => navigation.navigate('StoryQuiz', { storyId })} />
        </View>
      );
    }
    // Remove 'px' suffix if present
    const fontSize = typeof story.storyTextSize === 'string' ? parseInt(story.storyTextSize.replace('px', ''), 10) : story.storyTextSize;
    const fontColor = story.storyTextColor;

    
    return (
      <View style={styles.page}>
        <Image style={styles.image} source={{ uri: item.storyImage }} />
        <Text style={[styles.text, { fontSize: fontSize, color: fontColor }]}>{item.storyText}</Text>
      </View>
    );
  };

  

  return (
    <View style={styles.container}>
      {/* <Text style={styles.title}>{story.storyName}</Text> */}
      <FlatList
         data={[...story.storySection, {}]}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        horizontal
        pagingEnabled
        onViewableItemsChanged={viewableItemsChanged.current}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        onLayout={() => {
          setIsReady(true);
        }}
      />
    </View>
  );
  
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginVertical: 20,
  },
  page: {
    width: width,
    height: height,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 500,
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  text: {
    textAlign: "center",
  },
});

export default SingleStory;
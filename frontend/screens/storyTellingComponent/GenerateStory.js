import React, { useState, useEffect } from "react";

import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  Image,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import axios from "axios";
import * as Speech from "expo-speech"; // For text-to-speech
import { Picker } from "@react-native-picker/picker"; // Correct Picker import
import { Audio } from "expo-av"; // Import for playing audio
import { useNavigation } from '@react-navigation/native';

const GenerateStory = () => {
  const navigation = useNavigation();

  const [storyPrompt, setStoryPrompt] = useState(""); // User input for story
  const [storyParts, setStoryParts] = useState([]); // Segmented story parts
  const [loading, setLoading] = useState(false); // Loader
  const [availableVoices, setAvailableVoices] = useState([]); // List of available voices
  const [selectedVoice, setSelectedVoice] = useState(null); // Selected voice
  const [fontStyle, setFontStyle] = useState("Poppins"); // Default font style
  const [fontColor, setFontColor] = useState("#000000"); // Default text color
  const [fontSize, setFontSize] = useState(16); // Default font size
  const [musicURLs, setMusicURLs] = useState([]); // Music URLs
  const [sound, setSound] = useState(null); // Sound object for playing music

  const [storyName, setStoryName] = useState("");
  const [storyDescription, setStoryDescription] = useState("");
  const [saving, setSaving] = useState(false);

  // Font styles for selection
  const fontStyles = [
    { label: "Poppins", value: "Poppins" },
    { label: "Baloo Bhai 2", value: "BalooBhai2" },
    { label: "Bangers", value: "Bangers" },
    { label: "Fredoka One", value: "FredokaOne" },
    { label: "Roboto", value: "Roboto" },
    { label: "Lobster", value: "Lobster" },
    { label: "Pacifico", value: "Pacifico" },
    { label: "Caveat", value: "Caveat" },
    { label: "Shadows Into Light", value: "ShadowsIntoLight" },
    { label: "Comic Sans MS", value: "ComicSansMS" },
  ];

  // Color palette for text
  const colors = [
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
    "#000000",
    "#808080",
    "#800000",
    "#FFA500",
    "#008000",
    "#4B0082",
    "#FFC0CB",
    "#A52A2A",
    "#D2691E",
    "#008B8B",
    "#DA70D6",
    "#4682B4",
  ];

  // Font sizes for dropdown
  const fontSizes = [12, 14, 16, 18, 20, 22, 24, 26];

  // Corrected implementation
  useEffect(() => {
    let isMounted = true;
    let retryTimeout;

    const fetchVoices = async () => {
      try {
        const voices = await Speech.getAvailableVoicesAsync();

        if (!isMounted) return;

        if (voices.length > 0) {
          setAvailableVoices(voices);
          setSelectedVoice(voices[0].identifier);
        } else {
          // Retry after 1 second if no voices found
          retryTimeout = setTimeout(fetchVoices, 1000);
        }
      } catch (error) {
        console.error("Error fetching voices:", error);
      }
    };

    // Initial fetch with slight delay
    const initialDelay = setTimeout(fetchVoices, 500);

    return () => {
      isMounted = false;
      clearTimeout(initialDelay);
      clearTimeout(retryTimeout);
    };
  }, []);

  // Add this utility function at the top of your component
  const convertS3UrlToPresigned = async (
    s3Uri,
    baseURL = "http://192.168.8.144:4010"
  ) => {
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

  // Function to fetch music URLs based on story parameters
  const fetchMusicURLs = async (
    musicmood,
    musicCategory,
    subCategory,
    baseURL = "http://192.168.8.144:4010"
  ) => {
    try {
      // Step 1: Get S3 URIs from MongoDB
      const response = await axios.get(`${baseURL}/story-music/search`, {
        params: { musicmood, musicCategory, subCategory },
        timeout: 10000, // 10 seconds timeout
      });

      if (!response.data?.urls || !Array.isArray(response.data.urls)) {
        throw new Error("Invalid response format from music search endpoint");
      }

      // Step 2: Convert S3 URIs to presigned URLs - but only if they're not already presigned
      const presignedUrls = [];
      for (const s3Uri of response.data.urls) {
        try {
          // Debug log
          console.log("Processing S3 URI:", s3Uri);

          // Skip URLs that are already presigned
          if (s3Uri.includes("X-Amz-Algorithm")) {
            presignedUrls.push(s3Uri);
            continue;
          }

          const presignedUrl = await convertS3UrlToPresigned(s3Uri, baseURL);
          presignedUrls.push(presignedUrl);
        } catch (error) {
          console.error(`Failed to convert S3 URI: ${s3Uri}`, error);
        }
      }

      if (presignedUrls.length === 0) {
        throw new Error("No valid music URLs could be generated");
      }

      return {
        success: true,
        urls: presignedUrls,
        originalCount: response.data.urls.length,
        convertedCount: presignedUrls.length,
      };
    } catch (error) {
      console.error("Music URL fetch error:", error);

      const errorData = {
        message: "Failed to fetch music URLs",
        details: error.message,
        timestamp: new Date().toISOString(),
      };

      if (error.response) {
        errorData.status = error.response.status;
        errorData.serverMessage =
          error.response.data?.message || "No server message";
        console.error(
          "Server error:",
          error.response.status,
          error.response.data
        );
      } else if (error.request) {
        errorData.type = "network-error";
        console.error("Network error:", error.request);
      }

      throw errorData;
    }
  };

  // Generate story from the server
  const generateStory = async () => {
    setLoading(true);
    try {
      console.log("Sending request...");

      const response = await axios.post(
        "http://192.168.8.144:5000/story/generate-story",
        { story_prompt: storyPrompt },
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("Response received:", response.data);
      setStoryParts(response.data.segments);

      // And update the handleMusic function inside generateStory:
      const handleMusic = async (
        mood,
        category,
        subcategory,
        isDefault = false
      ) => {
        try {
          const musicResponse = await fetchMusicURLs(
            mood,
            category,
            subcategory
          );
          console.log("Music response:", musicResponse);

          if (musicResponse.urls && musicResponse.urls.length > 0) {
            setMusicURLs(musicResponse.urls);

            // Log the URL we're about to play
            console.log("About to play music URL:", musicResponse.urls[0]);

            // Play the first URL
            playMusic(musicResponse.urls[0]);

            if (isDefault) {
              console.log("Using default background music");
            }
          } else {
            Alert.alert(
              "No Music Available",
              isDefault
                ? "Could not load default background music"
                : "No suitable music found for this story"
            );
          }
        } catch (musicError) {
          console.error("Music error:", musicError);
          Alert.alert(
            "Music Error",
            isDefault
              ? "Failed to load default background music"
              : "Failed to load story-specific music"
          );
        }
      };

      // Try to get music based on story metadata
      if (
        response.data.mood &&
        response.data.category &&
        response.data.subcategory
      ) {
        await handleMusic(
          response.data.mood,
          response.data.category,
          response.data.subcategory
        );
      } else {
        // Fallback to default parameters
        await handleMusic("happy", "Fairy Tale", "Dragon's Lair", true);
      }
    } catch (error) {
      console.error("Error:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to generate story"
      );
    } finally {
      setLoading(false);
    }
  };

  // Function to play music
  const playMusic = async (url) => {
    try {
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      console.log("Attempting to play from URL:", url);

      const { sound: newSound } = await Audio.Sound.createAsync(
        {
          uri: url,
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        },
        {
          shouldPlay: true,
          isLooping: true,
          isMuted: false,
          volume: 0.5,
          rate: 1.0,
          shouldCorrectPitch: true,
        }
      );

      setSound(newSound);
      console.log("Playback started successfully");
    } catch (error) {
      console.error("Playback Error:", error);
      Alert.alert(
        "Playback Failed",
        `Could not play music:\n${url}\n\nError: ${error.message}`
      );
    }
  };

  // Function to stop music
  const stopMusic = async () => {
    if (sound) {
      await sound.stopAsync();
      setSound(null); // Clear the sound state
      console.log("Music stopped successfully");
    }
  };


  const logAllStates = () => {
    console.log("📋 ALL STATE VALUES:", JSON.stringify({
      storyPrompt,
      storyParts,
      loading,
      availableVoices: availableVoices.length,
      selectedVoice,
      fontStyle,
      fontColor,
      fontSize,
      musicURLs,
      sound: sound ? "Exists" : "Null",
      storyName,
      storyDescription,
      saving
    }, null, 2));
  };

  
  const handleSaveStory = async () => {
    logAllStates(); // <-- Add this at the start
    
    
    if (!storyName || storyParts.length === 0) {
      Alert.alert("Error", "Please fill all fields and generate a story first");
      return;
    }

    setSaving(true);
    try {
      const getRandomMusicURL = (urls) => {
        if (!urls || urls.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * urls.length);
        return urls[randomIndex];
      };
      const storyData = {
        user_id: "12345", // Replace with actual user ID from your auth system
        storyName,
        story: storyPrompt,
        storyTextColor: fontColor,
        storyTextSize: `${fontSize}px`,
        storyTextStyle: fontStyle,
        backgroundMusicURL: getRandomMusicURL(musicURLs),
        storySections: storyParts.map((part) => ({
          storyText: part.text,
          storyImage: part.image_url,
        })),
      };
      console.log("Saving story:", storyData);
      const response = await axios.post(
        "http://192.168.8.144:4010/story-liabrary/stories",
        storyData,
        { headers: { "Content-Type": "application/json" } }
      );

      // Stop music when the story is saved successfully
    await stopMusic();

    Speech.stop();
    
    // Use the Alert callback to navigate after OK is pressed
    Alert.alert(
      "Success", 
      "Story saved successfully!", 
      [
        {
          text: "OK",
          onPress: () => {
            // Add a small delay before navigating
            setTimeout(() => {
              navigation.navigate('StoryTellingHome');
            }, 500); // 1 second delay
          }
        }
      ]
    );
    } catch (error) {
      console.error("Save error:", error);
      Alert.alert(
        "Save Failed",
        error.response?.data?.message || "Failed to save story"
      );
    } finally {
      setSaving(false);
    }
  };

  // Text-to-Speech function
  const readText = (text) => {
    Speech.speak(text, {
      voice: selectedVoice, // Use the selected voice
      language: "en", // Adjust language code if necessary
      pitch: 1.0, // Adjust pitch
      rate: 0.5, // Adjust speech rate
    });
  };

  // Render a single story part with the selected styles
  const renderStoryPart = ({ item }) => (
    <View style={styles.storyPart}>
      <Text
        style={{
          fontFamily: fontStyle,
          color: fontColor,
          fontSize: fontSize,
          marginBottom: 10,
        }}
      >
        {item.text}
      </Text>
      <Image source={{ uri: item.image_url }} style={styles.storyImage} />
      <View style={styles.buttonRow}>
        <Button title="Read Text" onPress={() => readText(item.text)} />
      </View>
    </View>
  );

  // Render music player section if music URLs are available
  const renderMusicPlayer = () => {
    if (musicURLs.length === 0) return null;

    return (
      <View style={styles.musicPlayerContainer}>
        <Text style={styles.musicTitle}>Background Music</Text>
        <FlatList
          data={musicURLs}
          horizontal
          keyExtractor={(item, index) => `music-${index}`}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={styles.musicItem}
              onPress={() => playMusic(item)}
            >
              <Text style={styles.musicText}>Track {index + 1}</Text>
            </TouchableOpacity>
          )}
        />
        <Button title="Stop Music" onPress={stopMusic} />
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Generate Your Story</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter a story prompt"
        value={storyPrompt}
        onChangeText={setStoryPrompt}
      />
      <Button title="Submit Story" onPress={generateStory} />
      {loading && <ActivityIndicator size="large" color="#0000ff" />}

      {/* Music player section */}
      {renderMusicPlayer()}

      {/* Settings for font styles, sizes, colors, and voices */}
      <View style={styles.settings}>
        <View style={styles.dropdownContainer}>
          <Text style={styles.dropdownLabel}>Font Style:</Text>
          <Picker
            selectedValue={fontStyle}
            onValueChange={(itemValue) => setFontStyle(itemValue)}
            style={styles.picker}
          >
            {fontStyles.map((font) => (
              <Picker.Item
                key={font.value}
                label={font.label}
                value={font.value}
              />
            ))}
          </Picker>
        </View>

        <View style={styles.dropdownContainer}>
          <Text style={styles.dropdownLabel}>Font Size:</Text>
          <Picker
            selectedValue={fontSize}
            onValueChange={(itemValue) => setFontSize(Number(itemValue))}
            style={styles.picker}
          >
            {fontSizes.map((size) => (
              <Picker.Item key={size} label={`${size}px`} value={size} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.voiceContainer}>
        <Text style={styles.dropdownLabel}>Select Voice:</Text>
        <Picker
          selectedValue={selectedVoice}
          onValueChange={(itemValue) => setSelectedVoice(itemValue)}
          style={styles.picker}
        >
          {availableVoices.map((voice) => (
            <Picker.Item
              key={voice.identifier}
              label={voice.name}
              value={voice.identifier}
            />
          ))}
        </Picker>
      </View>

      {/* Color Palette */}
      <View style={styles.paletteContainer}>
        <Text style={styles.paletteLabel}>Text Color:</Text>
        <View style={styles.palette}>
          {colors.map((color) => (
            <TouchableOpacity
              key={color}
              style={[styles.colorBox, { backgroundColor: color }]}
              onPress={() => setFontColor(color)}
            />
          ))}
        </View>
      </View>

      {/* Render Story Parts */}
      <FlatList
        data={storyParts}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderStoryPart}
      />

      <TextInput
        style={styles.input}
        placeholder="Story Name"
        value={storyName}
        onChangeText={setStoryName}
      />

      {storyParts.length > 0 && (
        <TouchableOpacity
          style={[styles.button]}
          onPress={handleSaveStory}
          disabled={saving}
        >
          <Text style={styles.buttonText}>
            {saving ? "Saving..." : "Save Story"}
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f5f7fa",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
    textAlign: "center",
  },
  input: {
    height: 50,
    width: "100%",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  storyPart: {
    marginBottom: 20,
    alignItems: "center",
  },
  storyImage: {
    width: 200,
    height: 200,
    marginBottom: 10,
    borderRadius: 10,
  },
  settings: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  dropdownContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  dropdownLabel: {
    fontSize: 16,
    marginBottom: 10,
    color: "#333",
  },
  picker: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  voiceContainer: {
    width: "100%",
    marginBottom: 20,
  },
  paletteContainer: {
    width: "100%",
    marginBottom: 20,
  },
  paletteLabel: {
    fontSize: 16,
    marginBottom: 10,
    color: "#333",
  },
  palette: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  colorBox: {
    width: 30,
    height: 30,
    margin: 5,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  musicPlayerContainer: {
    width: "100%",
    marginVertical: 20,
    padding: 15,
    backgroundColor: "#e8f4ff",
    borderRadius: 10,
  },
  musicTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  musicItem: {
    backgroundColor: "#0078ff",
    padding: 12,
    borderRadius: 8,
    marginRight: 10,
    marginBottom: 10,
    width: 100,
    alignItems: "center",
  },
  musicText: {
    color: "#fff",
    fontWeight: "bold",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
});

export default GenerateStory;

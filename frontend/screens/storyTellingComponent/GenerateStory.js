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
} from "react-native";
import axios from "axios";
import * as Speech from "expo-speech"; // For text-to-speech
import { Picker } from "@react-native-picker/picker"; // Correct Picker import
import { Audio } from 'expo-av'; // Import for playing audio

const GenerateStory = () => {
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
  const fontSizes = [12, 14, 16, 18, 20, 24, 28, 32, 36, 40];

  // Fetch available voices on component mount
  useEffect(() => {
    const fetchVoices = async () => {
      const voices = await Speech.getAvailableVoicesAsync();
      
      setAvailableVoices(voices);
      if (voices.length > 0) {
        
        setSelectedVoice(voices[0].identifier); // Set the first voice as default
      }
    };
    fetchVoices();

    // Cleanup function to unload sound when component unmounts
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  // Function to fetch music URLs based on story parameters
  const fetchMusicURLs = async (musicmood, musicCategory, subCategory, baseURL = 'http://192.168.8.144:4010') => {
    try {
      // Construct the URL with query parameters
      const response = await axios.get(`${baseURL}/story-music/search`, {
        params: {
          musicmood,
          musicCategory,
          subCategory
        }
      });
      
      // Return the data from the response
      return response.data;
    } catch (error) {
      // Handle different types of errors
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Server error:', error.response.status, error.response.data);
        throw error.response.data;
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Network error:', error.request);
        throw new Error('Network error. Please check your connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Request error:', error.message);
        throw new Error('Error setting up request: ' + error.message);
      }
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
      setStoryParts(response.data.story_parts);
      
      // After getting the story, fetch appropriate music based on the story's mood and category
      // Assuming the response includes mood and category information for the story
      if (response.data.mood && response.data.category && response.data.subcategory) {
        try {
          const musicResponse = await fetchMusicURLs(
            response.data.mood,
            response.data.category,
            response.data.subcategory
          );
          setMusicURLs(musicResponse.urls);
          
          // Play the first music track if available
          if (musicResponse.urls && musicResponse.urls.length > 0) {
            playMusic(musicResponse.urls[0]);
          }
        } catch (musicError) {
          console.error("Error fetching music:", musicError);
        }
      } else {
        // Fallback to default music parameters if not provided in response
        try {
          const musicResponse = await fetchMusicURLs("happy", "Fairy Tale", "Dragon's Lair");
          setMusicURLs(musicResponse.urls);
          console.log(musicResponse.urls);
          
          // Play the first music track if available
          if (musicResponse.urls && musicResponse.urls.length > 0) {
            playMusic(musicResponse.urls[0]);
          }
        } catch (musicError) {
          console.error("Error fetching default music:", musicError);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Network or CORS issue detected.");
    } finally {
      setLoading(false);
    }
  };

  // Function to play music
  const playMusic = async (url) => {
    // Stop any currently playing music
    if (sound) {
      await sound.unloadAsync();
    }
    
    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true, isLooping: true }
      );
      setSound(newSound);
    } catch (error) {
      console.error("Error playing music:", error);
    }
  };

  // Function to stop music
  const stopMusic = async () => {
    if (sound) {
      await sound.stopAsync();
    }
  };

  // Text-to-Speech function
  const readText = (text) => {
    Speech.speak(text, {
      voice: selectedVoice, // Use the selected voice
      language: "en", // Adjust language code if necessary
      pitch: 1.0, // Adjust pitch
      rate: 1.0, // Adjust speech rate
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
              <Picker.Item key={font.value} label={font.label} value={font.value} />
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
            <Picker.Item key={voice.identifier} label={voice.name} value={voice.identifier} />
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
// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   Button,
//   FlatList,
//   Image,
//   ActivityIndicator,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
// } from "react-native";
// import axios from "axios";
// import { Audio } from "expo-av";
// import { Picker } from "@react-native-picker/picker"; // Correct Picker import

// const GenerateStory = () => {
//   const [storyPrompt, setStoryPrompt] = useState(""); // User input for story
//   const [storyParts, setStoryParts] = useState([]); // Segmented story parts
//   const [loading, setLoading] = useState(false); // Loader
//   const [fontStyle, setFontStyle] = useState("Poppins"); // Default font style
//   const [fontColor, setFontColor] = useState("#000000"); // Default text color
//   const [fontSize, setFontSize] = useState(16); // Default font size

//   // Font styles for selection
//   const fontStyles = [
//     { label: "Poppins", value: "Poppins" },
//     { label: "Baloo Bhai 2", value: "BalooBhai2" },
//     { label: "Bangers", value: "Bangers" },
//     { label: "Fredoka One", value: "FredokaOne" },
//     { label: "Roboto", value: "Roboto" },
//     { label: "Lobster", value: "Lobster" },
//     { label: "Pacifico", value: "Pacifico" },
//     { label: "Caveat", value: "Caveat" },
//     { label: "Shadows Into Light", value: "ShadowsIntoLight" },
//     { label: "Comic Sans MS", value: "ComicSansMS" },
//   ];

//   // Color palette for text
//   const colors = [
//     "#FF0000",
//     "#00FF00",
//     "#0000FF",
//     "#FFFF00",
//     "#FF00FF",
//     "#00FFFF",
//     "#000000",
//     "#808080",
//     "#800000",
//     "#FFA500",
//     "#008000",
//     "#4B0082",
//     "#FFC0CB",
//     "#A52A2A",
//     "#D2691E",
//     "#008B8B",
//     "#DA70D6",
//     "#4682B4",
//   ];

//   // Font sizes for dropdown
//   const fontSizes = [12, 14, 16, 18, 20, 24, 28, 32, 36, 40];

//   // Generate story from the server
//   const generateStory = async () => {
//     setLoading(true);
//     try {
//       const response = await axios.post(
//         "http://172.28.19.181:5000/api/generate-story",
//         {
//           story_prompt: storyPrompt,
//         }
//       );
//       setStoryParts(response.data.story_parts);
//     } catch (error) {
//       console.error("Error generating story:", error.response?.data || error);
//       alert("Failed to generate the story. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Render a single story part with the selected styles
//   const renderStoryPart = ({ item }) => (
//     <View style={styles.storyPart}>
//       <Text
//         style={{
//           fontFamily: fontStyle,
//           color: fontColor,
//           fontSize: fontSize,
//           marginBottom: 10,
//         }}
//       >
//         {item.text}
//       </Text>
//       <Image source={{ uri: item.image_url }} style={styles.storyImage} />
//       <Button title="Play Audio" onPress={() => playAudio(item.audio_url)} />
//     </View>
//   );

//   // Play the audio for a story segment
//   const playAudio = (audioUrl) => {
//     const audio = new Audio(`http://localhost:5000${audioUrl}`);
//     audio.play().catch((error) => {
//       console.error("Error playing audio:", error);
//       alert("Failed to play the audio. Please try again.");
//     });
//   };


//   // const playAudio = (audioUrl) => {
//   //   const audio = new Audio(`http://localhost:5000${audioUrl}`);
//   //   audio.play().catch((error) => {
//   //     console.error("Error playing audio:", error);
//   //     alert("Failed to play the audio. Please try again.");
//   //   });
//   // };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.title}>Generate Your Story</Text>
//       <TextInput
//         style={styles.input}
//         placeholder="Enter a story prompt"
//         value={storyPrompt}
//         onChangeText={setStoryPrompt}
//       />
//       <Button title="Submit Story" onPress={generateStory} />
//       {loading && <ActivityIndicator size="large" color="#0000ff" />}

//       {/* Settings for font styles, sizes, and colors */}
//       <View style={styles.settings}>
//         <View style={styles.dropdownContainer}>
//           <Text style={styles.dropdownLabel}>Font Style:</Text>
//           <Picker
//             selectedValue={fontStyle}
//             onValueChange={(itemValue) => setFontStyle(itemValue)}
//             style={styles.picker}
//           >
//             {fontStyles.map((font) => (
//               <Picker.Item key={font.value} label={font.label} value={font.value} />
//             ))}
//           </Picker>
//         </View>

//         <View style={styles.dropdownContainer}>
//           <Text style={styles.dropdownLabel}>Font Size:</Text>
//           <Picker
//             selectedValue={fontSize}
//             onValueChange={(itemValue) => setFontSize(itemValue)}
//             style={styles.picker}
//           >
//             {fontSizes.map((size) => (
//               <Picker.Item key={size} label={`${size}px`} value={size} />
//             ))}
//           </Picker>
//         </View>
//       </View>

//       {/* Color Palette */}
//       <View style={styles.paletteContainer}>
//         <Text style={styles.paletteLabel}>Text Color:</Text>
//         <View style={styles.palette}>
//           {colors.map((color) => (
//             <TouchableOpacity
//               key={color}
//               style={[styles.colorBox, { backgroundColor: color }]}
//               onPress={() => setFontColor(color)}
//             />
//           ))}
//         </View>
//       </View>

//       {/* Render Story Parts */}
//       <FlatList
//         data={storyParts}
//         keyExtractor={(item, index) => index.toString()}
//         renderItem={renderStoryPart}
//       />
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flexGrow: 1,
//     padding: 20,
//     backgroundColor: "#f5f7fa",
//     alignItems: "center",
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: "bold",
//     marginBottom: 20,
//     color: "#333",
//     textAlign: "center",
//   },
//   input: {
//     height: 50,
//     width: "100%",
//     borderColor: "#ccc",
//     borderWidth: 1,
//     borderRadius: 10,
//     paddingHorizontal: 15,
//     marginBottom: 20,
//     backgroundColor: "#fff",
//   },
//   storyPart: {
//     marginBottom: 20,
//     alignItems: "center",
//   },
//   storyImage: {
//     width: 200,
//     height: 200,
//     marginBottom: 10,
//     borderRadius: 10,
//   },
//   settings: {
//     width: "100%",
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 20,
//   },
//   dropdownContainer: {
//     flex: 1,
//     marginHorizontal: 5,
//   },
//   dropdownLabel: {
//     fontSize: 16,
//     marginBottom: 10,
//     color: "#333",
//   },
//   picker: {
//     height: 50,
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 10,
//     backgroundColor: "#fff",
//   },
//   paletteContainer: {
//     width: "100%",
//     marginBottom: 20,
//   },
//   paletteLabel: {
//     fontSize: 16,
//     marginBottom: 10,
//     color: "#333",
//   },
//   palette: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "center",
//   },
//   colorBox: {
//     width: 30,
//     height: 30,
//     margin: 5,
//     borderRadius: 15,
//     borderWidth: 1,
//     borderColor: "#ddd",
//   },
// });

// export default GenerateStory;





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

const GenerateStory = () => {
  const [storyPrompt, setStoryPrompt] = useState(""); // User input for story
  const [storyParts, setStoryParts] = useState([]); // Segmented story parts
  const [loading, setLoading] = useState(false); // Loader
  const [availableVoices, setAvailableVoices] = useState([]); // List of available voices
  const [selectedVoice, setSelectedVoice] = useState(null); // Selected voice
  const [fontStyle, setFontStyle] = useState("Poppins"); // Default font style
  const [fontColor, setFontColor] = useState("#000000"); // Default text color
  const [fontSize, setFontSize] = useState(16); // Default font size

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
  }, []);

  // Generate story from the server
  const generateStory = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        "http://10.0.2.2:5000/api/generate-story",
        {
          story_prompt: storyPrompt,
        }
      );
      setStoryParts(response.data.story_parts);
    } catch (error) {
      console.error("Error generating story:", error.response?.data || error);
      alert("Failed to generate the story. Please try again.");
    } finally {
      setLoading(false);
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
      <Button title="Read Text" onPress={() => readText(item.text)} />
    </View>
  );

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
            onValueChange={(itemValue) => setFontSize(itemValue)}
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
});

export default GenerateStory;


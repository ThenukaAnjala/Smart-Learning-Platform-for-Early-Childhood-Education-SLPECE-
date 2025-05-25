// import React, { useState } from "react";

// import {
//   View,
//   Text,
//   TextInput,
//   Button,
//   Image,
//   FlatList,
//   StyleSheet,
//   ActivityIndicator,
// } from "react-native";
// import axios from "axios";

// const GenerateStory = ({ onStoryGenerated, onCancel }) => {
//   const [storyPrompt, setStoryPrompt] = useState(""); // User input
//   const [storyParts, setStoryParts] = useState([]); // Generated story parts
//   const [loading, setLoading] = useState(false);

//   // Generate story function
//   const generateStory = async () => {
//     setLoading(true);
//     setStoryParts([]);
//     try {
//       const response = await axios.post("http://localhost:5000/generate-story", {
//         story_prompt: storyPrompt,
//       });
//       setStoryParts(response.data.story_parts);

//       // Save the story to the library
//       const newStory = {
//         id: Date.now(),
//         title: storyPrompt,
//         image: response.data.story_parts[0]?.image_url, // First part's image
//       };
//       onStoryGenerated(newStory);
//     } catch (error) {
//       console.error("Error generating story:", error.response?.data || error);
//       alert("Failed to generate the story. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Render each story part
//   const renderStoryPart = ({ item }) => (
//     <View style={styles.storyPart}>
//       <Text style={styles.storyText}>{item.text}</Text>
//       <Image source={{ uri: item.image_url }} style={styles.storyImage} />
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Generate Your Story</Text>
//       <TextInput
//         style={styles.input}
//         placeholder="Enter a story prompt"
//         value={storyPrompt}
//         onChangeText={setStoryPrompt}
//       />
//       <Button title="Generate Story" onPress={generateStory} disabled={loading} />
//       {loading && <ActivityIndicator size="large" color="#0000ff" />}
//       <FlatList
//         data={storyParts}
//         renderItem={renderStoryPart}
//         keyExtractor={(item, index) => index.toString()}
//       />
//       <Button title="Cancel" onPress={onCancel} />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: "#fff",
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginBottom: 20,
//   },
//   input: {
//     height: 40,
//     borderColor: "gray",
//     borderWidth: 1,
//     marginBottom: 20,
//     paddingHorizontal: 10,
//     borderRadius: 5,
//   },
//   storyPart: {
//     marginBottom: 20,
//     alignItems: "center",
//   },
//   storyText: {
//     fontSize: 16,
//     marginBottom: 10,
//     textAlign: "center",
//   },
//   storyImage: {
//     width: 200,
//     height: 200,
//     marginBottom: 10,
//     borderRadius: 10,
//   },
// });

// export default GenerateStory;

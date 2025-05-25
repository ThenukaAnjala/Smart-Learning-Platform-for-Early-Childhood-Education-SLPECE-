import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";

const CreateStorySection = ({ onCreateStory }) => {
  return (
    <View style={styles.container}>
      {/* Interactive Image */}
      <LottieView
        source={require("../../assets/storyAnimation/createStory.json")}
        autoPlay
        loop
        style={styles.image}
      />
      <Text style={styles.description}>
        Start your adventure by creating a story!
      </Text>

      {/* Create Story Button */}
      <TouchableOpacity style={styles.button} onPress={onCreateStory}>
        <Text style={styles.buttonText}>Create Story</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: 30,
  },
  image: {
  width: 400,      // Set your desired width
  height: 200,     // Set your desired height
  alignSelf: "center",
  
},
  description: {
    fontSize: 24,
    color: "#555",
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "bold",
    fontFamily: "YourCustomFont",
  },
  button: {
      backgroundColor: "#E49B0F",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    // Shadow for iOS
    shadowColor: "#DAA520",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 10,
    shadowRadius: 10,
    // Shadow for Android
    elevation: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
});

export default CreateStorySection;

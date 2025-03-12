import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";

const CreateStorySection = ({ onCreateStory }) => {
  return (
    <View style={styles.container}>
      {/* Interactive Image */}
      <Image
        style={styles.image}
        source={require("../../assets/storyUI.jpg")} // Replace with your image
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
    width: "100%",
    height: 250,
    resizeMode: "cover",
    borderRadius: 10,
    marginBottom: 20,
  },
  description: {
    fontSize: 18,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CreateStorySection;

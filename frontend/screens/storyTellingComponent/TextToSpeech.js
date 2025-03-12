import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import * as Speech from "expo-speech";

const TextToSpeech = () => {
  const [text, setText] = useState("");

  const speak = () => {
    if (text.trim()) {
      Speech.speak(text, {
        pitch: 1.0,
        rate: 1.0,
        language: "en-US",
      });
    } else {
      alert("Please enter some text to speak!");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Text to Speech</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter text to speak"
        value={text}
        onChangeText={setText}
      />
      <Button title="Speak" onPress={speak} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    width: "100%",
    marginBottom: 20,
    paddingHorizontal: 10,
  },
});

export default TextToSpeech;

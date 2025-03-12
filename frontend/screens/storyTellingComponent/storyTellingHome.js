import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import CreateStorySection from "./CreateStorySection";
import StoryLibrary from "./StoryLibrary";
import GenerateStory from "./GenerateStory";

const Home = () => {
  const [showGenerateStory, setShowGenerateStory] = useState(false); // Toggle generation page
  const [stories, setStories] = useState([]); // Story library state

  const handleStoryCreation = (newStory) => {
    setStories((prevStories) => [...prevStories, newStory]); // Add story to library
    setShowGenerateStory(false); // Return to home after story creation
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
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
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f5f7fa",
  },
});

export default Home;

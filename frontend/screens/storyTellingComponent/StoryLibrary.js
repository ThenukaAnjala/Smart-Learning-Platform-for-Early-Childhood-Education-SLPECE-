import React from "react";
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from "react-native";

const StoryLibrary = ({ stories }) => {
  const handleOpenStory = (story) => {
    console.log(`Opening story: ${story.title}`);
    // Redirect to story-reading page
    // Navigate or show a modal to display the story
  };

  const renderStory = ({ item }) => (
    <TouchableOpacity style={styles.storyCard} onPress={() => handleOpenStory(item)}>
      <Image style={styles.storyImage} source={{ uri: item.image }} />
      <Text style={styles.storyTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Story Library</Text>
      <FlatList
        data={stories}
        renderItem={renderStory}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.storyList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  storyList: {
    alignItems: "center",
  },
  storyCard: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 20,
    alignItems: "center",
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  storyImage: {
    width: 100,
    height: 100,
    borderRadius: 5,
    marginBottom: 10,
  },
  storyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
});

export default StoryLibrary;

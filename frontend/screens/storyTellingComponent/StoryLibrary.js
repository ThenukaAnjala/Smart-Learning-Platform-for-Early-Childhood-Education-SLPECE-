import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from "react-native";
import axios from "axios";
import { useNavigation } from '@react-navigation/native';

const StoryLibrary = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = "12345"; // Replace with actual user ID
  const navigation = useNavigation();

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await axios.get(`http://192.168.8.144:4010/story-liabrary/stories/user/${userId}`);
        setStories(response.data);
      } catch (error) {
        console.error("Error fetching stories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, [userId]);

  const handleOpenStory = (story) => {
    console.log(`Opening story: ${story.storyName}`);
    navigation.navigate('SingleStory', { storyId: story._id });
  };

  const renderStory = ({ item }) => (
    <TouchableOpacity style={styles.storyCard} onPress={() => handleOpenStory(item)}>
      <Image style={styles.storyImage} source={{ uri: item.image }} />
      <Text style={styles.storyTitle}>{item.storyName}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Story Library</Text>
      <FlatList
        data={stories}
        renderItem={renderStory}
        keyExtractor={(item) => item._id.toString()}
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
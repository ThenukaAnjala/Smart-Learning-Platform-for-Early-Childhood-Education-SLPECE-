import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, Dimensions } from "react-native";
import axios from "axios";
import Swiper from 'react-native-swiper';

const { width, height } = Dimensions.get("window");

const SingleStory = ({ route }) => {
  const { storyId } = route.params;
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const response = await axios.get(`http://192.168.8.144:4010/story-liabrary/stories/${storyId}`);
        setStory(response.data);
      } catch (error) {
        console.error("Error fetching story:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStory();
  }, [storyId]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!story) {
    return (
      <View style={styles.container}>
        <Text>Story not found.</Text>
      </View>
    );
  }

  return (
    <Swiper style={styles.wrapper} showsButtons={true}>
      {story.storySection.map((section, index) => (
        <View key={index} style={styles.page}>
          <Image style={styles.image} source={{ uri: section.storyImage }} />
          <Text style={styles.text}>{section.storyText}</Text>
        </View>
      ))}
    </Swiper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  wrapper: {},
  page: {
    width: width,
    height: height,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "70%",
    borderRadius: 10,
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
});

export default SingleStory;
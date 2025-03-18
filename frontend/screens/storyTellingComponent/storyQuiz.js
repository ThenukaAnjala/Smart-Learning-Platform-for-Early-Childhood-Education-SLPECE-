import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, Dimensions, Alert, TouchableOpacity, ScrollView } from "react-native";
import { useNavigation } from '@react-navigation/native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import axios from "axios";

const { width, height } = Dimensions.get("window");

const StoryQuiz = ({ route }) => {
  const navigation = useNavigation();
  const { storyId } = route?.params;
  const [storySections, setStorySections] = useState([]);
  const [shuffledSections, setShuffledSections] = useState([]);
  const numColumns = 4; // Number of columns for the grid

  useEffect(() => {
    const fetchStorySections = async () => {
      try {
        const response = await axios.get(`http://192.168.8.144:4010/story-liabrary/stories/${storyId}`);
        setStorySections(response.data.storySection);
        setShuffledSections(shuffleArray(response.data.storySection));
      } catch (error) {
        console.error("Error fetching story sections:", error);
      }
    };

    fetchStorySections();
  }, [storyId]);

  const shuffleArray = (array) => {
    return array
      .map((item) => ({ ...item, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map((item) => ({ ...item, sort: undefined }));
  };

  const checkOrder = () => {
    for (let i = 0; i < storySections.length; i++) {
      if (storySections[i]._id !== shuffledSections[i]._id) {
        Alert.alert("Incorrect Order", "Please try again.");
        return;
      }
    }
    Alert.alert("Congratulations", "You have correctly ordered the images!");
  };

  const renderItem = ({ item, drag, isActive }) => {
    return (
      <TouchableOpacity
        style={[styles.item, { backgroundColor: isActive ? "#f0f0f0" : "#fff" }]}
        onLongPress={drag}
      >
        <Image style={styles.image} source={{ uri: item.storyImage }} resizeMode="contain" />
      </TouchableOpacity>
    );
  };

  const handleDragEnd = ({ data, from, to }) => {
    const newData = [...shuffledSections];
    const movedItem = newData.splice(from, 1)[0];
    newData.splice(to, 0, movedItem);
    setShuffledSections(newData);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Reorder the Images</Text>
        <View style={styles.listContainer}>
          <DraggableFlatList
            data={shuffledSections}
            renderItem={renderItem}
            keyExtractor={(item) => item._id ? item._id.toString() : Math.random().toString()}
            onDragEnd={handleDragEnd}
            numColumns={numColumns} // Display 4 images per row
            key={`draggable-flatlist-${numColumns}`} // Force a fresh render when numColumns changes
          />
        </View>
        <TouchableOpacity style={styles.button} onPress={checkOrder}>
          <Text style={styles.buttonText}>Check Order</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  listContainer: {
    height: height * 0.6, // Adjust height as needed
  },
  item: {
    flex: 1,
    margin: 10,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  image: {
    width: "100%",
    height: 200, // Adjust height to fit 4 images per row
    borderRadius: 10,
  },
  button: {
    backgroundColor: "#0078ff",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default StoryQuiz;
import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useNavigate } from "react-router-native";

const About = () => {
  const navigate = useNavigate();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>About This App</Text>
      <Text style={styles.text}>
        This app integrates AI technologies to create a dynamic learning
        experience for children. It includes features like image generation and
        storytelling.
      </Text>
      <Button title="Back to Home" onPress={() => navigate("/")} />
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
  text: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
});

export default About;

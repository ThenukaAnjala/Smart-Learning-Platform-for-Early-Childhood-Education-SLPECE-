
import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, PanResponder } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Pen from '../components/Pen';

const DrawingBoard = ({ navigation }) => {
  const [currentPoints, setCurrentPoints] = useState([]);
  const [previousStrokes, setPreviousStrokes] = useState([]);
  const [pen] = useState(new Pen());
  const [color, setColor] = useState('#000000'); // Default brush color
  const [strokeWidth, setStrokeWidth] = useState(4); // Default stroke width

  const clearCanvas = () => {
    setCurrentPoints([]);
    setPreviousStrokes([]);
    pen.clear();
  };

  // Initialize PanResponder to capture touch events
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        pen.addStroke([{ x: locationX, y: locationY }]);
        setCurrentPoints([{ x: locationX, y: locationY }]);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        setCurrentPoints((prevPoints) => [...prevPoints, { x: locationX, y: locationY }]);
      },
      onPanResponderRelease: () => {
        setPreviousStrokes((prevStrokes) => [...prevStrokes, currentPoints]);
        setCurrentPoints([]);
      },
    })
  ).current;

  // Functions to adjust stroke width dynamically
  const increaseStrokeWidth = () => {
    setStrokeWidth((prevWidth) => prevWidth + 1);
  };

  const decreaseStrokeWidth = () => {
    setStrokeWidth((prevWidth) => Math.max(prevWidth - 1, 1)); // Minimum width is 1
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      {/* Drawing Canvas */}
      <View style={{ flex: 1 }} {...panResponder.panHandlers}>
        <Svg style={styles.canvas}>
          {previousStrokes.map((stroke, index) => (
            <Path
              key={index}
              d={pen.pointsToSvg(stroke)}
              stroke={color}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          <Path
            d={pen.pointsToSvg(currentPoints)}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#FF0000' }]}
          onPress={() => setColor('#FF0000')}
        >
          <Text style={styles.buttonText}>Red</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#00FF00' }]}
          onPress={() => setColor('#00FF00')}
        >
          <Text style={styles.buttonText}>Green</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#0000FF' }]}
          onPress={() => setColor('#0000FF')}
        >
          <Text style={styles.buttonText}>Blue</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.clearButton} onPress={clearCanvas}>
          <Text style={styles.buttonText}>Clear</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={increaseStrokeWidth}>
          <Text style={styles.buttonText}>Increase Width</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={decreaseStrokeWidth}>
          <Text style={styles.buttonText}>Decrease Width</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  canvas: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  controls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    padding: 10,
    backgroundColor: '#eeeeee',
  },
  button: {
    padding: 10,
    borderRadius: 5,
    margin: 5,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  clearButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#000000',
    margin: 5,
  },
  controlButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#6200EE',
    margin: 5,
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 1,
    backgroundColor: '#6200EE',
    padding: 10,
    borderRadius: 5,
  },
  backButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});

export default DrawingBoard;

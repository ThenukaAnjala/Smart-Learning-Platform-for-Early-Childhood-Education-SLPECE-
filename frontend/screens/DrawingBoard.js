import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, PanResponder, Alert } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Pen from '../components/Pen';

const DrawingBoard = ({ navigation }) => {
  const [currentPoints, setCurrentPoints] = useState([]); // Points of the current stroke
  const [previousStrokes, setPreviousStrokes] = useState([]); // Array of completed strokes
  const [pen] = useState(new Pen()); // Pen instance
  const [color, setColor] = useState('#000000'); // Default brush color
  const [strokeWidth, setStrokeWidth] = useState(4); // Default stroke width
  const [isEraser, setIsEraser] = useState(false); // Track eraser mode

  const canvasRef = useRef(); // Ref for capturing the canvas

  // Save the drawing to an image
  const handleOk = async () => {
    Alert.alert('Drawing Saved', 'Your drawing is ready for the next step!');
    // Logic to export or save the image can be added here
  };

  // PanResponder to handle touch gestures
 const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        const strokeColor = isEraser ? '#ffffff' : color; // Use eraser color if active
        setCurrentPoints((prevPoints) => [
          ...prevPoints,
          { x: locationX, y: locationY, color: strokeColor },
        ]);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        setCurrentPoints((prevPoints) => [...prevPoints, { x: locationX, y: locationY }]);
      },
      onPanResponderRelease: () => {
        if (currentPoints.length > 0) {
          setPreviousStrokes((prevStrokes) => [
            ...prevStrokes,
            { points: currentPoints, color: isEraser ? '#ffffff' : color, strokeWidth },
          ]);
          setCurrentPoints([]); // Clear currentPoints for the next stroke
        }
      },
    })
  ).current;


  // Increase stroke width
  const increaseStrokeWidth = () => setStrokeWidth((prevWidth) => prevWidth + 1);

  // Decrease stroke width
  const decreaseStrokeWidth = () => setStrokeWidth((prevWidth) => Math.max(prevWidth - 1, 1)); // Minimum width is 1

  // Toggle eraser mode
  const toggleEraser = () => setIsEraser(!isEraser);

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      {/* Drawing Canvas */}
      <View style={{ flex: 1 }} ref={canvasRef} {...panResponder.panHandlers}>
        <Svg style={styles.canvas}>
          {previousStrokes.map((stroke, index) => (
            <Path
              key={index}
              d={pen.pointsToSvg(stroke.points)}
              stroke={stroke.color}
              strokeWidth={stroke.strokeWidth}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {currentPoints.length > 0 && (
            <Path
              d={pen.pointsToSvg(currentPoints)}
              stroke={isEraser ? '#ffffff' : color}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
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
        <TouchableOpacity
          style={styles.clearButton}
          onPress={toggleEraser}
        >
          <Text style={styles.buttonText}>{isEraser ? 'Eraser On' : 'Eraser Off'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={increaseStrokeWidth}>
          <Text style={styles.buttonText}>Increase Width</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={decreaseStrokeWidth}>
          <Text style={styles.buttonText}>Decrease Width</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.okButton} onPress={handleOk}>
          <Text style={styles.buttonText}>OK</Text>
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
  okButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#00AA00',
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

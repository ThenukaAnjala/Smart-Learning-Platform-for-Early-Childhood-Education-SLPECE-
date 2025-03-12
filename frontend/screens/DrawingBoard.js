// frontend/screens/DrawingBoard.js
import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  PanResponder,
  Alert,
  Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import ViewShot from 'react-native-view-shot';
import Pen from '../components/Pen';

export default function DrawingBoard({ navigation }) {
  const [currentPoints, setCurrentPoints] = useState([]);
  const [previousStrokes, setPreviousStrokes] = useState([]);
  const [color, setColor] = useState('#000');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [isEraser, setIsEraser] = useState(false);
  const [recognizedLabel, setRecognizedLabel] = useState(null);
  const viewShotRef = useRef(null);
  const [pen] = useState(new Pen());

  // For environment config:
  const IS_ANDROID_EMULATOR = false;
  const COMPUTER_IP = '192.168.16.101'; // update to your LAN IP
  const BACKEND_URL =
    Platform.OS === 'android'
      ? IS_ANDROID_EMULATOR
        ? 'http://10.0.2.2:5000/predict'
        : `http://${COMPUTER_IP}:5000/predict`
      : Platform.OS === 'ios'
      ? 'http://127.0.0.1:5000/predict'
      : `http://${COMPUTER_IP}:5000/predict`;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        const strokeColor = isEraser ? '#ffffff' : color;
        setCurrentPoints([{ x: locationX, y: locationY, color: strokeColor }]);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        setCurrentPoints((prev) => [...prev, { x: locationX, y: locationY }]);
      },
      onPanResponderRelease: () => {
        if (currentPoints.length > 0) {
          setPreviousStrokes((prev) => [
            ...prev,
            { points: currentPoints, color: isEraser ? '#ffffff' : color, strokeWidth },
          ]);
          setCurrentPoints([]);
        }
      },
    })
  ).current;

  // Capture as a file, upload to backend, get processed base64 (background removed)
  const handleOk = async () => {
    try {
      // 1) Capture the drawing as a temp file
      const tmpFilePath = await viewShotRef.current.capture({
        format: 'png',
        quality: 0.8,
        result: 'tmpfile',
      });
      console.log('Captured file path:', tmpFilePath);

      // 2) Build FormData
      const formData = new FormData();
      formData.append('image', {
        uri: tmpFilePath,
        type: 'image/png',
        name: 'drawing.png',
      });

      // 3) POST to the backend
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const data = await response.json();
      console.log('Response from backend:', data);

      if (data.label) {
        setRecognizedLabel(data.label);
        Alert.alert('Prediction', `Recognized: ${data.label}`);
        // If recognized fish, navigate to FishScreen with the new base64
        if (data.label.toLowerCase() === 'fish' && data.processedBase64) {
          navigation.navigate('FishScreen', {
            fishImageBase64: data.processedBase64,
          });
        }
      } else {
        Alert.alert('Error', data.error || 'No label returned.');
      }
    } catch (error) {
      console.error('Error uploading drawing:', error);
      Alert.alert('Error', 'Network request failed. Check your IP and connectivity.');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <ViewShot style={styles.canvasContainer} ref={viewShotRef}>
        <View style={styles.drawingArea} {...panResponder.panHandlers}>
          <Svg width="100%" height="100%">
            {previousStrokes.map((stroke, idx) => (
              <Path
                key={idx}
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
      </ViewShot>

      <View style={styles.controls}>
        <TouchableOpacity style={[styles.button, { backgroundColor: '#FF0000' }]} onPress={() => setColor('#FF0000')}>
          <Text style={styles.buttonText}>Red</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { backgroundColor: '#00FF00' }]} onPress={() => setColor('#00FF00')}>
          <Text style={styles.buttonText}>Green</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { backgroundColor: '#0000FF' }]} onPress={() => setColor('#0000FF')}>
          <Text style={styles.buttonText}>Blue</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => setIsEraser(!isEraser)}>
          <Text style={styles.buttonText}>{isEraser ? 'Eraser On' : 'Eraser Off'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => setStrokeWidth((w) => w + 1)}>
          <Text style={styles.buttonText}>+ Width</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => setStrokeWidth((w) => Math.max(1, w - 1))}>
          <Text style={styles.buttonText}>- Width</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { backgroundColor: '#00AA00' }]} onPress={handleOk}>
          <Text style={styles.buttonText}>OK</Text>
        </TouchableOpacity>
      </View>

      {recognizedLabel && (
        <View style={styles.labelContainer}>
          <Text style={styles.labelText}>Recognized: {recognizedLabel}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 10,
    backgroundColor: '#6200EE',
    padding: 10,
    borderRadius: 5,
  },
  backButtonText: { color: '#fff', fontWeight: 'bold' },
  canvasContainer: { flex: 1, backgroundColor: '#fff' },
  drawingArea: { flex: 1, backgroundColor: '#fff' },
  controls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    padding: 10,
    backgroundColor: '#eee',
  },
  button: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#6200EE',
    margin: 5,
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  labelContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
    borderRadius: 10,
  },
  labelText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

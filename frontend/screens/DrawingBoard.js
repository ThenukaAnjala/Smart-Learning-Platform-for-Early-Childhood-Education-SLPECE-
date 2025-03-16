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
  // State for completed strokes
  const [previousStrokes, setPreviousStrokes] = useState([]);
  // Drawing attributes
  const [color, setColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [isEraser, setIsEraser] = useState(false);
  const [recognizedLabel, setRecognizedLabel] = useState(null);

  // Ref for capturing the drawing board
  const viewShotRef = useRef(null);
  // Pen helper
  const [pen] = useState(new Pen());
  // Use a ref for the current stroke to allow drawing over multiple touches.
  const currentStrokeRef = useRef([]);

  // Network configuration: update COMPUTER_IP with your computer’s LAN IP.
  const IS_ANDROID_EMULATOR = false;
  const COMPUTER_IP = '192.168.16.100'; // <-- Replace with your actual LAN IP.
  const BACKEND_URL =
    Platform.OS === 'android'
      ? IS_ANDROID_EMULATOR
        ? 'http://10.0.2.2:5000/predict'
        : `http://${COMPUTER_IP}:5000/predict`
      : Platform.OS === 'ios'
      ? 'http://127.0.0.1:5000/predict'
      : `http://${COMPUTER_IP}:5000/predict`;

  // PanResponder to capture drawing strokes.
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        const strokeColor = isEraser ? '#ffffff' : color;
        currentStrokeRef.current = [{ x: locationX, y: locationY, color: strokeColor }];
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        currentStrokeRef.current.push({ x: locationX, y: locationY });
      },
      onPanResponderRelease: () => {
        if (currentStrokeRef.current.length > 0) {
          setPreviousStrokes((prev) => [
            ...prev,
            {
              points: [...currentStrokeRef.current],
              color: isEraser ? '#ffffff' : color,
              strokeWidth,
            },
          ]);
          currentStrokeRef.current = [];
        }
      },
    })
  ).current;

  // Handle OK press: capture the drawing and upload to backend.
  const handleOk = async () => {
    try {
      // Capture the drawing board as a temporary file.
      const tmpFilePath = await viewShotRef.current.capture({
        format: 'png',
        quality: 0.8,
        result: 'tmpfile',
      });
      console.log('Captured file path:', tmpFilePath);

      // Build FormData for file upload.
      const formData = new FormData();
      formData.append('image', {
        uri: tmpFilePath,
        type: 'image/png',
        name: 'drawing.png',
      });

      // POST the drawing to the backend.
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const data = await response.json();
      console.log('Response from backend:', data);

      if (data.label) {
        setRecognizedLabel(data.label);
        Alert.alert('Prediction', `Recognized: ${data.label}`);
        const label = data.label.toLowerCase();
        // Branch for fish, rabbit, bird are preserved.
        if (label === 'fish' && data.processedBase64) {
          Alert.alert(
            "Fish Head Direction",
            "Which side is the fish's head on?",
            [
              {
                text: "Left",
                onPress: () =>
                  navigation.navigate('FishScreen', {
                    fishImageBase64: data.processedBase64,
                    initialHeadSide: 'left',
                  }),
              },
              {
                text: "Right",
                onPress: () =>
                  navigation.navigate('FishScreen', {
                    fishImageBase64: data.processedBase64,
                    initialHeadSide: 'right',
                  }),
              },
              {
                text: "Wrong",
                onPress: handleReportWrong,
              },
            ]
          );
        } else if (label === 'rabbit' && data.processedBase64) {
          Alert.alert(
            "Rabbit Drawing Type",
            "Is this just a rabbit's head or the entire rabbit?",
            [
              {
                text: "Head Only",
                onPress: () =>
                  navigation.navigate('RabbitScreen', {
                    rabbitImageBase64: data.processedBase64,
                    isHeadOnly: true,
                  }),
              },
              {
                text: "Full Body",
                onPress: () =>
                  Alert.alert(
                    "Rabbit Head Direction",
                    "Which side is the rabbit's head on?",
                    [
                      {
                        text: "Left",
                        onPress: () =>
                          navigation.navigate('RabbitBodyScreen', {
                            rabbitImageBase64: data.processedBase64,
                            isHeadOnly: false,
                            initialHeadSide: 'left',
                          }),
                      },
                      {
                        text: "Right",
                        onPress: () =>
                          navigation.navigate('RabbitBodyScreen', {
                            rabbitImageBase64: data.processedBase64,
                            isHeadOnly: false,
                            initialHeadSide: 'right',
                          }),
                      },
                      {
                        text: "Wrong",
                        onPress: handleReportWrong,
                      },
                    ]
                  ),
              },
              {
                text: "Wrong",
                onPress: handleReportWrong,
              },
            ]
          );
        } else if (label === 'bird' && data.processedBase64) {
          Alert.alert(
            "Bird Head Direction",
            "Which direction is the bird facing?",
            [
              {
                text: "Left",
                onPress: () =>
                  navigation.navigate('BirdScreen', {
                    birdImageBase64: data.processedBase64,
                    initialHeadSide: 'left',
                  }),
              },
              {
                text: "Right",
                onPress: () =>
                  navigation.navigate('BirdScreen', {
                    birdImageBase64: data.processedBase64,
                    initialHeadSide: 'right',
                  }),
              },
              {
                text: "Wrong",
                onPress: handleReportWrong,
              },
            ]
          );
        } else if (label === 'dog' && data.processedBase64) {
          Alert.alert(
            "Dog Head Direction",
            "Which side is the dog's head on?",
            [
              {
                text: "Left",
                onPress: () =>
                  navigation.navigate('DogScreen', {
                    dogImageBase64: data.processedBase64,
                    initialHeadSide: 'left',
                  }),
              },
              {
                text: "Right",
                onPress: () =>
                  navigation.navigate('DogScreen', {
                    dogImageBase64: data.processedBase64,
                    initialHeadSide: 'right',
                  }),
              },
              {
                text: "Wrong",
                onPress: handleReportWrong,
              },
            ]
          );
        } else if (label === 'cat' && data.processedBase64) {
          Alert.alert(
            "Cat Head Direction",
            "Which side is the cat's head on?",
            [
              {
                text: "Left",
                onPress: () =>
                  navigation.navigate('CatScreen', {
                    catImageBase64: data.processedBase64,
                    initialHeadSide: 'left',
                  }),
              },
              {
                text: "Right",
                onPress: () =>
                  navigation.navigate('CatScreen', {
                    catImageBase64: data.processedBase64,
                    initialHeadSide: 'right',
                  }),
              },
              {
                text: "Wrong",
                onPress: handleReportWrong,
              },
            ]
          );
        } else if (label === 'lion' && data.processedBase64) {
          Alert.alert(
            "Lion Head Direction",
            "Which side is the lion's head on?",
            [
              {
                text: "Left",
                onPress: () =>
                  navigation.navigate('LionScreen', {
                    lionImageBase64: data.processedBase64,
                    initialHeadSide: 'left',
                  }),
              },
              {
                text: "Right",
                onPress: () =>
                  navigation.navigate('LionScreen', {
                    lionImageBase64: data.processedBase64,
                    initialHeadSide: 'right',
                  }),
              },
              {
                text: "Wrong",
                onPress: handleReportWrong,
              },
            ]
          );
        } else if (label === 'tiger' && data.processedBase64) {
          Alert.alert(
            "Tiger Head Direction",
            "Which side is the tiger's head on?",
            [
              {
                text: "Left",
                onPress: () =>
                  navigation.navigate('TigerScreen', {
                    tigerImageBase64: data.processedBase64,
                    initialHeadSide: 'left',
                  }),
              },
              {
                text: "Right",
                onPress: () =>
                  navigation.navigate('TigerScreen', {
                    tigerImageBase64: data.processedBase64,
                    initialHeadSide: 'right',
                  }),
              },
              {
                text: "Wrong",
                onPress: handleReportWrong,
              },
            ]
          );
        } else if (label === 'giraffe' && data.processedBase64) {
          Alert.alert(
            "Giraffe Head Direction",
            "Which side is the giraffe's head on?",
            [
              {
                text: "Left",
                onPress: () =>
                  navigation.navigate('GiraffeScreen', {
                    giraffeImageBase64: data.processedBase64,
                    initialHeadSide: 'left',
                  }),
              },
              {
                text: "Right",
                onPress: () =>
                  navigation.navigate('GiraffeScreen', {
                    giraffeImageBase64: data.processedBase64,
                    initialHeadSide: 'right',
                  }),
              },
              {
                text: "Wrong",
                onPress: handleReportWrong,
              },
            ]
          );
        } else if (label === 'cow' && data.processedBase64) {
          Alert.alert(
            "Cow Head Direction",
            "Which side is the cow's head on?",
            [
              {
                text: "Left",
                onPress: () =>
                  navigation.navigate('CowScreen', {
                    cowImageBase64: data.processedBase64,
                    initialHeadSide: 'left',
                  }),
              },
              {
                text: "Right",
                onPress: () =>
                  navigation.navigate('CowScreen', {
                    cowImageBase64: data.processedBase64,
                    initialHeadSide: 'right',
                  }),
              },
              {
                text: "Wrong",
                onPress: handleReportWrong,
              },
            ]
          );
        }
      } else {
        Alert.alert('Error', data.error || 'No label returned.');
      }
    } catch (error) {
      console.error('Error uploading drawing:', error);
      Alert.alert('Error', 'Network request failed. Check your connectivity.');
    }
  };

  // Add a new function to report an incorrect prediction:
  const handleReportWrong = async () => {
    try {
      await fetch(BACKEND_URL + '/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prediction: recognizedLabel, timestamp: new Date().toISOString() }),
      });
      Alert.alert('Reported', 'The model has been informed that the prediction was incorrect.');
    } catch (error) {
      console.error('Error reporting wrong prediction:', error);
    }
  };

  // Clear the drawing board.
  const handleClear = () => {
    setPreviousStrokes([]);
    currentStrokeRef.current = [];
  };

  return (
    <View style={styles.container}>
      {/* Toolbar mimicking Windows Paint */}
      <View style={styles.toolbar}>
        <Text style={styles.toolbarTitle}>Windows Paint</Text>
        <View style={styles.toolbarButtons}>
          <TouchableOpacity style={styles.toolbarButton} onPress={() => setIsEraser(false)}>
            <Text style={styles.buttonLabel}>Pencil</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolbarButton} onPress={() => setIsEraser(true)}>
            <Text style={styles.buttonLabel}>Eraser</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolbarButton} onPress={() => setStrokeWidth((w) => w + 1)}>
            <Text style={styles.buttonLabel}>+ Width</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolbarButton} onPress={() => setStrokeWidth((w) => Math.max(1, w - 1))}>
            <Text style={styles.buttonLabel}>- Width</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolbarButton} onPress={handleClear}>
            <Text style={styles.buttonLabel}>Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolbarButton} onPress={handleOk}>
            <Text style={styles.buttonLabel}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Drawing area capture */}
      <ViewShot style={styles.canvasContainer} ref={viewShotRef}>
        <View style={styles.drawingAreaWrapper}>
          {/* Fixed layer: render completed strokes */}
          <View style={styles.fixedLayer} pointerEvents="none">
            <Svg style={styles.svg}>
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
            </Svg>
          </View>
          {/* Interactive layer: render current stroke */}
          <View style={styles.interactiveLayer} {...panResponder.panHandlers}>
            <Svg style={styles.svg}>
              {currentStrokeRef.current.length > 0 && (
                <Path
                  d={pen.pointsToSvg(currentStrokeRef.current)}
                  stroke={isEraser ? '#ffffff' : color}
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </Svg>
          </View>
        </View>
      </ViewShot>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  toolbar: {
    height: 50,
    width: '100%',
    backgroundColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    zIndex: 15,
  },
  toolbarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  toolbarButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toolbarButton: {
    marginHorizontal: 5,
    paddingVertical: 5,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 3,
  },
  buttonLabel: {
    fontSize: 14,
    color: '#333',
  },
  canvasContainer: { flex: 1, backgroundColor: '#fff' },
  drawingAreaWrapper: { flex: 1 },
  fixedLayer: { ...StyleSheet.absoluteFillObject, zIndex: 1 },
  interactiveLayer: { flex: 1, zIndex: 2 },
  svg: { flex: 1 },
});

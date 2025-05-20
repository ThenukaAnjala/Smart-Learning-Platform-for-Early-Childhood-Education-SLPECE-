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
  Image,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import ViewShot from 'react-native-view-shot';
import * as ImagePicker from 'expo-image-picker';
import Pen from '../components/Pen';

export default function DrawingBoard({ navigation }) {
  // State for completed strokes.
  const [previousStrokes, setPreviousStrokes] = useState([]);
  // Drawing attributes.
  const [color, setColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [isEraser, setIsEraser] = useState(false);
  const [recognizedLabel, setRecognizedLabel] = useState(null);
  // State for an uploaded image URI.
  const [uploadedImage, setUploadedImage] = useState(null);

  // Ref for capturing the drawing board.
  const viewShotRef = useRef(null);
  // Pen helper to convert drawn points into an SVG path.
  const [pen] = useState(new Pen());
  // Ref for the current stroke (to allow multi-stroke drawing).
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

  // Function to pick an image from the gallery.
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Denied', 'Permission to access gallery is required!');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      base64: false,
    });
    if (!result.cancelled) {
      setUploadedImage(result.uri);
    }
  };

  // Shared function to process prediction response from backend.
  const processPrediction = (data) => {
    console.log('Response from backend:', data);
    if (data.label) {
      setRecognizedLabel(data.label);
      Alert.alert('Prediction', `Recognized: ${data.label}`);
      const label = data.label.toLowerCase();
      // Branch logic for various labels (fish, rabbit, bird, etc.) remains unchanged.
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
              onPress: () => handleReportWrong(),
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
                      onPress: () => handleReportWrong(),
                    },
                  ]
                ),
            },
            {
              text: "Wrong",
              onPress: () => handleReportWrong(),
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
              onPress: () => handleReportWrong(),
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
              onPress: () => handleReportWrong(),
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
              onPress: () => handleReportWrong(),
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
              onPress: () => handleReportWrong(),
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
              onPress: () => handleReportWrong(),
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
              onPress: () => handleReportWrong(),
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
              onPress: () => handleReportWrong(),
            },
          ]
        );
      }
    } else {
      Alert.alert('Error', data.error || 'No label returned.');
    }
  };

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
      });
      const data = await response.json();
      processPrediction(data);
    } catch (error) {
      console.error('Error uploading drawing:', error);
      Alert.alert('Error', 'Network request failed. Check your connectivity.');
    }
  };

  // Handle Upload Photo press – pick an image from the gallery, then send to backend.
  const handleUploadPhoto = async () => {
    try {
      const options = {
        mediaType: ImagePicker.MediaTypeOptions.Images,
        selectionLimit: 1,
      };
      const result = await ImagePicker.launchImageLibraryAsync(options);
      if (result.cancelled || !result.assets || result.assets.length === 0) return;

      const asset = result.assets[0];
      const { uri, type } = asset;
      setUploadedImage(uri); // Immediately display the uploaded image.

      // Build FormData for file upload.
      const formData = new FormData();
      formData.append('image', {
        uri,
        type: type || 'image/jpeg',
        name: 'upload.jpg',
      });

      // POST the photo to the backend's /upload endpoint.
      const response = await fetch(BACKEND_URL + '/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      processPrediction(data);
    } catch (error) {
      console.error('Error uploading photo:', error);
      Alert.alert('Error', 'Network request failed. Check your connectivity.');
    }
  };

  // Report an incorrect prediction.
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
    setUploadedImage(null);
  };

  return (
    <View style={styles.container}>
      {/* Toolbar mimicking Windows Paint */}
      <View style={styles.toolbar}>
        {/* <Text style={styles.toolbarTitle}>Windows Paint</Text> */}
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
          <TouchableOpacity style={styles.toolbarButton} onPress={handleUploadPhoto}>
            <Text style={styles.buttonLabel}>Upload Photo</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Drawing area capture */}
      <ViewShot style={styles.canvasContainer} ref={viewShotRef}>
        <View style={styles.drawingAreaWrapper}>
          {/* If an image was uploaded, display it as a background */}
          {uploadedImage && (
            <Image source={{ uri: uploadedImage }} style={styles.uploadedImage} resizeMode="contain" />
          )}
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
    height: 54,
    width: '100%',
    backgroundColor: '#f5f5f7',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#b0b0b0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 3,
    zIndex: 15,
    // Optional: rounded top corners for a softer look
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  toolbarButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  toolbarButton: {
    marginHorizontal: 6,
    paddingVertical: 7,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#b0b0b0',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 1,
    elevation: 1,
    // Simulate a button press effect
    // (for actual press feedback, use TouchableOpacity's activeOpacity)
  },
  buttonLabel: {
    fontSize: 15,
    color: '#222',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  canvasContainer: { flex: 1, backgroundColor: '#fff' },
  drawingAreaWrapper: { flex: 1 },
  fixedLayer: { ...StyleSheet.absoluteFillObject, zIndex: 1 },
  interactiveLayer: { flex: 1, zIndex: 2 },
  svg: { flex: 1 },
  uploadedImage: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
});

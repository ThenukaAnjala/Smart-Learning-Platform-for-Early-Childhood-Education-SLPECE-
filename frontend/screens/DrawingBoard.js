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
  Modal,
  Pressable,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import ViewShot from 'react-native-view-shot';
import * as ImagePicker from 'expo-image-picker';
import Pen from '../components/Pen';
import { LinearGradient } from 'expo-linear-gradient';

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
  // Add state for child-friendly modal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalQuestion, setModalQuestion] = useState("");
  const [modalOptions, setModalOptions] = useState([]);

  // Ref for capturing the drawing board.
  const viewShotRef = useRef(null);
  // Pen helper to convert drawn points into an SVG path.
  const [pen] = useState(new Pen());
  // Ref for the current stroke (to allow multi-stroke drawing).
  const currentStrokeRef = useRef([]);

  // Network configuration: update COMPUTER_IP with your computer’s LAN IP.
  const IS_ANDROID_EMULATOR = false;
  const COMPUTER_IP = '172.28.0.164'; // <-- Replace with your actual LAN IP.
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
      // Alert.alert('Prediction', `Recognized: ${data.label}`);
      const label = data.label.toLowerCase();
      // Branch logic for various labels (fish, rabbit, bird, etc.) remains unchanged.
      if (label === 'fish' && data.processedBase64) {
        showChildModal(
          "Which side is the fish's head on?",
          [
            {
              label: "Left",
              icon: "🐟⬅️",
              onPress: () => {
                setModalVisible(false);
                navigation.navigate('FishScreen', {
                  fishImageBase64: data.processedBase64,
                  initialHeadSide: 'left',
                });
              },
            },
            {
              label: "Right",
              icon: "🐟➡️",
              onPress: () => {
                setModalVisible(false);
                navigation.navigate('FishScreen', {
                  fishImageBase64: data.processedBase64,
                  initialHeadSide: 'right',
                });
              },
            },
            {
              label: "Wrong",
              icon: "❌",
              onPress: () => {
                setModalVisible(false);
                handleReportWrong();
              },
            },
          ]
        );
      } else if (label === 'rabbit' && data.processedBase64) {
        showChildModal(
          "Is this just a rabbit's head or the entire rabbit?",
          [
            {
              label: "Head Only",
              icon: "🐰",
              onPress: () => {
                setModalVisible(false);
                navigation.navigate('RabbitScreen', {
                  rabbitImageBase64: data.processedBase64,
                  isHeadOnly: true,
                });
              },
            },
            {
              label: "Full Body",
              icon: "🐇",
              onPress: () => {
                setModalVisible(false);
                showChildModal(
                  "Which side is the rabbit's head on?",
                  [
                    {
                      label: "Left",
                      icon: "🐇⬅️",
                      onPress: () => {
                        setModalVisible(false);
                        navigation.navigate('RabbitBodyScreen', {
                          rabbitImageBase64: data.processedBase64,
                          isHeadOnly: false,
                          initialHeadSide: 'left',
                        });
                      },
                    },
                    {
                      label: "Right",
                      icon: "🐇➡️",
                      onPress: () => {
                        setModalVisible(false);
                        navigation.navigate('RabbitBodyScreen', {
                          rabbitImageBase64: data.processedBase64,
                          isHeadOnly: false,
                          initialHeadSide: 'right',
                        });
                      },
                    },
                    {
                      label: "Wrong",
                      icon: "❌",
                      onPress: () => {
                        setModalVisible(false);
                        handleReportWrong();
                      },
                    },
                  ]
                );
              },
            },
            {
              label: "Wrong",
              icon: "❌",
              onPress: () => {
                setModalVisible(false);
                handleReportWrong();
              },
            },
          ]
        );
      } else if (label === 'bird' && data.processedBase64) {
        showChildModal(
          "Which direction is the bird facing?",
          [
            {
              label: "Left",
              icon: "🐦⬅️",
              onPress: () => {
                setModalVisible(false);
                navigation.navigate('BirdScreen', {
                  birdImageBase64: data.processedBase64,
                  initialHeadSide: 'left',
                });
              },
            },
            {
              label: "Right",
              icon: "🐦➡️",
              onPress: () => {
                setModalVisible(false);
                navigation.navigate('BirdScreen', {
                  birdImageBase64: data.processedBase64,
                  initialHeadSide: 'right',
                });
              },
            },
            {
              label: "Wrong",
              icon: "❌",
              onPress: () => {
                setModalVisible(false);
                handleReportWrong();
              },
            },
          ]
        );
      } else if (label === 'dog' && data.processedBase64) {
        showChildModal(
          "Which side is the dog's head on?",
          [
            {
              label: "Left",
              icon: "🐶⬅️",
              onPress: () => {
                setModalVisible(false);
                navigation.navigate('DogScreen', {
                  dogImageBase64: data.processedBase64,
                  initialHeadSide: 'left',
                });
              },
            },
            {
              label: "Right",
              icon: "🐶➡️",
              onPress: () => {
                setModalVisible(false);
                navigation.navigate('DogScreen', {
                  dogImageBase64: data.processedBase64,
                  initialHeadSide: 'right',
                });
              },
            },
            {
              label: "Wrong",
              icon: "❌",
              onPress: () => {
                setModalVisible(false);
                handleReportWrong();
              },
            },
          ]
        );
      } else if (label === 'cat' && data.processedBase64) {
        showChildModal(
          "Which side is the cat's head on?",
          [
            {
              label: "Left",
              icon: "🐱⬅️",
              onPress: () => {
                setModalVisible(false);
                navigation.navigate('CatScreen', {
                  catImageBase64: data.processedBase64,
                  initialHeadSide: 'left',
                });
              },
            },
            {
              label: "Right",
              icon: "🐱➡️",
              onPress: () => {
                setModalVisible(false);
                navigation.navigate('CatScreen', {
                  catImageBase64: data.processedBase64,
                  initialHeadSide: 'right',
                });
              },
            },
            {
              label: "Wrong",
              icon: "❌",
              onPress: () => {
                setModalVisible(false);
                handleReportWrong();
              },
            },
          ]
        );
      } else if (label === 'lion' && data.processedBase64) {
        showChildModal(
          "Which side is the lion's head on?",
          [
            {
              label: "Left",
              icon: "🦁⬅️",
              onPress: () => {
                setModalVisible(false);
                navigation.navigate('LionScreen', {
                  lionImageBase64: data.processedBase64,
                  initialHeadSide: 'left',
                });
              },
            },
            {
              label: "Right",
              icon: "🦁➡️",
              onPress: () => {
                setModalVisible(false);
                navigation.navigate('LionScreen', {
                  lionImageBase64: data.processedBase64,
                  initialHeadSide: 'right',
                });
              },
            },
            {
              label: "Wrong",
              icon: "❌",
              onPress: () => {
                setModalVisible(false);
                handleReportWrong();
              },
            },
          ]
        );
      } else if (label === 'tiger' && data.processedBase64) {
        showChildModal(
          "Which side is the tiger's head on?",
          [
            {
              label: "Left",
              icon: "🐯⬅️",
              onPress: () => {
                setModalVisible(false);
                navigation.navigate('TigerScreen', {
                  tigerImageBase64: data.processedBase64,
                  initialHeadSide: 'left',
                });
              },
            },
            {
              label: "Right",
              icon: "🐯➡️",
              onPress: () => {
                setModalVisible(false);
                navigation.navigate('TigerScreen', {
                  tigerImageBase64: data.processedBase64,
                  initialHeadSide: 'right',
                });
              },
            },
            {
              label: "Wrong",
              icon: "❌",
              onPress: () => {
                setModalVisible(false);
                handleReportWrong();
              },
            },
          ]
        );
      } else if (label === 'giraffe' && data.processedBase64) {
        showChildModal(
          "Which side is the giraffe's head on?",
          [
            {
              label: "Left",
              icon: "🦒⬅️",
              onPress: () => {
                setModalVisible(false);
                navigation.navigate('GiraffeScreen', {
                  giraffeImageBase64: data.processedBase64,
                  initialHeadSide: 'left',
                });
              },
            },
            {
              label: "Right",
              icon: "🦒➡️",
              onPress: () => {
                setModalVisible(false);
                navigation.navigate('GiraffeScreen', {
                  giraffeImageBase64: data.processedBase64,
                  initialHeadSide: 'right',
                });
              },
            },
            {
              label: "Wrong",
              icon: "❌",
              onPress: () => {
                setModalVisible(false);
                handleReportWrong();
              },
            },
          ]
        );
      } else if (label === 'cow' && data.processedBase64) {
        showChildModal(
          "Which side is the cow's head on?",
          [
            {
              label: "Left",
              icon: "🐮⬅️",
              onPress: () => {
                setModalVisible(false);
                navigation.navigate('CowScreen', {
                  cowImageBase64: data.processedBase64,
                  initialHeadSide: 'left',
                });
              },
            },
            {
              label: "Right",
              icon: "🐮➡️",
              onPress: () => {
                setModalVisible(false);
                navigation.navigate('CowScreen', {
                  cowImageBase64: data.processedBase64,
                  initialHeadSide: 'right',
                });
              },
            },
            {
              label: "Wrong",
              icon: "❌",
              onPress: () => {
                setModalVisible(false);
                handleReportWrong();
              },
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

  // Helper to show child-friendly modal
  const showChildModal = (question, options) => {
    setModalQuestion(question);
    setModalOptions(options);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      {/* Toolbar mimicking Windows Paint */}
      <LinearGradient
        colors={["#a8edea", "#fed6e3", "#fcb69f"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.toolbar}
      >
        {/* <Text style={styles.toolbarTitle}>Windows Paint</Text> */}
        <View style={styles.toolbarButtons}>
          <TouchableOpacity style={[styles.toolbarButton, !isEraser && styles.activeButton]} onPress={() => setIsEraser(false)} activeOpacity={0.7}>
            <Text style={[styles.buttonLabel, !isEraser && styles.activeButtonLabel]}>✏️</Text>
          </TouchableOpacity>
          
          {/* <TouchableOpacity style={styles.toolbarButton} onPress={() => setStrokeWidth((w) => w + 1)} activeOpacity={0.7}>
            <Text style={styles.buttonLabel}>＋</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolbarButton} onPress={() => setStrokeWidth((w) => Math.max(1, w - 1))} activeOpacity={0.7}>
            <Text style={styles.buttonLabel}>－</Text>
          </TouchableOpacity> */}
          <TouchableOpacity style={styles.toolbarButton} onPress={handleClear} activeOpacity={0.7}>
            <Text style={styles.buttonLabel}>🗑️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolbarButton} onPress={handleOk} activeOpacity={0.7}>
            <Text style={styles.buttonLabel}>✅</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolbarButton} onPress={handleUploadPhoto} activeOpacity={0.7}>
            <Text style={styles.buttonLabel}>📷</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

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

      {/* Child-friendly modal for animal questions */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: '#f7faff', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 0, paddingVertical: 40, paddingHorizontal: 20, alignItems: 'center', width: '100%', height: '100%', justifyContent: 'center', elevation: 8, marginHorizontal: 0 }}>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#f68084', marginBottom: 36, marginTop: 4, textAlign: 'center', paddingHorizontal: 8 }}>{modalQuestion}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 32, marginTop: 10, marginBottom: 2 }}>
              {modalOptions.map((opt, idx) => (
                <Pressable
                  key={idx}
                  onPress={opt.onPress}
                  style={({ pressed }) => [{
                    backgroundColor: pressed ? '#fcb69f' : '#f7faff',
                    borderRadius: 24,
                    paddingVertical: 32,
                    paddingHorizontal: 32,
                    marginHorizontal: 18,
                    alignItems: 'center',
                    justifyContent: 'center',
                    elevation: 2,
                    borderWidth: 2,
                    borderColor: '#fcb69f',
                  }]}
                >
                  <Text style={{ fontSize: 48, marginBottom: 8 }}>{opt.icon}</Text>
                  <Text style={{ fontSize: 22, color: '#444', fontWeight: 'bold', marginTop: 2 }}>{opt.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  toolbar: {
    height: 60,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 15,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    marginBottom: 2,
  },
  toolbarButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    gap: 10,
  },
  toolbarButton: {
    marginHorizontal: 4,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    // Add scale effect on press (handled by activeOpacity)
  },
  activeButton: {
    backgroundColor: '#fcb69f',
    borderColor: '#f68084',
    shadowColor: '#fcb69f',
    shadowOpacity: 0.25,
  },
  buttonLabel: {
    fontSize: 22,
    color: '#444',
    fontWeight: 'bold',
    letterSpacing: 0.2,
  },
  activeButtonLabel: {
    color: '#fff',
    textShadowColor: '#f68084',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
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

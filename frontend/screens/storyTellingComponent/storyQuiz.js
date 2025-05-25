import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Vibration,
  Animated,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import DraggableFlatList from "react-native-draggable-flatlist";
import { api4010 } from "../storyTellingComponent/axiosInstance";
import * as ScreenOrientation from "expo-screen-orientation";
import { useFocusEffect } from "@react-navigation/native";
import { BackHandler } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LottieView from 'lottie-react-native';
import QuizAnimation from '../../assets/storyAnimation/QuizAnimation.json';
import IncorrectQuiz from '../../assets/storyAnimation/IncorrectQuiz.json';
import { Audio } from "expo-av";
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get("window");
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const StoryQuiz = ({ route }) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { storyId } = route?.params;
  const [storySections, setStorySections] = useState([]);
  const [shuffledSections, setShuffledSections] = useState([]);
  const [fixedNumbers, setFixedNumbers] = useState([]);
  const [showAnimation, setShowAnimation] = useState(false);
  const [showIncorrectAnimation, setShowIncorrectAnimation] = useState(false);
  const [screenWidth, setScreenWidth] = useState(Dimensions.get("window").width);
  const [screenHeight, setScreenHeight] = useState(Dimensions.get("window").height);
  const [shakeIndex, setShakeIndex] = useState(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const onChange = ({ window }) => {
      setScreenWidth(window.width);
      setScreenHeight(window.height);
    };
    const subscription = Dimensions.addEventListener("change", onChange);
    return () => subscription.remove();
  }, []);

  const setOrientation = async (orientation) => {
    try {
      await ScreenOrientation.lockAsync(orientation);
    } catch (error) {
      console.error("Error setting orientation:", error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      setOrientation(ScreenOrientation.OrientationLock.PORTRAIT);
      return () => {
        
      };
    }, [])
  );

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.replace('SingleStory', { storyId });
        return true;
      };
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => {
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
      };
    }, [navigation, storyId])
  );

  useEffect(() => {
    const fetchStorySections = async () => {
      try {
        const response = await api4010.get(`/story-liabrary/stories/${storyId}`);
        setStorySections(response.data.storySection);
        setShuffledSections(shuffleArray(response.data.storySection));
        setFixedNumbers(Array.from({ length: response.data.storySection.length }, (_, i) => i + 1));
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

  const playSuccessAudio = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/storyAnimation/congratulations.mp3'),
        { shouldPlay: true }
      );
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.error("Audio playback error:", error);
    }
  };

  const playErrorAudio = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/storyAnimation/tryAgain.mp3'),
        { shouldPlay: true }
      );
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.error("Audio playback error:", error);
    }
  };

  const checkOrder = () => {
    for (let i = 0; i < storySections.length; i++) {
      if (shuffledSections[i]?._id !== storySections[i]?._id) {
        playErrorAudio();
        setShowIncorrectAnimation(true);
        setTimeout(() => setShowIncorrectAnimation(false), 5000);
        return;
      }
    }
    setShowAnimation(true);
    playSuccessAudio();
    setTimeout(() => setShowAnimation(false), 5000);
  };

  const renderItem = ({ item, drag, isActive, index }) => {
    const isShaking = shakeIndex === index;
    const animatedStyle = isShaking
      ? {
          transform: [
            {
              translateX: shakeAnim.interpolate({
                inputRange: [-1, 1],
                outputRange: [-15, 15],
              }),
            },
          ],
          shadowColor: 'red',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 10,
          elevation: 10,
          borderColor: 'red',
          borderWidth: 3,
        }
      : {};

    return (
      <View style={styles(screenWidth, screenHeight).itemRow}>
        <AnimatedTouchable
          style={[
            styles(screenWidth, screenHeight).item,
            { backgroundColor: isActive ? "#f0f0f0" : "#fff" },
            animatedStyle,
          ]}
          onLongPress={drag}
          delayLongPress={80}
          activeOpacity={0.9}
        >
          <Image
            style={styles(screenWidth, screenHeight).image}
            source={{ uri: item.storyImage }}
            resizeMode="cover"
          />
        </AnimatedTouchable>
      </View>
    );
  };

  const handleDragEnd = ({ data, from, to }) => {
    const newData = [...shuffledSections];
    const movedItem = newData.splice(from, 1)[0];
    newData.splice(to, 0, movedItem);
    setShuffledSections(newData);

    let isCorrect = true;
    let wrongIndex = null;
    for (let i = 0; i < storySections.length; i++) {
      if (newData[i]?._id !== storySections[i]?._id) {
        isCorrect = false;
        wrongIndex = i;
        break;
      }
    }
    if (!isCorrect) {
      Vibration.vibrate(200);
      setShakeIndex(wrongIndex);
      shakeAnim.setValue(0);
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -1, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
      ]).start(() => setShakeIndex(null));
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f7fa" }}>
      {showAnimation && (
        <View style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 999,
        }}>
          <LottieView
            source={QuizAnimation}
            autoPlay
            loop={false}
            style={{ width: 500, height: 500 }}
            onAnimationFinish={() => setShowAnimation(false)}
          />
        </View>
      )}

      {showIncorrectAnimation && (
        <View style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 999,
        }}>
          <LottieView
            source={IncorrectQuiz}
            autoPlay
            loop={false}
            style={{ width: 400, height: 400 }}
            onAnimationFinish={() => setShowIncorrectAnimation(false)}
          />
        </View>
      )}

      <View style={styles(screenWidth, screenHeight).container}>
        {/* Title row with back button and centered title */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 50, marginBottom: 10 }}>
          <View style={{ flex: 1, alignItems: 'flex-start' }}>
            <TouchableOpacity
              style={{ paddingHorizontal: 10 }}
              onPress={() => navigation.navigate('StoryTellingHome')}
            >
              <Ionicons name="arrow-back" size={28} color="#0078ff" />
            </TouchableOpacity>
          </View>
          <View style={{ flex: 3, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={[styles(screenWidth, screenHeight).title, { marginTop: 0, marginBottom: 0 }]}>
              Reorder the Images
            </Text>
          </View>
          <View style={{ flex: 1 }} /> {/* Spacer for symmetry */}
        </View>
        <View style={{ flex: 1, flexDirection: 'row' }}>
          {/* Numbers and images scroll together */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1, flexDirection: 'row' }}
            showsVerticalScrollIndicator={false}
          >
            {/* Fixed number column */}
            <View style={{ justifyContent: 'flex-start', alignItems: 'center', width: 100 }}>
              {shuffledSections.map((section, idx) => {
                const isCorrect = storySections[idx]?._id === section?._id;
                return (
                  <View
                    key={idx}
                    style={[
                      styles(screenWidth, screenHeight).numberContainer,
                      isCorrect && { backgroundColor: '#2ecc40' },
                    ]}
                  >
                    <Text style={styles(screenWidth, screenHeight).numberText}>
                      {idx + 1}
                    </Text>
                  </View>
                );
              })}
            </View>
            {/* Draggable images column */}
            <View style={{ flex: 1 }}>
              <DraggableFlatList
                data={shuffledSections}
                keyExtractor={(item, index) =>
                  item._id ? item._id.toString() : index.toString()
                }
                onDragEnd={handleDragEnd}
                activationDistance={8}
                animationType="spring"
                animationConfig={{
                  damping: 20,
                  mass: 0.8,
                  stiffness: 120,
                  overshootClamping: false,
                  restDisplacementThreshold: 0.01,
                  restSpeedThreshold: 0.01,
                }}
                renderPlaceholder={() => (
                  <View style={[styles(screenWidth, screenHeight).itemRow]}>
                    <View style={[styles(screenWidth, screenHeight).item, { opacity: 0.3 }]} />
                  </View>
                )}
                renderItem={renderItem}
                scrollEnabled={false}
              />
            </View>
          </ScrollView>
        </View>
        <TouchableOpacity
          style={styles(screenWidth, screenHeight).button}
          onPress={checkOrder}
        >
          <Text style={styles(screenWidth, screenHeight).buttonText}>
            Check Order
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = (screenWidth, screenHeight) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 0,
      backgroundColor: "#f5f7fa",
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: "#333",
      textAlign: "center",
      marginVertical: 1,
      marginTop: 0,
      paddingBottom: 20,
    },
    image: {
      width: screenWidth * 0.7,
      height: screenHeight * 0.35,
      backgroundColor: "white",
    },
    button: {
      backgroundColor: "#0078ff",
      padding: 15,
      borderRadius: 10,
      alignItems: "center",
      marginVertical: 15,
      marginHorizontal: 20,
    },
    buttonText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 16,
    },
    itemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 10,
      paddingHorizontal: 5,
      position: 'relative',
    },
    numberContainer: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: '#0078ff',
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: 140,
    },
    numberText: {
      color: '#ffffff',
      fontSize: 28,
      fontWeight: 'bold',
    },
    item: {
      width: screenWidth * 0.7,
      height: screenHeight * 0.35,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 8,
      borderWidth: 1,
      backgroundColor: "#fff",
      padding: 0,
      marginVertical: 0,
      overflow: "hidden",
    },
    fixedNumberContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#0078ff',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 15,
      position: 'absolute',
      left: 15,
      zIndex: 1,
    },
  });

export default StoryQuiz;
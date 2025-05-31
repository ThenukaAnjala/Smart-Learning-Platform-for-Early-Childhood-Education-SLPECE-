import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, PanResponder, Dimensions, Animated, TouchableOpacity, TouchableWithoutFeedback, Image, Vibration } from 'react-native';
import { Audio } from 'expo-av';

const { width, height } = Dimensions.get('window');
const ELEMENT_SIZE = 80;
const ELEMENT_SPACING = 10;
const TOP_OFFSET = 100;
const BOTTOM_OFFSET = 120;
const RIGHT_OFFSET = 0;
const MAX_ATTEMPTS = 1000;
const TIMER_DURATION = 15;

// Static mapping of audio files
const audioFiles = {
  1: require('../../assets/audio/find_number_1.mp3'),
  2: require('../../assets/audio/find_number_2.mp3'),
  3: require('../../assets/audio/find_number_3.mp3'),
  4: require('../../assets/audio/find_number_4.mp3'),
  5: require('../../assets/audio/find_number_5.mp3'),
  6: require('../../assets/audio/find_number_6.mp3'),
  7: require('../../assets/audio/find_number_7.mp3'),
  8: require('../../assets/audio/find_number_8.mp3'),
  9: require('../../assets/audio/find_number_9.mp3'),
  10: require('../../assets/audio/find_number_10.mp3'),
  great_job: require('../../assets/audio/great_job.mp3'),
  try_again: require('../../assets/audio/try_again.mp3'),
  time_up: require('../../assets/audio/time_up.mp3'),
};

// Custom Toast Component
const Toast = ({ visible, message, onDismiss, isCorrect }) => {
    const [fadeAnim] = useState(new Animated.Value(0));
    const [scaleAnim] = useState(new Animated.Value(0.5));

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
                Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }),
            ]).start();
        } else {
            Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
        }
    }, [visible, fadeAnim, scaleAnim]);

    if (!visible) return null;

    return (
        <Animated.View
            style={[
                styles.toastContainer,
                { opacity: fadeAnim, transform: [{ scale: scaleAnim }], backgroundColor: isCorrect ? '#FF5722' : '#F44336' },
            ]}
        >
            <Text style={styles.toastText}>{message}</Text>
            {isCorrect && (
                <TouchableOpacity onPress={onDismiss} style={styles.nextButton}>
                    <Text style={styles.nextButtonText}>🎉 Next Challenge!</Text>
                </TouchableOpacity>
            )}
        </Animated.View>
    );
};

// Timer Component
const Timer = ({ timeLeft, isTimeUp }) => {
    return (
        <View style={styles.timerContainer}>
            <Text style={styles.timerText}>⏰ {timeLeft}s</Text>
            {isTimeUp && <Text style={styles.timeUpText}>Time's Up!</Text>}
        </View>
    );
};

// Draggable Element Component
const DraggableElement = ({ id, number, x, y, onDrop, onTouch, isTarget, isTimeUp }) => {
    const pan = useRef(new Animated.ValueXY()).current;

    useEffect(() => {
        pan.setValue({ x, y });
    }, [x, y]);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => !isTimeUp,
            onPanResponderGrant: () => {
                pan.setOffset({ x: pan.x._value, y: pan.y._value });
                pan.setValue({ x: 0, y: 0 });
            },
            onPanResponderMove: Animated.event(
                [null, { dx: pan.x, dy: pan.y }],
                {
                    useNativeDriver: false,
                    listener: (event, gestureState) => {
                        const newX = Math.max(0, Math.min(gestureState.dx + pan.x._offset, width - ELEMENT_SIZE));
                        const newY = Math.max(0, Math.min(gestureState.dy + pan.y._offset, height - ELEMENT_SIZE));
                        pan.setValue({ x: newX - pan.x._offset, y: newY - pan.y._offset });
                    },
                }
            ),
            onPanResponderRelease: () => {
                pan.flattenOffset();
                onDrop(id, pan.x._value, pan.y._value);
            },
        })
    ).current;

    return (
        <Animated.View
            style={[
                styles.element,
                { transform: pan.getTranslateTransform() },
                isTimeUp && isTarget && styles.targetElement,
            ]}
            {...panResponder.panHandlers}
        >
            <TouchableOpacity onPress={() => onTouch(number, isTimeUp)}>
                <Text style={styles.elementText}>{number}</Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

// Sea Background Component
const SeaBackground = ({ isDarkMode }) => {
    const waveAnim = useRef(new Animated.Value(0)).current;
    const NUMBER_OF_FISH = 25;
    const fishAnimations = useRef(
        Array.from({ length: NUMBER_OF_FISH }, (_, index) => ({
            x: new Animated.Value(-50),
            y: new Animated.Value(Math.random() * (height - 150)),
            direction: new Animated.Value(1),
        }))
    ).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(waveAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
                Animated.timing(waveAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
            ])
        ).start();

        fishAnimations.forEach((fish, index) => {
            Animated.loop(
                Animated.sequence([
                    Animated.parallel([
                        Animated.timing(fish.x, { toValue: width + 50, duration: 8000 + index * 300, useNativeDriver: true }),
                        Animated.timing(fish.direction, { toValue: 1, duration: 0, useNativeDriver: true }),
                    ]),
                    Animated.timing(fish.y, { toValue: Math.random() * (height - 150), duration: 2000, useNativeDriver: true }),
                    Animated.parallel([
                        Animated.timing(fish.x, { toValue: -50, duration: 8000 + index * 300, useNativeDriver: true }),
                        Animated.timing(fish.direction, { toValue: -1, duration: 0, useNativeDriver: true }),
                    ]),
                ])
            ).start();
        });
    }, [waveAnim]);

    const handleFishPress = (fish) => {
        Animated.parallel([
            Animated.spring(fish.x, { toValue: Math.random() * width, friction: 3, useNativeDriver: true }),
            Animated.spring(fish.y, { toValue: Math.random() * (height - 150), friction: 3, useNativeDriver: true }),
            Animated.timing(fish.direction, { toValue: fish.x._value < Math.random() * width ? 1 : -1, duration: 0, useNativeDriver: true }),
        ]).start();
    };

    return (
        <View style={[styles.seaBackground, { backgroundColor: isDarkMode ? '#0A2E38' : '#00CED1' }]}>
            <Animated.View style={[styles.wave, { transform: [{ translateY: waveAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 20] }) }], backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.3)' }]} />
            <Animated.View style={[styles.wave, { transform: [{ translateY: waveAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -20] }) }], backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.3)' }]} />
            {fishAnimations.map((fish, index) => (
                <TouchableWithoutFeedback key={index} onPress={() => handleFishPress(fish)}>
                    <Animated.View
                        style={{
                            position: 'absolute',
                            width: 60,
                            height: 60,
                            transform: [{ translateX: fish.x }, { translateY: fish.y }, { scaleX: fish.direction }],
                        }}
                    >
                        <Image source={require('../../assets/images/blue_fish.png')} style={styles.fishImage} />
                    </Animated.View>
                </TouchableWithoutFeedback>
            ))}
        </View>
    );
};

// Main Component
const OrderIrrelevance = ({ navigation }) => { // Added navigation prop
    const [elements, setElements] = useState([]);
    const [targetNumber, setTargetNumber] = useState(null);
    const [toastVisible, setToastVisible] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [isCorrect, setIsCorrect] = useState(false);
    const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
    const [isTimeUp, setIsTimeUp] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const targetAnim = useRef(new Animated.Value(0)).current;
    const soundObject = useRef(null);

    useEffect(() => {
        // Initialize audio
        const loadSound = async () => {
            soundObject.current = new Audio.Sound();
        };
        loadSound();

        initializeElements();

        return () => {
            // Unload sound when component unmounts
            if (soundObject.current) {
                soundObject.current.unloadAsync();
            }
        };
    }, []);

    const playSound = async (soundFile) => {
        try {
            if (soundObject.current) {
                await soundObject.current.unloadAsync();
                await soundObject.current.loadAsync(soundFile);
                await soundObject.current.playAsync();
                console.log('Sound played successfully:', soundFile);
            }
        } catch (error) {
            console.log('Error playing sound:', error);
        }
    };

    const placeElementRandomly = (existingElements, currentX, currentY) => {
        const availableWidth = width - RIGHT_OFFSET - ELEMENT_SIZE;
        const availableHeight = height - TOP_OFFSET - BOTTOM_OFFSET - ELEMENT_SIZE;
        const minDistance = ELEMENT_SIZE + ELEMENT_SPACING;
        let attempts = 0;
        let newX, newY;

        do {
            newX = Math.random() * availableWidth;
            newY = TOP_OFFSET + Math.random() * availableHeight;
            attempts++;
        } while (
            attempts < MAX_ATTEMPTS &&
            (existingElements.some((el) =>
                Math.sqrt(Math.pow(newX - el.x, 2) + Math.pow(newY - el.y, 2)) < minDistance
            ) || (Math.abs(newX - currentX) < minDistance && Math.abs(newY - currentY) < minDistance))
        );

        if (attempts >= MAX_ATTEMPTS) {
            console.warn("Max attempts reached for element placement!");
            return null;
        }

        return { x: newX, y: newY };
    };

    const initializeElements = () => {
        const newElements = [];
        for (let i = 1; i <= 10; i++) {
            const position = placeElementRandomly(newElements);
            if (position) {
                newElements.push({ id: i, number: i, ...position });
            }
        }

        if (newElements.length < 10) {
            console.warn("Not all elements could be placed due to space constraints!");
        }

        setElements(newElements);
        const newTargetNumber = Math.floor(Math.random() * newElements.length) + 1;
        setTargetNumber(newTargetNumber);
        setTimeLeft(TIMER_DURATION);
        setIsTimeUp(false);
        setIsCorrect(false);
        setToastVisible(false);
        animateTargetNumber();

        console.log('Playing target number:', newTargetNumber);
        playSound(audioFiles[newTargetNumber]);
    };

    useEffect(() => {
        if (timeLeft > 0 && !isCorrect) {
            const timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        setIsTimeUp(true);
                        clearInterval(timer);
                        setToastMessage(`⏰ Time's up! Tap ${targetNumber} to continue.`);
                        setToastVisible(true);
                        console.log('Playing time up message');
                        playSound(audioFiles.time_up);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [timeLeft, isCorrect, targetNumber]);

    const shuffleElements = () => {
        if (isTimeUp) return;
        setElements((prevElements) => {
            const shuffledElements = [...prevElements];
            for (let i = shuffledElements.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                const tempX = shuffledElements[i].x;
                const tempY = shuffledElements[i].y;
                shuffledElements[i].x = shuffledElements[j].x;
                shuffledElements[i].y = shuffledElements[j].y;
                shuffledElements[j].x = tempX;
                shuffledElements[j].y = tempY;
            }

            prevElements.forEach((original, index) => {
                if (original.x === shuffledElements[index].x && original.y === shuffledElements[index].y) {
                    const nextIndex = (index + 1) % shuffledElements.length;
                    const tempX = shuffledElements[index].x;
                    const tempY = shuffledElements[index].y;
                    shuffledElements[index].x = shuffledElements[nextIndex].x;
                    shuffledElements[index].y = shuffledElements[nextIndex].y;
                    shuffledElements[nextIndex].x = tempX;
                    shuffledElements[nextIndex].y = tempY;
                }
            });

            const newTargetNumber = Math.floor(Math.random() * shuffledElements.length) + 1;
            setTargetNumber(newTargetNumber);
            setTimeLeft(TIMER_DURATION);
            setIsTimeUp(false);
            animateTargetNumber();

            console.log('Playing new target number after shuffle:', newTargetNumber);
            playSound(audioFiles[newTargetNumber]);

            return shuffledElements;
        });
    };

    const handleDrop = (id, newX, newY) => {
        if (isTimeUp) return;
        setElements((prevElements) => prevElements.map((el) => (el.id === id ? { ...el, x: newX, y: newY } : el)));
    };

    const handleTouch = (number, timeUp) => {
        if (timeUp) {
            if (number === targetNumber) {
                console.log('Playing time up tap confirmation');
                playSound(audioFiles.time_up);
                initializeElements();
            }
            return;
        }

        if (number === targetNumber) {
            setToastMessage(`🎉 Great job! You found ${number}!`);
            setIsCorrect(true);
            Vibration.vibrate(100);
            setToastVisible(true);
            console.log('Playing correct tap feedback');
            playSound(audioFiles.great_job);
        } else {
            setToastMessage(`😕 Try again! Find ${targetNumber}!`);
            setIsCorrect(false);
            Vibration.vibrate([0, 50]);
            setToastVisible(true);
            console.log('Playing incorrect tap feedback');
            playSound(audioFiles.try_again);
        }
    };

    const dismissToast = () => {
        setToastVisible(false);
        if (isCorrect) {
            initializeElements();
        }
    };

    const animateTargetNumber = () => {
        Animated.sequence([
            Animated.timing(targetAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.timing(targetAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]).start();
    };

    const toggleDarkMode = () => {
        setIsDarkMode(prevMode => !prevMode);
    };

    // Handle back button press to navigate to Smart Counter
    const handleBackPress = () => {
        navigation.navigate("SmartCounter");
    };

    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? '#1A1A1A' : '#24bbed' }]}>
            <SeaBackground isDarkMode={isDarkMode} />
            <View style={styles.workspace}>
                {targetNumber && (
                    <Animated.View
                        style={[
                            styles.targetTextContainer,
                            {
                                transform: [
                                    { scale: targetAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] }) },
                                    { rotate: targetAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '10deg'] }) },
                                ],
                                backgroundColor: isDarkMode ? 'rgba(50, 50, 50, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                                borderColor: isDarkMode ? '#FFD700' : '#FFD700',
                            },
                        ]}
                    >
                        <Text style={[styles.targetText, { color: isDarkMode ? '#FF8C00' : '#FF4500' }]}>
                            SHOW NUMBER {targetNumber}
                        </Text>
                    </Animated.View>
                )}
                {elements.map((el) => (
                    <DraggableElement
                        key={el.id}
                        id={el.id}
                        number={el.number}
                        x={el.x}
                        y={el.y}
                        onDrop={handleDrop}
                        onTouch={handleTouch}
                        isTarget={el.number === targetNumber}
                        isTimeUp={isTimeUp}
                    />
                ))}
            </View>
            <View style={styles.controls}>
                <TouchableOpacity
                    onPress={shuffleElements}
                    style={[styles.button, { backgroundColor: isDarkMode ? '#333333' : '#ccc' }]}
                    disabled={isTimeUp}
                >
                    <Text style={[styles.buttonText, { color: isDarkMode ? '#E0E0E0' : 'black' }]}>
                        Shuffle
                    </Text>
                </TouchableOpacity>
            </View>
            <Timer timeLeft={timeLeft} isTimeUp={isTimeUp} />
            <Toast visible={toastVisible} message={toastMessage} onDismiss={dismissToast} isCorrect={isCorrect} />
            <TouchableOpacity
                style={[styles.darkModeButton, { backgroundColor: isDarkMode ? '#333333' : '#E0E0E0' }]}
                onPress={toggleDarkMode}
            >
                <Text style={styles.darkModeIcon}>
                    {isDarkMode ? '☀️' : '🌙'}
                </Text>
            </TouchableOpacity>
            {/* Back Button */}
            <TouchableOpacity
                style={[styles.backButton, { backgroundColor: isDarkMode ? '#333333' : '#00CED1' }]}
                onPress={handleBackPress}
            >
                <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    workspace: { backgroundColor: 'transparent', flex: 1, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
    element: {
        width: ELEMENT_SIZE,
        height: ELEMENT_SIZE,
        backgroundColor: 'red',
        borderRadius: 50,
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 5, height: 5 },
        shadowOpacity: 0.8,
        shadowRadius: 5,
        elevation: 10,
    },
    targetElement: {
        borderWidth: 4,
        borderColor: 'yellow',
    },
    elementText: { color: 'white', fontSize: 24, fontWeight: 'bold' },
    targetTextContainer: {
        position: 'absolute',
        top: 30,
        left: width / 2 - 120,
        zIndex: 1500,
        padding: 15,
        borderRadius: 10,
        borderWidth: 2,
    },
    targetText: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    controls: { flexDirection: 'row', justifyContent: 'flex-end', marginRight: 20, marginBottom: 20, padding: 10 },
    button: { padding: 10, borderRadius: 5 },
    buttonText: { fontSize: 20 },
    toastContainer: {
        position: 'absolute',
        bottom: 50,
        left: 300,
        right: 300,
        padding: 20,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        borderWidth: 4,
        borderColor: '#FFCA28',
    },
    toastText: { color: 'white', fontSize: 24, fontWeight: 'bold', textAlign: 'center', textShadowColor: '#000', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
    nextButton: { marginTop: 10, padding: 10, backgroundColor: '#FFEB3B', borderRadius: 10 },
    nextButtonText: { color: '#333', fontSize: 18, fontWeight: 'bold' },
    seaBackground: { flex: 1, overflow: 'hidden' },
    wave: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 50, borderRadius: 50 },
    fishImage: { width: '100%', height: '100%', resizeMode: 'contain' },
    timerContainer: {
        position: 'absolute',
        top: 20,
        right: 20,
        alignItems: 'center',
        zIndex: 1499,
    },
    timerText: {
        fontSize: 36,
        color: '#FFF',
        fontWeight: 'bold',
        textShadowColor: '#000',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    timeUpText: {
        fontSize: 18,
        color: '#FF4500',
        marginTop: 5,
        fontWeight: 'bold',
    },
    darkModeButton: {
        position: 'absolute',
        top: 20,
        right: 80,
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        zIndex: 2000,
        marginRight: 60,
    },
    darkModeIcon: {
        fontSize: 24,
        color: '#000',
    },
    backButton: {
        position: 'absolute',
        top: 20,
        left: 20,
        width: 80,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        zIndex: 2000,
    },
    backButtonText: {
        fontSize: 18,
        color: 'black', // Changed to black
        fontWeight: 'bold',
    },
});

export default OrderIrrelevance;
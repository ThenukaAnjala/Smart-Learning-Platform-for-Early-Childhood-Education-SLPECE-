import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, PanResponder, Dimensions, Animated, TouchableOpacity, TouchableWithoutFeedback, Image, Vibration } from 'react-native';

const { width, height } = Dimensions.get('window');
const ELEMENT_SIZE = 80;
const ELEMENT_SPACING = 10;
const TOP_OFFSET = 100;
const BOTTOM_OFFSET = 120;
const RIGHT_OFFSET = 0;
const MAX_ATTEMPTS = 1000;

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
                { opacity: fadeAnim, transform: [{ scale: scaleAnim }], backgroundColor: isCorrect ? '#4CAF50' : '#F44336' },
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

// Draggable Element Component
const DraggableElement = ({ id, number, x, y, onDrop, onTouch }) => {
    const pan = useRef(new Animated.ValueXY()).current;

    // Reset the Animated.ValueXY whenever x or y props change
    useEffect(() => {
        pan.setValue({ x, y });
    }, [x, y]);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                pan.setOffset({ x: pan.x._value, y: pan.y._value });
                pan.setValue({ x: 0, y: 0 });
            },
            onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
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
            ]}
            {...panResponder.panHandlers}
        >
            <TouchableOpacity onPress={() => onTouch(number)}>
                <Text style={styles.elementText}>{number}</Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

// Sea Background Component (unchanged)
const SeaBackground = () => {
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
                        Animated.timing(fish.x, { toValue: width + 50, duration: 5000 + index * 200, useNativeDriver: true }),
                        Animated.timing(fish.direction, { toValue: 1, duration: 0, useNativeDriver: true }),
                    ]),
                    Animated.timing(fish.y, { toValue: Math.random() * (height - 150), duration: 1000, useNativeDriver: true }),
                    Animated.parallel([
                        Animated.timing(fish.x, { toValue: -50, duration: 5000 + index * 200, useNativeDriver: true }),
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
        <View style={styles.seaBackground}>
            <Animated.View style={{ ...styles.wave, transform: [{ translateY: waveAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 20] }) }] }} />
            <Animated.View style={{ ...styles.wave, transform: [{ translateY: waveAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -20] }) }] }} />
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
const OrderIrrelevance = () => {
    const [elements, setElements] = useState([]);
    const [targetNumber, setTargetNumber] = useState(null);
    const [toastVisible, setToastVisible] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [isCorrect, setIsCorrect] = useState(false);
    const targetAnim = useRef(new Animated.Value(0)).current;

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
        const newTarget = Math.floor(Math.random() * newElements.length) + 1;
        setTargetNumber(newTarget);
        animateTargetNumber();
    };

    useEffect(() => {
        initializeElements();
    }, []);

    const shuffleElements = () => {
        setElements((prevElements) => {
            const shuffledElements = [...prevElements];
            console.log("Before shuffle:", prevElements.map(el => ({ number: el.number, x: el.x, y: el.y })));

            // Fisher-Yates shuffle
            for (let i = shuffledElements.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                const tempX = shuffledElements[i].x;
                const tempY = shuffledElements[i].y;
                shuffledElements[i].x = shuffledElements[j].x;
                shuffledElements[i].y = shuffledElements[j].y;
                shuffledElements[j].x = tempX;
                shuffledElements[j].y = tempY;
            }

            // Check and fix any elements that stayed in their original position
            prevElements.forEach((original, index) => {
                if (original.x === shuffledElements[index].x && original.y === shuffledElements[index].y) {
                    // Swap with the next element (wrap around if at end)
                    const nextIndex = (index + 1) % shuffledElements.length;
                    const tempX = shuffledElements[index].x;
                    const tempY = shuffledElements[index].y;
                    shuffledElements[index].x = shuffledElements[nextIndex].x;
                    shuffledElements[index].y = shuffledElements[nextIndex].y;
                    shuffledElements[nextIndex].x = tempX;
                    shuffledElements[nextIndex].y = tempY;
                }
            });

            console.log("After shuffle:", shuffledElements.map(el => ({ number: el.number, x: el.x, y: el.y })));
            setTargetNumber(Math.floor(Math.random() * shuffledElements.length) + 1);
            animateTargetNumber();
            return shuffledElements;
        });
    };

    const handleDrop = (id, newX, newY) => {
        setElements((prevElements) => prevElements.map((el) => (el.id === id ? { ...el, x: newX, y: newY } : el)));
    };

    const handleTouch = (number) => {
        if (number === targetNumber) {
            setToastMessage(`🎉 Great job! You found ${number}!`);
            setIsCorrect(true);
            Vibration.vibrate(100);
        } else {
            setToastMessage(`😕 Try again! Find ${targetNumber}!`);
            setIsCorrect(false);
            Vibration.vibrate([0, 50]);
        }
        setToastVisible(true);
    };

    const dismissToast = () => {
        setToastVisible(false);
        if (isCorrect) {
            const newTarget = Math.floor(Math.random() * elements.length) + 1;
            setTargetNumber(newTarget);
            animateTargetNumber();
        }
    };

    const animateTargetNumber = () => {
        Animated.sequence([
            Animated.timing(targetAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.timing(targetAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]).start();
    };

    return (
        <View style={styles.container}>
            <SeaBackground />
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
                            },
                        ]}
                    >
                        <Text style={styles.targetText}>SHOW NUMBER {targetNumber}</Text>
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
                    />
                ))}
            </View>
            <View style={styles.controls}>
                <TouchableOpacity onPress={shuffleElements} style={styles.button}>
                    <Text style={styles.buttonText}>Shuffle</Text>
                </TouchableOpacity>
            </View>
            <Toast visible={toastVisible} message={toastMessage} onDismiss={dismissToast} isCorrect={isCorrect} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#24bbed' },
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
    elementText: { color: 'white', fontSize: 24, fontWeight: 'bold' },
    targetTextContainer: {
        position: 'absolute',
        top: 30,
        left: width / 2 - 120,
        zIndex: 1500,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 15,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#FFD700',
    },
    targetText: {
        color: '#FF4500',
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    controls: { flexDirection: 'row', justifyContent: 'flex-end', marginRight: 20, marginBottom: 20, padding: 10 },
    button: { backgroundColor: '#ccc', padding: 10, borderRadius: 5 },
    buttonText: { fontSize: 20, color: 'black' },
    toastContainer: {
        position: 'absolute',
        bottom: 50,
        left: 80,
        right: 80,
        padding: 20,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
    },
    toastText: { color: 'white', fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
    nextButton: { marginTop: 10, padding: 10, backgroundColor: '#FFEB3B', borderRadius: 10 },
    nextButtonText: { color: '#333', fontSize: 18, fontWeight: 'bold' },
    seaBackground: { flex: 1, backgroundColor: '#00CED1', overflow: 'hidden' },
    wave: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 50, backgroundColor: 'rgba(255, 255, 255, 0.3)', borderRadius: 50 },
    fishImage: { width: '100%', height: '100%', resizeMode: 'contain' },
});

export default OrderIrrelevance;
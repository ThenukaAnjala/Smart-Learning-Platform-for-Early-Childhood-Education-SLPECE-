import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, PanResponder, Dimensions, Animated, TouchableOpacity, TouchableWithoutFeedback, Image } from 'react-native';

const { width, height } = Dimensions.get('window');
const ELEMENT_SIZE = 80; // Size of each element
const DUSTBIN_SIZE = 60;
const DUSTBIN_PADDING = 20;
const ELEMENT_SPACING = 10; // Minimum spacing between elements
const TOP_OFFSET = 80; // For target text (SHOW NUMBER) and padding
const BOTTOM_OFFSET = 120; // For wave, shuffle button, and padding
const RIGHT_OFFSET = DUSTBIN_SIZE + DUSTBIN_PADDING; // For dustbin

// Custom Toast Component for Child-Friendly Interaction
const Toast = ({ visible, message, onDismiss, isCorrect }) => {
    const [fadeAnim] = useState(new Animated.Value(0));
    const [scaleAnim] = useState(new Animated.Value(0.5));

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 3,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [visible, fadeAnim, scaleAnim]);

    if (!visible) return null;

    return (
        <Animated.View
            style={[
                styles.toastContainer,
                {
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }],
                    backgroundColor: isCorrect ? '#4CAF50' : '#F44336',
                },
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

const DraggableElement = ({ id, number, x, y, onDrop, onTouch, isTarget }) => {
    const pan = useRef(new Animated.ValueXY({ x, y })).current;
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                pan.setOffset({ x: pan.x._value, y: pan.y._value });
                pan.setValue({ x: 0, y: 0 });
            },
            onPanResponderMove: Animated.event(
                [null, { dx: pan.x, dy: pan.y }],
                { useNativeDriver: false }
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
                isTarget && styles.targetElement, // Highlight if this is the target number
            ]}
            {...panResponder.panHandlers}
        >
            <TouchableOpacity onPress={() => onTouch(number)}>
                <Text style={styles.elementText}>{number}</Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

// Custom Sea Background Component with Multiple Fish
const SeaBackground = () => {
    const waveAnim = useRef(new Animated.Value(0)).current;
    const NUMBER_OF_FISH = 25; // Set to 25 fish (within 20-30 range)

    // Predefine fish animations with fixed number of Animated.Values
    const fishAnimations = useRef(
        Array.from({ length: NUMBER_OF_FISH }, (_, index) => ({
            x: new Animated.Value(-50),
            y: new Animated.Value(Math.random() * (height - 150)),
            direction: new Animated.Value(1), // 1 for left to right, -1 for right to left
        }))
    ).current;

    useEffect(() => {
        // Animate sea waves
        Animated.loop(
            Animated.sequence([
                Animated.timing(waveAnim, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(waveAnim, {
                    toValue: 0,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Animate each fish independently
        fishAnimations.forEach((fish, index) => {
            Animated.loop(
                Animated.sequence([
                    // Left to right
                    Animated.parallel([
                        Animated.timing(fish.x, {
                            toValue: width + 50,
                            duration: 5000 + index * 200, // Staggered timing for variety
                            useNativeDriver: true,
                        }),
                        Animated.timing(fish.direction, {
                            toValue: 1, // Head faces left (no flip)
                            duration: 0,
                            useNativeDriver: true,
                        }),
                    ]),
                    Animated.timing(fish.y, {
                        toValue: Math.random() * (height - 150),
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    // Right to left
                    Animated.parallel([
                        Animated.timing(fish.x, {
                            toValue: -50,
                            duration: 5000 + index * 200,
                            useNativeDriver: true,
                        }),
                        Animated.timing(fish.direction, {
                            toValue: -1, // Head faces right (flip)
                            duration: 0,
                            useNativeDriver: true,
                        }),
                    ]),
                ])
            ).start();
        });
    }, [waveAnim]);

    const handleFishPress = (fish) => {
        // Interactive feedback: move fish to a random position
        Animated.parallel([
            Animated.spring(fish.x, {
                toValue: Math.random() * width,
                friction: 3,
                useNativeDriver: true,
            }),
            Animated.spring(fish.y, {
                toValue: Math.random() * (height - 150),
                friction: 3,
                useNativeDriver: true,
            }),
            // Reset direction based on new position relative to current position
            Animated.timing(fish.direction, {
                toValue: fish.x._value < Math.random() * width ? 1 : -1, // If moving right, face left; if moving left, face right
                duration: 0,
                useNativeDriver: true,
            }),
        ]).start();
    };

    return (
        <View style={styles.seaBackground}>
            {/* Animated Sea Waves */}
            <Animated.View
                style={{
                    ...styles.wave,
                    transform: [{ translateY: waveAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 20],
                    }) }],
                }}
            />
            <Animated.View
                style={{
                    ...styles.wave,
                    transform: [{ translateY: waveAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -20],
                    }) }],
                }}
            />
            {/* Multiple Interactive Fish */}
            {fishAnimations.map((fish, index) => (
                <TouchableWithoutFeedback
                    key={index}
                    onPress={() => handleFishPress(fish)}
                >
                    <Animated.View
                        style={{
                            position: 'absolute',
                            width: 60,
                            height: 60,
                            transform: [
                                { translateX: fish.x },
                                { translateY: fish.y },
                                { scaleX: fish.direction }, // Dynamically flip the fish based on direction
                            ],
                        }}
                    >
                        <Image
                            source={require('../../assets/images/blue_fish.png')} // Use only blue fish
                            style={styles.fishImage}
                        />
                    </Animated.View>
                </TouchableWithoutFeedback>
            ))}
        </View>
    );
};

const OrderIrrelevance = () => {
    const [elements, setElements] = useState([]);
    const [targetNumber, setTargetNumber] = useState(null);
    const [toastVisible, setToastVisible] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [isCorrect, setIsCorrect] = useState(false);

    const initializeElements = () => {
        const newElements = [];
        const gridSpacing = ELEMENT_SIZE + ELEMENT_SPACING;
        const availableWidth = width - RIGHT_OFFSET;
        const availableHeight = height - TOP_OFFSET - BOTTOM_OFFSET;
        const gridSizeX = Math.floor(availableWidth / gridSpacing);
        const gridSizeY = Math.floor(availableHeight / gridSpacing);
        const totalSlots = gridSizeX * gridSizeY;

        if (totalSlots < 10) {
            console.warn("Not enough space to place all elements without overlap during initialization!");
            return;
        }

        const positions = [];
        for (let y = 0; y < gridSizeY; y++) {
            for (let x = 0; x < gridSizeX; x++) {
                positions.push({
                    x: x * gridSpacing,
                    y: y * gridSpacing + TOP_OFFSET,
                });
            }
        }

        // Shuffle positions for initial placement
        for (let i = positions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [positions[i], positions[j]] = [positions[j], positions[i]];
        }

        for (let i = 1; i <= 10; i++) {
            const pos = positions[i - 1];
            newElements.push({ id: i, number: i, x: pos.x, y: pos.y });
        }
        setElements(newElements);
        setTargetNumber(Math.floor(Math.random() * 10) + 1);
    };

    // Initialize elements when the component mounts
    useEffect(() => {
        initializeElements();
    }, []);

    // Shuffle the positions of the elements without overlapping
    const shuffleElements = () => {
        setElements((prevElements) => {
            const shuffledElements = prevElements.map((el) => ({ ...el }));
            const gridSpacing = ELEMENT_SIZE + ELEMENT_SPACING;
            const availableWidth = width - RIGHT_OFFSET;
            const availableHeight = height - TOP_OFFSET - BOTTOM_OFFSET;
            const gridSizeX = Math.floor(availableWidth / gridSpacing);
            const gridSizeY = Math.floor(availableHeight / gridSpacing);
            const totalSlots = gridSizeX * gridSizeY;

            if (totalSlots < shuffledElements.length) {
                console.warn("Not enough space to place all elements without overlap!");
                return shuffledElements; // Return unchanged if not enough space
            }

            // Create an array of possible positions with spacing
            const positions = [];
            for (let y = 0; y < gridSizeY; y++) {
                for (let x = 0; x < gridSizeX; x++) {
                    positions.push({
                        x: x * gridSpacing,
                        y: y * gridSpacing + TOP_OFFSET,
                    });
                }
            }

            // Shuffle positions array
            for (let i = positions.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [positions[i], positions[j]] = [positions[j], positions[i]];
            }

            // Assign shuffled positions to elements
            shuffledElements.forEach((el, index) => {
                if (index < positions.length) {
                    el.x = positions[index].x;
                    el.y = positions[index].y;
                }
            });

            return shuffledElements;
        });
        // Set a new target number (change the question), within 1 to 10
        setTargetNumber(Math.floor(Math.random() * 10) + 1);
    };

    // Update the position of an element when dropped
    // Delete the element if it's dropped inside the dustbin region
    const handleDrop = (id, newX, newY) => {
        const centerX = newX + ELEMENT_SIZE / 2;
        const centerY = newY + ELEMENT_SIZE / 2;
        const dustbinX = width - DUSTBIN_SIZE - DUSTBIN_PADDING;
        const dustbinY = DUSTBIN_PADDING;

        if (
            centerX >= dustbinX &&
            centerX <= dustbinX + DUSTBIN_SIZE &&
            centerY >= dustbinY &&
            centerY <= dustbinY + DUSTBIN_SIZE
        ) {
            // Remove the element if dropped in dustbin region
            setElements((prevElements) => prevElements.filter((el) => el.id !== id));
        } else {
            // Update the element's position
            setElements((prevElements) =>
                prevElements.map((el) =>
                    el.id === id ? { ...el, x: newX, y: newY } : el
                )
            );
        }
    };

    // Handle when a number is touched
    const handleTouch = (number) => {
        if (number === targetNumber) {
            setToastMessage(`🎉 Great job! You found ${number}!`);
            setIsCorrect(true);
        } else {
            setToastMessage(`😕 Try again! Find ${targetNumber}!`);
            setIsCorrect(false);
        }
        setToastVisible(true);
    };

    // Dismiss toast and proceed to next challenge if correct
    const dismissToast = () => {
        setToastVisible(false);
        if (isCorrect) {
            setTargetNumber(Math.floor(Math.random() * elements.length) + 1);
        }
    };

    return (
        <View style={styles.container}>
            <SeaBackground />
            <View style={styles.workspace}>
                {/* Display the target number to find */}
                {targetNumber && (
                    <Text style={styles.targetText}>SHOW NUMBER {targetNumber}</Text>
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
                    />
                ))}
            </View>
            {/* Dustbin icon */}
            <View style={styles.dustbin}>
                <Text style={styles.dustbinText}>🗑️</Text>
            </View>
            <View style={styles.controls}>
                <TouchableOpacity onPress={shuffleElements} style={styles.button}>
                    <Text style={styles.buttonText}>Shuffle</Text>
                </TouchableOpacity>
            </View>
            {/* Custom Toast */}
            <Toast
                visible={toastVisible}
                message={toastMessage}
                onDismiss={dismissToast}
                isCorrect={isCorrect}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#24bbed', // Original background color, overridden by SeaBackground
    },
    workspace: {
        backgroundColor: 'transparent', // Make workspace transparent to show sea background
        flex: 1,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
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
        borderWidth: 3,
        borderColor: 'yellow', // Highlight the target number
    },
    elementText: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
    },
    targetText: {
        position: 'absolute',
        top: 20,
        left: width / 2 - 100,
        color: 'black',
        fontSize: 24,
        fontWeight: 'bold',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        padding: 10,
        borderRadius: 5,
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginRight: 20,
        marginBottom: 20,
        padding: 10,
    },
    button: {
        backgroundColor: '#ccc',
        padding: 10,
        borderRadius: 5,
    },
    buttonText: {
        fontSize: 20,
        color: 'black',
    },
    dustbin: {
        position: 'absolute',
        top: DUSTBIN_PADDING,
        right: DUSTBIN_PADDING,
        width: DUSTBIN_SIZE,
        height: DUSTBIN_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#eee',
        borderRadius: DUSTBIN_SIZE / 2,
        borderWidth: 1,
        borderColor: '#ccc',
        zIndex: 1000,
    },
    dustbinText: {
        fontSize: 30,
    },
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
    toastText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    nextButton: {
        marginTop: 10,
        padding: 10,
        backgroundColor: '#FFEB3B',
        borderRadius: 10,
    },
    nextButtonText: {
        color: '#333',
        fontSize: 18,
        fontWeight: 'bold',
    },
    seaBackground: {
        flex: 1,
        backgroundColor: '#00CED1', // Deep sky blue for sea base
        overflow: 'hidden',
    },
    wave: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.3)', // White waves with transparency
        borderRadius: 50,
    },
    fishText: {
        fontSize: 18,
        color: 'white',
        textAlign: 'center',
    },
    fishImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
});

export default OrderIrrelevance;
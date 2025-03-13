import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, PanResponder, Dimensions, Animated, TouchableOpacity } from 'react-native';

const { width, height } = Dimensions.get('window');
const ELEMENT_SIZE = 80; // Used for both element size & collision threshold
const DUSTBIN_SIZE = 60;
const DUSTBIN_PADDING = 20;

// Custom Toast Component for Child-Friendly Interaction
const Toast = ({ visible, message, onDismiss, isCorrect }) => {
    const [fadeAnim] = useState(new Animated.Value(0));
    const [scaleAnim] = useState(new Animated.Value(0.5));

    React.useEffect(() => {
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

const OrderIrrelevance = () => {
    const [elements, setElements] = useState([]);
    const [targetNumber, setTargetNumber] = useState(null);
    const [toastVisible, setToastVisible] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [isCorrect, setIsCorrect] = useState(false);

    const initializeElements = () => {
        const newElements = [];
        for (let i = 1; i <= 10; i++) { // Changed from 8 to 10
            const randomX = Math.random() * (width - ELEMENT_SIZE);
            const randomY = Math.random() * (height - 150);
            newElements.push({ id: i, number: i, x: randomX, y: randomY });
        }
        setElements(newElements);
        // Set a random target number to find, ensuring it’s within 1 to 10
        setTargetNumber(Math.floor(Math.random() * 10) + 1); // Changed from 8 to 10
    };

    // Initialize elements when the component mounts
    React.useEffect(() => {
        initializeElements();
    }, []);

    // Shuffle the positions of the elements
    const shuffleElements = () => {
        setElements((prevElements) =>
            prevElements.map((el) => ({
                ...el,
                x: Math.random() * (width - ELEMENT_SIZE),
                y: Math.random() * (height - 150),
            }))
        );
        // Set a new target number (change the question), within 1 to 10
        setTargetNumber(Math.floor(Math.random() * 10) + 1); // Changed from 8 to 10
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
        backgroundColor: '#24bbed',
    },
    workspace: {
        backgroundColor: '#24bbed',
        flex: 1,
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
    // Styles for the new Toast component
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
});

export default OrderIrrelevance;
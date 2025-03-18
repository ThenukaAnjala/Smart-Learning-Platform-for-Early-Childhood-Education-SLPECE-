import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, PanResponder, Dimensions, Animated, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const ELEMENT_SIZE = 60;
const DUSTBIN_SIZE = 70;
const DUSTBIN_PADDING = 20;
const LEFT_MARGIN = 20;
const GAP = 10;

const DraggableElement = ({ id, x, y, onDrop, label }) => {
    const pan = useRef(new Animated.ValueXY({ x, y })).current;
    const opacity = useRef(new Animated.Value(1)).current; // Added opacity ref

    useEffect(() => {
        Animated.spring(pan, {
            toValue: { x, y },
            useNativeDriver: false,
        }).start();
    }, [x, y]);

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
            onPanResponderRelease: (evt, gestureState) => {
                pan.flattenOffset();
                onDrop(id, gestureState.dx, gestureState.dy, pan, opacity);
            },
        })
    ).current;

    return (
        <Animated.View
            style={[
                styles.element,
                { transform: pan.getTranslateTransform(), opacity }, // Apply opacity animation
            ]}
            {...panResponder.panHandlers}
        >
            <Text style={styles.labelText}>{label}</Text>
        </Animated.View>
    );
};

// Function to recalculate element positions and labels after changes
const recalcRowElements = (elements, rowY) => {
    return elements.map((el, idx) => ({
        ...el,
        x: LEFT_MARGIN + idx * (ELEMENT_SIZE + GAP),
        y: rowY,
        label: idx + 1,
    }));
};

const generateRow = () => {
    const rowY = height / 2; // Single row at middle
    const count = 10; // Fixed to 10 elements initially
    const elements = Array.from({ length: count }, (_, i) => ({
        id: `0-${i}`,
        label: i + 1,
        x: LEFT_MARGIN + i * (ELEMENT_SIZE + GAP),
        y: rowY,
    }));
    return { rowIndex: 0, y: rowY, elements };
};

const SingleRowElements = () => {
    const [elements, setElements] = useState([]); // State to store the row elements
    const [isDarkMode, setIsDarkMode] = useState(false); // State for dark mode toggle

    // Reset the row elements when the screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            setElements(generateRow().elements);
        }, [])
    );

    // Handle dropping an element (for deletion in the dustbin)
    const handleDrop = (id, deltaX, deltaY, pan, opacity) => {
        const dustbinX = width - DUSTBIN_SIZE - DUSTBIN_PADDING;
        const dustbinY = DUSTBIN_PADDING;

        setElements(prevElements => {
            const updatedElements = prevElements.map(el => {
                if (el.id !== id) return el;

                const currentX = el.x + deltaX;
                const currentY = el.y + deltaY;

                const isInDustbin =
                    currentX + ELEMENT_SIZE > dustbinX &&
                    currentX < dustbinX + DUSTBIN_SIZE &&
                    currentY + ELEMENT_SIZE > dustbinY &&
                    currentY < dustbinY + DUSTBIN_SIZE;

                if (isInDustbin) {
                    // Fade out the element when dropped in the dustbin
                    Animated.timing(opacity, {
                        toValue: 0,
                        duration: 200,
                        useNativeDriver: false,
                    }).start(() => {
                        setElements(prevElements => {
                            const filteredElements = prevElements.filter(el => el.id !== id);
                            return recalcRowElements(filteredElements, height / 2); // Recalculate positions
                        });
                    });
                    return el; // Return unchanged element initially
                }
                return el;
            });
            return updatedElements;
        });
    };

    // Function to add a new element to the row
    const addElement = () => {
        setElements(prevElements => {
            // Check if the row already has 10 elements
            if (prevElements.length >= 10) return prevElements; // Prevent adding if limit reached
            const newEl = { id: `0-${Date.now()}`, x: 0, y: height / 2 }; // New element
            const newElements = [...prevElements, newEl];
            return recalcRowElements(newElements, height / 2); // Recalculate positions
        });
    };

    // Toggle dark mode
    const toggleDarkMode = () => {
        setIsDarkMode(prevMode => !prevMode);
    };

    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? '#1A1A1A' : '#ADD8E6' }]}>
            <View style={styles.workspace}>
                {elements.map(el => (
                    <DraggableElement
                        key={el.id}
                        id={el.id}
                        x={el.x}
                        y={el.y}
                        label={el.label}
                        onDrop={handleDrop}
                    />
                ))}
            </View>
            <View style={[styles.dustbin, { backgroundColor: isDarkMode ? '#333333' : '#eee', borderColor: isDarkMode ? '#555' : '#ccc' }]}>
                <Text style={styles.dustbinText}>🗑️</Text>
            </View>
            {/* Dark Mode Toggle Button - Positioned below dustbin */}
            <TouchableOpacity
                style={[styles.darkModeButton, { backgroundColor: isDarkMode ? '#333333' : '#E0E0E0' }]}
                onPress={toggleDarkMode}
            >
                <Text style={styles.darkModeIcon}>
                    {isDarkMode ? '☀️' : '🌙'}
                </Text>
            </TouchableOpacity>
            {/* Add Element Button - Positioned at the bottom */}
            <View style={styles.controls}>
                <TouchableOpacity
                    onPress={addElement}
                    style={[styles.button, { backgroundColor: isDarkMode ? '#555' : 'blue' }]}
                >
                    <Text style={styles.buttonText}>Add Element</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    workspace: {
        flex: 1,
    },
    element: {
        width: ELEMENT_SIZE,
        height: ELEMENT_SIZE,
        backgroundColor: 'red',
        borderRadius: 50,
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 5, height: 5 },
        shadowOpacity: 0.8,
        shadowRadius: 5,
        elevation: 10,
    },
    labelText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    dustbin: {
        position: 'absolute',
        top: DUSTBIN_PADDING,
        right: DUSTBIN_PADDING,
        width: DUSTBIN_SIZE,
        height: DUSTBIN_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: DUSTBIN_SIZE / 2,
        borderWidth: 1,
        zIndex: 1000,
    },
    dustbinText: {
        fontSize: 30,
    },
    darkModeButton: {
        position: 'absolute',
        top: DUSTBIN_PADDING + DUSTBIN_SIZE + 10, // Positioned below dustbin with 10px gap
        right: DUSTBIN_PADDING,
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        zIndex: 1000,
    },
    darkModeIcon: {
        fontSize: 24,
        color: '#000',
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
        padding: 10,
    },
    button: {
        padding: 10,
        borderRadius: 5,
    },
    buttonText: {
        fontSize: 20,
        color: 'white',
    },
});

export default SingleRowElements;
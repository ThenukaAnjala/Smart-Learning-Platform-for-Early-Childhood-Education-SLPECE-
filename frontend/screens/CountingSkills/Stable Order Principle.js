import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, PanResponder, Dimensions, Animated, TouchableOpacity, ImageBackground } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const ELEMENT_SIZE = 60;
const DUSTBIN_SIZE = 70;
const DUSTBIN_PADDING = 20;
const GAP = 10;

const DraggableElement = ({ id, x, y, onDrop, label, onPositionUpdate }) => {
    const pan = useRef(new Animated.ValueXY({ x, y })).current;
    const opacity = useRef(new Animated.Value(1)).current;

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
                onDrop(id, gestureState.dx, gestureState.dy, pan, opacity, onPositionUpdate);
            },
        })
    ).current;

    return (
        <Animated.View
            style={[
                styles.element,
                { transform: pan.getTranslateTransform(), opacity },
            ]}
            {...panResponder.panHandlers}
        >
            <Text style={styles.labelText}>{label}</Text>
        </Animated.View>
    );
};

// Function to generate centered row elements
const generateRow = () => {
    const rowY = height / 2;
    const count = 10;
    const totalWidth = count * ELEMENT_SIZE + (count - 1) * GAP;
    const startX = (width - totalWidth) / 2; // Center the row horizontally

    const elements = Array.from({ length: count }, (_, i) => ({
        id: `element-${i}`,
        label: i + 1,
        x: startX + i * (ELEMENT_SIZE + GAP),
        y: rowY,
    }));
    return { rowIndex: 0, y: rowY, elements };
};

const SingleRowElements = () => {
    const [elements, setElements] = useState([]); // State to store the row elements
    const [deletedElements, setDeletedElements] = useState(new Set()); // Track deleted elements by their original labels
    const [isDarkMode, setIsDarkMode] = useState(false); // State for dark mode toggle

    // Reset the row elements when the screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            setElements(generateRow().elements);
            setDeletedElements(new Set()); // Reset deleted elements when screen focuses
        }, [])
    );

    // Handle dropping an element (for deletion in the dustbin)
    const handleDrop = (id, deltaX, deltaY, pan, opacity) => {
        const dustbinX = width - DUSTBIN_SIZE - DUSTBIN_PADDING;
        const dustbinY = DUSTBIN_PADDING;

        const currentElement = elements.find(el => el.id === id);
        if (!currentElement) return;

        const currentX = currentElement.x + deltaX;
        const currentY = currentElement.y + deltaY;

        const isInDustbin =
            currentX + ELEMENT_SIZE > dustbinX &&
            currentX < dustbinX + DUSTBIN_SIZE &&
            currentY + ELEMENT_SIZE > dustbinY &&
            currentY < dustbinY + DUSTBIN_SIZE;

        if (isInDustbin) {
            // Fade out and delete
            Animated.timing(opacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: false,
            }).start(() => {
                setElements(prevElements => {
                    const elementToDelete = prevElements.find(el => el.id === id);
                    if (elementToDelete) {
                        setDeletedElements(prev => new Set([...prev, elementToDelete.label]));
                    }

                    const filteredElements = prevElements.filter(el => el.id !== id);
                    if (filteredElements.length === 0) {
                        setTimeout(() => {
                            setElements(generateRow().elements);
                            setDeletedElements(new Set());
                        }, 500);
                        return [];
                    }
                    return filteredElements;
                });
            });
        } else {
            // Update position in state to allow free placement
            onPositionUpdate(id, currentX, currentY);
        }
    };

    // Update element position in state
    const updatePosition = (id, newX, newY) => {
        setElements(prevElements =>
            prevElements.map(el =>
                el.id === id ? { ...el, x: newX, y: newY } : el
            )
        );
    };

    const addElement = () => {
        setElements(prevElements => {
            if (prevElements.length >= 10) return prevElements;

            let nextNumber = 1;
            const existingNumbers = new Set(prevElements.map(el => el.label));
            while (existingNumbers.has(nextNumber)) {
                nextNumber++;
                if (nextNumber > 10) break;
            }
            if (nextNumber > 10) return prevElements;

            // Calculate new row to keep it centered
            const count = prevElements.length + 1;
            const totalWidth = count * ELEMENT_SIZE + (count - 1) * GAP;
            const startX = (width - totalWidth) / 2;

            // Sort elements by label to maintain order
            const newElement = {
                id: `element-${Date.now()}`,
                x: startX + (count - 1) * (ELEMENT_SIZE + GAP), // Place at the right
                y: height / 2,
                label: nextNumber,
            };

            const updatedElements = [...prevElements, newElement].sort((a, b) => a.label - b.label);

            // Reposition all elements to maintain centered row
            return updatedElements.map((el, i) => ({
                ...el,
                x: startX + i * (ELEMENT_SIZE + GAP),
                y: height / 2,
            }));
        });
    };

    // Function to manually refill all elements (optional reset button)
    const refillElements = () => {
        setElements(generateRow().elements);
        setDeletedElements(new Set()); // Reset deleted elements
    };

    // Toggle dark mode
    const toggleDarkMode = () => {
        setIsDarkMode(prevMode => !prevMode);
    };

    return (
        <ImageBackground
            source={require('../../assets/images/resized_landscape_.png')}
            style={styles.backgroundImage}
            resizeMode="cover"
        >
            <View style={[styles.container, { backgroundColor: isDarkMode ? 'rgba(26, 26, 26, 0.7)' : 'rgba(173, 216, 230, 0.7)' }]}>
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
                {/* Controls - Only Reset Button */}
                <View style={styles.controls}>
                    <TouchableOpacity
                        onPress={refillElements}
                        style={[styles.button, { backgroundColor: isDarkMode ? '#555' : 'green' }]}
                    >
                        <Text style={styles.buttonText}>Reset All</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
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
        top: DUSTBIN_PADDING + DUSTBIN_SIZE + 10,
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
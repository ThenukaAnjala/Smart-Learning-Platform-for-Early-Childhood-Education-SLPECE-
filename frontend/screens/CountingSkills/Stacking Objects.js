// Import necessary React and React Native modules
import React, { useState, useRef, useMemo, useCallback, memo, useEffect } from 'react';
import { View, Text, StyleSheet, PanResponder, Dimensions, Animated, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Import navigation hook for screen navigation

// Get the window dimensions for responsive layout
const { width, height } = Dimensions.get('window');
// Define constants for element and dustbin sizes, max elements, and styling
const ELEMENT_SIZE = 80; // Size of draggable elements
const DUSTBIN_SIZE = 60; // Size of the dustbin
const DUSTBIN_PADDING = 20; // Padding around the dustbin
const MAX_ELEMENTS = 50; // Maximum number of elements allowed
const COLORS = ['red', 'blue', '#cfe010', 'green']; // Array of colors for elements (includes specific yellow)
const SHAPES = ['circle', 'square', 'triangle']; // Array of shapes for elements
// Predefined positions for star decorations in the background
const STARS = [
    { left: width * 0.1, top: height * 0.1 },
    { left: width * 0.8, top: height * 0.15 },
    { left: width * 0.3, top: height * 0.3 },
    { left: width * 0.7, top: height * 0.4 },
    { left: width * 0.2, top: height * 0.6 },
    { left: width * 0.9, top: height * 0.7 },
    { left: width * 0.4, top: height * 0.8 },
];

// Custom Triangle component to render a true triangle shape using borders
const Triangle = ({ color, size, borderColor }) => {
    return (
        <View style={{
            position: 'relative',
            width: size,
            height: size,
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            {/* Render a slightly larger triangle for the border effect if borderColor is provided */}
            {borderColor && (
                <View style={{
                    position: 'absolute',
                    width: 0,
                    height: 0,
                    backgroundColor: 'transparent',
                    borderStyle: 'solid',
                    borderLeftWidth: size / 2 + 3,
                    borderRightWidth: size / 2 + 3,
                    borderBottomWidth: size + 6,
                    borderLeftColor: 'transparent',
                    borderRightColor: 'transparent',
                    borderBottomColor: borderColor,
                    top: -3,
                    zIndex: 1,
                }} />
            )}
            {/* Render the main triangle shape */}
            <View style={{
                position: 'absolute',
                width: 0,
                height: 0,
                backgroundColor: 'transparent',
                borderStyle: 'solid',
                borderLeftWidth: size / 2,
                borderRightWidth: size / 2,
                borderBottomWidth: size,
                borderLeftColor: 'transparent',
                borderRightColor: 'transparent',
                borderBottomColor: color,
                zIndex: 2,
                shadowColor: '#000',
                shadowOffset: { width: 5, height: 5 },
                shadowOpacity: 0.8,
                shadowRadius: 5,
                elevation: 10,
            }} />
        </View>
    );
};

// Memoized DraggableElement component to optimize rendering of individual draggable shapes
const DraggableElement = memo(({ id, internalId, color, shape, pan, onDrop, stackNumber }) => {
    // Create an animated value for scaling the element during interaction
    const scale = useRef(new Animated.Value(1)).current;
    // Set up PanResponder for handling drag gestures
    const panResponder = useRef(
        PanResponder.create({
            // Allow the element to respond to touch
            onStartShouldSetPanResponder: () => true,
            // Initialize drag with offset and scale animation
            onPanResponderGrant: () => {
                pan.setOffset({ x: pan.x._value, y: pan.y._value });
                pan.setValue({ x: 0, y: 0 });
                Animated.spring(scale, {
                    toValue: 1.1, // Slightly scale up when touched
                    duration: 100,
                    useNativeDriver: true,
                }).start();
            },
            // Handle drag movement, keeping the element within screen bounds
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
            // Handle release of the element, reset scale, and trigger drop logic
            onPanResponderRelease: () => {
                pan.flattenOffset();
                Animated.spring(scale, {
                    toValue: 1, // Return to original size
                    duration: 100,
                    useNativeDriver: true,
                }).start();
                onDrop(internalId, pan.x._value, pan.y._value);
            },
        })
    ).current;

    // Conditionally render the appropriate shape based on the 'shape' prop
    let shapeElement;
    if (shape === 'circle') {
        shapeElement = (
            <View style={[
                styles.shape,
                styles.circle,
                { backgroundColor: color, borderColor: 'rgba(255, 255, 255, 0.5)', borderWidth: 3 }
            ]}>
                {stackNumber !== null && <Text style={styles.elementText}>{stackNumber}</Text>}
            </View>
        );
    } else if (shape === 'square') {
        shapeElement = (
            <View style={[styles.shape, styles.square, { backgroundColor: color, borderColor: 'rgba(255, 255, 255, 0.5)', borderWidth: 3 }]}>
                {stackNumber !== null && <Text style={styles.elementText}>{stackNumber}</Text>}
            </View>
        );
    } else if (shape === 'triangle') {
        shapeElement = (
            <View style={styles.triangleContainer}>
                <Triangle color={color} size={ELEMENT_SIZE - 10} borderColor="rgba(255, 255, 255, 0.5)" />
                {stackNumber !== null && (
                    <View style={styles.triangleTextContainer}>
                        <Text style={styles.elementText}>{stackNumber}</Text>
                    </View>
                )}
            </View>
        );
    }

    // Render the animated draggable element with pan and scale transformations
    return (
        <Animated.View
            style={[
                styles.element,
                {
                    transform: [
                        ...pan.getTranslateTransform(),
                        { scale },
                    ],
                },
            ]}
            {...panResponder.panHandlers}
        >
            {shapeElement}
        </Animated.View>
    );
});

// Main StackingElements component
const StackingElements = ({ navigation }) => { // Receive navigation prop for screen transitions
    // State to store the list of draggable elements
    const [elements, setElements] = useState([]);
    // Ref to keep track of unique keys for elements
    const keyCounter = useRef(0);
    // Animated values for button scaling animations
    const backScale = useRef(new Animated.Value(1)).current;
    const addScale = useRef(new Animated.Value(1)).current;
    // Ref to store the current list of elements for validation
    const elementsRef = useRef([]);

    // State to prevent multiple rapid navigation presses
    const [isNavigating, setIsNavigating] = useState(false);

    // Handle back button press with debouncing to prevent rapid navigation
    const handleBackPress = useCallback(() => {
        if (isNavigating) return; // Prevent multiple presses
        
        setIsNavigating(true);
        
        // Navigate back or to "SmartCounter" screen if no back navigation is possible
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            navigation.navigate("SmartCounter"); // Fallback navigation
        }
        
        // Reset navigation state after a delay
        setTimeout(() => {
            setIsNavigating(false);
        }, 1000);
    }, [navigation, isNavigating]);

    // Validate if a position is valid for placing a new element (no overlap, within bounds)
    const validatePosition = useCallback((x, y) => {
        if (x < 0 || x > width - ELEMENT_SIZE || y < 0 || y > height - ELEMENT_SIZE) return false;
        for (const el of elementsRef.current) {
            const dx = x - el.pan.x._value;
            const dy = y - el.pan.y._value;
            if (Math.abs(dx) < ELEMENT_SIZE && Math.abs(dy) < ELEMENT_SIZE) return false;
        }
        return true;
    }, []);

    // Add a new element at a specific position
    const addElementAtPosition = useCallback((x, y, color, shape) => {
        if (elementsRef.current.length >= MAX_ELEMENTS || !validatePosition(x, y)) {
            console.warn('Failed to add element at', x, y);
            return null;
        }
        const uniqueKey = keyCounter.current++;
        const pan = new Animated.ValueXY({ x, y });
        const newElement = { key: uniqueKey, internalId: uniqueKey, pan, color, shape };
        setElements(prev => {
            const newElements = [...prev, newElement];
            elementsRef.current = newElements;
            return newElements;
        });
        return newElement;
    }, [validatePosition]);

    // Animate an element to a specific position
    const animateElementTo = useCallback((pan, toX, toY, callback, duration = 1000) => {
        const anim = Animated.timing(pan, {
            toValue: { x: toX, y: toY },
            duration,
            useNativeDriver: true,
        });
        anim.start(() => {
            console.log('Animation completed to x:', toX, 'y:', toY);
            callback();
        });
    }, []);

    // Handle drop events for draggable elements
    const handleDrop = useCallback((internalId, newX, newY) => {
        const centerX = newX + ELEMENT_SIZE / 2;
        const centerY = newY + ELEMENT_SIZE / 2;
        const dustbinX = width - DUSTBIN_SIZE - DUSTBIN_PADDING;
        const dustbinY = DUSTBIN_PADDING;

        // Update element position
        setElements(prev => {
            const newElements = prev.map(el => {
                if (el.internalId === internalId) {
                    el.pan.setValue({ x: newX, y: newY });
                    return { ...el };
                }
                return el;
            });
            elementsRef.current = newElements;
            return newElements;
        });

        // Check if the element was dropped in the dustbin and remove it if so
        if (
            centerX >= dustbinX &&
            centerX <= dustbinX + DUSTBIN_SIZE &&
            centerY >= dustbinY &&
            centerY <= dustbinY + DUSTBIN_SIZE
        ) {
            setElements(prev => {
                const newElements = prev.filter(el => el.internalId !== internalId);
                elementsRef.current = newElements;
                console.log('Deleted element', internalId, 'New count:', newElements.length);
                return newElements;
            });
        }
    }, []);

    // Add a new random element to the screen
    const addElement = useCallback(() => {
        if (elementsRef.current.length >= MAX_ELEMENTS) return;

        // Randomly select a shape
        const randomShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
        
        // Assign specific yellow to triangles, random color to others
        const randomColor = randomShape === 'triangle' 
            ? '#cfe010' // Specific yellow for triangles
            : COLORS[Math.floor(Math.random() * COLORS.length)];
        const uniqueKey = keyCounter.current++;
        let randomX, randomY;
        let attempts = 0;
        const maxAttempts = 30;
        let isValidPosition = false;

        // Try to find a valid random position
        while (attempts < maxAttempts) {
            randomX = Math.random() * (width - ELEMENT_SIZE);
            randomY = Math.random() * (height - ELEMENT_SIZE);
            isValidPosition = true;

            for (const el of elementsRef.current) {
                const dx = randomX - el.pan.x._value;
                const dy = randomY - el.pan.y._value;
                if (Math.abs(dx) < ELEMENT_SIZE && Math.abs(dy) < ELEMENT_SIZE) {
                    isValidPosition = false;
                    break;
                }
            }

            if (isValidPosition) break;
            attempts++;
        }

        // Fallback position if no valid position is found
        if (!isValidPosition) {
            randomX = 10;
            randomY = 10;
            let offset = 0;
            while (!isValidPosition && offset < Math.min(width, height)) {
                randomX = 10 + offset;
                randomY = 10 + offset;
                isValidPosition = true;
                for (const el of elementsRef.current) {
                    const dx = randomX - el.pan.x._value;
                    const dy = randomY - el.pan.y._value;
                    if (Math.abs(dx) < ELEMENT_SIZE && Math.abs(dy) < ELEMENT_SIZE) {
                        isValidPosition = false;
                        break;
                    }
                }
                offset += ELEMENT_SIZE / 2;
            }
        }

        const pan = new Animated.ValueXY({ x: randomX, y: randomY });
        const newElement = { key: uniqueKey, internalId: uniqueKey, pan, color: randomColor, shape: randomShape };
        setElements(prev => {
            const newElements = [...prev, newElement];
            elementsRef.current = newElements;
            return newElements;
        });
    }, []);

    // Compute clusters of elements based on proximity
    const getClusters = useCallback((elementsList) => {
        const clusters = [];
        const elementStackNumbers = new Map();
        const visited = new Set();
        const threshold = ELEMENT_SIZE;

        // Iterate through elements to find clusters
        for (let i = 0; i < elementsList.length; i++) {
            const el = elementsList[i];
            if (visited.has(el.key)) continue;
            const cluster = [];
            const stack = [el];

            // Use a stack to group nearby elements
            while (stack.length > 0) {
                const current = stack.pop();
                if (visited.has(current.key)) continue;
                visited.add(current.key);
                cluster.push(current);
                for (let j = 0; j < elementsList.length; j++) {
                    const candidate = elementsList[j];
                    if (
                        !visited.has(candidate.key) &&
                        Math.abs(candidate.pan.x._value - current.pan.x._value) <= threshold &&
                        Math.abs(candidate.pan.y._value - current.pan.y._value) <= threshold
                    ) {
                        stack.push(candidate);
                    }
                }
            }

            // Calculate cluster center and assign stack numbers
            if (cluster.length > 1) {
                const avgX = cluster.reduce((sum, item) => sum + item.pan.x._value, 0) / cluster.length;
                const avgY = cluster.reduce((sum, item) => sum + item.pan.y._value, 0) / cluster.length;
                clusters.push({ x: avgX, y: avgY, count: cluster.length });
                cluster.forEach((el, index) => {
                    elementStackNumbers.set(el.key, index + 1);
                });
            } else {
                elementStackNumbers.set(cluster[0].key, 1);
            }
        }

        // Assign stack number 1 to unclustered elements
        elementsList.forEach(el => {
            if (!elementStackNumbers.has(el.key)) {
                elementStackNumbers.set(el.key, 1);
            }
        });

        console.log('Clusters computed:', clusters);
        return { clusters, elementStackNumbers };
    }, []);

    // Memoize clusters and stack numbers to optimize performance
    const { clusters, elementStackNumbers } = useMemo(() => getClusters(elements), [elements, getClusters]);

    // State to manage displayed elements (synchronized with elements state)
    const [displayElements, setDisplayElements] = useState([]);
    useEffect(() => {
        setDisplayElements([...elements]);
    }, [elements]);

    // Animate button scaling for press feedback
    const animateButton = useCallback((scale, pressIn) => {
        Animated.spring(scale, {
            toValue: pressIn ? 0.95 : 1, // Scale down on press, back to normal on release
            duration: 100,
            useNativeDriver: true,
        }).start();
    }, []);

    // Memoize star overlay for performance
    const memoizedStars = useMemo(() => (
        <View style={styles.starOverlay}>
            {STARS.map((star, index) => (
                <Text key={index} style={[styles.star, { left: star.left, top: star.top }]}>•</Text>
            ))}
        </View>
    ), []);

    // Render the main component
    return (
        <View style={styles.container}>
            {/* Render background stars */}
            {memoizedStars}
            {/* Render the workspace with draggable elements */}
            <View style={styles.workspace}>
                {displayElements.map((el, index) => (
                    <DraggableElement
                        key={el.key}
                        id={index + 1}
                        internalId={el.internalId}
                        color={el.color}
                        shape={el.shape}
                        pan={el.pan}
                        onDrop={handleDrop}
                        stackNumber={elementStackNumbers.get(el.key)}
                    />
                ))}
                {/* Display cluster counts */}
                {clusters.map((cluster, index) => (
                    <Text
                        key={index}
                        style={[
                            styles.stackText,
                            {
                                position: 'absolute',
                                left: cluster.x,
                                top: cluster.y - 50,
                            },
                        ]}
                    >
                        {cluster.count}
                    </Text>
                ))}
            </View>
            {/* Render the dustbin for deleting elements */}
            <View style={styles.dustbin}>
                <Text style={styles.dustbinText}>🗑️</Text>
            </View>
            {/* Render the add element button */}
            <View style={styles.controls}>
                <TouchableOpacity
                    onPress={addElement}
                    onPressIn={() => animateButton(addScale, true)}
                    onPressOut={() => animateButton(addScale, false)}
                    activeOpacity={0.8}
                >
                    <Animated.View style={[styles.button, { transform: [{ scale: addScale }], backgroundColor: '#FFCA28' }]}>
                        <Text style={styles.buttonText}>+ Add Element</Text>
                    </Animated.View>
                </TouchableOpacity>
            </View>

            {/* Render the back button with debouncing */}
            <TouchableOpacity
                style={[
                    styles.backButton, 
                    { 
                        backgroundColor: '#00CED1',
                        opacity: isNavigating ? 0.5 : 1 // Visual feedback for navigation state
                    }
                ]}
                onPress={handleBackPress}
                disabled={isNavigating} // Disable button during navigation
                activeOpacity={0.7} // Touch feedback
            >
                <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
        </View>
    );
};

// Styles for the component
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1B263B', // Dark background for the app
    },
    starOverlay: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        zIndex: 0, // Place stars behind other elements
    },
    star: {
        position: 'absolute',
        color: 'rgba(255, 255, 255, 0.7)', // Semi-transparent white stars
        fontSize: 10,
    },
    workspace: {
        flex: 1,
        backgroundColor: 'transparent',
        borderLeftWidth: 2,
        borderRightWidth: 2,
        borderColor: '#000', // Workspace boundaries
    },
    element: {
        width: ELEMENT_SIZE,
        height: ELEMENT_SIZE,
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    shape: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 5, height: 5 },
        shadowOpacity: 0.8,
        shadowRadius: 5,
        elevation: 10, // Shadow for depth
    },
    circle: {
        borderRadius: 50, // Fully rounded for circles
    },
    square: {
        borderRadius: 0, // No rounding for squares
    },
    triangleContainer: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    elementText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2, // Text styling for stack numbers
    },
    triangleTextContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 3,
        top: ELEMENT_SIZE / 2 - 10, // Center text in triangles
    },
    stackText: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
        textAlign: 'center', // Styling for cluster count text
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginLeft: 50,
        marginBottom: 20,
        padding: 10, // Layout for control buttons
    },
    button: {
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5, // Styling for buttons
    },
    buttonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        letterSpacing: 0.5,
        paddingVertical: 10,
        paddingHorizontal: 16, // Button text styling
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
        zIndex: 1000, // Dustbin styling
    },
    dustbinText: {
        fontSize: 30, // Dustbin icon size
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
        zIndex: 2000, // Back button styling
    },
    backButtonText: {
        fontSize: 18,
        color: 'black',
        fontWeight: 'bold', // Back button text styling
    },
});

export default StackingElements;
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, PanResponder, Dimensions, Animated, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
// Setting up constants for element size, dustbin size, padding, margin, and gap between elements
const ELEMENT_SIZE = 60;
const DUSTBIN_SIZE = 70;
const DUSTBIN_PADDING = 20;
const LEFT_MARGIN = 20;
const GAP = 10;

const DraggableElement = ({ id, x, y, rowIndex, onDrop, label }) => {
    const pan = useRef(new Animated.ValueXY({ x, y })).current;
    const opacity = useRef(new Animated.Value(1)).current; // Reference to control the fade-out effect

    // This effect ensures the element animates back to its starting position when x or y changes
    useEffect(() => {
        Animated.spring(pan, {
            toValue: { x, y },
            useNativeDriver: false,
        }).start();
    }, [x, y]);

    // Sets up the drag functionality using PanResponder for each element
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true, // Allows dragging to start
            onPanResponderGrant: () => {
                // Saves the current position when the drag begins
                pan.setOffset({ x: pan.x._value, y: pan.y._value });
                pan.setValue({ x: 0, y: 0 }); // Resets the base value for movement
            },
            onPanResponderMove: Animated.event(
                [null, { dx: pan.x, dy: pan.y }],
                { useNativeDriver: false }
            ), // Updates the element's position as the user drags
            onPanResponderRelease: (evt, gestureState) => {
                // Flattens the offset and triggers the drop action when dragging ends
                pan.flattenOffset();
                onDrop(rowIndex, id, gestureState.dx, gestureState.dy, pan, opacity);
            },
        })
    ).current;

    return (
        <Animated.View
            style={[
                styles.element,
                { transform: pan.getTranslateTransform(), opacity }, // Applies position and opacity animations
            ]}
            {...panResponder.panHandlers}
        >
            <Text style={styles.labelText}>{label}</Text>
        </Animated.View>
    );
};

// Recalculates the positions and renumbers the labels of elements in a row after changes
const recalcRowElements = (elements, rowY) => {
    // Loops through the elements and updates their positions and labels based on their new index
    return elements.map((el, idx) => ({
        ...el, // Keeps all existing properties
        x: LEFT_MARGIN + idx * (ELEMENT_SIZE + GAP), // Sets new x position with margin and gap
        y: rowY, // Keeps the row's y position
        label: idx + 1, // Updates the label to reflect the new order (1, 2, 3, ...)
    }));
};

// Generates the initial set of rows with random numbers of elements
const generateRows = () => {
    const rowYs = [height / 4, height / 2, (3 * height) / 4]; // Defines the y positions for the three rows
    return rowYs.map((rowY, rowIndex) => {
        const count = Math.floor(Math.random() * 10) + 1; // Picks a random number of elements (1 to 10)
        const elements = Array.from({ length: count }, (_, i) => ({
            id: `${rowIndex}-${i}`, // Creates a unique ID for each element
            label: i + 1, // Sets the label from 1 to the random count
            x: LEFT_MARGIN + i * (ELEMENT_SIZE + GAP), // Calculates the initial x position
            y: rowY, // Assigns the row's y position
            rowIndex, // Stores the row index for reference
        }));
        return { rowIndex, y: rowY, elements: recalcRowElements(elements, rowY) }; // Returns the row with recalculated elements
    });
};

const ThreeLineElements = () => {
    const [rows, setRows] = useState(generateRows()); // Initialize with generated rows
    const [isDarkMode, setIsDarkMode] = useState(false); // State to toggle between light and dark modes

    // Resets the rows to a fresh state whenever the screen is focused
    useFocusEffect(
        React.useCallback(() => {
            setRows(generateRows());
            return () => {}; // Cleanup function
        }, [])
    );

    // Handles the action when an element is dropped, such as into the dustbin
    const handleDrop = (rowIndex, id, deltaX, deltaY, pan, opacity) => {
        const dustbinX = width - DUSTBIN_SIZE - DUSTBIN_PADDING; // Determines the dustbin's x position
        const dustbinY = DUSTBIN_PADDING; // Sets the dustbin's y position

        setRows(prevRows => {
            const updatedRows = prevRows.map(r => {
                if (r.rowIndex !== rowIndex) return r; // Skips if not the target row

                const element = r.elements.find(el => el.id === id); // Finds the dropped element
                if (!element) return r; // Skips if the element isn't found

                const currentX = element.x + deltaX; // Calculates the new x position after drag
                const currentY = element.y + deltaY; // Calculates the new y position after drag

                const isInDustbin =
                    currentX + ELEMENT_SIZE > dustbinX &&
                    currentX < dustbinX + DUSTBIN_SIZE &&
                    currentY + ELEMENT_SIZE > dustbinY &&
                    currentY < dustbinY + DUSTBIN_SIZE; // Checks if the element is over the dustbin

                if (isInDustbin) {
                    // Starts a fade-out animation when the element is dropped in the dustbin
                    Animated.timing(opacity, {
                        toValue: 0, // Fades the element out
                        duration: 200, // Smooth 200ms animation
                        useNativeDriver: false,
                    }).start(() => {
                        // Removes the element from the row after the fade-out completes
                        setRows(prevRows =>
                            prevRows.map(r => {
                                if (r.rowIndex !== rowIndex) return r;
                                const updatedElements = r.elements.filter(el => el.id !== id); // Filters out the dropped element
                                return { ...r, elements: recalcRowElements(updatedElements, r.y) }; // Recalculates positions and labels
                            })
                        );
                    });
                    return r; // Returns the unchanged row initially
                }
                return r; // Returns the row unchanged if not in the dustbin
            });
            return updatedRows;
        });
    };

    // Adds a new element to a randomly selected row
    const addElement = () => {
        if (rows.length === 0) {
            // Handle the case where rows might be empty
            setRows(generateRows());
            return;
        }
        
        const randomRowIndex = Math.floor(Math.random() * rows.length); // Picks a random row
        setRows(prevRows =>
            prevRows.map(r => {
                if (r.rowIndex !== randomRowIndex) return r; // Skips if not the selected row
                const newEl = { 
                    id: `${r.rowIndex}-${Date.now()}`, 
                    rowIndex: r.rowIndex,
                    label: r.elements.length + 1 // Ensure new element has a label
                }; // Creates a new element with a unique ID
                const newElements = [...r.elements, newEl]; // Adds the new element to the existing ones
                return { ...r, elements: recalcRowElements(newElements, r.y) }; // Recalculates positions and labels
            })
        );
    };

    // Toggles the dark mode on or off
    const toggleDarkMode = () => {
        setIsDarkMode(prevMode => !prevMode); // Switches the dark mode state
    };

    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? '#1A1A1A' : '#24bbed' }]}>
            <View style={styles.workspace}>
                {rows.map(row =>
                    row.elements.map(el => (
                        <DraggableElement
                            key={el.id}
                            id={el.id}
                            rowIndex={row.rowIndex}
                            x={el.x}
                            y={el.y}
                            label={el.label}
                            onDrop={handleDrop}
                        />
                    ))
                )}
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
            <View style={styles.controls}>
                <TouchableOpacity
                    onPress={addElement}
                    style={[styles.button, { backgroundColor: isDarkMode ? '#555' : 'blue' }]}
                >
                    <Text style={[styles.buttonText, { color: 'white' }]}>Add Element</Text>
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
    controls: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
        padding: 10,
    },
    button: {
        padding: 10,
        borderRadius: 5,
        minWidth: 120,
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 20,
        color: 'white',
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
});

export default ThreeLineElements;
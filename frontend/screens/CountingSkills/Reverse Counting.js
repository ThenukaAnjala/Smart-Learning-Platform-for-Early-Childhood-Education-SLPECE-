import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, PanResponder, Dimensions, Animated, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const ELEMENT_SIZE = 60;
const DUSTBIN_SIZE = 70;
const DUSTBIN_PADDING = 20;
const LEFT_MARGIN = 20;
const GAP = 10;

const DraggableElement = ({ id, x, y, rowIndex, onDrop, label }) => {
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
                onDrop(rowIndex, id, gestureState.dx, gestureState.dy, pan, opacity);
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

const recalcRowElements = (elements, rowY) => {
    return elements.map((el, idx) => ({
        ...el,
        x: LEFT_MARGIN + idx * (ELEMENT_SIZE + GAP),
        y: rowY,
        label: idx + 1,
    }));
};

const generateRows = () => {
    const rowYs = [height / 4, height / 2, (3 * height) / 4];
    return rowYs.map((rowY, rowIndex) => {
        const count = Math.floor(Math.random() * 10) + 1;
        const elements = Array.from({ length: count }, (_, i) => ({
            id: `${rowIndex}-${i}`,
            label: i + 1,
            x: LEFT_MARGIN + i * (ELEMENT_SIZE + GAP),
            y: rowY,
            rowIndex,
        }));
        return { rowIndex, y: rowY, elements: recalcRowElements(elements, rowY) };
    });
};

const ThreeLineElements = () => {
    const [rows, setRows] = useState([]); // Initially empty
    const [isDarkMode, setIsDarkMode] = useState(false); // Added dark mode state

    // Use useFocusEffect to reset state when the screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            setRows(generateRows()); // Reset rows to a fresh state
        }, [])
    );

    const handleDrop = (rowIndex, id, deltaX, deltaY, pan, opacity) => {
        const dustbinX = width - DUSTBIN_SIZE - DUSTBIN_PADDING;
        const dustbinY = DUSTBIN_PADDING;

        setRows(prevRows => {
            const updatedRows = prevRows.map(r => {
                if (r.rowIndex !== rowIndex) return r;

                const element = r.elements.find(el => el.id === id);
                if (!element) return r;

                const currentX = element.x + deltaX;
                const currentY = element.y + deltaY;

                const isInDustbin =
                    currentX + ELEMENT_SIZE > dustbinX &&
                    currentX < dustbinX + DUSTBIN_SIZE &&
                    currentY + ELEMENT_SIZE > dustbinY &&
                    currentY < dustbinY + DUSTBIN_SIZE;

                if (isInDustbin) {
                    // Fade out the element instead of moving it
                    Animated.timing(opacity, {
                        toValue: 0,
                        duration: 200, // Quick fade-out for smoothness
                        useNativeDriver: false,
                    }).start(() => {
                        // Remove element after fade-out
                        setRows(prevRows =>
                            prevRows.map(r => {
                                if (r.rowIndex !== rowIndex) return r;
                                const updatedElements = r.elements.filter(el => el.id !== id);
                                return { ...r, elements: recalcRowElements(updatedElements, r.y) };
                            })
                        );
                    });
                    return r; // Return unchanged row initially
                }
                return r;
            });
            return updatedRows;
        });
    };

    const addElement = () => {
        const randomRowIndex = Math.floor(Math.random() * rows.length);
        setRows(prevRows =>
            prevRows.map(r => {
                if (r.rowIndex !== randomRowIndex) return r;
                const newEl = { id: `${r.rowIndex}-${Date.now()}`, rowIndex: r.rowIndex };
                const newElements = [...r.elements, newEl];
                return { ...r, elements: recalcRowElements(newElements, r.y) };
            })
        );
    };

    // Toggle dark mode
    const toggleDarkMode = () => {
        setIsDarkMode(prevMode => !prevMode);
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
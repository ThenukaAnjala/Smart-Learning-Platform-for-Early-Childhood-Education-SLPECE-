import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, PanResponder, Dimensions, Animated, TouchableOpacity } from 'react-native';

const { width, height } = Dimensions.get('window');
const ELEMENT_SIZE = 80;
const DUSTBIN_SIZE = 60;
const DUSTBIN_PADDING = 20;
const LEFT_MARGIN = 20;
const GAP = 10;

const DraggableElement = ({ id, x, y, rowIndex, onDrop, label }) => {
    const pan = useRef(new Animated.ValueXY({ x, y })).current;

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
            // Use gestureState.dx/dy to calculate the final drop offset
            onPanResponderRelease: (evt, gestureState) => {
                pan.flattenOffset();
                onDrop(rowIndex, id, gestureState.dx, gestureState.dy);
            },
        })
    ).current;

    return (
        <Animated.View style={[styles.element, { transform: pan.getTranslateTransform() }]} {...panResponder.panHandlers}>
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
    const [rows, setRows] = useState(generateRows);

    const handleDrop = (rowIndex, id, deltaX, deltaY) => {
        setRows(prevRows =>
            prevRows.map(r => {
                if (r.rowIndex !== rowIndex) return r;
    
                const element = r.elements.find(el => el.id === id);
                if (!element) return r;
    
                const currentX = element.x + deltaX;
                const currentY = element.y + deltaY;
                const centerX = currentX + ELEMENT_SIZE / 2;
                const centerY = currentY + ELEMENT_SIZE / 2;
                const dustbinX = width - DUSTBIN_SIZE - DUSTBIN_PADDING;
                const dustbinY = DUSTBIN_PADDING;
    
                // Check if the element is dropped inside the dustbin area
                const isInDustbin =
                    centerX >= dustbinX &&
                    centerX <= dustbinX + DUSTBIN_SIZE &&
                    centerY >= dustbinY &&
                    centerY <= dustbinY + DUSTBIN_SIZE;
    
                if (isInDustbin) {
                    const updatedElements = r.elements.filter(el => el.id !== id);
                    return { ...r, elements: recalcRowElements(updatedElements, r.y) };
                } else {
                    return r;
                }
            })
        );
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

    return (
        <View style={styles.container}>
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
            <View style={styles.dustbin}>
                <Text style={styles.dustbinText}>🗑️</Text>
            </View>
            <View style={styles.controls}>
                <TouchableOpacity onPress={addElement} style={styles.button}>
                    <Text style={styles.buttonText}>Add Element</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#24bbed',
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
        backgroundColor: 'blue',
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
        backgroundColor: '#eee',
        borderRadius: DUSTBIN_SIZE / 2,
        borderWidth: 1,
        borderColor: '#ccc',
        zIndex: 1000,
    },
    dustbinText: {
        fontSize: 30,
    },
});

export default ThreeLineElements;

import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, PanResponder, Dimensions, Animated, TouchableOpacity } from 'react-native';

const { width, height } = Dimensions.get('window');
const ELEMENT_SIZE = 80;
const DUSTBIN_SIZE = 60;
const DUSTBIN_PADDING = 20;

const DraggableElement = ({ id, x, y, color, onDrop }) => {
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
                {
                    useNativeDriver: false,
                    listener: (event, gestureState) => {
                        // Clamp the position to stay within screen boundaries
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
                { backgroundColor: color },
            ]}
            {...panResponder.panHandlers}
        >
            <Text></Text>
        </Animated.View>
    );
};

const StackingElements = () => {
    const [elements, setElements] = useState([]);
    const idCounter = useRef(0);

    const addElement = () => {
        const randomX = Math.random() * (width - ELEMENT_SIZE);
        const randomY = Math.random() * (height - ELEMENT_SIZE);
        const colors = ['red', 'blue', 'yellow', 'green'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const uniqueId = idCounter.current++;

        setElements([...elements, { x: randomX, y: randomY, id: uniqueId, color: randomColor }]);
    };

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
            setElements(prevElements => prevElements.filter(el => el.id !== id));
        } else {
            setElements((prevElements) =>
                prevElements.map((el) =>
                    el.id === id ? { ...el, x: newX, y: newY } : el
                )
            );
        }
    };

    const getClusters = (elementsList) => {
        const clusters = [];
        const visited = new Set();
        const threshold = ELEMENT_SIZE;

        for (const el of elementsList) {
            if (visited.has(el.id)) continue;
            const cluster = [];
            const stack = [el];

            while (stack.length > 0) {
                const current = stack.pop();
                if (visited.has(current.id)) continue;
                visited.add(current.id);
                cluster.push(current);
                elementsList.forEach((candidate) => {
                    if (
                        !visited.has(candidate.id) &&
                        Math.abs(candidate.x - current.x) <= threshold &&
                        Math.abs(candidate.y - current.y) <= threshold
                    ) {
                        stack.push(candidate);
                    }
                });
            }
            if (cluster.length > 1) {
                const avgX = cluster.reduce((sum, item) => sum + item.x, 0) / cluster.length;
                const avgY = cluster.reduce((sum, item) => sum + item.y, 0) / cluster.length;
                clusters.push({ x: avgX, y: avgY, count: cluster.length });
            }
        }
        return clusters;
    };

    const clusters = getClusters(elements);

    return (
        <View style={styles.container}>
            <View style={styles.workspace}>
                {elements.map((el) => (
                    <DraggableElement
                        key={el.id}
                        id={el.id}
                        x={el.x}
                        y={el.y}
                        color={el.color}
                        onDrop={handleDrop}
                    />
                ))}
                {clusters.map((cluster, index) => (
                    <Text
                        key={index}
                        style={[
                            styles.stackText,
                            {
                                position: 'absolute',
                                left: cluster.x,
                                top: cluster.y - 25,
                            },
                        ]}
                    >
                        {cluster.count}
                    </Text>
                ))}
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
        backgroundColor: '#FFFFFF',
    },
    workspace: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderLeftWidth: 2, // Vertical border on left
        borderRightWidth: 2, // Vertical border on right
        borderColor: '#000',
    },
    element: {
        width: ELEMENT_SIZE,
        height: ELEMENT_SIZE,
        borderRadius: 50,
        position: 'absolute',
        shadowColor: '#000',
        shadowOffset: { width: 5, height: 5 },
        shadowOpacity: 0.8,
        shadowRadius: 5,
        elevation: 10,
    },
    stackText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 5,
        borderRadius: 5,
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginLeft: 50,
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

export default StackingElements;
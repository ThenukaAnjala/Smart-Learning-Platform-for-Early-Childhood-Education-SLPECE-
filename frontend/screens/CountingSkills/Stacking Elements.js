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
    const backScale = useRef(new Animated.Value(1)).current;
    const addScale = useRef(new Animated.Value(1)).current;

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

    const handleBackPress = () => {
        console.log('Back button pressed');
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

    const animateButton = (scale, toValue, pressIn) => {
        Animated.spring(scale, {
            toValue: pressIn ? 0.95 : 1,
            useNativeDriver: true,
        }).start();
    };

    // Generate star positions
    const stars = [
        { left: width * 0.1, top: height * 0.1 },
        { left: width * 0.8, top: height * 0.15 },
        { left: width * 0.3, top: height * 0.3 },
        { left: width * 0.7, top: height * 0.4 },
        { left: width * 0.2, top: height * 0.6 },
        { left: width * 0.9, top: height * 0.7 },
        { left: width * 0.4, top: height * 0.8 },
    ];

    return (
        <View style={styles.container}>
            {/* Starry Background Overlay */}
            <View style={styles.starOverlay}>
                {stars.map((star, index) => (
                    <Text key={index} style={[styles.star, { left: star.left, top: star.top }]}>•</Text>
                ))}
            </View>
            <View style={styles.workspace}>
                {/* Back Button */}
                <TouchableOpacity
                    onPress={handleBackPress}
                    onPressIn={() => animateButton(backScale, true)}
                    onPressOut={() => animateButton(backScale, false)}
                    activeOpacity={0.8}
                >
                    <Animated.View style={[styles.backButton, { transform: [{ scale: backScale }], backgroundColor: '#40C4FF' }]}>
                        <Text style={styles.backButtonText}>← Back</Text>
                    </Animated.View>
                </TouchableOpacity>
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1B263B', // Starry blue for space background
    },
    starOverlay: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        zIndex: 0, // Below interactive elements
    },
    star: {
        position: 'absolute',
        color: 'rgba(255, 255, 255, 0.7)', // Semi-transparent white
        fontSize: 10,
    },
    workspace: {
        flex: 1,
        backgroundColor: 'transparent', // Allow container background to show
        borderLeftWidth: 2,
        borderRightWidth: 2,
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
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        letterSpacing: 0.5,
        paddingVertical: 10,
        paddingHorizontal: 16,
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
    backButton: {
        borderRadius: 50,
        shadowColor: '#000',
        height: 50,
        width: 100,
        position: 'absolute',
        top: 20,
        left: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    backButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        letterSpacing: 0.5,
        paddingVertical: 10,
        paddingHorizontal: 16,
    },
});

export default StackingElements;
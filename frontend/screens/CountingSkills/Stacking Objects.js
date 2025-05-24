import React, { useState, useRef, useMemo, useCallback, memo, useEffect } from 'react';
import { View, Text, StyleSheet, PanResponder, Dimensions, Animated, TouchableOpacity } from 'react-native';

const { width, height } = Dimensions.get('window');
const ELEMENT_SIZE = 80;
const DUSTBIN_SIZE = 60;
const DUSTBIN_PADDING = 20;
const MAX_ELEMENTS = 50;
const COLORS = ['red', 'blue', 'yellow', 'green'];
const SHAPES = ['circle', 'square', 'triangle'];
const STARS = [
    { left: width * 0.1, top: height * 0.1 },
    { left: width * 0.8, top: height * 0.15 },
    { left: width * 0.3, top: height * 0.3 },
    { left: width * 0.7, top: height * 0.4 },
    { left: width * 0.2, top: height * 0.6 },
    { left: width * 0.9, top: height * 0.7 },
    { left: width * 0.4, top: height * 0.8 },
];

// Custom Triangle component that draws a true triangle shape
const Triangle = ({ color, size, borderColor }) => {
    return (
        <View style={{
            position: 'relative',
            width: size,
            height: size,
            alignItems: 'center',
            justifyContent: 'center',
        }}>
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

const DraggableElement = memo(({ id, internalId, color, shape, pan, onDrop, stackNumber }) => {
    const scale = useRef(new Animated.Value(1)).current;
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                pan.setOffset({ x: pan.x._value, y: pan.y._value });
                pan.setValue({ x: 0, y: 0 });
                Animated.spring(scale, {
                    toValue: 1.1,
                    duration: 100,
                    useNativeDriver: true,
                }).start();
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
                Animated.spring(scale, {
                    toValue: 1,
                    duration: 100,
                    useNativeDriver: true,
                }).start();
                onDrop(internalId, pan.x._value, pan.y._value);
            },
        })
    ).current;

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

const StackingElements = () => {
    const [elements, setElements] = useState([]);
    const keyCounter = useRef(0);
    const backScale = useRef(new Animated.Value(1)).current;
    const addScale = useRef(new Animated.Value(1)).current;
    const elementsRef = useRef([]);

    const validatePosition = useCallback((x, y) => {
        if (x < 0 || x > width - ELEMENT_SIZE || y < 0 || y > height - ELEMENT_SIZE) return false;
        for (const el of elementsRef.current) {
            const dx = x - el.pan.x._value;
            const dy = y - el.pan.y._value;
            if (Math.abs(dx) < ELEMENT_SIZE && Math.abs(dy) < ELEMENT_SIZE) return false;
        }
        return true;
    }, []);

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

    const handleDrop = useCallback((internalId, newX, newY) => {
        const centerX = newX + ELEMENT_SIZE / 2;
        const centerY = newY + ELEMENT_SIZE / 2;
        const dustbinX = width - DUSTBIN_SIZE - DUSTBIN_PADDING;
        const dustbinY = DUSTBIN_PADDING;

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

    const addElement = useCallback(() => {
        if (elementsRef.current.length >= MAX_ELEMENTS) return;

        const randomShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
        const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
        const uniqueKey = keyCounter.current++;
        let randomX, randomY;
        let attempts = 0;
        const maxAttempts = 30;
        let isValidPosition = false;

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

    const handleBackPress = useCallback(() => {
        console.log('Back button pressed');
    }, []);

    const getClusters = useCallback((elementsList) => {
        const clusters = [];
        const elementStackNumbers = new Map(); // Map to store stack number for each element
        const visited = new Set();
        const threshold = ELEMENT_SIZE;

        for (let i = 0; i < elementsList.length; i++) {
            const el = elementsList[i];
            if (visited.has(el.key)) continue;
            const cluster = [];
            const stack = [el];

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

            if (cluster.length > 1) {
                const avgX = cluster.reduce((sum, item) => sum + item.pan.x._value, 0) / cluster.length;
                const avgY = cluster.reduce((sum, item) => sum + item.pan.y._value, 0) / cluster.length;
                clusters.push({ x: avgX, y: avgY, count: cluster.length });
                // Assign unique stack numbers (1 to n) to each element in the cluster
                cluster.forEach((el, index) => {
                    elementStackNumbers.set(el.key, index + 1);
                });
            } else {
                // Assign 1 to elements not in a cluster
                elementStackNumbers.set(cluster[0].key, 1);
            }
        }

        // Ensure all elements have a stack number (for any element not processed due to visited logic)
        elementsList.forEach(el => {
            if (!elementStackNumbers.has(el.key)) {
                elementStackNumbers.set(el.key, 1);
            }
        });

        console.log('Clusters computed:', clusters);
        return { clusters, elementStackNumbers };
    }, []);

    const { clusters, elementStackNumbers } = useMemo(() => getClusters(elements), [elements, getClusters]);

    const [displayElements, setDisplayElements] = useState([]);
    useEffect(() => {
        setDisplayElements([...elements]);
    }, [elements]);

    const animateButton = useCallback((scale, pressIn) => {
        Animated.spring(scale, {
            toValue: pressIn ? 0.95 : 1,
            duration: 100,
            useNativeDriver: true,
        }).start();
    }, []);

    const memoizedStars = useMemo(() => (
        <View style={styles.starOverlay}>
            {STARS.map((star, index) => (
                <Text key={index} style={[styles.star, { left: star.left, top: star.top }]}>•</Text>
            ))}
        </View>
    ), []);

    return (
        <View style={styles.container}>
            {memoizedStars}
            <View style={styles.workspace}>
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
                {clusters.map((cluster, index) => (
                    <Text
                        key={index}
                        style={[
                            styles.stackText,
                            {
                                position: 'absolute',
                                left: cluster.x,
                                top: cluster.y - 50, // Adjusted to be further above the stack
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
        backgroundColor: '#1B263B',
    },
    starOverlay: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        zIndex: 0,
    },
    star: {
        position: 'absolute',
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 10,
    },
    workspace: {
        flex: 1,
        backgroundColor: 'transparent',
        borderLeftWidth: 2,
        borderRightWidth: 2,
        borderColor: '#000',
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
        elevation: 10,
    },
    circle: {
        borderRadius: 50,
    },
    square: {
        borderRadius: 0,
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
        textShadowRadius: 2,
    },
    triangleTextContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 3,
        top: ELEMENT_SIZE / 2 - 10,
    },
    stackText: {
        color: 'white',
        fontSize: 24, // Increased font size for clarity
        fontWeight: 'bold',
        backgroundColor: 'rgba(0, 0, 0, 0.8)', // Slightly darker background for better contrast
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
        textAlign: 'center',
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
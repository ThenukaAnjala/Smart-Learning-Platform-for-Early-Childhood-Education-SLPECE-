import React, { useState, useRef, useMemo, useCallback, memo, useEffect } from 'react';
import { View, Text, StyleSheet, PanResponder, Dimensions, Animated, TouchableOpacity } from 'react-native';

const { width, height } = Dimensions.get('window');
const ELEMENT_SIZE = 80;
const DUSTBIN_SIZE = 60;
const DUSTBIN_PADDING = 20;
const MAX_ELEMENTS = 50;
const COLORS = ['red', 'blue', 'yellow', 'green'];
const STARS = [
    { left: width * 0.1, top: height * 0.1 },
    { left: width * 0.8, top: height * 0.15 },
    { left: width * 0.3, top: height * 0.3 },
    { left: width * 0.7, top: height * 0.4 },
    { left: width * 0.2, top: height * 0.6 },
    { left: width * 0.9, top: height * 0.7 },
    { left: width * 0.4, top: height * 0.8 },
];

const DraggableElement = memo(({ id, internalId, color, pan, onDrop }) => {
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

    return (
        <Animated.View
            style={[
                styles.element,
                {
                    transform: [
                        ...pan.getTranslateTransform(),
                        { scale },
                    ],
                    backgroundColor: color,
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    borderWidth: 3,
                },
            ]}
            {...panResponder.panHandlers}
        >
            <Text style={styles.elementText}>{id}</Text>
        </Animated.View>
    );
});

const StackingElements = () => {
    const [elements, setElements] = useState([]);
    const [isTutorialActive, setIsTutorialActive] = useState(true);
    const [tutorialText, setTutorialText] = useState('Watch how to create stacks!');
    const keyCounter = useRef(0);
    const backScale = useRef(new Animated.Value(1)).current;
    const addScale = useRef(new Animated.Value(1)).current;
    const arrowOpacity = useRef(new Animated.Value(0)).current;
    const elementsRef = useRef([]);
    const tutorialCompleted = useRef(false);
    const tutorialStep = useRef(0);
    const animationRef = useRef(null);

    const validatePosition = useCallback((x, y) => {
        if (x < 0 || x > width - ELEMENT_SIZE || y < 0 || y > height - ELEMENT_SIZE) return false;
        for (const el of elementsRef.current) {
            const dx = x - el.pan.x._value;
            const dy = y - el.pan.y._value;
            if (Math.abs(dx) < ELEMENT_SIZE && Math.abs(dy) < ELEMENT_SIZE) return false;
        }
        return true;
    }, []);

    const addElementAtPosition = useCallback((x, y, color) => {
        if (elementsRef.current.length >= MAX_ELEMENTS || !validatePosition(x, y)) {
            console.warn('Failed to add tutorial element at', x, y);
            return null;
        }
        const uniqueKey = keyCounter.current++;
        const pan = new Animated.ValueXY({ x, y });
        const newElement = { key: uniqueKey, internalId: uniqueKey, pan, color };
        setElements(prev => {
            const newElements = [...prev, newElement];
            elementsRef.current = newElements;
            return newElements;
        });
        return newElement;
    }, [validatePosition]);

    const animateElementTo = useCallback((pan, toX, toY, callback) => {
        const anim = Animated.timing(pan, {
            toValue: { x: toX, y: toY },
            duration: 1000,
            useNativeDriver: true,
        });
        animationRef.current = anim;
        anim.start(() => {
            console.log('Animation completed to x:', toX, 'y:', toY);
            callback();
            animationRef.current = null;
        });
    }, []);

    const handleDrop = useCallback((internalId, newX, newY, isTutorial = false) => {
        const centerX = newX + ELEMENT_SIZE / 2;
        const centerY = newY + ELEMENT_SIZE / 2;
        const dustbinX = width - DUSTBIN_SIZE - DUSTBIN_PADDING;
        const dustbinY = DUSTBIN_PADDING;

        if (
            centerX >= dustbinX &&
            centerX <= dustbinX + DUSTBIN_SIZE &&
            centerY >= dustbinY &&
            centerY <= dustbinY + DUSTBIN_SIZE ||
            isTutorial
        ) {
            setElements(prev => {
                const newElements = prev.filter(el => el.internalId !== internalId);
                elementsRef.current = newElements;
                console.log('Deleted element', internalId, 'New count:', newElements.length);
                return newElements;
            });
        } else if (!isTutorial) {
            elementsRef.current = elementsRef.current.map(el => {
                if (el.internalId === internalId) {
                    el.pan.setValue({ x: newX, y: newY });
                    return { ...el };
                }
                return el;
            });
            setElements([...elementsRef.current]);
        }
    }, []);

    const skipTutorial = useCallback(() => {
        if (animationRef.current) {
            animationRef.current.stop();
            animationRef.current = null;
        }
        Animated.timing(arrowOpacity, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
        }).start();
        setIsTutorialActive(false);
        setElements([]);
        elementsRef.current = [];
        tutorialCompleted.current = true;
        tutorialStep.current = 2;
        console.log('Tutorial skipped');
    }, []);

    useEffect(() => {
        if (!isTutorialActive || tutorialCompleted.current) return;

        const runTutorial = () => {
            if (tutorialStep.current === 0) {
                setTutorialText('Adding elements to form stacks...');
                const stack1X = width * 0.3;
                const stack1Y = height * 0.4;
                const stack2X = width * 0.6;
                const stack2Y = height * 0.4;

                Animated.sequence([
                    Animated.timing(new Animated.Value(0), { toValue: 1, duration: 500, useNativeDriver: false }),
                    Animated.timing(new Animated.Value(0), { toValue: 1, duration: 500, useNativeDriver: false }),
                    Animated.timing(new Animated.Value(0), { toValue: 1, duration: 500, useNativeDriver: false }),
                    Animated.timing(new Animated.Value(0), { toValue: 1, duration: 500, useNativeDriver: false }),
                    Animated.timing(new Animated.Value(0), { toValue: 1, duration: 500, useNativeDriver: false }),
                    Animated.timing(new Animated.Value(0), { toValue: 1, duration: 500, useNativeDriver: false }),
                ]).start(() => {
                    const el1 = addElementAtPosition(stack1X, stack1Y, 'red');
                    const el2 = addElementAtPosition(stack1X + 20, stack1Y + 20, 'blue');
                    const el3 = addElementAtPosition(stack1X - 20, stack1Y - 20, 'yellow');
                    const el4 = addElementAtPosition(stack2X, stack2Y, 'green');
                    const el5 = addElementAtPosition(stack2X + 20, stack2Y + 20, 'red');
                    const el6 = addElementAtPosition(stack2X - 20, stack2Y - 20, 'blue');

                    if (!el1 || !el2 || !el3 || !el4 || !el5 || !el6) {
                        console.warn('Tutorial failed: Could not add all elements');
                        skipTutorial();
                        return;
                    }

                    tutorialStep.current = 1;
                    setTutorialText('Dragging an element to the dustbin to delete...');
                    Animated.timing(arrowOpacity, {
                        toValue: 1,
                        duration: 500,
                        useNativeDriver: true,
                    }).start();

                    const dustbinCenterX = width - DUSTBIN_SIZE - DUSTBIN_PADDING + DUSTBIN_SIZE / 2;
                    const dustbinCenterY = DUSTBIN_PADDING + DUSTBIN_SIZE / 2;
                    const elementX = dustbinCenterX - ELEMENT_SIZE / 2;
                    const elementY = dustbinCenterY - ELEMENT_SIZE / 2;

                    animateElementTo(el6.pan, elementX, elementY, () => {
                        handleDrop(el6.internalId, elementX, elementY, true);
                        tutorialStep.current = 2;
                        setTutorialText('Tutorial complete! Try it yourself!');
                        Animated.timing(arrowOpacity, {
                            toValue: 0,
                            duration: 500,
                            useNativeDriver: true,
                        }).start();
                        Animated.timing(new Animated.Value(0), {
                            toValue: 1,
                            duration: 2000,
                            useNativeDriver: false,
                        }).start(() => {
                            setIsTutorialActive(false);
                            tutorialCompleted.current = true;
                        });
                    });
                });
            }
        };

        runTutorial();
        return () => {
            if (animationRef.current) {
                animationRef.current.stop();
                animationRef.current = null;
            }
            Animated.timing(arrowOpacity, { toValue: 0, duration: 0, useNativeDriver: true }).start();
        };
    }, [isTutorialActive, addElementAtPosition, animateElementTo, handleDrop, skipTutorial]);

    const addElement = useCallback(() => {
        if (elementsRef.current.length >= MAX_ELEMENTS || isTutorialActive) return;

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
        const newElement = { key: uniqueKey, internalId: uniqueKey, pan, color: randomColor };
        setElements(prev => {
            const newElements = [...prev, newElement];
            elementsRef.current = newElements;
            return newElements;
        });
    }, [isTutorialActive]);

    const handleBackPress = useCallback(() => {
        console.log('Back button pressed');
    }, []);

    const getClusters = useCallback((elementsList) => {
        const clusters = [];
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
            }
        }
        console.log('Clusters computed:', clusters);
        return clusters;
    }, []);

    const clusters = useMemo(() => getClusters(elements), [elements, getClusters]);

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
                    disabled={isTutorialActive}
                >
                    <Animated.View style={[styles.backButton, { transform: [{ scale: backScale }], backgroundColor: '#40C4FF' }]}>
                        <Text style={styles.backButtonText}>← Back</Text>
                    </Animated.View>
                </TouchableOpacity>
                {elements.map((el, index) => (
                    <DraggableElement
                        key={el.key}
                        id={index + 1}
                        internalId={el.internalId}
                        color={el.color}
                        pan={el.pan}
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
                    disabled={isTutorialActive}
                >
                    <Animated.View style={[styles.button, { transform: [{ scale: addScale }], backgroundColor: '#FFCA28' }]}>
                        <Text style={styles.buttonText}>+ Add Element</Text>
                    </Animated.View>
                </TouchableOpacity>
            </View>
            {isTutorialActive && (
                <View style={styles.tutorialOverlay}>
                    <Text style={styles.tutorialText}>{tutorialText}</Text>
                    <Animated.View
                        style={[
                            styles.arrow,
                            {
                                opacity: arrowOpacity,
                                top: DUSTBIN_PADDING - 50,
                                right: DUSTBIN_PADDING + DUSTBIN_SIZE / 2,
                            },
                        ]}
                    >
                        <Text style={styles.arrowText}>↓</Text>
                    </Animated.View>
                    <TouchableOpacity
                        onPress={skipTutorial}
                        style={styles.skipButton}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.skipButtonText}>Skip Tutorial</Text>
                    </TouchableOpacity>
                </View>
            )}
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
        borderRadius: 50,
        position: 'absolute',
        shadowColor: '#000',
        shadowOffset: { width: 5, height: 5 },
        shadowOpacity: 0.8,
        shadowRadius: 5,
        elevation: 10,
        shadowColor: '#fff',
        shadowOpacity: 0.3,
        shadowRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    elementText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
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
    tutorialOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 2000,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tutorialText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: 10,
        borderRadius: 10,
        textAlign: 'center',
    },
    arrow: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    arrowText: {
        fontSize: 40,
        color: '#FFCA28',
        fontWeight: 'bold',
    },
    skipButton: {
        position: 'absolute',
        bottom: 20,
        backgroundColor: '#FF5722',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    skipButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        textAlign: 'center',
    },
});

export default StackingElements;
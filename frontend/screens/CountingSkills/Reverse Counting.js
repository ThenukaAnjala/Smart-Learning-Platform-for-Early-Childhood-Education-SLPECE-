import React, { useState, useRef, useCallback, useEffect, memo } from 'react';
import { View, Text, StyleSheet, PanResponder, Dimensions, Animated, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const ELEMENT_SIZE = 70;
const DUSTBIN_SIZE = 80;
const DUSTBIN_PADDING = 20;
const LEFT_MARGIN = 20;
const GAP = 10;
const MAX_ELEMENTS = 10;
const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'];

const SUCCESS_MESSAGES = [
    'Super Job! 🌟',
    'You’re a Star! ✨',
    'Wow, You Did It! 🎉',
    'Awesome Work! 👍',
    'High Five! 🖐️',
    'You’re Amazing! 😊',
    'Great Going! 🚀',
    'Way to Shine! 💫',
    'Fantastic! 🏆',
];

const FAILURE_MESSAGES = [
    'Try Again! 😄',
    'You’re So Close! 🌈',
    'Keep Going! 💪',
    'Almost There! 🐾',
    'Give It Another Go! 😊',
    'You Can Do It! 🌟',
    'Nice Try! 👍',
    'Let’s Try Again! 🚀',
];

const getRandomMessage = (messages) => {
    return messages[Math.floor(Math.random() * messages.length)];
};

const DraggableElement = memo(({ id, label, x, y, onDrop, isHighest }) => {
    const pan = useRef(new Animated.ValueXY({ x, y })).current;
    const opacity = useRef(new Animated.Value(1)).current;
    const scale = useRef(new Animated.Value(1)).current;
    const shake = useRef(new Animated.Value(0)).current;
    const pulse = useRef(new Animated.Value(1)).current;
    const isTouchable = useRef(true);

    useEffect(() => {
        if (pan && typeof pan.setValue === 'function') {
            Animated.spring(pan, {
                toValue: { x, y },
                useNativeDriver: true,
            }).start();
        }
    }, [x, y]);

    useEffect(() => {
        if (isHighest) {
            const pulseAnimation = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulse, {
                        toValue: 1.1,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulse, {
                        toValue: 1,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                ])
            );
            pulseAnimation.start();
            return () => pulseAnimation.stop();
        }
    }, [isHighest]);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => isTouchable.current,
            onPanResponderGrant: () => {
                if (pan && typeof pan.setOffset === 'function') {
                    pan.setOffset({ x: pan.x._value, y: pan.y._value });
                    pan.setValue({ x: 0, y: 0 });
                    Animated.spring(scale, {
                        toValue: 1.15,
                        duration: 100,
                        useNativeDriver: true,
                    }).start();
                }
            },
            onPanResponderMove: Animated.event(
                [null, { dx: pan.x, dy: pan.y }],
                { useNativeDriver: false }
            ),
            onPanResponderRelease: () => {
                if (pan && typeof pan.flattenOffset === 'function') {
                    pan.flattenOffset();
                    Animated.spring(scale, {
                        toValue: 1,
                        duration: 100,
                        useNativeDriver: true,
                    }).start();
                    isTouchable.current = false;
                    onDrop(id, pan.x._value, pan.y._value, opacity, shake, { x, y }, () => {
                        isTouchable.current = true;
                        console.log('Touch re-enabled for element:', { id, label });
                    });
                }
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
                        { scale: Animated.multiply(scale, pulse) },
                        { translateX: Animated.multiply(shake, 15) },
                    ],
                    opacity,
                    backgroundColor: COLORS[label % COLORS.length],
                    zIndex: 10,
                },
            ]}
            {...panResponder.panHandlers}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
            <Text style={styles.labelText}>{label}</Text>
        </Animated.View>
    );
});

const ReverseCountingGame = () => {
    const [elements, setElements] = useState([]);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [messageColor, setMessageColor] = useState('rgba(255, 0, 0, 0.7)');
    const keyCounter = useRef(0);
    const elementsRef = useRef([]);
    const animationRef = useRef(null);
    const skipScale = useRef(new Animated.Value(1)).current;
    const toastOpacity = useRef(new Animated.Value(0)).current;
    const toastTranslateY = useRef(new Animated.Value(-20)).current;
    const dustbinPulse = useRef(new Animated.Value(1)).current;
    const mounted = useRef(true);
    const isDropping = useRef(false);

    useEffect(() => {
        const dustbinAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(dustbinPulse, {
                    toValue: 1.05,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(dustbinPulse, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        );
        dustbinAnimation.start();
        return () => {
            mounted.current = false;
            dustbinAnimation.stop();
            if (animationRef.current) {
                animationRef.current.stop();
                animationRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (errorMessage) {
            Animated.parallel([
                Animated.timing(toastOpacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(toastTranslateY, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
            setTimeout(() => {
                if (mounted.current) {
                    Animated.parallel([
                        Animated.timing(toastOpacity, {
                            toValue: 0,
                            duration: 300,
                            useNativeDriver: true,
                        }),
                        Animated.timing(toastTranslateY, {
                            toValue: -20,
                            duration: 300,
                            useNativeDriver: true,
                        }),
                    ]).start(() => setErrorMessage(''));
                }
            }, 2000);
        }
    }, [errorMessage]);

    const initializeElements = useCallback(() => {
        const rowY = height / 2;
        const newElements = Array.from({ length: MAX_ELEMENTS }, (_, i) => {
            const id = keyCounter.current++;
            const x = LEFT_MARGIN + i * (ELEMENT_SIZE + GAP);
            return {
                id,
                label: i + 1,
                x,
                y: rowY,
                originalX: x,
                originalY: rowY,
                pan: new Animated.ValueXY({ x, y: rowY }),
                opacity: new Animated.Value(1),
                shake: new Animated.Value(0),
            };
        });
        if (mounted.current) {
            setElements(newElements);
            elementsRef.current = newElements;
            console.log('Initialized elements:', newElements.map(el => ({ id: el.id, label: el.label, x: el.x })));
        }
    }, []);

    useEffect(() => {
        elementsRef.current = elements;
    }, [elements]);

    useFocusEffect(
        useCallback(() => {
            if (!elements.length) {
                initializeElements();
            }
            return () => {
                if (animationRef.current) {
                    animationRef.current.stop();
                    animationRef.current = null;
                }
            };
        }, [initializeElements, elements.length])
    );

    const validatePosition = useCallback((x, y) => {
        console.log('validatePosition called with:', { x, y, width, height, ELEMENT_SIZE });
        if (x < 0 || x > width - ELEMENT_SIZE || y < 0 || y > height - ELEMENT_SIZE) {
            console.log('Position out of bounds:', { x, y });
            return false;
        }
        for (const el of elementsRef.current) {
            const dx = x - el.x;
            const dy = y - el.y;
            if (Math.abs(dx) < ELEMENT_SIZE && Math.abs(dy) < ELEMENT_SIZE) {
                console.log('Position overlaps with existing element:', { x, y, el_x: el.x, el_y: el.y });
                return false;
            }
        }
        console.log('Position valid:', { x, y });
        return true;
    }, []);

    const addElement = useCallback(() => {
        console.log('addElement called', { currentLength: elementsRef.current.length, MAX_ELEMENTS });
        if (elementsRef.current.length >= MAX_ELEMENTS) {
            console.log('Cannot add element: MAX_ELEMENTS reached');
            return;
        }
        const rowY = height / 2;
        let x = LEFT_MARGIN + elementsRef.current.length * (ELEMENT_SIZE + GAP);
        console.log('Attempting to add element at:', { x, y: rowY });
        if (!validatePosition(x, rowY)) {
            console.log('validatePosition failed for:', { x, y: rowY });
            return;
        }

        const id = keyCounter.current++;
        const newElement = {
            id,
            label: elementsRef.current.length === 0 ? 1 : Math.max(...elementsRef.current.map(el => el.label)) + 1,
            x,
            y: rowY,
            originalX: x,
            originalY: rowY,
            pan: new Animated.ValueXY({ x, y: rowY }),
            opacity: new Animated.Value(1),
            shake: new Animated.Value(0),
        };
        console.log('Adding new element:', { id, label: newElement.label, x, y: rowY });
        if (mounted.current) {
            setElements(prev => {
                const newElements = [...prev, newElement];
                elementsRef.current = newElements; // Sync elementsRef
                console.log('Updated elements:', newElements.map(el => ({ id: el.id, label: el.label, x: el.x })));
                return newElements;
            });
        }
    }, [validatePosition]);

    const shuffleElements = useCallback(() => {
        if (!elementsRef.current.length || isDropping.current) {
            console.log('No elements to shuffle or drop in progress');
            return;
        }
        const labels = elementsRef.current.map(el => el.label);
        // Fisher-Yates shuffle
        for (let i = labels.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [labels[i], labels[j]] = [labels[j], labels[i]];
        }
        const newElements = elementsRef.current.map((el, i) => ({
            ...el,
            label: labels[i],
        }));
        if (mounted.current) {
            setElements(newElements);
            elementsRef.current = newElements;
            console.log('Shuffled elements:', newElements.map(el => ({ id: el.id, label: el.label, x: el.x })));
        }
    }, []);

    const handleDrop = useCallback((id, newX, newY, opacity, shake, originalPos, callback) => {
        if (!elementsRef.current.length || isDropping.current) {
            console.log('No elements to drop or drop in progress');
            callback?.();
            return;
        }

        isDropping.current = true;
        setTimeout(() => {
            isDropping.current = false;
        }, 500);

        const dustbinX = width - DUSTBIN_SIZE - DUSTBIN_PADDING;
        const dustbinY = DUSTBIN_PADDING;
        const centerX = newX + ELEMENT_SIZE / 2;
        const centerY = newY + ELEMENT_SIZE / 2;

        const isInDustbin =
            centerX >= dustbinX &&
            centerX <= dustbinX + DUSTBIN_SIZE &&
            centerY >= dustbinY &&
            centerY <= dustbinY + DUSTBIN_SIZE;

        const element = elementsRef.current.find(el => el.id === id);
        if (!element) {
            console.warn('Element not found:', id);
            isDropping.current = false;
            callback?.();
            return;
        }

        const maxLabel = Math.max(...elementsRef.current.map(el => el.label));
        const target = elementsRef.current.find(el => el.label === maxLabel);

        if (isInDustbin && (!target || target.id !== id)) {
            // Wrong element dropped in dustbin
            setErrorMessage(getRandomMessage(FAILURE_MESSAGES));
            setMessageColor('rgba(255, 0, 0, 0.7)');
            Animated.sequence([
                Animated.timing(shake, {
                    toValue: 1,
                    duration: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(shake, {
                    toValue: -1,
                    duration: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(shake, {
                    toValue: 1,
                    duration: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(shake, {
                    toValue: 0,
                    duration: 100,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                Animated.spring(element.pan, {
                    toValue: { x: element.originalX, y: element.originalY },
                    duration: 300,
                    friction: 8,
                    tension: 40,
                    useNativeDriver: true,
                }).start(() => {
                    element.pan.setValue({ x: element.originalX, y: element.originalY });
                    console.log(`Repositioned wrong element ${element.label} to original position: (${element.originalX}, ${element.originalY})`);
                    isDropping.current = false;
                    callback?.();
                });
            });
            return;
        }

        if (isInDustbin && target && target.id === id) {
            // Correct element dropped in dustbin
            setErrorMessage(getRandomMessage(SUCCESS_MESSAGES));
            setMessageColor('rgba(0, 128, 0, 0.7)');
            Animated.timing(opacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start(() => {
                if (mounted.current) {
                    setElements(prev => {
                        const updatedElements = prev.filter(el => el.id !== id).map(el => ({
                            ...el,
                            opacity: new Animated.Value(1),
                            shake: new Animated.Value(0),
                        }));
                        console.log('Deleted element', { id, label: element.label }, 'New count:', updatedElements.length, 'Labels:', updatedElements.map(el => el.label));
                        return updatedElements;
                    });
                }
                isDropping.current = false;
                callback?.();
            });
        } else if (!isInDustbin) {
            Animated.spring(element.pan, {
                toValue: { x: element.originalX, y: element.originalY },
                duration: 300,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }).start(() => {
                element.pan.setValue({ x: element.originalX, y: element.originalY });
                console.log('Repositioned element outside dustbin:', { id, label: element.label, toX: element.originalX });
                isDropping.current = false;
                callback?.();
            });
        }
    }, []);

    const toggleDarkMode = useCallback(() => {
        if (mounted.current) {
            setIsDarkMode(prev => !prev);
        }
    }, []);

    const animateButton = useCallback((scale, pressIn) => {
        Animated.spring(scale, {
            toValue: pressIn ? 0.9 : 1,
            friction: 7,
            tension: 50,
            useNativeDriver: true,
        }).start();
    }, []);

    // Find the maximum label for highlighting
    const maxLabel = elements.length > 0 ? Math.max(...elements.map(el => el.label)) : 0;

    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? '#1A1A1A' : '#E6F3FF' }]}>
            <View style={styles.workspace}>
                {elements.map((el, index) => (
                    <DraggableElement
                        key={el.id}
                        id={el.id}
                        label={el.label}
                        x={el.x}
                        y={el.y}
                        onDrop={handleDrop}
                        isHighest={el.label === maxLabel}
                    />
                ))}
            </View>
            <Animated.View style={[styles.dustbin, { transform: [{ scale: dustbinPulse }] }]}>
                <Text style={styles.dustbinText}>🗑️</Text>
            </Animated.View>
            <TouchableOpacity
                style={[styles.darkModeButton, { backgroundColor: isDarkMode ? '#444' : '#FFF' }]}
                onPress={toggleDarkMode}
                onPressIn={() => animateButton(skipScale, true)}
                onPressOut={() => animateButton(skipScale, false)}
            >
                <Animated.View style={{ transform: [{ scale: skipScale }] }}>
                    <Text style={styles.darkModeIcon}>{isDarkMode ? '☀️' : '🌙'}</Text>
                </Animated.View>
            </TouchableOpacity>
            <View style={styles.controls}>
                <TouchableOpacity
                    onPress={() => {
                        console.log('Add Number button pressed');
                        addElement();
                    }}
                    style={[styles.button, { backgroundColor: isDarkMode ? '#666' : '#FF6B6B' }]}
                    onPressIn={() => animateButton(skipScale, true)}
                    onPressOut={() => animateButton(skipScale, false)}
                >
                    <Animated.View style={{ transform: [{ scale: skipScale }] }}>
                        <Text style={styles.buttonText}>+ Add Number</Text>
                    </Animated.View>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={shuffleElements}
                    style={[styles.button, styles.shuffleButton, { backgroundColor: isDarkMode ? '#666' : '#FF6B6B' }]}
                    onPressIn={() => animateButton(skipScale, true)}
                    onPressOut={() => animateButton(skipScale, false)}
                >
                    <Animated.View style={{ transform: [{ scale: skipScale }] }}>
                        <Text style={styles.shuffleButtonText}>Shuffle</Text>
                    </Animated.View>
                </TouchableOpacity>
            </View>
            <View style={styles.progressContainer}>
                <Text style={[styles.progressText, { color: isDarkMode ? '#FFF' : '#333' }]}>
                    Numbers left: {elements.length}
                </Text>
            </View>
            {errorMessage ? (
                <Animated.View
                    style={[
                        styles.errorOverlay,
                        {
                            opacity: toastOpacity,
                            transform: [{ translateY: toastTranslateY }],
                        },
                    ]}
                >
                    <View
                        style={[
                            styles.errorTextContainer,
                            {
                                backgroundColor: messageColor.includes('255, 0, 0') ? '#FF3333' : '#2E7D32',
                            },
                        ]}
                    >
                        <Text
                            style={[styles.errorText, { color: isDarkMode ? '#FFF' : '#FFF' }]}
                        >
                            {errorMessage}
                        </Text>
                    </View>
                </Animated.View>
            ) : null}
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
        borderRadius: 12,
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    labelText: {
        color: '#FFF',
        fontSize: 26,
        fontWeight: '700',
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    dustbin: {
        position: 'absolute',
        top: DUSTBIN_PADDING,
        right: DUSTBIN_PADDING,
        width: DUSTBIN_SIZE,
        height: DUSTBIN_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 12,
    },
    dustbinText: {
        fontSize: 40,
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 5,
        elevation: 6,
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
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 5,
        elevation: 6,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFF',
    },
    shuffleButton: {
        marginLeft: 10,
    },
    shuffleButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFF',
    },
    progressContainer: {
        position: 'absolute',
        top: DUSTBIN_PADDING + (DUSTBIN_SIZE - 24) / 2,
        right: DUSTBIN_PADDING + DUSTBIN_SIZE + 20,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
        zIndex: 1000,
    },
    progressText: {
        fontSize: 16,
        fontWeight: '600',
    },
    errorOverlay: {
        position: 'absolute',
        top: 50,
        left: 0,
        right: 0,
        zIndex: 1500,
        alignItems: 'center',
    },
    errorTextContainer: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 10,
        maxWidth: '90%',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    errorText: {
        fontSize: 22,
        fontWeight: '700',
        textAlign: 'center',
        letterSpacing: 0.5,
    },
});

export default ReverseCountingGame;
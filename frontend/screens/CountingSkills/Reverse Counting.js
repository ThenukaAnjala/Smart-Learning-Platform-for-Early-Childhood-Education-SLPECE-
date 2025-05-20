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
                        toValue: 1.1,
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
                    shadowOpacity: isHighest ? 0.5 : 0.3,
                    shadowRadius: isHighest ? 8 : 4,
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
    const [isTutorialActive, setIsTutorialActive] = useState(true);
    const [tutorialText, setTutorialText] = useState('Welcome! Drag the highest number (10) to the dustbin.');
    const [tutorialStep, setTutorialStep] = useState(0);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [messageColor, setMessageColor] = useState('rgba(255, 0, 0, 0.7)');
    const keyCounter = useRef(0);
    const elementsRef = useRef([]);
    const tutorialCompleted = useRef(false);
    const animationRef = useRef(null);
    const skipScale = useRef(new Animated.Value(1)).current;
    const mounted = useRef(true);
    const hasSkipped = useRef(false);
    const isDropping = useRef(false);

    useEffect(() => {
        return () => {
            mounted.current = false;
            if (animationRef.current) {
                animationRef.current.stop();
                animationRef.current = null;
            }
        };
    }, []);

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
            if (!tutorialCompleted.current) {
                setIsTutorialActive(true);
                setTutorialStep(0);
                hasSkipped.current = false;
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
        if (x < 0 || x > width - ELEMENT_SIZE || y < 0 || y > height - ELEMENT_SIZE) return false;
        for (const el of elementsRef.current) {
            const dx = x - el.x;
            const dy = y - el.y;
            if (Math.abs(dx) < ELEMENT_SIZE && Math.abs(dy) < ELEMENT_SIZE) return false;
        }
        return true;
    }, []);

    const addElement = useCallback(() => {
        if (elementsRef.current.length >= MAX_ELEMENTS || isTutorialActive) return;
        const rowY = height / 2;
        let x = LEFT_MARGIN + elementsRef.current.length * (ELEMENT_SIZE + GAP);
        if (!validatePosition(x, rowY)) return;

        const id = keyCounter.current++;
        const newElement = {
            id,
            label: elementsRef.current.length + 1,
            x,
            y: rowY,
            originalX: x,
            originalY: rowY,
            pan: new Animated.ValueXY({ x, y: rowY }),
            opacity: new Animated.Value(1),
            shake: new Animated.Value(0),
        };
        if (mounted.current) {
            setElements(prev => {
                const newElements = [...prev, newElement];
                console.log('Added element:', { id, label: newElement.label, x });
                return newElements;
            });
        }
    }, [isTutorialActive, validatePosition]);

    const handleDrop = useCallback((id, newX, newY, opacity, shake, originalPos, callback, isTutorial = false) => {
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

        const target = elementsRef.current[elementsRef.current.length - 1];

        if (isInDustbin && !isTutorial && (!target || target.id !== id)) {
            // Wrong element dropped in dustbin
            setErrorMessage('You have picked the wrong number');
            setMessageColor('rgba(255, 0, 0, 0.7)');
            setTimeout(() => {
                if (mounted.current) setErrorMessage('');
            }, 2000);
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

        if (isInDustbin && (isTutorial || (target && target.id === id))) {
            // Correct element dropped in dustbin
            setErrorMessage('Yayy, you have deleted the correct one');
            setMessageColor('rgba(0, 128, 0, 0.7)');
            setTimeout(() => {
                if (mounted.current) setErrorMessage('');
            }, 2000);
            Animated.timing(opacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start(() => {
                if (mounted.current) {
                    setElements(prev => {
                        const newElements = prev.filter(el => el.id !== id);
                        const updatedElements = newElements.map((el, i) => {
                            const newX = LEFT_MARGIN + i * (ELEMENT_SIZE + GAP);
                            return {
                                ...el,
                                label: i + 1,
                                x: newX,
                                originalX: newX,
                                pan: new Animated.ValueXY({ x: newX, y: el.y }),
                                opacity: new Animated.Value(1),
                                shake: new Animated.Value(0),
                            };
                        });
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

    const animateElementTo = useCallback((element, toX, toY, callback) => {
        if (!element || !element.pan) {
            console.warn('Invalid element for animation');
            callback();
            return;
        }
        const anim = Animated.timing(element.pan, {
            toValue: { x: toX, y: toY },
            duration: 1000,
            useNativeDriver: true,
        });
        animationRef.current = anim;
        anim.start(() => {
            callback();
            animationRef.current = null;
        });
    }, []);

    const skipTutorial = useCallback(() => {
        if (hasSkipped.current || !mounted.current) return;
        hasSkipped.current = true;
        if (animationRef.current) {
            animationRef.current.stop();
            animationRef.current = null;
        }
        setIsTutorialActive(false);
        setTutorialStep(3);
        tutorialCompleted.current = true;
        console.log('Tutorial skipped');
    }, []);

    const advanceTutorial = useCallback(() => {
        if (!mounted.current) return;
        setTutorialStep(prev => prev + 1);
    }, []);

    useEffect(() => {
        if (!isTutorialActive || tutorialCompleted.current || !mounted.current || !elements.length) return;

        const runTutorial = () => {
            const secondLastElement = elementsRef.current[elementsRef.current.length - 2];
            const lastElement = elementsRef.current[elementsRef.current.length - 1];
            const dustbinCenterX = width - DUSTBIN_SIZE - DUSTBIN_PADDING + DUSTBIN_SIZE / 2;
            const dustbinCenterY = DUSTBIN_PADDING + DUSTBIN_SIZE / 2;
            const elementX = dustbinCenterX - ELEMENT_SIZE / 2;
            const elementY = dustbinCenterY - ELEMENT_SIZE / 2;

            if (tutorialStep === 0) {
                setTutorialText('Welcome! Drag the highest number (10) to the dustbin.');
            } else if (tutorialStep === 1) {
                if (!secondLastElement) {
                    console.warn('Tutorial failed: Not enough elements');
                    skipTutorial();
                    return;
                }
                setTutorialText(`Try dragging ${MAX_ELEMENTS - 1}. It’s not the highest, so it’ll go back!`);
                animateElementTo(secondLastElement, elementX, elementY, () => {
                    if (!mounted.current) return;
                    Animated.sequence([
                        Animated.timing(secondLastElement.shake, {
                            toValue: 1,
                            duration: 100,
                            useNativeDriver: true,
                        }),
                        Animated.timing(secondLastElement.shake, {
                            toValue: -1,
                            duration: 100,
                            useNativeDriver: true,
                        }),
                        Animated.timing(secondLastElement.shake, {
                            toValue: 1,
                            duration: 100,
                            useNativeDriver: true,
                        }),
                        Animated.timing(secondLastElement.shake, {
                            toValue: 0,
                            duration: 100,
                            useNativeDriver: true,
                        }),
                    ]).start();
                    Animated.timing(secondLastElement.pan, {
                        toValue: { x: secondLastElement.originalX, y: secondLastElement.originalY },
                        duration: 300,
                        useNativeDriver: true,
                    }).start(() => {
                        secondLastElement.pan.setValue({ x: secondLastElement.originalX, y: secondLastElement.originalY });
                        console.log('Repositioned tutorial element:', { id: secondLastElement.id, label: secondLastElement.label });
                    });
                });
            } else if (tutorialStep === 2) {
                if (!lastElement) {
                    console.warn('Tutorial failed: No last element');
                    skipTutorial();
                    return;
                }
                setTutorialText(`Now drag ${MAX_ELEMENTS} to the dustbin to delete it!`);
                animateElementTo(lastElement, elementX, elementY, () => {
                    if (!mounted.current) return;
                    handleDrop(lastElement.id, elementX, elementY, lastElement.opacity, lastElement.shake, { x: lastElement.originalX, y: lastElement.originalY }, () => {}, true);
                });
            } else if (tutorialStep === 3) {
                setTutorialText('Great! Keep dragging the highest number to count down.');
                setTimeout(() => {
                    if (mounted.current) {
                        setIsTutorialActive(false);
                        tutorialCompleted.current = true;
                    }
                }, 2000);
            }
        };

        runTutorial();
        return () => {
            if (animationRef.current) {
                animationRef.current.stop();
                animationRef.current = null;
            }
        };
    }, [isTutorialActive, tutorialStep, animateElementTo, handleDrop, skipTutorial, elements.length]);

    const toggleDarkMode = useCallback(() => {
        if (mounted.current) {
            setIsDarkMode(prev => !prev);
        }
    }, []);

    const animateButton = useCallback((scale, pressIn) => {
        Animated.spring(scale, {
            toValue: pressIn ? 0.95 : 1,
            duration: 100,
            useNativeDriver: true,
        }).start();
    }, []);

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
                        isHighest={index === elements.length - 1}
                    />
                ))}
            </View>
            <View style={styles.dustbin}>
                <Text style={styles.dustbinText}>🗑️</Text>
            </View>
            <TouchableOpacity
                style={[styles.darkModeButton, { backgroundColor: isDarkMode ? '#333' : '#FFF' }]}
                onPress={toggleDarkMode}
                onPressIn={() => animateButton(skipScale, true)}
                onPressOut={() => animateButton(skipScale, false)}
            >
                <Text style={styles.darkModeIcon}>{isDarkMode ? '☀️' : '🌙'}</Text>
            </TouchableOpacity>
            <View style={styles.controls}>
                <TouchableOpacity
                    onPress={addElement}
                    style={[styles.button, { backgroundColor: isDarkMode ? '#555' : '#FF6B6B' }]}
                    disabled={isTutorialActive}
                    onPressIn={() => animateButton(skipScale, true)}
                    onPressOut={() => animateButton(skipScale, false)}
                >
                    <Text style={styles.buttonText}>+ Add Number</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.progressContainer}>
                <Text style={styles.progressText}>Numbers left: {elements.length}</Text>
            </View>
            {isTutorialActive && (
                <View style={styles.tutorialOverlay}>
                    <Text style={styles.tutorialText}>{tutorialText}</Text>
                    <TouchableOpacity
                        onPress={advanceTutorial}
                        style={styles.gotItButton}
                        onPressIn={() => animateButton(skipScale, true)}
                        onPressOut={() => animateButton(skipScale, false)}
                    >
                        <Animated.View style={[styles.gotItButtonInner, { transform: [{ scale: skipScale }] }]}>
                            <Text style={styles.gotItButtonText}>Got it</Text>
                        </Animated.View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={skipTutorial}
                        style={styles.skipButton}
                        onPressIn={() => animateButton(skipScale, true)}
                        onPressOut={() => animateButton(skipScale, false)}
                    >
                        <Animated.View style={[styles.skipButtonInner, { transform: [{ scale: skipScale }] }]}>
                            <Text style={styles.skipButtonText}>Skip Tutorial</Text>
                        </Animated.View>
                    </TouchableOpacity>
                </View>
            )}
            {errorMessage ? (
                <View style={styles.errorOverlay}>
                    <Text style={[styles.errorText, { backgroundColor: messageColor }]}>{errorMessage}</Text>
                </View>
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
        borderRadius: 10,
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    labelText: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: 'bold',
        textShadowColor: 'rgba(0,0,0,0.2)',
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
        shadowOpacity: 0.3,
        shadowRadius: 4,
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
        paddingVertical: 12,
        paddingHorizontal: 20,
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
        color: '#FFF',
    },
    progressContainer: {
        position: 'absolute',
        top: DUSTBIN_PADDING + (DUSTBIN_SIZE - 24) / 2, // Center vertically with dustbin
        right: DUSTBIN_PADDING + DUSTBIN_SIZE + 20, // Further left of the dustbin
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 8,
        borderRadius: 8,
        zIndex: 1000,
    },
    progressText: {
        fontSize: 16,
        color: '#FFF',
        fontWeight: '600',
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
        color: '#FFF',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: 15,
        borderRadius: 10,
        textAlign: 'center',
        maxWidth: '80%',
    },
    gotItButton: {
        position: 'absolute',
        bottom: 100,
    },
    gotItButtonInner: {
        backgroundColor: '#4CAF50',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    gotItButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFF',
        textAlign: 'center',
    },
    skipButton: {
        position: 'absolute',
        bottom: 30,
    },
    skipButtonInner: {
        backgroundColor: '#FFCA28',
        borderRadius: 8,
        paddingVertical: 12,
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
        color: '#333',
        textAlign: 'center',
    },
    errorOverlay: {
        position: 'absolute',
        top: 50, // Higher up on the screen
        left: 0,
        right: 0,
        zIndex: 1500,
        alignItems: 'center', // Center horizontally
    },
    errorText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFF',
        padding: 10,
        borderRadius: 8,
        textAlign: 'center',
        maxWidth: '80%',
    },
});

export default ReverseCountingGame;
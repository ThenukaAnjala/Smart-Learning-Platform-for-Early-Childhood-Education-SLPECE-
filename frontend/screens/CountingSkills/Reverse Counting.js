import React, { useState, useRef, useCallback, useEffect, memo } from 'react';
import { View, Text, StyleSheet, PanResponder, Dimensions, Animated, TouchableOpacity } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import * as Speech from 'expo-speech';
import Svg, { Polygon } from 'react-native-svg';

// Get device screen dimensions for responsive layout
const { width, height } = Dimensions.get('window');
// Constants for element and dustbin sizes, margins, and game settings
const ELEMENT_SIZE = 70; // Size of draggable elements
const DUSTBIN_SIZE = 80; // Size of the dustbin
const DUSTBIN_PADDING = 20; // Padding around dustbin
const LEFT_MARGIN = 20; // Margin for elements from left edge
const GAP = 10; // Gap between elements
const MAX_ELEMENTS = 10; // Maximum number of elements in game
const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD']; // Colors for elements

// Arrays of success and failure messages for user feedback
const SUCCESS_MESSAGES = [
    'Super Job!', 'You’re a Star!', 'Wow, You Did It!', 'Awesome Work!',
    'High Five!', 'You’re Amazing!', 'Great Going!', 'Way to Shine!', 'Fantastic!',
];
const FAILURE_MESSAGES = [
    'Try Again!', 'You’re So Close!', 'Keep Going!', 'Almost There!',
    'Give It Another Go!', 'You Can Do It!', 'Nice Try!', 'Let’s Try Again!',
];

// Utility function to pick a random message from an array
const getRandomMessage = (messages) => {
    return messages[Math.floor(Math.random() * messages.length)];
};

// Initialize Text-to-Speech (TTS) to find a kid-friendly voice
const initializeTts = async () => {
    try {
        const voices = await Speech.getAvailableVoicesAsync();
        console.log('Available TTS voices:', voices);
        // Look for a child-like or friendly voice (e.g., 'samantha')
        const kidVoice = voices.find(voice =>
            voice.name.toLowerCase().includes('child') ||
            voice.name.toLowerCase().includes('kid') ||
            voice.name.toLowerCase().includes('samantha')
        );
        return kidVoice ? kidVoice.identifier : null;
    } catch (error) {
        console.error('Error initializing TTS:', error);
        return null;
    }
};

// Debounce utility to prevent rapid function calls (used for TTS announcements)
const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

// Announce the highest number to pick using TTS
const announcePickNumber = async (elements, kidVoiceId, lastAnnouncedRef, isAnnouncingRef, setSpeechText, setSpeechBubbleColor) => {
    if (elements.length === 0) {
        setSpeechText('');
        setSpeechBubbleColor('#FF69B4');
        return;
    }
    if (isAnnouncingRef.current) return; // Prevent overlapping announcements
    const maxLabel = Math.max(...elements.map(el => el.label));
    if (lastAnnouncedRef.current === maxLabel) return; // Avoid repeating same announcement
    isAnnouncingRef.current = true;
    try {
        // Stop any ongoing speech to avoid overlap
        let isSpeaking = await Speech.isSpeakingAsync();
        let attempts = 0;
        const maxAttempts = 3;
        while (isSpeaking && attempts < maxAttempts) {
            await Speech.stop();
            await new Promise(resolve => setTimeout(resolve, 100));
            isSpeaking = await Speech.isSpeakingAsync();
            attempts++;
        }
        const speechText = `Pick number ${maxLabel}`;
        lastAnnouncedRef.current = maxLabel;
        setSpeechText(speechText);
        setSpeechBubbleColor('#FF69B4');
        await Speech.speak(speechText, {
            language: 'en',
            voice: kidVoiceId || undefined,
            pitch: kidVoiceId ? 1.0 : 1.5,
            rate: kidVoiceId ? 0.5 : 0.6,
            onError: (error) => {
                console.error('Speech Error:', error);
                setSpeechText('');
                setSpeechBubbleColor('#FF69B4');
                isAnnouncingRef.current = false;
            },
            onDone: () => {
                isAnnouncingRef.current = false;
            },
        });
    } catch (error) {
        console.error('Error in announcePickNumber:', error);
        isAnnouncingRef.current = false;
        setSpeechText('');
        setSpeechBubbleColor('#FF69B4');
    }
};

// Memoized DraggableElement component for performance optimization
const DraggableElement = memo(
  ({ id, label, x, y, onDrop, isHighest, shape }) => {
    // Animated values for dragging, opacity, scaling, and shaking effects
    const pan = useRef(new Animated.ValueXY({ x, y })).current;
    const opacity = useRef(new Animated.Value(1)).current;
    const scale = useRef(new Animated.Value(1)).current;
    const shake = useRef(new Animated.Value(0)).current;
    const pulse = useRef(new Animated.Value(1)).current;
    const isTouchable = useRef(true);

    // Animate element back to its original position when x or y changes
    useEffect(() => {
        Animated.spring(pan, {
            toValue: { x, y },
            useNativeDriver: true,
            tension: 100,
            friction: 4,
        }).start();
    }, [x, y]);

    // Pulse animation for the element with the highest label
    useEffect(() => {
        if (isHighest) {
            const pulseAnimation = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulse, {
                        toValue: 1.1,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulse, {
                        toValue: 1,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                ])
            );
            pulseAnimation.start();
            return () => pulseAnimation.stop();
        }
    }, [isHighest]);

    // PanResponder for handling drag gestures
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => isTouchable.current,
            onPanResponderGrant: () => {
                pan.setOffset({ x: pan.x._value, y: pan.y._value });
                pan.setValue({ x: 0, y: 0 });
                Animated.spring(scale, {
                    toValue: 1.15,
                    duration: 30,
                    useNativeDriver: true,
                }).start();
                isTouchable.current = false;
            },
            onPanResponderMove: (evt, gestureState) => {
                pan.setValue({ x: gestureState.dx, y: gestureState.dy });
            },
            onPanResponderRelease: () => {
                pan.flattenOffset();
                pan.setOffset({ x: 0, y: 0 });
                Animated.spring(scale, {
                    toValue: 1,
                    duration: 30,
                    useNativeDriver: true,
                }).start();
                onDrop(id, pan.x._value, pan.y._value, opacity, shake, { x, y }, () => {
                    isTouchable.current = true;
                });
            },
        })
    ).current;

    // Dynamic style
    const backgroundColor = shape === 'triangle'
        ? 'transparent'
        : COLORS[Math.floor(label) % COLORS.length];

    const borderRadiusStyle =
        shape === 'square'
            ? { borderRadius: 12 }
            : shape === 'circle'
            ? { borderRadius: ELEMENT_SIZE / 2 }
            : {};

    // Render draggable element with shape-specific styling (square, circle, or triangle)
    return (
      <Animated.View
        style={[
          styles.element,
          shape === 'triangle' && styles.elementTriangle,    // removes shadow for triangle
          {
            transform: [
              ...pan.getTranslateTransform(),
              { scale: Animated.multiply(scale, pulse) },
              { translateX: Animated.multiply(shake, 10) },
            ],
            opacity,
            backgroundColor,
            ...borderRadiusStyle,
          },
        ]}
        {...panResponder.panHandlers}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        {shape === 'triangle' && (
          <Svg
            width={ELEMENT_SIZE}
            height={ELEMENT_SIZE}
            style={{ position: 'absolute', top: 0, left: 0 }}
          >
            <Polygon
              points={`
                ${ELEMENT_SIZE / 2},0
                0,${ELEMENT_SIZE}
                ${ELEMENT_SIZE},${ELEMENT_SIZE}
              `}
              fill={COLORS[Math.floor(label) % COLORS.length]}
            />
          </Svg>
        )}

        {/* number in a circle */}
        <View
          style={
            shape === 'triangle'
              ? {
                  position: 'absolute',
                  top: ELEMENT_SIZE * 0.3,
                  left: (ELEMENT_SIZE - 32) / 2,
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: 'rgba(255,255,255,0.5)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }
              : {}
          }
        >
          <Text
            style={[
              styles.labelText,
              shape === 'triangle' && { fontSize: 28, lineHeight: 32 },
            ]}
          >
            {Math.floor(label)}
          </Text>
        </View>
      </Animated.View>
    );
  }
);

// Main game component
const ReverseCountingGame = () => {
    const navigation = useNavigation();
    // State for game elements, dark mode, TTS, speech bubble, and shape
    const [elements, setElements] = useState([]);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [kidVoiceId, setKidVoiceId] = useState(null);
    const [speechText, setSpeechText] = useState('');
    const [temporarySpeechText, setTemporarySpeechText] = useState('');
    const [speechBubbleColor, setSpeechBubbleColor] = useState('#FF69B4');
    const [shape, setShape] = useState('triangle');
    // Refs for managing state and animations
    const keyCounter = useRef(0);
    const elementsRef = useRef([]);
    const animationRef = useRef(null);
    const skipScale = useRef(new Animated.Value(1)).current;
    const dustbinPulse = useRef(new Animated.Value(1)).current;
    const speechOpacity = useRef(new Animated.Value(0)).current;
    const speechScale = useRef(new Animated.Value(0.8)).current;
    const mounted = useRef(true);
    const isDropping = useRef(false);
    const isInitialized = useRef(false);
    const lastAnnouncedRef = useRef(null);
    const isAnnouncingRef = useRef(false);
    const backButtonScale = useRef(new Animated.Value(1)).current;

    // Debounced function to announce the highest number
    const debouncedAnnouncePickNumber = useRef(
        debounce((elements, kidVoiceId) => {
            announcePickNumber(elements, kidVoiceId, lastAnnouncedRef, isAnnouncingRef, setSpeechText, setSpeechBubbleColor);
        }, 1000)
    ).current;

    const maxLabel = elements.length > 0 ? Math.max(...elements.map(el => el.label)) : 0;

    // Initialize TTS on component mount
    useEffect(() => {
        let isActive = true;
        const setupTts = async () => {
            const voiceId = await initializeTts();
            if (isActive && mounted.current) {
                setKidVoiceId(voiceId);
            }
        };
        setupTts();
        return () => {
            isActive = false;
        };
    }, []);

    // Animate dustbin with a pulsing effect
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
            Speech.stop();
        };
    }, []);

    // Animate speech bubble when text changes
    useEffect(() => {
        const displayText = temporarySpeechText || speechText;
        if (displayText && mounted.current) {
            Animated.parallel([
                Animated.timing(speechOpacity, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.spring(speechScale, {
                    toValue: temporarySpeechText ? 1.1 : 1,
                    friction: 4,
                    tension: 100,
                    useNativeDriver: true,
                }),
            ]).start();
        } else if (mounted.current) {
            Animated.parallel([
                Animated.timing(speechOpacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(speechScale, {
                    toValue: 0.8,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [speechText, temporarySpeechText]);

    // Initialize game elements (numbers 1 to 10)
    const initializeElements = useCallback(() => {
        if (isInitialized.current) return;
        isInitialized.current = true;
        elementsRef.current = [];
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
            setTimeout(() => {
                if (mounted.current) {
                    debouncedAnnouncePickNumber(newElements, kidVoiceId);
                }
            }, 1000);
        }
    }, [kidVoiceId]);

    // Trigger element initialization on mount
    useEffect(() => {
        if (!elements.length && !isInitialized.current) {
            initializeElements();
        }
    }, [elements.length, initializeElements]);

    // Update speech text when elements change
    useEffect(() => {
        elementsRef.current = elements;
        if (elements.length > 0) {
            const newMaxLabel = Math.max(...elements.map(el => el.label));
            if (newMaxLabel !== lastAnnouncedRef.current) {
                setSpeechText(`Pick number ${newMaxLabel}`);
                setSpeechBubbleColor('#FF69B4');
            }
        } else {
            setSpeechText('');
            setSpeechBubbleColor('#FF69B4');
        }
    }, [elements]);

    // Clean up animations on screen focus change
    useFocusEffect(
        useCallback(() => {
            return () => {
                if (animationRef.current) {
                    animationRef.current.stop();
                    animationRef.current = null;
                }
            };
        }, [])
    );

    // Validate element position to avoid overlaps and out-of-bounds
    const validatePosition = useCallback((x, y) => {
        if (x < 0 || x > width - ELEMENT_SIZE || y < 0 || y > height - ELEMENT_SIZE) {
            return false;
        }
        for (const el of elementsRef.current) {
            if (!el || typeof el.x !== 'number' || typeof el.y !== 'number') {
                continue;
            }
            const dx = x - el.x;
            const dy = y - el.y;
            if (Math.abs(dx) < ELEMENT_SIZE && Math.abs(dy) < ELEMENT_SIZE) {
                return false;
            }
        }
        return true;
    }, []);

    // Add a new element to the game
    const addElement = useCallback(() => {
        if (elementsRef.current.length >= MAX_ELEMENTS) return;
        const rowY = height / 2;
        let x = LEFT_MARGIN + elementsRef.current.length * (ELEMENT_SIZE + GAP);
        if (!validatePosition(x, rowY)) return;
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
        if (mounted.current) {
            setElements(prev => {
                const newElements = [...prev, newElement];
                elementsRef.current = newElements;
                setTimeout(() => {
                    if (mounted.current) {
                        debouncedAnnouncePickNumber(newElements, kidVoiceId);
                    }
                }, 1000);
                return newElements;
            });
        }
    }, [validatePosition, kidVoiceId]);

    // Shuffle element labels
    const shuffleElements = useCallback(() => {
        if (!elementsRef.current.length || isDropping.current) return;
        const labels = elementsRef.current.map(el => el.label);
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
            setTimeout(() => {
                if (mounted.current) {
                    debouncedAnnouncePickNumber(newElements, kidVoiceId);
                }
            }, 1000);
        }
    }, [kidVoiceId]);

    // Toggle between square, triangle, and circle shapes
    const toggleShape = useCallback(() => {
        if (mounted.current) {
            setShape(prev => {
                const newShape = prev === 'square' ? 'triangle' : prev === 'triangle' ? 'circle' : 'square';
                return newShape;
            });
        }
    }, []);

    // Get icon for the next shape
    const getNextShapeIcon = () => {
        if (shape === 'square') return '🔺';
        if (shape === 'triangle') return '⚪';
        return '⬛';
    };

    // Handle element drop (check if dropped in dustbin and validate)
    const handleDrop = useCallback((id, newX, newY, opacity, shake, originalPos, callback) => {
        if (!elementsRef.current.length || isDropping.current) {
            callback?.();
            return;
        }
        isDropping.current = true;
        setTimeout(() => {
            isDropping.current = false;
        }, 300);
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
            isDropping.current = false;
            callback?.();
            return;
        }
        const maxLabel = Math.max(...elementsRef.current.map(el => el.label));
        const target = elementsRef.current.find(el => el.label === maxLabel);
        if (isInDustbin && (!target || target.id !== id)) {
            // Wrong number dropped: show failure message and shake element
            const failureMessage = getRandomMessage(FAILURE_MESSAGES);
            setTemporarySpeechText(failureMessage);
            setSpeechBubbleColor('#FF3333');
            Speech.stop();
            Speech.speak(failureMessage, {
                language: 'en',
                voice: kidVoiceId || undefined,
                pitch: kidVoiceId ? 1.0 : 1.5,
                rate: kidVoiceId ? 0.5 : 0.6,
                onError: (error) => {
                    console.error('Speech Error:', error);
                    setTemporarySpeechText('');
                    setSpeechBubbleColor('#FF69B4');
                },
                onDone: () => {
                    setTimeout(() => {
                        if (mounted.current) {
                            setTemporarySpeechText('');
                            setSpeechBubbleColor('#FF69B4');
                            if (elementsRef.current.length > 0) {
                                const currentMaxLabel = Math.max(...elementsRef.current.map(el => el.label));
                                setSpeechText(`Pick number ${currentMaxLabel}`);
                            }
                        }
                    }, 1500);
                },
            });
            Animated.sequence([
                Animated.timing(shake, {
                    toValue: 1,
                    duration: 50,
                    useNativeDriver: true,
                }),
                Animated.timing(shake, {
                    toValue: -1,
                    duration: 50,
                    useNativeDriver: true,
                }),
                Animated.timing(shake, {
                    toValue: 1,
                    duration: 50,
                    useNativeDriver: true,
                }),
                Animated.timing(shake, {
                    toValue: 0,
                    duration: 50,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                Animated.spring(element.pan, {
                    toValue: { x: element.originalX, y: element.originalY },
                    duration: 100,
                    friction: 4,
                    tension: 100,
                    useNativeDriver: true,
                }).start(() => {
                    element.pan.setValue({ x: element.originalX, y: element.originalY });
                    isDropping.current = false;
                    callback?.();
                });
            });
            return;
        }
        if (isInDustbin && target && target.id === id) {
            // Correct number dropped: show success message and remove element
            const successMessage = getRandomMessage(SUCCESS_MESSAGES);
            setTemporarySpeechText(successMessage);
            setSpeechBubbleColor('#2E7D32');
            Speech.stop();
            Speech.speak(successMessage, {
                language: 'en',
                voice: kidVoiceId || undefined,
                pitch: kidVoiceId ? 1.0 : 1.5,
                rate: kidVoiceId ? 0.5 : 0.6,
                onError: (error) => {
                    console.error('Speech Error:', error);
                    setTemporarySpeechText('');
                    setSpeechBubbleColor('#FF69B4');
                },
                onDone: () => {
                    setTimeout(() => {
                        if (mounted.current) {
                            setTemporarySpeechText('');
                            setSpeechBubbleColor('#FF69B4');
                            const updatedElements = elementsRef.current.filter(el => el.id !== id);
                            if (updatedElements.length > 0) {
                                const newMaxLabel = Math.max(...updatedElements.map(el => el.label));
                                setSpeechText(`Pick number ${newMaxLabel}`);
                                debouncedAnnouncePickNumber(updatedElements, kidVoiceId);
                            } else {
                                setSpeechText('');
                            }
                        }
                    }, 1500);
                },
            });
            Animated.timing(opacity, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            }).start(() => {
                if (mounted.current) {
                    setElements(prev => {
                        const updatedElements = prev.filter(el => el.id !== id).map(el => ({
                            ...el,
                            opacity: new Animated.Value(1),
                            shake: new Animated.Value(0),
                        }));
                        return updatedElements;
                    });
                }
                isDropping.current = false;
                callback?.();
            });
        } else if (!isInDustbin) {
            // Dropped outside dustbin: return to original position
            Animated.spring(element.pan, {
                toValue: { x: element.originalX, y: element.originalY },
                duration: 100,
                friction: 4,
                tension: 100,
                useNativeDriver: true,
            }).start(() => {
                element.pan.setValue({ x: element.originalX, y: element.originalY });
                isDropping.current = false;
                callback?.();
            });
        }
    }, [kidVoiceId]);

    // Toggle dark mode
    const toggleDarkMode = useCallback(() => {
        if (mounted.current) {
            setIsDarkMode(prev => !prev);
        }
    }, []);

    // Animate button press effect
    const animateButton = useCallback((scale, pressIn) => {
        Animated.spring(scale, {
            toValue: pressIn ? 0.9 : 1,
            friction: 4,
            tension: 100,
            useNativeDriver: true,
        }).start();
    }, []);

    // Navigate back to SmartCounter screen
    const handleBackPress = () => {
        navigation.navigate('SmartCounter');
    };

    // Render game UI
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
                        shape={shape}
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
            <TouchableOpacity
                style={styles.backButton}
                onPress={handleBackPress}
                onPressIn={() => animateButton(backButtonScale, true)}
                onPressOut={() => animateButton(backButtonScale, false)}
            >
                <Animated.View style={{ transform: [{ scale: backButtonScale }] }}>
                    <Text style={styles.backButtonText}>← Back</Text>
                </Animated.View>
            </TouchableOpacity>
            <View style={styles.controls}>
                <TouchableOpacity
                    onPress={addElement}
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
                <TouchableOpacity
                    onPress={toggleShape}
                    style={[styles.button, styles.shapeButton, { backgroundColor: isDarkMode ? '#666' : '#FF6B6B' }]}
                    onPressIn={() => animateButton(skipScale, true)}
                    onPressOut={() => animateButton(skipScale, false)}
                >
                    <Animated.View style={{ transform: [{ scale: skipScale }] }}>
                        <Text style={styles.shapeButtonText}>{getNextShapeIcon()}</Text>
                    </Animated.View>
                </TouchableOpacity>
            </View>
            {(speechText || temporarySpeechText) ? (
                <Animated.View
                    style={[
                        styles.speechOverlay,
                        {
                            opacity: speechOpacity,
                            transform: [{ scale: speechScale }],
                        },
                    ]}
                >
                    <View style={[styles.speechBubble, { backgroundColor: speechBubbleColor, borderColor: isDarkMode ? '#FFF' : '#FFF' }]}>
                        <Text style={[styles.speechText, { color: speechBubbleColor === '#FF69B4' && isDarkMode ? '#333' : '#FFF' }]}>
                            {temporarySpeechText || speechText}
                        </Text>
                    </View>
                </Animated.View>
            ) : null}
        </View>
    );
};

// Styles for the game UI
const styles = StyleSheet.create({
    container: {
        flex: 1, // Full-screen container
    },
    workspace: {
        flex: 1, // Workspace for draggable elements
    },
    // Base—still includes shadows for square & circle
    element: {
        width: ELEMENT_SIZE,
        height: ELEMENT_SIZE,
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        // default shadow for square & circle shapes
        shadowColor: '#000',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },

    // **Override:** no shadow / no elevation when triangle
    elementTriangle: {
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
    },
    labelText: {
        color: '#FFF',
        fontSize: 26,
        fontWeight: '700',
        textShadowColor: 'rgba(0,0,0,0.3)', // Text shadow for readability
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
        backgroundColor: 'rgba(255, 255, 255, 0.2)', // Semi-transparent dustbin
        borderRadius: 12,
    },
    dustbinText: {
        fontSize: 40, // Trash can emoji
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
    backButton: {
        position: 'absolute',
        top: DUSTBIN_PADDING,
        left: DUSTBIN_PADDING,
        backgroundColor: '#4A90E2', // Blue back button
        paddingVertical: 10,
        paddingHorizontal: 20,
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
    backButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFF',
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
    shapeButton: {
        marginLeft: 10,
    },
    shapeButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFF',
    },
    speechOverlay: {
        position: 'absolute',
        top: 65,
        left: 275,
        right: 0,
        zIndex: 1600,
        alignItems: 'center',
        maxWidth: '34%',
    },
    speechBubble: {
        paddingVertical: 15,
        paddingHorizontal: 25,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
        maxWidth: '80%',
        borderWidth: 2,
    },
    speechText: {
        fontSize: 28,
        fontWeight: '700',
        textAlign: 'center',
        textShadowColor: 'rgba(0,0,0,0.2)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
        letterSpacing: 0.5,
    },
});

export default ReverseCountingGame;
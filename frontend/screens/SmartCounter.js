import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, TouchableWithoutFeedback, Image, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Import the bird asset from the assets folder
import birdGif from '../assets/images/bluebird.gif'; // Adjusted path

// Get screen dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Define bird size and padding
const BIRD_SIZE = 80;
const PADDING = 20; // Padding from screen edges
const X_MIN = PADDING;
const X_MAX = SCREEN_WIDTH - BIRD_SIZE - PADDING;
const Y_MIN = PADDING;
const Y_MAX = SCREEN_HEIGHT - BIRD_SIZE - PADDING;

export default function SmartCounter() {
    const navigation = useNavigation();
    const [isDarkMode, setIsDarkMode] = useState(false); // State for dark mode toggle
    const skills = [
        'Stacking Elements',
        'Reverse Counting',
        'Mid-Range Counting',
        'Order Irrelevance Principle',
        'Stable Order Principle'
    ];

    // Animation for buttons (scale and rotation)
    const bounceAnim = React.useRef(skills.map(() => new Animated.Value(1))).current;
    const rotateAnim = React.useRef(skills.map(() => new Animated.Value(0))).current;

    // Animation for birds (6) with distributed positions
    const birdAnims = React.useRef(
        Array(6).fill().map((_, index) => {
            const yStep = (Y_MAX - Y_MIN) / 5; // Divide height into 6 sections for spacing
            return {
                x: new Animated.Value(X_MIN), // Start at left edge with padding
                y: new Animated.Value(Y_MIN + index * yStep), // Distribute vertically
                scale: new Animated.Value(0.8 + Math.random() * 0.4),
                direction: new Animated.Value(1), // 1 for right, -1 for left
            };
        })
    ).current;

    useEffect(() => {
        // Animate birds (left to right, then right to left within bounds)
        birdAnims.forEach((anim, index) => {
            Animated.loop(
                Animated.sequence([
                    // Fly left to right
                    Animated.parallel([
                        Animated.timing(anim.x, {
                            toValue: X_MAX, // Right edge with padding
                            duration: 2000 + index * 200,
                            useNativeDriver: true,
                        }),
                        Animated.timing(anim.direction, {
                            toValue: 1, // Face right
                            duration: 0,
                            useNativeDriver: true,
                        }),
                    ]),
                    // Fly right to left
                    Animated.parallel([
                        Animated.timing(anim.x, {
                            toValue: X_MIN, // Left edge with padding
                            duration: 2000 + index * 200,
                            useNativeDriver: true,
                        }),
                        Animated.timing(anim.direction, {
                            toValue: -1, // Face left
                            duration: 0,
                            useNativeDriver: true,
                        }),
                    ]),
                ])
            ).start();

            // Vertical drift within bounds
            Animated.loop(
                Animated.sequence([
                    Animated.timing(anim.y, {
                        toValue: Y_MIN + Math.random() * (Y_MAX - Y_MIN),
                        duration: 3000 + index * 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(anim.y, {
                        toValue: Y_MIN + Math.random() * (Y_MAX - Y_MIN),
                        duration: 3000 + index * 300,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        });
    }, [birdAnims]);

    const handlePressIn = (index) => {
        Animated.parallel([
            Animated.spring(bounceAnim[index], {
                toValue: 0.9,
                friction: 4,
                useNativeDriver: true,
            }),
            Animated.timing(rotateAnim[index], {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
            })
        ]).start();
    };

    const handlePressOut = (index) => {
        Animated.parallel([
            Animated.spring(bounceAnim[index], {
                toValue: 1,
                friction: 4,
                useNativeDriver: true,
            }),
            Animated.timing(rotateAnim[index], {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            })
        ]).start();
    };

    // Interactive background tap
    const handleBackgroundTap = () => {
        birdAnims.forEach((anim) => {
            Animated.spring(anim.scale, {
                toValue: 1.2,
                friction: 5,
                useNativeDriver: true,
            }).start(() => {
                Animated.spring(anim.scale, {
                    toValue: 0.8 + Math.random() * 0.4,
                    friction: 5,
                    useNativeDriver: true,
                }).start();
            });
        });
    };

    // Toggle dark mode
    const toggleDarkMode = () => {
        setIsDarkMode(prevMode => !prevMode);
    };

    return (
        <TouchableWithoutFeedback onPress={handleBackgroundTap}>
            <View style={[styles.container, { backgroundColor: isDarkMode ? '#1A1A1A' : '#FFFFFF' }]}>
                {/* Background Birds */}
                {birdAnims.map((anim, index) => (
                    <Animated.Image
                        key={`bird-${index}`}
                        source={birdGif}
                        style={[
                            styles.bird,
                            {
                                transform: [
                                    { translateX: anim.x },
                                    { translateY: anim.y },
                                    { scale: anim.scale },
                                    { scaleX: anim.direction },
                                ],
                            },
                        ]}
                    />
                ))}
                {/* Buttons */}
                {skills.map((skill, index) => {
                    const rotateInterpolate = rotateAnim[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '10deg'],
                    });

                    return (
                        <Animated.View
                            key={index}
                            style={[
                                styles.buttonContainer,
                                {
                                    transform: [
                                        { scale: bounceAnim[index] },
                                        { rotate: rotateInterpolate },
                                    ],
                                    borderColor: isDarkMode ? '#333333' : '#FFFFFF',
                                },
                            ]}
                        >
                            <View style={[styles.buttonGradient, { backgroundColor: getColor(index) }]}>
                                <TouchableOpacity
                                    onPressIn={() => handlePressIn(index)}
                                    onPressOut={() => handlePressOut(index)}
                                    onPress={() => navigation.navigate(skill)}
                                    style={styles.touchable}
                                >
                                    <Text style={[styles.buttonText, { color: isDarkMode ? '#E0E0E0' : '#FFFFFF' }]}>
                                        {skill}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    );
                })}
                {/* Dark Mode Toggle Button */}
                <TouchableOpacity
                    style={[styles.darkModeButton, { backgroundColor: isDarkMode ? '#333333' : '#E0E0E0' }]}
                    onPress={toggleDarkMode}
                >
                    <Text style={styles.darkModeIcon}>
                        {isDarkMode ? '☀️' : '🌙'}
                    </Text>
                </TouchableOpacity>
            </View>
        </TouchableWithoutFeedback>
    );
}

// Function to assign playful colors to buttons
const getColor = (index) => {
    const colors = ['#FF6F61', '#FFD166', '#06D6A0', '#FF9F1C', '#118AB2'];
    return colors[index % colors.length];
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 20,
        position: 'relative',
    },
    bird: {
        position: 'absolute',
        width: 80,
        height: 80,
        opacity: 0.9,
    },
    buttonContainer: {
        margin: 35,
        borderRadius: 40,
        borderWidth: 3,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 10,
        zIndex: 1,
    },
    buttonGradient: {
        borderRadius: 36,
        padding: 4,
        overflow: 'hidden',
    },
    touchable: {
        padding: 20,
        width: 140,
        alignItems: 'center',
        borderRadius: 32,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    buttonText: {
        fontSize: 18,
        fontWeight: '900',
        textAlign: 'center',
        textShadowColor: '#000',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    darkModeButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        zIndex: 2,
    },
    darkModeIcon: {
        fontSize: 24,
        color: '#000',
    },
});
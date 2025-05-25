import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Get screen dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function SmartCounter() {
    const navigation = useNavigation();
    const [isDarkMode, setIsDarkMode] = useState(false); // State for dark mode toggle
    const skills = [
        'Stacking Objects',
        'Reverse Counting',
        'Mid-Range Counting',
        'Order Irrelevance Principle',
        'Stable Order Principle'
    ];

    // Animation for buttons (scale, rotation, shake, and fade-in)
    const bounceAnim = React.useRef(skills.map(() => new Animated.Value(1))).current;
    const rotateAnim = React.useRef(skills.map(() => new Animated.Value(0))).current;
    const shakeAnim = React.useRef(skills.map(() => new Animated.Value(0))).current;
    const fadeAnim = React.useRef(skills.map(() => new Animated.Value(0))).current;

    useEffect(() => {
        // Fade-in animation on load
        fadeAnim.forEach((anim, index) => {
            Animated.timing(anim, {
                toValue: 1,
                duration: 500,
                delay: index * 100, // Staggered fade-in for each button
                useNativeDriver: true,
            }).start();
        });

        // Periodic shake animation for buttons
        const shakeSequence = () => {
            shakeAnim.forEach((anim, index) => {
                Animated.sequence([
                    Animated.timing(anim, {
                        toValue: 5,
                        duration: 50, // Reduced from 100 to 50
                        useNativeDriver: true,
                    }),
                    Animated.timing(anim, {
                        toValue: -5,
                        duration: 50, // Reduced from 100 to 50
                        useNativeDriver: true,
                    }),
                    Animated.timing(anim, {
                        toValue: 5,
                        duration: 50, // Reduced from 100 to 50
                        useNativeDriver: true,
                    }),
                    Animated.timing(anim, {
                        toValue: 0,
                        duration: 50, // Reduced from 100 to 50
                        useNativeDriver: true,
                    }),
                ]).start();
            });
        };

        // Trigger shake every 5 seconds
        shakeSequence();
        const shakeInterval = setInterval(shakeSequence, 5000);

        return () => clearInterval(shakeInterval); // Clean up interval on unmount
    }, [shakeAnim, fadeAnim]);

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

        // Placeholder for sound effect (requires react-native-sound or similar library)
        // Example: playSound('button_press.mp3');
        console.log('Play sound: button_press.mp3');
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

    // Toggle dark mode
    const toggleDarkMode = () => {
        setIsDarkMode(prevMode => !prevMode);
    };

    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? '#1A1A1A' : '#FFFFFF' }]}>  
            {/* Back Button */}
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.navigate('Home')}
                activeOpacity={0.7}
            >
                <Text style={styles.backButtonIcon}>←</Text>
                <Text style={styles.backButtonLabel}>Back</Text>
            </TouchableOpacity>
            {/* Buttons */}
            {skills.map((skill, index) => {
                const rotateInterpolate = rotateAnim[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '10deg'],
                });
                const shakeInterpolate = shakeAnim[index].interpolate({
                    inputRange: [-5, 0, 5],
                    outputRange: ['-5deg', '0deg', '5deg'],
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
                                    { rotate: shakeInterpolate },
                                ],
                                borderColor: isDarkMode ? '#333333' : '#FFFFFF',
                                opacity: fadeAnim[index],
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
    backButton: {
        position: 'absolute',
        top: 30,
        left: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4A90E2',
        borderRadius: 25,
        paddingVertical: 10,
        paddingHorizontal: 22,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        zIndex: 10,
    },
    backButtonIcon: {
        fontSize: 22,
        color: '#FFF',
        fontWeight: 'bold',
        marginRight: 7,
        textShadowColor: 'rgba(0,0,0,0.2)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    backButtonLabel: {
        fontSize: 18,
        color: '#FFF',
        fontWeight: '700',
        letterSpacing: 1,
        textShadowColor: 'rgba(0,0,0,0.2)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
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
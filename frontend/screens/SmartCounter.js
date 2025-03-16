import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function SmartCounter() {
    const navigation = useNavigation();
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

    return (
        <View style={styles.container}>
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
                                <Text style={styles.buttonText}>{skill}</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                );
            })}
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
        backgroundColor: '#F0F8FF', // Softer pastel blue
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 20,
        // Adding a subtle texture-like effect with shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    buttonContainer: {
        margin: 35,
        borderRadius: 40,
        borderWidth: 3,
        borderColor: '#FFFFFF', // White border for a clean, playful look
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 10,
    },
    buttonGradient: {
        borderRadius: 36,
        padding: 4, // Space for inner "gradient" effect
        backgroundColor: '#FFFFFF', // Base color for gradient simulation
        overflow: 'hidden',
    },
    touchable: {
        padding: 20,
        width: 140, // Slightly larger for better touch area
        alignItems: 'center',
        borderRadius: 32,
        backgroundColor: 'rgba(255, 255, 255, 0.2)', // Subtle overlay for depth
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '900', // Extra bold for emphasis
        textAlign: 'center',
        textShadowColor: '#000', // Text shadow for pop
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
});
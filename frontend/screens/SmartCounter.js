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

    // Animation for buttons
    const bounceAnim = React.useRef(skills.map(() => new Animated.Value(1))).current;

    const handlePressIn = (index) => {
        Animated.spring(bounceAnim[index], {
            toValue: 0.95,
            friction: 5,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = (index) => {
        Animated.spring(bounceAnim[index], {
            toValue: 1,
            friction: 5,
            useNativeDriver: true,
        }).start();
    };

    return (
        <View style={styles.container}>
            {skills.map((skill, index) => (
                <Animated.View
                    key={index}
                    style={[
                        styles.buttonContainer,
                        { transform: [{ scale: bounceAnim[index] }] },
                        { backgroundColor: getColor(index) }, // Dynamic colors
                    ]}
                >
                    <TouchableOpacity
                        onPressIn={() => handlePressIn(index)}
                        onPressOut={() => handlePressOut(index)}
                        onPress={() => navigation.navigate(skill)}
                        style={styles.touchable}
                    >
                        <Text style={styles.buttonText}>{skill}</Text>
                    </TouchableOpacity>
                </Animated.View>
            ))}
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
        backgroundColor: '#E6F0FA', // Light, playful blue background
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 20,
    },
    buttonContainer: {
        margin: 20,
        borderRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    touchable: {
        padding: 20,
        width: 120, // Fixed width for consistency
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});
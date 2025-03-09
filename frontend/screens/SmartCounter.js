import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function SmartCounter() {
    const navigation = useNavigation();
    const skills = ['Stacking Elements', 'Reverse Counting', 'Mid-Range Counting', 'Order Irrelevance Principle', 'Stable Order Principle'];

    return (
        <>
            {skills.map((skill, index) => (
                <TouchableOpacity
                    key={index}
                    style={styles.buttonContainer}
                    onPress={() => navigation.navigate(skill)}
                >
                    <Text style={styles.buttonText}>{skill}</Text>
                </TouchableOpacity>
            ))}
        </>
    );
}

const styles = StyleSheet.create({
    buttonContainer: {
        margin: 10,
        padding: 15,
        backgroundColor: '#007BFF',
        borderRadius: 25,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
});
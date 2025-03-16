import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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

    return (
        <View style={styles.container}>
            {skills.map((skill, index) => (
                <TouchableOpacity
                    key={index}
                    style={styles.buttonContainer}
                    onPress={() => navigation.navigate(skill)}
                >
                    <Text style={styles.buttonText}>{skill}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection:'row',
        flexWrap:'wrap'
    },
    buttonContainer: {
        margin: 40,
        padding: 20,
        width: '20%',
        minHeight:'auto',
        backgroundColor: '#007BFF',
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
});
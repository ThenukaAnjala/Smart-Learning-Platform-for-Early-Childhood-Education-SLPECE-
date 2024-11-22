import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import { predict } from './src/api/predict';

export default function App() {
    const [input, setInput] = useState('');
    const [result, setResult] = useState(null);

    const handlePredict = async () => {
        const prediction = await predict(input);
        setResult(prediction);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Predict Using AI</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter input"
                value={input}
                onChangeText={setInput}
            />
            <Button title="Predict" onPress={handlePredict} />
            {result && <Text style={styles.result}>Prediction: {result}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    input: {
        width: '80%',
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 16,
        paddingHorizontal: 8,
    },
    result: {
        marginTop: 16,
        fontSize: 18,
    },
});

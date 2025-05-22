import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { AuthContext } from '../../frontend/App';

const api = axios.create({
  baseURL: 'http://192.168.1.46:5000/api', // Replace with your backend URL
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const SignupScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setIsAuthenticated } = useContext(AuthContext);

  const handleSignup = async () => {
    try {
      await api.post('/register', { username, password });
      // Optionally log in automatically after signup
      const response = await api.post('/login', { username, password });
      await SecureStore.setItemAsync('jwt_token', response.data.token);
      setIsAuthenticated(true); // Switch to authenticated stack
    } catch (err) {
      setError('Signup failed. Username may already exist.');
      console.error('Signup error:', err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title="Sign Up" onPress={handleSignup} />
      <View style={styles.buttonSpacer} />
      <Button
        title="Go to Login"
        onPress={() => navigation.navigate('Login')}
      />
      <View style={styles.buttonSpacer} />
      <Button
        title="Go to Landing"
        onPress={() => navigation.navigate('Landing')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  error: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  buttonSpacer: {
    height: 10,
  },
});

export default SignupScreen;
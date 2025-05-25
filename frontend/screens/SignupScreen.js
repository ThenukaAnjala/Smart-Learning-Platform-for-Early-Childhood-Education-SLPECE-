import React, { useState, useContext } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { AuthContext } from '../../frontend/App';
import { useFonts } from 'expo-font';

const api = axios.create({
  baseURL: 'http://192.168.53.47:5000/api',
});
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('jwt_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const SignupScreen = ({ navigation }) => {
  const { setIsAuthenticated } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [fontsLoaded] = useFonts({
    'Schoolbell-Regular': require('../assets/fonts/Schoolbell-Regular.ttf'),
  });
  if (!fontsLoaded) return null;

  const handleSignup = async () => {
    try {
      await api.post('/register', { username, password });
      // auto-login
      const res = await api.post('/login', { username, password });
      await SecureStore.setItemAsync('jwt_token', res.data.token);
      setIsAuthenticated(true);
    } catch (err) {
      setError('Signup failed. Username may already exist.');
      console.error(err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#888"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity
        style={styles.buttonPrimary}
        onPress={handleSignup}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.buttonSecondary}
        onPress={() => navigation.navigate('Login')}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Go to Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.buttonSecondary}
        onPress={() => navigation.navigate('Landing')}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7ED',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Schoolbell-Regular',
    fontSize: 32,
    color: '#E94E77',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    fontFamily: 'Schoolbell-Regular',
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#4F6D7A',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
    color: '#333',
  },
  error: {
    fontFamily: 'Schoolbell-Regular',
    color: '#D32F2F',
    textAlign: 'center',
    marginBottom: 16,
  },
  buttonPrimary: {
    backgroundColor: '#E94E77',
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonSecondary: {
    backgroundColor: '#4F6D7A',
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: 'center',
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    fontFamily: 'Schoolbell-Regular',
    fontSize: 18,
    color: '#FFF',
  },
});
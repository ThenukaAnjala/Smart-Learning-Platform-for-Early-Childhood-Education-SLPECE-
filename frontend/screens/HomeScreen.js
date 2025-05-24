import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { AuthContext } from '../../frontend/App'; // Adjust path if needed

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

const HomeScreen = ({ navigation }) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const { setIsAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    const fetchProtectedData = async () => {
      try {
        const response = await api.get('/protected');
        setData(response.data);
      } catch (err) {
        setError('Failed to fetch protected data.');
        if (err.response?.status === 401) {
          await SecureStore.deleteItemAsync('jwt_token');
          setIsAuthenticated(false);
        }
      }
    };
    fetchProtectedData();
  }, [setIsAuthenticated]);

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('jwt_token');
    setIsAuthenticated(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {data ? `Welcome, ${data.user.username}!` : 'This is the Home Screen'}
      </Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button
        title="Open Drawing Board"
        onPress={() => navigation.navigate('DrawingBoard')}
      />
      <View style={styles.buttonSpacer} />
      <Button title="Logout" onPress={handleLogout} color="#FF3B30" />

      <Text style={styles.title}>This is the Animal Discoverer Screen</Text>
      <Button title="Open Animal Discoverer" onPress={() => navigation.navigate('AnimalDetectionScreen')} />


      <Text style={styles.title}>This is the Animal Quiz Screen</Text>
      <Button title="Open Animal Quiz" onPress={() => navigation.navigate('LevelSelectionScreen')} />
      <Button title="Open Smart Counter" onPress={() => navigation.navigate('SmartCounter')} />
    </View>

    

    




  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6200EE',
    marginBottom: 20,
  },
  error: {
    fontSize: 16,
    color: '#FF3B30',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonSpacer: {
    height: 10,
  },
});

export default HomeScreen;
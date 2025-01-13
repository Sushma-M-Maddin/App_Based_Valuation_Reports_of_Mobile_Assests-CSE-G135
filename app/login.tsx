import { View, Text, StyleSheet, Alert, TextInput, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import axios from 'axios';
import LoginScreen from '../components/LoginScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';

// Define the type for props
interface FloatingLabelInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean; // Optional prop for secure text entry
  togglePasswordVisibility?: () => void; // Prop to toggle password visibility
}

const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({
  label,
  value,
  onChangeText,
  secureTextEntry = false,
  togglePasswordVisibility,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.inputContainer}>
      <Text
        style={[
          styles.floatingLabel,
          (isFocused || value) && styles.floatingLabelFocused,
        ]}
      >
        {label}
      </Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />

{togglePasswordVisibility && (
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={togglePasswordVisibility}
        >
          <Ionicons
            name={secureTextEntry ? 'eye-off' : 'eye'}
            size={24}
            color="#888"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true); // State for toggling password visibility

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://172.17.33.130:5000/api/auth/login', {
        email,
        password,
      });

      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
        await AsyncStorage.setItem('userName', response.data.name);
        await AsyncStorage.setItem('userEmail', response.data.email);

        alert('Login Successful, You are logged in');
        router.navigate('/(tabs)/home');
      } else {
        alert('Login Failed, Invalid email or password');
      }
    } catch (error) {
      console.error(error);
      alert('Login Failed, Invalid email or password');
    }
  };

  const onSignup = () => {
    router.navigate('/signup');
  };

   // Toggle the password visibility
   const togglePasswordVisibility = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back!</Text>
      <Text style={styles.subtitle}>
        Get Started with Your{'\n'}
        <Text>Asset Valuation</Text>
      </Text>

      <FloatingLabelInput label="E-mail" value={email} onChangeText={setEmail} />
      <FloatingLabelInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={secureTextEntry}
        togglePasswordVisibility={togglePasswordVisibility}  // Pass the function to toggle password visibility
      />

      <Text style={styles.registerText}>
        Not yet Registered?{' '}
        <Text onPress={onSignup} style={styles.signupText}>
          Sign Up
        </Text>
      </Text>
      <LoginScreen title={'Login'} onPress={handleLogin} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 32,
    fontFamily: 'outfit-Bold',
    marginTop: 20,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'outfit',
    textAlign: 'center',
    marginBottom: 30,
    color: '#555',
  },
  inputContainer: {
    width: 300,
    marginBottom: 20,
    position: 'relative',
  },
  floatingLabel: {
    position: 'absolute',
    left: 15,
    top: 18, // Aligns with the placeholder
    fontSize: 16,
    color: '#888',
    fontFamily: 'outfit',
    zIndex: 1, // Ensures it appears above the input field
    backgroundColor: '#f9f9f9', // Matches the container's background
    paddingHorizontal: 5,
  },
  floatingLabelFocused: {
    top: -10, // Moves above the input field
    fontSize: 12,
    color: '#6C63FF', // Blue for focus
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    fontFamily: 'outfit',
    backgroundColor: '#fff',
  },
  iconContainer: {
    position: 'absolute',
    right: 15,
    top: '30%',
  },
  registerText: {
    fontSize: 14,
    marginTop: 10,
    fontFamily: 'outfit',
    textAlign: 'center',
    color: '#777',
  },
  signupText: {
    fontSize: 14,
    fontFamily: 'outfit-Bold',
    color: '#6C63FF',
  },
});

export default Login;

import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import axios from 'axios';
import LoginScreen from '../components/LoginScreen';
import Ionicons from '@expo/vector-icons/Ionicons';

// Define the type for props
interface FloatingLabelInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
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

const SignUp = () => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securePassword, setSecurePassword] = useState(true); // State for toggling password visibility
  const [secureConfirmPassword, setSecureConfirmPassword] = useState(true); // State for toggling confirm password visibility

  const onLogin = () => {
    router.navigate('/login');
  };

  const onSignUp = async () => {
    try {
      const response = await axios.post('http://172.17.33.130:5000/api/auth/signup', {
        name,
        email,
        password,
        confirmPassword,
      });
      if (response.data.message === 'User registered successfully') {
        Alert.alert('Success', response.data.message);
        router.push('/login');
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        Alert.alert('Error', error.response?.data?.message || 'Something went wrong.');
      } else if (error instanceof Error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Error', 'An unknown error occurred.');
      }
    }
  };

  // Toggle the password visibility
  const togglePasswordVisibility = () => {
    setSecurePassword(!securePassword);
  };

  // Toggle the confirm password visibility
  const toggleConfirmPasswordVisibility = () => {
    setSecureConfirmPassword(!secureConfirmPassword);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome!</Text>
      <Text style={styles.subtitle}>
        Get Started with Your{'\n'}
        <Text>Asset Valuation</Text>
      </Text>

      <FloatingLabelInput label="Full Name" value={name} onChangeText={setName} />
      <FloatingLabelInput label="E-mail" value={email} onChangeText={setEmail} />
      <FloatingLabelInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={securePassword}
        togglePasswordVisibility={togglePasswordVisibility}  // Pass the function to toggle password visibility
      />
      <FloatingLabelInput
        label="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry={secureConfirmPassword}
        togglePasswordVisibility={toggleConfirmPasswordVisibility}  // Pass the function to toggle confirm password visibility
      />

      <Text style={styles.registerText}>
        Already have an account?{' '}
        <Text onPress={onLogin} style={styles.LoginText}>
          Login
        </Text>
      </Text>
      <LoginScreen title={'Register'} onPress={onSignUp} />
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
  LoginText: {
    fontSize: 14,
    fontFamily: 'outfit-Bold',
    color: '#6C63FF',
  },
});

export default SignUp;

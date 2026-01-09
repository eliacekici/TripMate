import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppFooter from './AppFooter'; 
import { RootStackParamList } from '../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';


import { styles, COLORS } from './LoginScreen.styles';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
const { width: screenWidth } = Dimensions.get('window');

interface LoginResponse {
  message?: string;
  token?: string;
  user?: {
    id: number;
    email: string;
  };
}





const LoginScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const navigateToSignUp = () => {
    navigation.navigate('SignUpScreen');
  };

  const handleLogin = async () => {
    setErrorMessage('');
    setLoading(true);

    try {
      const response = await fetch('http://10.0.2.2:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = (await response.json()) as LoginResponse;

      if (!response.ok) {
        if (data.message === 'NO_USER') {
          setErrorMessage('No account registered with this email.');
        } else if (data.message === 'WRONG_PASSWORD') {
          setErrorMessage(
            "Incorrect password. Don't remember your password? You could create a new account. "
          );
        } else {
          setErrorMessage('Login failed. Try again.');
        }
        setLoading(false);
        return;
      }

      console.log('Logged in user:', data.user);

      // SAVE USER ID HERE 
      if (data.user?.id) {
        await AsyncStorage.setItem('userId', String(data.user.id));
      }

      if (data.token) {
        await AsyncStorage.setItem('token', data.token);
      }

      navigation.replace('DashboardMyPlansScreen');


    } catch (error) {
      setErrorMessage('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Check if the current error message is the one that requires the 'Sign Up' link
  const isWrongPasswordError = errorMessage.startsWith('Incorrect password');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity style={styles.inactiveTab} onPress={navigateToSignUp}>
            <Text style={styles.inactiveTabText}>Sign Up</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.activeTab} disabled>
            <Text style={styles.activeTabText}>Log In</Text>
          </TouchableOpacity>
        </View>

        {/* Title */}
        <Text style={styles.welcomeTitle}>Welcome back!</Text>
        <Text style={styles.subtitle}>
          Get access to your travel data and plans by logging in to your account.
        </Text>

        {/* Inputs */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            placeholderTextColor={COLORS.DARK_TEXT}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={COLORS.DARK_TEXT}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {errorMessage !== '' && (
            <View style={styles.errorTextContainer}>
              <Text style={styles.errorText}>
                {/* Display the main error message */}
                {errorMessage}
                
                {/* Conditionally display the 'Sign Up' link for the wrong password error */}
                {isWrongPasswordError && (
                  <Text style={styles.signUpLinkText} onPress={navigateToSignUp}>
                    Sign Up
                  </Text>
                )}
              </Text>
            </View>
          )}

        </View>

        {/* Login Button */}
        <TouchableOpacity
          style={[styles.loginButton, loading && { opacity: 0.7 }]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.loginButtonText}>
            {loading ? 'Logging in...' : 'Log In'}
          </Text>
        </TouchableOpacity>

        {/* Sign up link */}
        <View style={styles.loginLinkContainer}>
          <Text style={styles.loginText}>You don't have an account? </Text>
          <TouchableOpacity onPress={navigateToSignUp}>
            <Text style={styles.loginLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;
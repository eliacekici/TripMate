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
import { RootStackParamList } from './AppFooter';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
const { width: screenWidth } = Dimensions.get('window');

// --- COLORS ---
const COLORS = {
  NAVY_BLUE: '#00223D',
  LIGHT_BLUE_BACKGROUND: '#E0F2FE',
  INPUT_FIELD: '#C3E2F1',
  WHITE: '#FFFFFF',
  DARK_TEXT: '#000000',
  GRAY_TEXT: '#888888',
  BORDER_COLOR: '#0C1559',
};

const LoginScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [wrongPassword, setWrongPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigateToSignUp = () => {
    navigation.navigate('SignUpScreen');
  };

  const handleLogin = async () => {
    setErrorMessage('');
    setWrongPassword(false);
    setLoading(true);

    try {
      const response = await fetch('http://192.168.1.96:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});

      const data = await response.json();

      if (!response.ok) {
        if (data.message === 'NO_USER') {
          setErrorMessage('No account registered with this email.');
        } else if (data.message === 'WRONG_PASSWORD') {
          setErrorMessage('Incorrect password.');
          setWrongPassword(true);
        } else {
          setErrorMessage('Login failed. Try again.');
        }
        setLoading(false);
        return;
      }

      // ✅ LOGIN SUCCESS
      console.log('Logged in user:', data.user);
      // navigation.replace('HomeScreen');

    } catch (error) {
      setErrorMessage('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
            <Text style={styles.errorText}>{errorMessage}</Text>
          )}

          {wrongPassword && (
            <TouchableOpacity
              style={styles.forgotPasswordButton}
              onPress={() => console.log('Forgot password')}
            >
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>
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

// --- STYLES ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.LIGHT_BLUE_BACKGROUND,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 20,
    alignItems: 'center',
  },

  tabContainer: {
    flexDirection: 'row',
    width: screenWidth - 60,
    height: 40,
    marginBottom: 30,
  },
  activeTab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 3,
    borderColor: COLORS.NAVY_BLUE,
  },
  activeTabText: {
    fontSize: 18,
    fontFamily: 'Karma-Bold',
    color: COLORS.NAVY_BLUE,
  },
  inactiveTab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: COLORS.GRAY_TEXT,
  },
  inactiveTabText: {
    fontSize: 16,
    fontFamily: 'Karma-Regular',
    color: COLORS.GRAY_TEXT,
  },

  welcomeTitle: {
    fontSize: 20,
    fontFamily: 'Karma-Bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
  },

  inputContainer: {
    width: '100%',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    height: 45,
    backgroundColor: COLORS.INPUT_FIELD,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.BORDER_COLOR,
    marginBottom: 15,
  },

  errorText: {
    color: 'red',
    fontSize: 14,
    marginBottom: 10,
  },

  forgotPasswordButton: {
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    color: COLORS.NAVY_BLUE,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },

  loginButton: {
    width: '100%',
    backgroundColor: COLORS.NAVY_BLUE,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
  },
  loginButtonText: {
    color: COLORS.WHITE,
    fontSize: 18,
    fontWeight: '700',
  },

  loginLinkContainer: {
    flexDirection: 'row',
  },
  loginText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    color: COLORS.NAVY_BLUE,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

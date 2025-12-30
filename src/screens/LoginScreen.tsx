import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from './AppFooter';

// Define the navigation type
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
const { width: screenWidth } = Dimensions.get('window');

// --- CONSTANTS  ---
const COLORS = {
  NAVY_BLUE: '#00223D', 
  LIGHT_BLUE_BACKGROUND: '#E0F2FE', 
  INPUT_FIELD: '#C3E2F1', 
  WHITE: '#FFFFFF',
  DARK_TEXT: '#000000',
  GRAY_TEXT: '#888888',
  INPUT_BORDER: '#CCCCCC',
  BLUE_FOCUS: '#4A90E2', 
  BORDER_COLOR: '#0C1559',
};


// --- Main Component: LoginScreen ---

const LoginScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Function to handle navigation to Sign Up screen
  const navigateToSignUp = () => {
    navigation.navigate('SignUpScreen');
  };

  const handleLogin = () => {
    // Implement actual login logic here (e.g., API call)
    console.log('Logging in with:', email, password);
    
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        {/* 1. Sign Up / Log in Tabs (Adopted from SignUpScreen) */}
        <View style={styles.tabContainer}>
          {/* Inactive Tab: Sign Up */}
          <TouchableOpacity 
            style={styles.inactiveTab}
            onPress={navigateToSignUp}
          >
            <Text style={styles.inactiveTabText}>Sign Up</Text>
          </TouchableOpacity>
          
          {/* Active Tab: Log In */}
          <TouchableOpacity style={styles.activeTab} disabled>
            <Text style={styles.activeTabText}>Log In</Text>
          </TouchableOpacity>
        </View>

        {/* 2. Welcome Text (Modified to match SignUp screen text style) */}
        <Text style={styles.welcomeTitle}>Welcome back!</Text>
        <Text style={styles.subtitle}>
          Get access to your travel data and plans by logging in to your account.
        </Text>

        {/* 3. Input Fields */}
        <View style={styles.inputContainer}>
          {/* Email Input */}
          <TextInput
            style={styles.input} 
            placeholder="Email Address"
            placeholderTextColor={COLORS.DARK_TEXT}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          
          {/* Password Input */}
          <TextInput
            style={styles.input} 
            placeholder="Password"
            placeholderTextColor={COLORS.DARK_TEXT}
            secureTextEntry={true}
            value={password}
            onChangeText={setPassword}
          />

          {/* Forgot Password Link */}
          <TouchableOpacity 
            style={styles.forgotPasswordButton}
            onPress={() => console.log('Forgot password pressed')}
          >
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>
        </View>

        {/* 4. Log In Button (Adopted SignUpScreen's button style) */}
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Log In</Text>
        </TouchableOpacity>

        {/* 5. Don't have an account / Sign Up Link */}
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


// --- Stylesheet (Adopted and merged from SignUpScreen's styles) ---

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
  
  // --- Tab Styles  ---
  tabContainer: {
    flexDirection: 'row',
    width: screenWidth - 60, 
    height: 40,
    marginBottom: 30,
    marginTop: 10, 
  },
  activeTab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 3,
    borderColor: COLORS.NAVY_BLUE,
    backgroundColor: COLORS.LIGHT_BLUE_BACKGROUND,
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
    backgroundColor: COLORS.LIGHT_BLUE_BACKGROUND,
  },
  inactiveTabText: {
    fontSize: 16,
    fontFamily: 'Karma-Regular',
    color: COLORS.GRAY_TEXT,
  },
  
  // --- Text Styles ---
  welcomeTitle: {
    fontSize: 20,
    fontFamily: 'Karma-Bold',
    color: COLORS.DARK_TEXT,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Karma-SemiBold',
    color: COLORS.DARK_TEXT,
    marginBottom: 40,
    width: '100%',
  },
  
  // --- Input Styles  ---
  inputContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    maxWidth: 345, 
    height: 45, 
    backgroundColor: COLORS.INPUT_FIELD, 
    paddingHorizontal: 15,
    borderRadius: 8,
    fontSize: 16,
    color: COLORS.DARK_TEXT,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.BORDER_COLOR, 
    
  },
  
  // --- Forgot Password Styles ---
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    width: '100%',
    maxWidth: 345, 
    alignItems: 'flex-end',
  },
  forgotPasswordText: {
    fontSize: 14,
    color: COLORS.NAVY_BLUE,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  
  // --- Button Styles---
  loginButton: {
    width: '100%', 
    maxWidth: 345, 
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
  
  // --- Log In/Sign Up Link Styles---
  loginLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  loginText: {
    fontSize: 14,
    color: COLORS.DARK_TEXT, 
  },
  loginLink: {
    fontSize: 14,
    color: COLORS.NAVY_BLUE,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
  Dimensions,
  Image, 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppFooter from './AppFooter'; 
import { RootStackParamList } from '../../App';

import { styles, COLORS } from './SignUpScreen.styles';


// --- Constants ---
const { width: screenWidth } = Dimensions.get('window');
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// --- CUSTOM ASSET IMPORTS ---
const ICONS = {
    CHECK_MARK: require('../assets/images/green_check.png'), 
    RED_CROSS: require('../assets/images/red_check.png'),     
    CHECKBOX_CHECKED: require('../assets/images/checkbox_checked.png'), 
    CHECKBOX_UNCHECKED: require('../assets/images/checkbox_unchecked.png'), 
};
// -----------------------------


const SignUpScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  // State and Handlers
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChecked, setIsChecked] = useState(false); 
  const [isLoading, setIsLoading] = useState(false); 

  // --- Password Validation Logic ---
  const passwordCriteria = useMemo(() => {
    return {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSymbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };
  }, [password]);

  const isPasswordValid = Object.values(passwordCriteria).every(Boolean);

  // --- Handler for Sign Up Logic ---
  const handleSignUp = async () => {
  if (!email || !password || !confirmPassword) {
    Alert.alert('Error', 'Please fill in all fields.');
    return;
  }
  
  if (!isPasswordValid) {
    Alert.alert('Error', 'Password does not meet all security criteria.');
    return;
  }

  if (password !== confirmPassword) {
    Alert.alert('Error', 'Password and Confirm Password do not match.');
    return;
  }
  
  if (!isChecked) {
    Alert.alert('Error', 'You must agree to the privacy and policy to sign up.');
    return;
  }

  setIsLoading(true);

  try {
    const response = await fetch('http://10.0.2.2:5000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        confirmPassword,
      }),
    });

    const data = await response.json() as { message?: string; token?: string };
    setIsLoading(false);

    if (!response.ok) {
      Alert.alert('Signup Failed', data.message || 'Something went wrong');
      return;
    }

    Alert.alert('Success', 'Account created successfully!');
    navigation.navigate('LoginScreen'); 
  } catch (error) {
    console.error(error);
    setIsLoading(false);
    Alert.alert('Error', 'Unable to connect to the server.');
  }
};

  // --- Helper Component for Password Conditions (Unchanged) ---
  const ConditionCheck = ({ met, text }: { met: boolean; text: string }) => {
    const iconSource = met ? ICONS.CHECK_MARK : ICONS.RED_CROSS;
    
    return (
      <View style={styles.conditionRow}>
        <Image 
            source={iconSource}
            style={styles.conditionIconImage} 
            resizeMode="contain"
        />
        <Text style={styles.conditionText}>
          {text}
        </Text>
      </View>
    );
  };
  
  // --- Render ---
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>

        {/* 1. Sign Up / Log in Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity style={styles.activeTab} disabled>
            <Text style={styles.activeTabText}>Sign Up</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.inactiveTab}
            onPress={() => navigation.navigate('LoginScreen')}
          >
            <Text style={styles.inactiveTabText}>Log in</Text>
          </TouchableOpacity>
        </View>

        {/* Introductory Text */}
        <Text style={styles.introText}>
          Sign up to access deals, itinerary and recommendations.
        </Text>

        {/* 2. Form Inputs */}
        <TextInput
          style={styles.input}
          placeholder="Email Address"
          placeholderTextColor={COLORS.DARK_TEXT}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={COLORS.DARK_TEXT}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true}
          autoCapitalize="none"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Confirm Password" 
          placeholderTextColor={COLORS.DARK_TEXT}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={true}
          autoCapitalize="none"
        />

        {/* 3. Password Conditions */}
        <View style={styles.conditionsArea}>
          <ConditionCheck met={passwordCriteria.minLength} text="minimum 8 characters" />
          <ConditionCheck met={passwordCriteria.hasUppercase} text="at least 1 uppercase letter" />
          <ConditionCheck met={passwordCriteria.hasNumber} text="at least 1 number" />
          <ConditionCheck met={passwordCriteria.hasSymbol} text="at least 1 symbol" />
        </View>
        
        {/* 4. Privacy Policy Checkbox (NOW USES DEDICATED IMAGE ASSET) */}
        <TouchableOpacity 
          style={styles.checkboxRow}
          onPress={() => setIsChecked(!isChecked)}
        >
          {/* Display the correct image based on the checked state */}
          <Image 
            source={isChecked ? ICONS.CHECKBOX_CHECKED : ICONS.CHECKBOX_UNCHECKED}
            style={styles.checkboxImage}
            resizeMode="contain"
          />
          <Text style={styles.privacyText}>By continuing you agree to our privacy and policy</Text>
        </TouchableOpacity>

        {/* 5. Sign Up Button */}
        <TouchableOpacity
          style={[
            styles.signUpButton, 
            (isLoading || !isChecked) && { opacity: 0.6 } 
          ]}
          onPress={handleSignUp}
          disabled={isLoading || !isChecked}
        >
          <Text style={styles.signUpButtonText}>
            {isLoading ? 'Signing Up...' : 'Sign Up'}
          </Text>
        </TouchableOpacity>

        {/* 6. Already have an account? Log in */}
        <View style={styles.loginLinkContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
            <Text style={styles.loginLink}>Log in</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
};

export default SignUpScreen;

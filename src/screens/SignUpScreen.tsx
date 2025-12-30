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
import { RootStackParamList } from './AppFooter'; 

// --- Constants ---
const { width: screenWidth } = Dimensions.get('window');
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const COLORS = {
  NAVY_BLUE: '#00223D', 
  LIGHT_BLUE_BACKGROUND: '#E0F2FE', 
  INPUT_FIELD: '#C3E2F1', 
  DARK_TEXT: '#000000',
  GRAY_TEXT: '#888888',
  RED: '#E74C3C', 
  GREEN: '#2ECC71', 
  WHITE: '#FFFFFF',
  BORDER_COLOR: '#0C1559',
};

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

    const data = await response.json();
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

// --- Stylesheet ---

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
  introText: {
    width: '100%',
    fontSize: 16,
    fontFamily: 'Karma-SemiBold',
    color: COLORS.DARK_TEXT,
    marginBottom: 40,
    textAlign: 'left',
  },
  input: {
    width: '100%',
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
  conditionsArea: {
    width: '100%',
    alignItems: 'flex-start',
    marginBottom: 30,
  },
  conditionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  conditionText: {
    fontSize: 14,
    color: COLORS.DARK_TEXT,
  },
  
  // --- STYLES FOR IMAGE ICONS ---
  conditionIconImage: {
    width: 16, 
    height: 16,
    marginRight: 10,
  },
  // --- Checkbox Styles ---
  checkboxRow: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    marginBottom: 50,
  },
  checkboxImage: { // New style for the checkbox image itself
    width: 20, 
    height: 20,
    marginRight: 10,
  },
  privacyText: {
    fontSize: 14,
    color: COLORS.DARK_TEXT,
  },
  
  // --- Button Styles ---
  signUpButton: {
    width: '100%',
    backgroundColor: COLORS.NAVY_BLUE,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
  },
  signUpButtonText: {
    color: COLORS.WHITE,
    fontSize: 18,
    fontWeight: '700',
  },
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
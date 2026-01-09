import React from 'react';
import {
  View,
  Text,
  Image, 
  ImageBackground, 
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppFooter from './AppFooter'; 
import { RootStackParamList } from '../../App';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { height: screenHeight } = Dimensions.get('window');

// --- Component ---

const MyPlansLoggedOutScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  // Space so content doesn’t go under the fixed footer (Keep your existing value)
  const FOOTER_SPACE = Platform.OS === 'ios' ? 120 : 90;

  return (
    // Use SafeAreaView around the whole screen for better fit
    <SafeAreaView style={styles.container}> 
      
      {/* 1. TOP IMAGE AREA */}
      <ImageBackground
        source={require('../assets/images/planning_top_image.png')}
        style={styles.headerImage}
        resizeMode="cover"
      >
      </ImageBackground>

      {/* 2. MAIN CONTENT AREA */}
      <View style={styles.content}>
        
        {/* TEXT */}
        <Text style={styles.title}>Welcome to TripMate!</Text> 
        <Text style={styles.subtitle}>Log in to save your plans</Text> 

        {/* LOGIN BUTTON */}
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate('LoginScreen')}
        >
          <Text style={styles.loginButtonText}>Log in</Text>
        </TouchableOpacity>

        {/* SIGN UP */}
        <Text style={styles.signupText}>Don't have an account yet?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('SignUpScreen')}>
          <Text style={styles.signupLink}>Sign up</Text>
        </TouchableOpacity>
        
      </View>

      {/* 3. FOOTER */}
      <AppFooter
        navigation={navigation}
        activeScreen="MyPlansLoggedOutScreen"
      />
    </SafeAreaView>
  );
};

export default MyPlansLoggedOutScreen;

// --- Stylesheet ---

const COLORS = {
  NAVY_BLUE: '#00223D', 
  LIGHT_BLUE_BACKGROUND: '#E0F2FE', 
  DARK_TEXT: '#000000',
  GRAY_TEXT: '#000000',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.LIGHT_BLUE_BACKGROUND, 
  },
  

  headerImage: {
    width: '100%',
    height: screenHeight * 0.30, 
    resizeMode: 'cover',
  },
  
  content: {
    flex: 1, 
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 60, 
    paddingBottom: Platform.OS === 'ios' ? 120 : 90,
  },
  
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.DARK_TEXT,
    marginBottom: 8, 
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.GRAY_TEXT,
    marginBottom: 40,
    textAlign: 'center',
    paddingBottom: 20,
  },
  
  
  loginButton: {
    width: '65%', 
    backgroundColor: COLORS.NAVY_BLUE,
    paddingVertical: 18, 
    borderRadius: 8,
    alignItems: 'center', 
    marginBottom: 30,
  },
  
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600', 
  },
  
  signupText: {
    fontSize: 14,
    color: COLORS.GRAY_TEXT,
    marginBottom: 6,
    paddingTop: 40,
  },

  signupLink: {
    fontSize: 16, 
    color: COLORS.NAVY_BLUE,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});
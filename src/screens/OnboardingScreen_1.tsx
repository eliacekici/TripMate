import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
//import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

type RootStackParamList = {
   Onboarding1: undefined;
  Onboarding2: undefined;
  Splash: undefined;
  Home: undefined;
};

const OnboardingScreen_1: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // const handleNext = async () => {
  //   try {
  //     await AsyncStorage.setItem('hasOnboarded', 'true'); // mark as completed
  //     navigation.replace('Splash'); // or 'Home' if you want to go directly to Home
  //   } catch (err) {
  //     // handle error gracefully
  //     console.warn('Could not save onboarding flag', err);
  //     Alert.alert('Error', 'Could not complete onboarding. Please try again.');
  //   }
  // };

  const handleNext = () => {
    navigation.navigate('Onboarding2');
  };

  return (
      <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <View style={styles.container}>
        <Text style={styles.title}>Tour Guides</Text>
        <Text style={styles.subtitle}>
          TripMate helps you find tour guides for personalized trips. 
          Discover tips and unforgettable experiences.
        </Text>

        <Image
          source={require('../assets/images/onboarding_photo.png')}
          style={styles.image}
          resizeMode="contain"
        />

       <TouchableOpacity
          style={styles.button}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default OnboardingScreen_1;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#E0F2FE', 
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center', 
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 36,
    fontFamily: 'Karma-Bold',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    color: '#000000',
  },
  subtitle: {
    fontSize: 20,
    fontFamily: 'Karma-Regular',
    textAlign: 'center',
    marginBottom: 24,
    color: '#000000',
  },
  image: {
    width: 393,
    height: 356,
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#00223D', 
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 140,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Karma-Bold',
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

import React from 'react';
import {
  View,
  Text,
  Image,
  StatusBar,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import styles from './OnboardingScreen_1.styles';
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



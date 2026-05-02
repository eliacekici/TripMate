import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import styles from './OnboardingScreen_2.styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Onboarding1: undefined;
  Onboarding2: undefined;
  Splash: undefined; 
  DashboardGuides: undefined;
};

const OnboardingScreen_2 = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

   const handleLetsGo = async () => {
    await AsyncStorage.setItem('hasOnboarded', 'true');
    navigation.replace('DashboardGuides'); 
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#E0F2FE" />
      <View style={styles.container}>
        <Text style={styles.title}>My Travel Plan</Text>
        <Text style={styles.subtitle}>
          TravelMate lets you create and manage your personal travel plans. 
          Easily organize your trips and schedules.
        </Text>

        <Image
          source={require('../assets/images/onboarding_photo_2.png')}
          style={styles.image}
          resizeMode="contain"
        />

        <TouchableOpacity style={styles.button} onPress={handleLetsGo}>
          <Text style={styles.buttonText}>Let’s go</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default OnboardingScreen_2;

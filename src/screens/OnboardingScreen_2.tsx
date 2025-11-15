import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#E0F2FE' },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    color: '#000000',
    marginBottom: 24,
  },
  image: {
    width: 303,
    height: 418,
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#00223D',
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Karma-Bold',
    fontWeight: '600',
  },
});

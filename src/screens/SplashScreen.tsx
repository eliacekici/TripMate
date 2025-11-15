import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Onboarding1: undefined;
  Onboarding2: undefined;
  Splash: undefined;
  DashboardGuides: undefined;
};

const SplashScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();


   useEffect(() => {
    const timer = setTimeout(async () => {
      const hasOnboarded = await AsyncStorage.getItem('hasOnboarded');

     if (hasOnboarded === 'true') {
        navigation.replace('DashboardGuides'); // go to main dashboard
      } else {
        navigation.replace('Onboarding1'); // go to first onboarding
      }
    }, 2000);// 2 seconds splash delay

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Image
        source={require('../assets/images/splash_logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.text}>Your travel buddy for every trip</Text>
    </View>
  );
};


export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0F2FE', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 134,
    height: 134,
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    fontFamily: 'Karma-Regular',
    color: '#000000',
  },
});

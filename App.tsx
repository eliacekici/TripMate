import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { getStoredAuth } from './src/utils/auth';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen_1 from './src/screens/OnboardingScreen_1';
import OnboardingScreen_2 from './src/screens/OnboardingScreen_2';
import DashboardGuides from './src/screens/DashboardGuides';
import SearchScreen from './src/screens/SearchScreen';
import CityDetailsScreen from './src/screens/CityDetailsScreen';
import LandmarkDetailsScreen from './src/screens/LandmarkDetailsScreen';
import MyPlansLoggedOutScreen from './src/screens/MyPlansLoggedOutScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import LoginScreen from './src/screens/LoginScreen';
import DashboardMyPlansScreen from './src/screens/DashboardMyPlansScreen';
import CreatingPlanEmptyScreen from './src/screens/CreatingPlanEmptyScreen';

export type RootStackParamList = {
  Splash: undefined;
  Onboarding1: undefined;
  Onboarding2: undefined;
  DashboardGuides: undefined;
  SearchScreen: undefined;
  CityDetailsScreen: { city: string };
  
  LandmarkDetailsScreen: { 
        placeName: string; 
        placeCategories: { name: string }[]; 
        lat: number; 
        lon: number;
        distanceDetail: string;
  }

  MyPlansLoggedOutScreen: undefined;
  SignUpScreen: undefined;
  LoginScreen: undefined;
  DashboardMyPlansScreen: undefined;
  CreatingPlanEmptyScreen: { destination: string };
  
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { token, userId } = await getStoredAuth();
      if (token && userId) {
        setInitialRoute('DashboardMyPlansScreen');
      } else {
        setInitialRoute('Splash');
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding1" component={OnboardingScreen_1} />
        <Stack.Screen name="Onboarding2" component={OnboardingScreen_2} />
        <Stack.Screen name="DashboardGuides" component={DashboardGuides} />
        <Stack.Screen name="SearchScreen" component={SearchScreen} />
        <Stack.Screen name="CityDetailsScreen" component={CityDetailsScreen} />
        <Stack.Screen name="LandmarkDetailsScreen" component={LandmarkDetailsScreen} />
        <Stack.Screen name="MyPlansLoggedOutScreen" component={MyPlansLoggedOutScreen} />
        <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="DashboardMyPlansScreen" component={DashboardMyPlansScreen} />
        <Stack.Screen name="CreatingPlanEmptyScreen" component={CreatingPlanEmptyScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );

}

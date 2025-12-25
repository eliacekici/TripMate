import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen_1 from './src/screens/OnboardingScreen_1';
import OnboardingScreen_2 from './src/screens/OnboardingScreen_2';
import DashboardGuides from './src/screens/DashboardGuides';
import SearchScreen from './src/screens/SearchScreen';
import CityDetailsScreen from './src/screens/CityDetailsScreen';
import LandmarkDetailsScreen from './src/screens/LandmarkDetailsScreen';
import MyPlansLoggedOutScreen from './src/screens/MyPlansLoggedOutScreen';

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
  
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* First screen when the app opens */}
        <Stack.Screen name="Splash" component={SplashScreen} />

        {/* Onboarding screens */}
        <Stack.Screen name="Onboarding1" component={OnboardingScreen_1} />
        <Stack.Screen name="Onboarding2" component={OnboardingScreen_2} />

        {/* Main app screen */}
        <Stack.Screen name="DashboardGuides" component={DashboardGuides} />
        <Stack.Screen name="SearchScreen" component={SearchScreen} />
        <Stack.Screen name="CityDetailsScreen" component={CityDetailsScreen} />
        <Stack.Screen name="LandmarkDetailsScreen" component={LandmarkDetailsScreen} />
        <Stack.Screen name="MyPlansLoggedOutScreen" component={MyPlansLoggedOutScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );

}

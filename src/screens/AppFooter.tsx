import React from 'react'; 
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native'; 
import { NativeStackNavigationProp } from '@react-navigation/native-stack'; 
import { NavigationProp } from '@react-navigation/native'; 

// --- TYPE DEFINITIONS --- 
export type RootStackParamList = {     
    DashboardGuides: undefined;     
    MyPlansLoggedOutScreen: undefined;     
    ProfileScreen: undefined;     
    SearchScreen: undefined;     
    CityDetailsScreen: { city: string };     
    LoginScreen: undefined;     
    SignUpScreen: undefined; 
    DashboardMyPlansScreen: undefined;
    LandmarkDetailsScreen: { 
        placeName: string; 
        placeCategories: { name: string }[]; 
        lat: number; 
        lon: number; 
        distanceDetail: string; 
    }; 
}; 

export type ScreenName = keyof RootStackParamList; 

interface FooterProps {     
    navigation: NativeStackNavigationProp<RootStackParamList>;     
    activeScreen: ScreenName; 
} 
// --- END TYPE DEFINITIONS --- 

const PRIMARY_ACTIVE_COLOR = '#0C1559'; 
const INACTIVE_COLOR = '#000000'; 
const FOOTER_BG_COLOR = '#C3E2F1'; 

const AppFooter: React.FC<FooterProps> = ({ navigation, activeScreen }) => { 
    // Define the tabs, their screen name, and asset location once 
    const tabs = [         
        {             
            name: 'Home',             
            screen: 'DashboardGuides' as ScreenName,             
            iconSource: require('../assets/images/guides_logo.png'),             
            iconStyle: footerStyles.footerIcon1         
        },         
        {             
            name: 'My Plans',             
            screen: 'MyPlansLoggedOutScreen' as ScreenName,             
            iconSource: require('../assets/images/myPlans_logo.png'),             
            iconStyle: footerStyles.footerIcon2         
        },         
        {             
            name: 'Profile',             
            screen: 'ProfileScreen' as ScreenName,             
            iconSource: require('../assets/images/profile_logo.png'),             
            iconStyle: footerStyles.footerIcon3         
        },     
    ]; 

    const handleNavigation = (screen: ScreenName) => {         
        navigation.navigate(screen as any);     
    }; 

    return (         
        <View style={footerStyles.footer}>             
            {tabs.map((tab) => {                 
                // Determine if the current tab matches the screen being viewed                 
                const isActive = tab.screen === activeScreen;                 
                const textColor = isActive ? PRIMARY_ACTIVE_COLOR : INACTIVE_COLOR;                 
                const iconOpacity = isActive ? 1.0 : 0.4;                 

                return (                     
                    <TouchableOpacity                         
                        key={tab.screen}                         
                        style={footerStyles.footerItem}                         
                        // Use the new fixed navigation handler                         
                        onPress={() => handleNavigation(tab.screen)}                         
                        // Optionally disable navigation if already on the screen                         
                        disabled={isActive}                     
                    >                         
                        <Image                             
                            source={tab.iconSource}                             
                            style={[tab.iconStyle, { opacity: iconOpacity }]}                             
                            resizeMode="contain"                         
                        />                         
                        <Text style={[                             
                            footerStyles.footerText,                             
                            {                                 
                                color: textColor,                                 
                                fontWeight: isActive ? '900' : '400'                             
                            }                         
                        ]}>                             
                            {tab.name}                         
                        </Text>                     
                    </TouchableOpacity>                 
                );             
            })}         
        </View>     
    ); 
}; 

export default AppFooter; 

// --- Footer Styles (Consolidated and using absolute positioning) --- 
const footerStyles = StyleSheet.create({     
    footer: {         
        flexDirection: 'row',         
        borderTopWidth: 1,         
        borderColor: '#0C1559',         
        paddingVertical: 10,         
        justifyContent: 'space-around',         
        backgroundColor: FOOTER_BG_COLOR,         
        // CRUCIAL: Absolute positioning fixes the footer to the bottom         
        position: 'absolute',         
        bottom: 0,         
        left: 0,         
        right: 0,         
        // Adjust padding for safe area on iOS         
        paddingBottom: Platform.OS === 'ios' ? 30 : 5,     
    },     
    footerItem: {         
        alignItems: 'center',     
    },     
    footerText: {         
        fontSize: 12,         
        color: INACTIVE_COLOR,     
    },     
    // The specific icon sizes you used     
    footerIcon1: {         
        width: 21,         
        height: 37,         
        marginBottom: 4,     
    },     
    footerIcon2: {         
        width: 40,         
        height: 40,         
        marginBottom: 4,     
    },     
    footerIcon3: {         
        width: 41,         
        height: 41,         
        marginBottom: 4,     
    }, 
});

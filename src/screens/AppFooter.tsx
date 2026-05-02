import React, { useEffect, useState } from 'react'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, Image, TouchableOpacity, Platform } from 'react-native';
import footerStyles from './AppFooter.styles';
import { NativeStackNavigationProp } from '@react-navigation/native-stack'; 
import { RootStackParamList } from '../../App';

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
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    useEffect(() => {
        (async () => {
            const token = await AsyncStorage.getItem('token');
            const userId = await AsyncStorage.getItem('userId');
            setIsLoggedIn(!!token && !!userId);
        })();
    }, []);

    const tabs = [
        {
            name: 'Home',
            screen: 'DashboardGuides' as ScreenName,
            iconSource: require('../assets/images/guides_logo.png'),
            iconStyle: footerStyles.footerIcon1
        },
        {
            name: 'My Plans',
            screen: isLoggedIn ? 'DashboardMyPlansScreen' as ScreenName : 'MyPlansLoggedOutScreen' as ScreenName,
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



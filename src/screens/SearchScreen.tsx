import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Image, Keyboard, Platform } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
    DashboardGuides: undefined;
    CityDetailsScreen: { city: string };
};


type SearchScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'DashboardGuides'>;

interface FooterProps {
    navigation: NativeStackNavigationProp<RootStackParamList>;
}


// --- AppFooter Component (from first file) ---
const AppFooter: React.FC<FooterProps> = ({ navigation }) => {
    return (
        <View style={footerStyles.footer}>
            <TouchableOpacity 
                style={footerStyles.footerItem} 
                onPress={() => navigation.navigate('DashboardGuides')}
            >
                <Image
                    source={require('../assets/images/guides_logo.png')}
                    style={footerStyles.footerIcon1}
                    resizeMode="contain"
                />
                <Text style={footerStyles.footerText}>Home</Text>
            </TouchableOpacity>

            <View style={footerStyles.footerItem}>
                <Image
                    source={require('../assets/images/myPlans_logo.png')}
                    style={footerStyles.footerIcon2}
                    resizeMode="contain"
                />
                <Text style={footerStyles.footerText}>My Plans</Text>
            </View>

            <View style={footerStyles.footerItem}>
                <Image
                    source={require('../assets/images/profile_logo.png')}
                    style={footerStyles.footerIcon3}
                    resizeMode="contain"
                />
                <Text style={footerStyles.footerText}>Settings</Text>
            </View>
        </View>
    );
};
// --- END AppFooter Component ---

const suggestions = [
  { id: '1', name: 'Budapest, Hungary' }, 
  { id: '2', name: 'Istanbul, Turkey' }, 
  { id: '3', name: 'Copenhagen, Denmark' }, 
  { id: '4', name: 'Stockholm, Sweden' }, 
  { id: '5', name: 'Athens, Greece' },
];

const SearchScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // 1. Add state for the search input
    const [searchText, setSearchText] = useState('');

    const handleCityPress = (city: string) => {
        // Navigate to the CityDetails screen, passing the selected city name
        navigation.navigate('CityDetailsScreen', { city });
    };

    // 2.Function to handle manual search submission
    const handleSearchSubmit = () => {
        // Only navigate if the user has typed something
        if (searchText.trim().length > 0) {
            // Navigate using the text entered by the user
            navigation.navigate('CityDetailsScreen', { city: searchText.trim() });
            
            // Optional: Clear the input and hide the keyboard after navigation
            setSearchText('');
            Keyboard.dismiss(); 
        }
    };

  return (
        // Change outer view to use flex: 1 for correct footer placement
        <View style={styles.fullContainer}> 

            {/* Main Content Area (Scrollable if needed, but not necessary here) */}
            <View style={styles.contentContainer}>
                {/* Search Header */}
                <View style={styles.header}>
                    <View style={styles.searchBar}>
                        <TextInput
                            style={styles.input}
                            placeholder="Where are you going?"
                            placeholderTextColor={styles.placeholder.color}
                            value={searchText}
                            onChangeText={setSearchText}
                            onSubmitEditing={handleSearchSubmit} 
                            returnKeyType="search" 
                        />
                        <TouchableOpacity onPress={handleSearchSubmit} disabled={searchText.trim().length === 0}>
                            <Image 
                                source={require('../assets/images/search_icon.png')} 
                                style={{ width: 19, height: 19, marginRight: 6, opacity: searchText.trim().length > 0 ? 1 : 0.5 }} 
                            />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity onPress={() => navigation.navigate('DashboardGuides')}>
                        <Text style={styles.cancel}>Cancel</Text>
                    </TouchableOpacity>
                </View>

                {/* Suggestions (Now only show if search text is empty) */}
                {searchText.trim().length === 0 && (
                    <FlatList
                        data={suggestions}
                        keyExtractor={(item) => item.id}
                        ListHeaderComponent={() => (
                            <Text style={styles.suggestionsTitle}>Popular Destinations</Text>
                        )}
                        renderItem={({ item }) => (
                            <TouchableOpacity 
                                style={styles.suggestionItem}
                                onPress={() => handleCityPress(item.name)}
                            >
                                <Image source={require('../assets/images/location_icon.png')} style={{ width: 22, height: 22, marginRight: 10 }} />
                                <Text style={styles.suggestionText}>{item.name}</Text>
                            </TouchableOpacity>
                        )}
                    />
                )}
            </View>
            
            {/* 2. Add the AppFooter component here */}
            <AppFooter navigation={navigation} /> 

        </View>
    );
}

export default SearchScreen;

// --- Combined Stylesheets ---

const styles = StyleSheet.create({
    fullContainer: { // New style to act as the main container for content + footer
        flex: 1,
        backgroundColor: '#E0F2FE',
    },
    contentContainer: { // New style to hold all content EXCEPT the footer
        flex: 1,
        paddingHorizontal: 15,
        paddingTop: 15,
    },
    placeholder: {
        color: '#000000',
        flexDirection: 'row', 
        alignItems: 'center',  
        borderRadius: 10, 
        paddingHorizontal: 10, 
        paddingVertical: 10, 
        marginBottom: 16, 
        width: 375,
        height: 43,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 20,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        backgroundColor: '#C3E2F1',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 6,
        marginBottom: 16,
    },
    input: {
        flex: 1,
        fontSize: 16,
        fontFamily: 'Karma-Bold', 
        fontWeight: '700',
        marginRight: 8,
    },
    cancel: {
        marginLeft: 12,
        fontSize: 16,
        color: '#000000',
        marginBottom:15,
    },
    suggestionsTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#00223D',
        marginBottom: 10,
        marginTop: 5,
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    suggestionText: {
        fontSize: 16,
        color: '#000000',
    },
});

// --- Footer Styles ---
const footerStyles = StyleSheet.create({
    footer: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderColor: '#0C1559',
        paddingVertical: 10,
        justifyContent: 'space-around',
        backgroundColor: '#C3E2F1',
        paddingBottom: Platform.OS === 'ios' ? 30 : 5, 
    },
    footerItem: {
        alignItems: 'center',
    },
    footerText: {
        color: '#000', 
    },
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
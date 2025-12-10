import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Image, Keyboard } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
    DashboardGuides: undefined;
    CityDetailsScreen: { city: string };
};


type SearchScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'DashboardGuides'>;

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
    <View style={styles.container}>

      {/* Search Header */}
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <TextInput
            style={styles.input}
            placeholder="Where are you going?"
            placeholderTextColor={styles.placeholder.color}
            // 1. Connect state to the input field
                        value={searchText}
                        onChangeText={setSearchText}
                        
                        // 3. Trigger search when the user presses 'return' on the keyboard
                        onSubmitEditing={handleSearchSubmit} 
                        
                        returnKeyType="search" // Shows 'Search' button on the keyboard
                    />

                    {/* Optional: Add a magnifying glass button to trigger search */}
                    <TouchableOpacity onPress={handleSearchSubmit} disabled={searchText.trim().length === 0}>
                        <Image source={require('../assets/images/search_icon.png')} style={{ width: 19, height: 19, marginRight: 6, opacity: searchText.trim().length > 0 ? 1 : 0.5 }} />
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

            {/* If search text is present, you would typically show live filtered results here. 
                For now, if the user is typing, they must submit (using the keyboard or button) 
                to navigate to CityDetailsScreen.
            */}

        </View>
    );
}

export default SearchScreen;

const styles = StyleSheet.create({
    container: {
    flex: 1,
    backgroundColor: '#E0F2FE',
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





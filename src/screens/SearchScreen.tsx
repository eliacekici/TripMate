import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    FlatList, 
    Image, 
    Keyboard, 
    Platform 
} from 'react-native';
import styles from './SearchScreen.styles';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import AppFooter from './AppFooter'; 
import { RootStackParamList } from '../../App';

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

      const FOOTER_HEIGHT = 10 + 45 + (Platform.OS === 'ios' ? 30 : 5);

  return (
    <View style={styles.fullContainer}>

      {/* Main Content Area */}
      <View style={styles.contentContainer}>
        <View style={styles.header}>
            <View style={styles.searchBar}>
                <TextInput
                    style={styles.input}
                    placeholder="Where are you going?"
                    placeholderTextColor={styles.placeholder.color}
                    value={searchText}
                    onChangeText={setSearchText}
                    onSubmitEditing={handleSearchSubmit}
                />
                {/* ...existing code for the rest of the component... */}
            </View>
            {/* ...existing code for the rest of the component... */}
        </View>
        {/* ...existing code for the rest of the component... */}
      </View>
      {/* ...existing code for the rest of the component... */}
    </View>
  );
};

export default SearchScreen;
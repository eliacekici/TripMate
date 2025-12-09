import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
    DashboardGuides: undefined;
    CityDetails: { city: string };
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
const navigation = useNavigation<SearchScreenNavigationProp>();

  return (
    <View style={styles.container}>

      {/* Search Header */}
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <TextInput
            style={styles.input}
            placeholder="Where are you going?"
            placeholderTextColor={styles.placeholder.color}
          />
          <Image source={require('../assets/images/search_icon.png')} style={{ width: 19, height: 19, marginRight: 6,  }} />
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('DashboardGuides')}>
          <Text style={styles.cancel}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {/* Suggestions */}
      <FlatList
        data={suggestions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.suggestionItem}>
            <Image source={require('../assets/images/location_icon.png')} style={{ width: 22, height: 22, marginRight: 10 }} />
            <Text style={styles.suggestionText}>{item.name}</Text>
          </View>
        )}
      />

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





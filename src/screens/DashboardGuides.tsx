import React from 'react';
import {
  Dimensions,
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  FlatList,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type RootStackParamList = {
  DashboardGuides: undefined;
  SearchScreen: undefined;
  CityDetailsScreen: { city: string };
};

type DashboardGuidesNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'DashboardGuides'
>;

const places = [
  { id: '1', name: 'Paris', image: require('../assets/images/Paris.png') },
  { id: '2', name: 'Rome', image: require('../assets/images/Rome.png') },
  { id: '3', name: 'London', image: require('../assets/images/London.png') },
  { id: '4', name: 'Berlin', image: require('../assets/images/Berlin.png') },
  { id: '5', name: 'Barcelona', image: require('../assets/images/Barcelona.png') },
  { id: '6', name: 'Madrid', image: require('../assets/images/Madrid.png') },
  { id: '7', name: 'Amsterdam', image: require('../assets/images/Amsterdam.png') },
  { id: '8', name: 'Vienna', image: require('../assets/images/Vienna.png') },
  { id: '9', name: 'Prague', image: require('../assets/images/Prague.png') },
  { id: '10', name: 'Milan', image: require('../assets/images/Milan.png') },
  { id: '11', name: 'Munich', image: require('../assets/images/Munich.png') },
  { id: '12', name: 'Lisbon', image: require('../assets/images/Lisbon.png') },
];

const DashboardGuides = () => {
  const navigation = useNavigation<DashboardGuidesNavigationProp>();

  // Function to handle Home navigation
  const handleHomePress = () => {
    // Navigate back to the DashboardGuides screen
    navigation.navigate('DashboardGuides');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={{ flex: 1 }}>
        <Image
          source={require('../assets/images/dashboard_top.png')}
          style={styles.topImage}
          resizeMode="cover"
        />

        <View style={styles.container}>
          <TouchableOpacity
            style={styles.searchBar}
            onPress={() => navigation.navigate('SearchScreen')}
          >
            <Text style={styles.searchInput}>Search location to find a guide</Text>
            <Image
              source={require('../assets/images/search_icon.png')}
              style={styles.searchImage}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <FlatList
            data={places}
            numColumns={3}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingVertical: 16 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.placeItem}
                onPress={() =>
                  navigation.navigate('CityDetailsScreen', { city: item.name })
                }
              >
                <Image source={item.image} style={styles.placeImage} />
                <Text style={styles.placeName}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Image
            source={require('../assets/images/guides_logo.png')}
            style={styles.footerIcon1}
            resizeMode="contain"
          />
          <Text>Home</Text>
        </View>
        <View style={styles.footerItem}>
          <Image
            source={require('../assets/images/myPlans_logo.png')}
            style={styles.footerIcon2}
            resizeMode="contain"
          />
          <Text>My Plans</Text>
        </View>
        <View style={styles.footerItem}>
          <Image
            source={require('../assets/images/profile_logo.png')}
            style={styles.footerIcon3}
            resizeMode="contain"
          />
          <Text>Settings</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default DashboardGuides;

const styles = StyleSheet.create({ 
  safe: { 
    flex: 1, 
    backgroundColor: '#E0F2FE' 
  }, 
  topImage: { 
    width: '100%', 
    height: SCREEN_WIDTH * 0.48, 
  }, 
  container: { 
    flex: 1, 
    backgroundColor: '#E0F2FE', 
    borderTopLeftRadius: 10, 
    borderTopRightRadius: 10, 
    paddingHorizontal: SCREEN_WIDTH * 0.04,
    marginTop: -24, // overlap top image
    paddingTop: 24, 
  }, 
  searchBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#C3E2F1', 
    borderRadius: 10, 
    paddingHorizontal: 10, 
    paddingVertical: 10, 
    marginBottom: 16, 
  }, 
  searchInput: { 
    flex: 1, 
    fontSize: 16, 
    fontFamily: 'Karma-Bold', 
    fontWeight: '700', 
    marginRight: 8, 
  }, 
  searchImage: { 
    width: 19, 
    height: 19, 
  }, 
  placeItem: { 
    alignItems: 'center', 
    marginBottom: 16, 
    flex: 1 / 3, 
  }, 
  placeImage: { 
    width: SCREEN_WIDTH * 0.22, 
    height: SCREEN_WIDTH * 0.22,
    borderRadius: (SCREEN_WIDTH * 0.22) / 2, 
    marginBottom: 8, 
  }, 
  placeName: { 
    fontSize: 10, 
    fontFamily: 'Karma-Regular', 
    textAlign: 'center', 
  }, 
  footer: { 
    flexDirection: 'row', 
    borderTopWidth: 1, 
    borderColor: '#0C1559', 
    paddingVertical: 10, 
    justifyContent: 'space-around', 
    backgroundColor: '#C3E2F1', 
    paddingBottom: Platform.OS === 'ios' ? 0 : 5,
  }, 
  footerItem: { 
    alignItems: 'center', 
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

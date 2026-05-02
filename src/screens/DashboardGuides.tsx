import React from 'react';
import {
  Dimensions,
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
} from 'react-native';
import styles from './DashboardGuides.styles';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AppFooter from './AppFooter'; 
import { RootStackParamList } from '../../App';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const FOOTER_PADDING = (Platform.OS === 'ios' ? 30 : 5) + 10 + 60;

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

        {/* 4. Add the padding View BEFORE the end of the ScrollView */}
        <View style={{ height: FOOTER_PADDING }} />

      </ScrollView>

      <AppFooter 
        navigation={navigation} 
        //Set the active tab to 'DashboardGuides'
        activeScreen={'DashboardGuides'} 
      />
    </SafeAreaView>
  );
};

export default DashboardGuides;


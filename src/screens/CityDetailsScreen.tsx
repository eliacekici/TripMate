import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack'; 
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App'; 
import { searchPlaces } from '../services/OpenSourcePlacesService';

type Props = NativeStackScreenProps<RootStackParamList, 'CityDetailsScreen'>;

type Place = {
  fsq_id: string;
  name: string;
  categories: { name: string }[];
  location?: { address?: string };
  geocodes?: {
    main?: {
      latitude: number;
      longitude: number;
    };
  };
};

const CityDetailsScreen = ({ route }: Props) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { city } = route.params;
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const results = await searchPlaces(city); 
        
        console.log('Open Source Places Results:', results); 

        if (results.length > 0) {
          setPlaces(results);
        } else {
          setPlaces([]);
        }
      } catch (error) {
        console.error('Error fetching Open Source places:', error); 
        setPlaces([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, [city]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0C1559" />
      </View>
    );
  }

  const renderHeader = () => (
    <>
      <Image
        source={require('../assets/images/city_placeholder.png')}
        style={styles.topImage}
        resizeMode="cover"
      />
      <Text style={styles.cityTitle}>{city}</Text>
    </>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={places}
        keyExtractor={(item) => item.fsq_id}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }) => (
            <TouchableOpacity 
                style={styles.placeItem}
                onPress={() => {
                      const latitude = item.geocodes?.main?.latitude;
                      const longitude = item.geocodes?.main?.longitude;

                      // Check for valid coordinates before navigating
                        if (typeof latitude !== 'number' || typeof longitude !== 'number') {
                             console.error("Missing coordinates for navigation:", item.name);
                             //Show a toast/alert to the user here
                             return; 
                        }
                        navigation.navigate('LandmarkDetailsScreen', {
                            placeName: item.name,
                            placeCategories: item.categories,
                            placeAddress: item.location?.address || 'Location data not available',
                            lat: latitude, 
                            lon: longitude,
                        });
                    }}
                >
            <Text style={styles.placeName}>{item.name}</Text>
            <Text style={styles.placeKinds}>
              {item.categories.map((c) => c.name).join(', ') || 'Unknown type'}
            </Text>
            {item.location?.address && (
              <Text style={styles.placeAddress}>{item.location.address}</Text>
            )}
            </TouchableOpacity>
            )}
        ListEmptyComponent={<Text style={{textAlign: 'center', marginTop: 20}}>No places found.</Text>}
      />
    </View>
  );
};

export default CityDetailsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E0F2FE' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topImage: { width: '100%', height: 200 },
  cityTitle: { fontSize: 24, fontWeight: '700', margin: 16 },
  placeItem: {
    padding: 16,
    backgroundColor: '#C3E2F1',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 8,
  },
  placeName: { fontSize: 18, fontWeight: '700' },
  placeKinds: { fontSize: 14, color: '#555', marginTop: 4 },
  placeAddress: { fontSize: 12, color: '#333', marginTop: 2 },
});
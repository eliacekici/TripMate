import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack'; 
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

import AppFooter from './AppFooter'; 
import { RootStackParamList } from '../../App';

import { 
    searchAttractions, 
    searchFoodAndDrinks, 
    getPlacePhotoUrl 
} from '../services/OpenSourcePlacesService';

// --- Type Definitions---
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
  distanceDetail: string;
};

// Props uses the imported RootStackParamList
type Props = NativeStackScreenProps<RootStackParamList, 'CityDetailsScreen'>;
type Category = 'Attractions' | 'Food & Drink';
// --- End Type Definitions ---

const CityDetailsScreen = ({ route }: Props) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { city } = route.params;

  const [attractions, setAttractions] = useState<Place[]>([]);
  const [foodAndDrinks, setFoodAndDrinks] = useState<Place[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category>('Attractions');

  const [loading, setLoading] = useState(true);
  const [cityPhotoUrl, setCityPhotoUrl] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Determines which array of places to display based on the selected tab
  const displayData = selectedCategory === 'Attractions' ? attractions : foodAndDrinks;
  
  
  const FOOTER_HEIGHT = 10 + 45 + (Platform.OS === 'ios' ? 30 : 5); 


  useEffect(() => {
    const fetchCityData = async () => {
      setLoading(true);
      setApiError(null);

      try {
                // FETCH DATA CONCURRENTLY 
                const [attrResults, foodResults, photoUrl] = await Promise.all([
                    searchAttractions(city),
                    searchFoodAndDrinks(city),
                    getPlacePhotoUrl(city) 
                ]);

                // Store results in separate state variables
                setAttractions(attrResults);
                setFoodAndDrinks(foodResults);
                setCityPhotoUrl(photoUrl);

                } catch (error: any) {
                console.error('Error fetching city data:', error); 
                setAttractions([]);
                setFoodAndDrinks([]);
                setApiError(
                    "Could not load points of interest. The map service may be busy or the location is too remote. Please try again."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchCityData();
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
                source={
                    cityPhotoUrl 
                        ? { uri: cityPhotoUrl } 
                        : require('../assets/images/city_placeholder.png')
                }
                style={styles.topImage}
                resizeMode="cover"
            />
            <View style={styles.headerContent}>
                <Text style={styles.cityTitle}>{city}</Text>

                {/* --- SEGMENTED CONTROL / TABS --- */}
                <View style={styles.tabContainer}>
                    <CategoryTab 
                        title="Attractions" 
                        selected={selectedCategory === 'Attractions'}
                        onPress={() => setSelectedCategory('Attractions')}
                    />
                    <CategoryTab 
                        title="Food & Drink" 
                        selected={selectedCategory === 'Food & Drink'}
                        onPress={() => setSelectedCategory('Food & Drink')}
                    />
                </View>
                {/* --- END TABS --- */}

                {apiError && <Text style={styles.errorText}>{apiError}</Text>}
            </View>
        </>
    );

    // --- Place Item Renderer ---
    const renderPlaceItem = ({ item }: { item: Place }) => (
        <TouchableOpacity 
            style={styles.placeItem}
            onPress={() => {
                const latitude = item.geocodes?.main?.latitude;
                const longitude = item.geocodes?.main?.longitude;

                if (typeof latitude !== 'number' || typeof longitude !== 'number') {
                    console.error("Missing coordinates for navigation:", item.name);
                    return; 
                }
                navigation.navigate('LandmarkDetailsScreen', {
                    placeName: item.name,
                    placeCategories: item.categories,
                    lat: latitude, 
                    lon: longitude,
                    distanceDetail: item.distanceDetail,
                });
            }}
        >
            <Text style={styles.placeName}>{item.name}</Text>
            <Text style={styles.placeKinds}>
                {item.categories.map((c) => c.name).join(', ') || 'Unknown type'}
            </Text>
            <Text style={styles.placeAddress}>{item.distanceDetail}</Text>
        </TouchableOpacity>
    );


    return (
        <View style={styles.container}>
            <FlatList
                data={displayData}
                keyExtractor={(item) => item.fsq_id}
                ListHeaderComponent={renderHeader}
                renderItem={renderPlaceItem}
                ListEmptyComponent={<Text style={styles.emptyText}>No {selectedCategory} found in {city}.</Text>}
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: FOOTER_HEIGHT }}
            />

            {/* FINAL FOOTER CALL: Fixed to the bottom and highlighting 'Home' */}
            <AppFooter 
                navigation={navigation} 
                activeScreen={'CityDetailsScreen'} 
            />
        </View>
    );
};

export default CityDetailsScreen;

// --- Helper Component for Tabs ---
interface TabProps {
    title: string;
    selected: boolean;
    onPress: () => void;
}

const CategoryTab: React.FC<TabProps> = ({ title, selected, onPress }) => (
    <TouchableOpacity 
        style={[styles.tab, selected ? styles.tabSelected : styles.tabUnselected]} 
        onPress={onPress}
    >
        <Text style={[styles.tabText, selected ? styles.tabTextSelected : styles.tabTextUnselected]}>
            {title}
        </Text>
    </TouchableOpacity>
);


const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#E0F2FE' },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    topImage: { width: '100%', height: 200 },
    headerContent: { paddingHorizontal: 16 },
    cityTitle: { fontSize: 24, fontWeight: '700', marginVertical: 16, color: '#00223D'},
    
    // --- STYLES FOR TABS ---
    tabContainer: { 
        flexDirection: 'row', 
        justifyContent: 'space-around', 
        marginBottom: 16, 
        backgroundColor: '#C3E2F1', 
        borderRadius: 10, 
        padding: 4 
    },
    tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
    tabSelected: { backgroundColor: '#00223D', elevation: 3 },
    tabUnselected: { backgroundColor: 'transparent' },
    tabText: { fontSize: 16, fontWeight: '600' },
    tabTextSelected: { color: '#FFFFFF' },
    tabTextUnselected: { color: '#00223D' },
    // --- END STYLES FOR TABS ---

    placeItem: {
        padding: 16,
        backgroundColor: '#C3E2F1',
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#00223D',
    },
    placeName: { fontSize: 18, fontWeight: '700' },
    placeKinds: { fontSize: 14, color: '#00223D', marginTop: 4 },
    placeAddress: { fontSize: 14, color: '#00223D', marginTop: 2 },
    errorText: { color: 'red', textAlign: 'center', marginBottom: 10 },
    emptyText: { textAlign: 'center', marginTop: 20, paddingBottom: 20, color: '#00223D' }
});

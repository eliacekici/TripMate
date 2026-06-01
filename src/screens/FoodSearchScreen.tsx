import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Linking } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { getCityDestId, saveFoodPlan, searchFoodPlaces } from '../services/BookingApi';

type FoodPlace = {
  id: string;
  name: string;
  address?: string;
  city?: string;
  lat?: number;
  lon?: number;
  distance_km?: number | null;
};

type Props = NativeStackScreenProps<RootStackParamList, 'FoodSearchScreen'>;

const FoodSearchScreen: React.FC<Props> = ({ route }) => {
  const [query, setQuery] = useState(route.params?.destination || '');
  const [loading, setLoading] = useState(false);
  const [places, setPlaces] = useState<FoodPlace[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (query && query.trim()) {
      doSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doSearch = async () => {
    const normalized = (query || '').trim();
    if (!normalized) return;
    setLoading(true);
    setMessage('');
    setPlaces([]);

    try {
      const dest = await getCityDestId(normalized);
      if (!dest) {
        setMessage('Could not find destination.');
        return;
      }

      const results = await searchFoodPlaces({ destId: dest.dest_id });
      if (!results || results.length === 0) {
        setMessage('No food places found for this city.');
      }

      setPlaces(results || []);
    } catch (e: any) {
      setMessage(e?.message || 'Error searching for food places.');
    } finally {
      setLoading(false);
    }
  };

  const openInMaps = (lat?: number, lon?: number, name?: string) => {
    if (!lat || !lon) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
    Linking.openURL(url).catch(() => {});
  };

  const handleSavePlace = async (place: FoodPlace) => {
    try {
      await saveFoodPlan({ place, destination: route.params?.destination });
      setMessage('Saved food spot!');
      // keep existing list intact, no need to refetch
    } catch (error) {
      setMessage('Could not save this place.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchSection}>
        <Text style={styles.title}>Find food in {route.params?.destination || ''}</Text>

        <TextInput
          style={styles.input}
          placeholder="City (e.g. Paris)"
          placeholderTextColor="#6B7280"
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          onSubmitEditing={doSearch}
        />
        <TouchableOpacity style={styles.button} onPress={doSearch} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Searching...' : 'Search Food Places'}</Text>
        </TouchableOpacity>
      </View>

      {!!message && <Text style={[styles.message]}>{message}</Text>}

      <FlatList
        data={places}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.name}>{item.name}</Text>
            {!!item.address && <Text style={styles.detail}>{item.address}</Text>}
            {!!item.city && <Text style={styles.detail}>{item.city}</Text>}
            {item.distance_km != null && <Text style={styles.detail}>Distance: {item.distance_km.toFixed(2)} km</Text>}
            <View style={styles.actions}>
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#00223D' }]} onPress={() => openInMaps(item.lat, item.lon, item.name)}>
                <Text style={styles.actionText}>Open in Maps</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#2F6030' }]} onPress={() => handleSavePlace(item)}>
                <Text style={styles.actionText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#E0F2FE' },
  searchSection: { marginTop: 24 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  input: { backgroundColor: 'rgb(255, 255, 255)', borderRadius: 8, padding: 12, marginBottom: 10, fontSize: 16, color: '#000' },
  button: { backgroundColor: '#00223D', borderRadius: 10, padding: 16, alignItems: 'center', marginBottom: 12 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  message: { marginBottom: 10, fontSize: 14, color: '#333' },
  item: { backgroundColor: '#C3E2F1', borderRadius: 18, borderWidth: 1, borderColor: '#00223D', padding: 16, marginBottom: 12 },
  name: { fontWeight: 'bold', fontSize: 18, marginBottom: 4 },
  detail: { color: '#555', fontSize: 14, marginBottom: 2 },
  actions: { flexDirection: 'row', marginTop: 10, gap: 8 },
  actionButton: { borderRadius: 6, paddingVertical: 8, paddingHorizontal: 16, alignItems: 'center' },
  actionText: { color: '#fff', fontWeight: 'bold' },
});

export default FoodSearchScreen;

import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { buildReservationUrl, getHotelDetails } from '../services/BookingApi';

type Props = NativeStackScreenProps<RootStackParamList, 'HotelDetailsScreen'>;

const HotelDetailsScreen: React.FC<Props> = ({ route }) => {
  const baseHotel = route.params.hotel;
  const [loading, setLoading] = useState(true);
  const [hotel, setHotel] = useState<any>(baseHotel);

  useEffect(() => {
    const loadDetails = async () => {
      if (!baseHotel?.hotel_id) {
        setLoading(false);
        return;
      }

      try {
        const details = await getHotelDetails({ hotelId: String(baseHotel.hotel_id) });
        setHotel({ ...baseHotel, ...details });
      } catch {
        setHotel(baseHotel);
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [baseHotel]);

  const bookingUrl = useMemo(() => buildReservationUrl(hotel), [hotel]);

  const onReserve = async () => {
    try {
      await Linking.openURL(bookingUrl);
    } catch {
      Alert.alert('Reservation link error', 'Could not open the booking page.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{hotel?.hotel_name || 'Hotel details'}</Text>

      {loading && <ActivityIndicator size="large" color="#00223D" style={styles.loader} />}

      {!loading && (
        <>
          <Text style={styles.text}>Hotel details are currently unavailable.</Text>
          <TouchableOpacity style={styles.button} onPress={onReserve}>
            <Text style={styles.buttonText}>Reserve</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, paddingTop: 52, backgroundColor: '#E0F2FE', alignItems: 'center' },
  loader: { marginVertical: 24 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  text: { fontSize: 16, marginBottom: 8, textAlign: 'center' },
  button: { backgroundColor: '#00223D', borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 24, width: '80%' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default HotelDetailsScreen;

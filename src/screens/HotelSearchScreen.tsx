import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  Linking,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import {
  buildReservationUrl,
  getCityDestId,
  saveHotelPlan,
  searchHotels,
} from '../services/BookingApi';

type Hotel = {
  hotel_id: string;
  hotel_name: string;
  address?: string;
  city?: string;
  currency?: string;
  min_total_price?: number;
  review_score?: number;
  url?: string;
};

type Props = NativeStackScreenProps<RootStackParamList, 'HotelSearchScreen'>;

const HotelSearchScreen: React.FC<Props> = ({ route }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const [saveModal, setSaveModal] = useState<{ visible: boolean; hotel: Hotel | null }>({
    visible: false,
    hotel: null,
  });
  const [checkin, setCheckin] = useState('');
  const [checkout, setCheckout] = useState('');
  const [dateError, setDateError] = useState('');

  const formatYmd = (value?: string): string | null => {
    if (!value) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const travelStartDate = formatYmd(route.params?.tripStartDate);
  const travelEndDate = formatYmd(route.params?.tripEndDate);
  const travelDays =
    travelStartDate && travelEndDate
      ? Math.max(
          1,
          Math.floor(
            (new Date(`${travelEndDate}T00:00:00Z`).getTime() -
              new Date(`${travelStartDate}T00:00:00Z`).getTime()) /
              (1000 * 60 * 60 * 24)
          ) + 1
        )
      : null;

  const isValidDateFormat = (value: string): boolean => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

    const [yearStr, monthStr, dayStr] = value.split('-');
    const year = Number(yearStr);
    const month = Number(monthStr);
    const day = Number(dayStr);
    const date = new Date(Date.UTC(year, month - 1, day));

    return (
      Number.isInteger(year) &&
      Number.isInteger(month) &&
      Number.isInteger(day) &&
      date.getUTCFullYear() === year &&
      date.getUTCMonth() + 1 === month &&
      date.getUTCDate() === day
    );
  };

  const showMessage = (msg: string, success = false) => {
    setIsSuccess(success);
    setMessage(msg);
    setTimeout(() => setMessage(''), 2500);
  };

  const handleSearch = async () => {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) return;

    setLoading(true);
    setMessage('');
    setHotels([]);

    try {
      const destination = await getCityDestId(normalizedQuery);
      if (!destination) {
        showMessage('No destination found for this search.');
        return;
      }

      const results = await searchHotels({
        destId: destination.dest_id,
        searchType: destination.search_type,
      });

      if (!results || results.length === 0) {
        showMessage('No hotels found for this search.');
      }

      setHotels(results || []);
    } catch (e: any) {
      showMessage(e?.message || 'Error searching hotels.');
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = async (hotel: Hotel) => {
    const url = buildReservationUrl(hotel);
    await Linking.openURL(url);
  };

  const handleSavePress = (hotel: Hotel) => {
    setCheckin('');
    setCheckout('');
    setDateError('');
    setSaveModal({ visible: true, hotel });
  };

  const handleSaveConfirm = async () => {
    if (!checkin || !checkout) {
      setDateError('Please enter both dates in YYYY-MM-DD format.');
      return;
    }

    if (!isValidDateFormat(checkin) || !isValidDateFormat(checkout)) {
      setDateError('Dates must be in YYYY-MM-DD format.');
      return;
    }

    if (checkout <= checkin) {
      setDateError('Check-out date must be later than check-in date.');
      return;
    }

    if (travelStartDate && travelEndDate) {
      if (checkin < travelStartDate || checkout > travelEndDate) {
        setDateError('hotel dates out of range of travel');
        return;
      }
    }

    setDateError('');

    const hotel = saveModal.hotel;
    if (!hotel) return;

    try {
      await saveHotelPlan({ hotel, checkin, checkout });
      setSaveModal({ visible: false, hotel: null });
      showMessage('Hotel saved!', true);
    } catch {
      showMessage('Could not save this hotel. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchSection}>
        <Text style={styles.title}>Search Hotels</Text>

        <TextInput
          style={styles.input}
          placeholder="City or Hotel Name (e.g. Paris, Hilton)"
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.button} onPress={handleSearch} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Searching...' : 'Search'}</Text>
        </TouchableOpacity>
      </View>

      {!!message && (
        <Text style={[styles.message, isSuccess ? styles.success : styles.error]}>{message}</Text>
      )}

      <FlatList
        data={hotels}
        keyExtractor={item => item.hotel_id.toString()}
        renderItem={({ item }) => (
          <View style={styles.hotelItem}>
            <Text style={styles.hotelName}>{item.hotel_name}</Text>
            {!!item.address && <Text style={styles.detail}>{item.address}</Text>}
            {!!item.city && <Text style={styles.detail}>{item.city}</Text>}
            {item.review_score != null && <Text style={styles.detail}>Rating: {item.review_score}</Text>}
            {!!item.min_total_price && (
              <Text style={styles.detail}>{item.currency} {item.min_total_price}</Text>
            )}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#00223D' }]}
                onPress={() => handleReserve(item)}
              >
                <Text style={styles.actionText}>Reserve</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#2F6030' }]}
                onPress={() => handleSavePress(item)}
              >
                <Text style={styles.actionText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Modal visible={saveModal.visible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Save Hotel</Text>
            <Text style={styles.modalHotelName}>{saveModal.hotel?.hotel_name}</Text>
            {travelStartDate && travelEndDate && travelDays != null && (
              <>
                <Text style={styles.travelInfoText}>You are traveling for {travelDays} days.</Text>
                <Text style={styles.travelInfoText}>
                  You are traveling between {travelStartDate} and {travelEndDate}. For what days are you staying in this hotel?
                </Text>
              </>
            )}
            <Text style={styles.modalSubtitle}>Enter your reserved dates:</Text>
            <TextInput
              style={styles.input}
              placeholder="Check-in Date (YYYY-MM-DD)"
              value={checkin}
              onChangeText={value => {
                setCheckin(value);
                if (dateError) setDateError('');
              }}
            />
            <TextInput
              style={styles.input}
              placeholder="Check-out Date (YYYY-MM-DD)"
              value={checkout}
              onChangeText={value => {
                setCheckout(value);
                if (dateError) setDateError('');
              }}
            />
            {!!dateError && <Text style={styles.dateErrorText}>{dateError}</Text>}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#00223D', flex: 1 }]}
                onPress={handleSaveConfirm}
              >
                <Text style={styles.actionText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#aaa', flex: 1 }]}
                onPress={() => {
                  setDateError('');
                  setSaveModal({ visible: false, hotel: null });
                }}
              >
                <Text style={styles.actionText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#E0F2FE' },
  searchSection: { marginTop: 24 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  input: { backgroundColor: 'rgb(255, 255, 255)', borderRadius: 8, padding: 12, marginBottom: 10, fontSize: 16 },
  button: { backgroundColor: '#00223D', borderRadius: 10, padding: 16, alignItems: 'center', marginBottom: 12 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  message: { marginBottom: 10, fontSize: 14 },
  error: { color: 'red' },
  success: { color: 'green' },
    hotelItem: {
      backgroundColor: '#C3E2F1',
      borderRadius: 18, // more rounded corners
      borderWidth: 1,
      borderColor: '#00223D', 
      padding: 16,
      marginBottom: 12,
    },
  hotelName: { fontWeight: 'bold', fontSize: 18, marginBottom: 4 },
  detail: { color: '#555', fontSize: 14, marginBottom: 2 },
  actions: { flexDirection: 'row', marginTop: 10, gap: 8 },
  actionButton: { borderRadius: 6, paddingVertical: 8, paddingHorizontal: 16, alignItems: 'center' },
  actionText: { color: '#fff', fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 24 },
  modalBox: { backgroundColor: '#fff', borderRadius: 12, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  modalHotelName: { fontSize: 15, color: '#333', marginBottom: 12 },
  travelInfoText: { fontSize: 13, color: '#333', marginBottom: 6 },
  modalSubtitle: { fontSize: 14, color: '#555', marginBottom: 8 },
  dateErrorText: { color: '#c62828', fontSize: 12, marginTop: -4, marginBottom: 8 },
});

export default HotelSearchScreen;

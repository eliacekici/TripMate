import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert, PermissionsAndroid, Platform } from 'react-native';
import { launchCamera, launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import TextRecognition from 'react-native-text-recognition';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import styles from './FlightTicketScannerScreen.styles';
import { saveTicketPlan } from '../services/BookingApi';

type FlightTicketScannerRouteProp = RouteProp<RootStackParamList, 'FlightTicketScannerScreen'>;

const FlightTicketScannerScreen = () => {
  const route = useRoute<FlightTicketScannerRouteProp>();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSavingTicket, setIsSavingTicket] = useState(false);
  const [parsedInfo, setParsedInfo] = useState<{
    passengerName?: string;
    airline?: string;
    timeOfTravel?: string;
    gate?: string;
    departureTime?: string;
    seat?: string;
  }>({});

  const handlePickImage = async () => {
    launchImageLibrary({ mediaType: 'photo' }, handleImageResponse);
  };

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'This app needs camera access to scan your flight ticket.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const handleTakePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Camera permission is required to take a photo.');
      return;
    }
    launchCamera({ mediaType: 'photo' }, handleImageResponse);
  };

  const handleImageResponse = async (response: ImagePickerResponse) => {
    if (response.didCancel) return;
    if (response.errorCode) {
      Alert.alert('Error', response.errorMessage || 'Image picker error');
      return;
    }
    const uri = response.assets?.[0]?.uri;
    if (uri) {
      setImageUri(uri);
      setLoading(true);
      try {
        const result = await TextRecognition.recognize(uri);
        setOcrText(result);
        setParsedInfo(parseTicketInfo(result));
      } catch (e) {
        Alert.alert('OCR Error', 'Failed to extract text from image.');
      }
      setLoading(false);
    }
  };

  // Helper function to parse ticket info from OCR lines
  function parseTicketInfo(lines: string[]) {
    const cleaned = lines.map(line => line.trim()).filter(Boolean);
    let passengerName: string | undefined;
    let airline: string | undefined;
    let timeOfTravel: string | undefined;
    let gate: string | undefined;
    let departureTime: string | undefined;
    let seat: string | undefined;

    const isValidSeat = (value: string) => /^(?:[0-9]{1,2}[A-Z]|[A-Z][0-9]{1,2}|[A-Z0-9]{2,4})$/.test(value);
    const isNameLike = (value: string) => /^[A-Za-zÀ-ÖØ-öø-ÿ]+\s+[A-Za-zÀ-ÖØ-öø-ÿ]+(?:\s+[A-Za-zÀ-ÖØ-öø-ÿ]+)?$/.test(value.trim());
    const isLabelLine = (value: string) => /^(boarding|boarding passes|passenger|passenger name|reference|seat|gate|departure|depart|arrival|flight|airline|time|non-priority|small bag only|add to wallet|ryanair|easyjet|klm|air france|british airways)$/i.test(value.trim());

    const getTime = (value: string) => {
      const match = value.match(/([01]?\d|2[0-3]):[0-5]\d/);
      return match?.[1];
    };

    const getSeat = (value: string) => {
      const match = value.match(/\b([0-9]{1,2}[A-Z]|[A-Z][0-9]{1,2}|[A-Z0-9]{2,4})\b/);
      return match?.[1];
    };

    const findNearbyName = (index: number) => {
      for (let offset = 1; offset <= 3; offset += 1) {
        const candidate = cleaned[index + offset];
        if (!candidate) break;
        if (isNameLike(candidate) && !isLabelLine(candidate)) return candidate.trim();
      }
      for (let offset = 1; offset <= 3; offset += 1) {
        const candidate = cleaned[index - offset];
        if (!candidate) break;
        if (isNameLike(candidate) && !isLabelLine(candidate)) return candidate.trim();
      }
      return undefined;
    };

    for (let i = 0; i < cleaned.length; i++) {
      const line = cleaned[i];
      const lower = line.toLowerCase();
      const nextLine = cleaned[i + 1] || '';

      if (!passengerName && /^(passenger name|passenger|name)\b/i.test(line)) {
        const match = line.match(/^(?:passenger name|passenger|name)\s*:?\s*(.+)$/i);
        if (match?.[1]?.trim() && isNameLike(match[1].trim())) {
          passengerName = match[1].trim();
        } else {
          passengerName = findNearbyName(i);
        }
      }

      if (!airline && /^(ryanair|turkish|pegasus|delta|united|lufthansa|qatar|emirates|american|easyjet|air france|klm|british airways)$/i.test(line.trim())) {
        airline = line.trim();
      }

      if (!airline && /(?:airline|airways|airlines)\b/i.test(line)) {
        const match = line.match(/^(?:airline|airways|airlines)\s*:?\s*(.+)$/i);
        if (match?.[1]?.trim()) airline = match[1].trim();
      }

      if (!gate && /\bgate\b/i.test(line) && !/gate closes/i.test(lower)) {
        const match = line.match(/gate\s*:?\s*([A-Z0-9-]+)/i);
        if (match?.[1]) {
          gate = match[1].trim();
        } else if (getSeat(nextLine) && !/closes/i.test(nextLine.toLowerCase())) {
          gate = nextLine.trim();
        }
      }

      if (!departureTime && /\b(departure|depart|dep)\b/i.test(lower)) {
        const match = line.match(/(?:departure|depart|dep)\s*:?\s*([0-9]{1,2}:[0-9]{2})/i);
        if (match?.[1]) {
          departureTime = match[1].trim();
        }
      }

      if (!seat && /\bseat\b/i.test(lower)) {
        const match = line.match(/seat\s*:?\s*([A-Z0-9]{2,4})/i);
        if (match?.[1]) {
          seat = match[1].trim();
        } else if (getSeat(nextLine)) {
          seat = getSeat(nextLine);
        }
      }

      if (!timeOfTravel && /time of travel|travel time|time/i.test(lower)) {
        const match = line.match(/(?:time of travel|travel time|time)\s*:?\s*(.+)/i);
        if (match?.[1]) {
          timeOfTravel = match[1].trim();
        }
      }
    }

    if (!passengerName) {
      for (let i = 0; i < cleaned.length; i++) {
        const line = cleaned[i];
        if (isNameLike(line) && !isLabelLine(line) && !/^[A-Z]{2,}$/.test(line)) {
          passengerName = line.trim();
          break;
        }
      }
    }

    if (!departureTime) {
      for (const line of cleaned) {
        const match = line.match(/([0-9]{1,2}:[0-9]{2})/);
        if (match) {
          departureTime = match[1];
          break;
        }
      }
    }

    if (!seat) {
      for (const line of cleaned) {
        const match = line.match(/\b([0-9]{1,2}[A-Z])\b/);
        if (match) {
          seat = match[1];
          break;
        }
      }
    }

    if (!gate) {
      for (const line of cleaned) {
        if (/\bgate\b/i.test(line) && !/gate closes/i.test(line)) {
          const match = line.match(/gate\s*:?\s*([A-Z0-9-]+)/i);
          if (match?.[1]) {
            gate = match[1].trim();
            break;
          }
        }
      }
    }

    return { passengerName, airline, timeOfTravel, gate, departureTime, seat };
  }

  const handleSaveTicket = async () => {
    if (ocrText.length === 0) {
      Alert.alert('No ticket data', 'Please scan or pick a ticket image first.');
      return;
    }

    setIsSavingTicket(true);
    try {
      await saveTicketPlan({
        ticket: {
          passengerName: parsedInfo.passengerName || '',
          airline: parsedInfo.airline || '',
          timeOfTravel: parsedInfo.timeOfTravel || '',
          gate: parsedInfo.gate || '',
          departureTime: parsedInfo.departureTime || '',
          seat: parsedInfo.seat || '',
          rawText: ocrText.join('\n'),
        },
        destination: route.params?.destination,
        tripStartDate: route.params?.tripStartDate,
        tripEndDate: route.params?.tripEndDate,
      });
      Alert.alert('Saved', 'Ticket information saved successfully.');
    } catch (error) {
      Alert.alert('Error', 'Unable to save ticket. Please try again.');
    } finally {
      setIsSavingTicket(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Scan Your Flight Ticket</Text>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.customButton} onPress={handlePickImage}>
          <Text style={styles.customButtonText}>Pick from Gallery</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.customButton} onPress={handleTakePhoto}>
          <Text style={styles.customButtonText}>Take Photo</Text>
        </TouchableOpacity>
      </View>
      {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}
      {loading && <ActivityIndicator size="large" color="#007AFF" />}
      {ocrText.length > 0 && (
        <View style={styles.ocrContainer}>
          <Text style={styles.ocrTitle}>Extracted Ticket Info:</Text>
          {parsedInfo.passengerName && (
            <Text style={styles.ocrText}>Passenger Name: {parsedInfo.passengerName}</Text>
          )}
          {parsedInfo.airline && (
            <Text style={styles.ocrText}>Airline: {parsedInfo.airline}</Text>
          )}
          {parsedInfo.timeOfTravel && (
            <Text style={styles.ocrText}>Time of Travel: {parsedInfo.timeOfTravel}</Text>
          )}
          {parsedInfo.gate && (
            <Text style={styles.ocrText}>Gate: {parsedInfo.gate}</Text>
          )}
          {parsedInfo.departureTime && (
            <Text style={styles.ocrText}>Departure Time: {parsedInfo.departureTime}</Text>
          )}
          {parsedInfo.seat && (
            <Text style={styles.ocrText}>Seat: {parsedInfo.seat}</Text>
          )}
          {/* Show all raw text as fallback */}
          <Text style={styles.ocrTitle}>Raw Extracted Text:</Text>
          {ocrText.map((line, idx) => (
            <Text key={idx} style={styles.ocrText}>{line}</Text>
          ))}

          <TouchableOpacity
            style={[styles.customButton, { marginTop: 14 }]}
            onPress={handleSaveTicket}
            disabled={isSavingTicket}
          >
            <Text style={styles.customButtonText}>
              {isSavingTicket ? 'Saving Ticket...' : 'Save Ticket'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

export default FlightTicketScannerScreen;

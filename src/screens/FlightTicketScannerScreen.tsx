import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert, PermissionsAndroid, Platform } from 'react-native';
import { launchCamera, launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import TextRecognition from 'react-native-text-recognition';
import styles from './FlightTicketScannerScreen.styles';

const FlightTicketScannerScreen = () => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
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
    let passengerName, airline, timeOfTravel, gate, departureTime, seat;
    // Try to find each field using regex or keyword search
    for (let line of lines) {
      // Passenger Name (look for NAME or PASSENGER)
      if (!passengerName && /name|passenger/i.test(line)) {
        const match = line.match(/(?:name|passenger)\s*:?\s*(.+)/i);
        if (match) passengerName = match[1].trim();
      }
      // Airline (look for AIRLINE or common airline names)
      if (!airline && /airline|airways|airlines|turkish|pegasus|delta|united|lufthansa|qatar|emirates|american/i.test(line)) {
        const match = line.match(/(?:airline)\s*:?\s*(.+)/i);
        airline = match ? match[1].trim() : line.trim();
      }
      // Time of Travel (look for TIME or DEPARTURE)
      if (!timeOfTravel && /time of travel|travel time/i.test(line)) {
        const match = line.match(/(?:time of travel|travel time)\s*:?\s*(.+)/i);
        if (match) timeOfTravel = match[1].trim();
      }
      // Gate (look for GATE)
      if (!gate && /gate/i.test(line)) {
        const match = line.match(/gate\s*:?\s*([A-Z0-9]+)/i);
        if (match) gate = match[1].trim();
      }
      // Departure Time (look for DEPARTURE or time format)
      if (!departureTime && /departure/i.test(line)) {
        const match = line.match(/departure\s*:?\s*([0-9]{1,2}:[0-9]{2})/i);
        if (match) departureTime = match[1].trim();
      }
      // Seat (look for SEAT)
      if (!seat && /seat/i.test(line)) {
        const match = line.match(/seat\s*:?\s*([A-Z0-9]+)/i);
        if (match) seat = match[1].trim();
      }
    }
    // Fallbacks: try to find time/seat/gate if not found
    if (!departureTime) {
      for (let line of lines) {
        const match = line.match(/([0-9]{1,2}:[0-9]{2})/);
        if (match) { departureTime = match[1]; break; }
      }
    }
    if (!seat) {
      for (let line of lines) {
        const match = line.match(/\b([0-9]{1,2}[A-Z])\b/);
        if (match) { seat = match[1]; break; }
      }
    }
    if (!gate) {
      for (let line of lines) {
        const match = line.match(/\b([A-Z][0-9]{1,2})\b/);
        if (match) { gate = match[1]; break; }
      }
    }
    return { passengerName, airline, timeOfTravel, gate, departureTime, seat };
  }

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
        </View>
      )}
    </ScrollView>
  );
};

export default FlightTicketScannerScreen;

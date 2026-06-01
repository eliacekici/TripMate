import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  PermissionsAndroid,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import AppFooter from './AppFooter';
import { RootStackParamList } from '../../App';
import Geolocation from 'react-native-geolocation-service';
import styles from './TransportScreen.styles';

type TransportRouteProp = {
  key: string;
  name: 'TransportScreen';
  params?: {
    destination?: string;
    tripStartDate?: string;
    tripEndDate?: string;
  };
};

const getDistanceKm = (start: { lat: number; lon: number }, end: { lat: number; lon: number }) => {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(end.lat - start.lat);
  const dLon = toRad(end.lon - start.lon);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(start.lat)) * Math.cos(toRad(end.lat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const formatDuration = (minutes: number) => {
  const rounded = Math.round(minutes);
  if (rounded < 60) return `${rounded} min`;
  const hours = Math.floor(rounded / 60);
  const mins = rounded % 60;
  return mins === 0 ? `${hours} hr` : `${hours} hr ${mins} min`;
};

const TransportScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<TransportRouteProp>();
  const destinationParam = route.params?.destination || '';

  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(destinationParam);
  const [destinationPlace, setDestinationPlace] = useState<{ display_name: string; lat: number; lon: number } | null>(null);
  const [routeOptions, setRouteOptions] = useState<Array<{ mode: string; duration: string; distance: string; notes: string }>>([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!permissionGranted) {
        checkLocationPermission();
      }
    }, [permissionGranted])
  );

  useEffect(() => {
    if (destinationParam.trim().length > 0 && permissionGranted && currentLocation) {
      searchDestination(destinationParam);
    }
  }, [destinationParam, permissionGranted, currentLocation]);

  const checkLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const fine = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
      const coarse = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION);
      if (fine || coarse) {
        setPermissionGranted(true);
        setLocationError(null);
        if (!currentLocation) getCurrentPosition();
        return true;
      }
      setPermissionGranted(false);
      setLocationError('Location permission required to continue.');
      setIsLoadingLocation(false);
      return false;
    }
    return true;
  };

  const requestLocationPermission = async () => {
    setIsLoadingLocation(true);
    try {
      if (Platform.OS === 'android') {
        const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        console.log('[Transport] request result', result);
        if (result === PermissionsAndroid.RESULTS.GRANTED) {
          setPermissionGranted(true);
          setLocationError(null);
          getCurrentPosition();
          return;
        }
        setPermissionGranted(false);
        setLocationError('Location permission is required to continue.');
        setIsLoadingLocation(false);
        return;
      }

      // iOS or other platforms: assume permission available and try to get position
      setPermissionGranted(true);
      setLocationError(null);
      getCurrentPosition();
    } catch (error) {
      console.warn('[Transport] requestLocationPermission error', error);
      setLocationError('Unable to request location permission.');
      setIsLoadingLocation(false);
    }
  };

  const getCurrentPosition = () => {
    // Use the native geolocation package when available, otherwise fall back to navigator.geolocation.
    console.log('[Transport] getCurrentPosition called');
    setIsLoadingLocation(true);
    setLocationError(null);

    const geolocationModule: any = (Geolocation as any).default || Geolocation;
    if (geolocationModule && geolocationModule.getCurrentPosition) {
      console.log('[Transport] using react-native-geolocation-service');
      geolocationModule.getCurrentPosition(
        (position: any) => {
          const loc = { lat: position.coords.latitude, lon: position.coords.longitude };
          console.log('[Transport] got current position (geolocation-service)', loc);
          setCurrentLocation(loc);
          setIsLoadingLocation(false);
        },
        (error: any) => {
          console.warn('[Transport] geolocation-service error', error);
          if (error.code === 1) {
            setLocationError('Location permission denied.');
          } else if (error.code === 3) {
            setLocationError('Location request timed out. Try again.');
          } else {
            setLocationError('Location service unavailable.');
          }
          setIsLoadingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
      );
      return;
    }

    const geolocation = (navigator as any)?.geolocation;
    if (!geolocation || !geolocation.getCurrentPosition) {
      console.warn('[Transport] no geolocation provider available (navigator missing)');
      setLocationError('Location service unavailable.');
      setIsLoadingLocation(false);
      return;
    }

    geolocation.getCurrentPosition(
      (position: any) => {
        const loc = { lat: position.coords.latitude, lon: position.coords.longitude };
        console.log('[Transport] got current position (navigator)', loc);
        setCurrentLocation(loc);
        setIsLoadingLocation(false);
      },
      (error: any) => {
        console.warn('[Transport] navigator geolocation error', error);
        setLocationError(error.message || 'Unable to get current location.');
        setIsLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  };

  const computeRoutes = (origin: { lat: number; lon: number }, destination: { lat: number; lon: number }) => {
    const distanceKm = getDistanceKm(origin, destination);
    const driveMinutes = 10 + (distanceKm / 50) * 60;
    const transitMinutes = 15 + (distanceKm / 30) * 60;
    const walkMinutes = (distanceKm / 5) * 60;
    const bikeMinutes = (distanceKm / 14) * 60;

    return [
      {
        mode: 'Driving',
        duration: formatDuration(driveMinutes),
        distance: `${distanceKm.toFixed(1)} km`,
        notes: 'Fastest route for medium and long distances.',
      },
      {
        mode: 'Public Transit',
        duration: formatDuration(transitMinutes),
        distance: `${distanceKm.toFixed(1)} km`,
        notes: 'Average transit time including transfer waits.',
      },
      {
        mode: 'Cycling',
        duration: formatDuration(bikeMinutes),
        distance: `${distanceKm.toFixed(1)} km`,
        notes: 'Good for short and medium distances in the city.',
      },
      {
        mode: 'Walking',
        duration: formatDuration(walkMinutes),
        distance: `${distanceKm.toFixed(1)} km`,
        notes: 'Best for very short trips and local exploration.',
      },
    ];
  };

  const searchDestination = async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) {
      setSearchError('Please enter a destination.');
      return;
    }

    if (!currentLocation) {
      console.warn('[Transport] searchDestination called but currentLocation is null');
      setSearchError('Current location not available yet.');
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setDestinationPlace(null);
    setRouteOptions([]);
    console.log('[Transport] searching destination', { query: trimmed, currentLocation });

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(trimmed)}&limit=1`,
        {
          headers: {
            'User-Agent': 'TripMateApp/1.0',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Search request failed');
      }

      const results = await response.json();
      if (!results || results.length === 0) {
        setSearchError('Destination not found. Try another location.');
        return;
      }

      const first = results[0];
      const place = {
        display_name: first.display_name,
        lat: parseFloat(first.lat),
        lon: parseFloat(first.lon),
      };
      setDestinationPlace(place);
      setRouteOptions(computeRoutes(currentLocation, place));
    } catch (error) {
      setSearchError('Unable to search destination. Please try again later.');
    } finally {
      setIsSearching(false);
      Keyboard.dismiss();
    }
  };

  const handleSearchPress = () => {
    if (searchQuery.trim().length === 0) {
      setSearchError('Please enter a destination.');
      return;
    }
    searchDestination(searchQuery);
  };

  const getStatusMessage = () => {
    if (isLoadingLocation) return 'Requesting location permission...';
    if (locationError) return locationError;
    if (currentLocation) return 'Location access granted. Ready to search destinations.';
    return 'Location permission not yet granted.';
  };

  const renderLocationButton = () => {
    if (isLoadingLocation) return null;
    if (!permissionGranted) {
      return (
        <TouchableOpacity style={styles.permissionButton} onPress={requestLocationPermission}>
          <Text style={styles.permissionButtonText}>Allow location access</Text>
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity style={styles.permissionButton} onPress={getCurrentPosition}>
        <Text style={styles.permissionButtonText}>{locationError ? 'Try location again' : 'Get current position'}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Transport routes</Text>
          <Text style={styles.subtitle}>Search another destination and compare travel options from your current location.</Text>
        </View>

        <View style={styles.statusBox}>
          <Text style={styles.statusText}>{getStatusMessage()}</Text>
        </View>

        {renderLocationButton()}

        <TextInput
          style={styles.searchInput}
          placeholder="Search destination"
          placeholderTextColor="#8b95a3"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearchPress}
          returnKeyType="search"
        />

        <TouchableOpacity style={styles.searchButton} onPress={handleSearchPress} disabled={isSearching || isLoadingLocation || !!locationError}>
          <Text style={styles.searchButtonText}>{isSearching ? 'Searching...' : 'Show transport options'}</Text>
        </TouchableOpacity>

        

        {searchError ? <Text style={styles.errorText}>{searchError}</Text> : null}

        {destinationPlace ? (
          <View style={styles.destinationCard}>
            <Text style={styles.destinationLabel}>Destination</Text>
            <Text style={styles.destinationName}>{destinationPlace.display_name}</Text>
          </View>
        ) : null}

        {!destinationPlace && !isSearching && !searchError ? (
          <View style={styles.hintBox}>
            <Text style={styles.hintTitle}>How it works</Text>
            <Text style={styles.hintText}>Enter a destination and tap the button. TripMate will calculate the distance from your current location and show travel time for driving, transit, cycling, and walking.</Text>
          </View>
        ) : null}

        {routeOptions.length > 0 ? (
          <View style={styles.optionsList}>
            <Text style={styles.resultsTitle}>Transport options</Text>
            {routeOptions.map((option) => (
              <View key={option.mode} style={styles.optionCard}>
                <Text style={styles.optionMode}>{option.mode}</Text>
                <Text style={styles.optionDetail}>{option.distance} · {option.duration}</Text>
                <Text style={styles.optionNotes}>{option.notes}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {(isLoadingLocation || isSearching) && <ActivityIndicator size="large" color="#0C1559" style={styles.loadingSpinner} />}
      </ScrollView>
      <AppFooter activeScreen="TransportScreen" navigation={navigation} />
    </SafeAreaView>
  );
};

export default TransportScreen;

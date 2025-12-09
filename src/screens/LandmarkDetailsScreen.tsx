import React, { useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App'; 
import WebView from 'react-native-webview';
import { WebView as WebViewType } from 'react-native-webview';


type Props = NativeStackScreenProps<RootStackParamList, 'LandmarkDetailsScreen'>;

const LandmarkDetailsScreen = ({ route }: Props) => {
    // Destructure lat and lon directly from route.params
    const { placeName, placeCategories, placeAddress, lat, lon } = route.params;
    
    const webViewRef = useRef<WebViewType | null>(null);

    //Function to receive the "mapReady" signal from the WebView
    const onMapMessage = (event: any) => {
        try {
            // event.nativeEvent.data is the string sent from the WebView
            const data = JSON.parse(event.nativeEvent.data);
            
            // Check for the "mapReady" signal
            if (data.type === 'mapReady') {
                console.log('WebView: Map is ready! Sending coordinates now.');

                // Use the WebView ref to post the coordinates immediately
                if (webViewRef.current) {
                    const mapData = JSON.stringify({ lat, lon, name: placeName });
                    webViewRef.current.postMessage(mapData); 
                }
            }
        } catch (e) {
            console.error('Error processing message from webview:', e);
        }
    }; 
    return (
        <View style={styles.container}>
            
            <View style={styles.mapContainer}>
                <WebView
                    ref={webViewRef}
                    style={styles.map}
                    source={require('../assets/map.html')}
                    
                    onMessage={onMapMessage} 
                    
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                />
            </View>
            {/* ---------------------------------- */}

            <View style={styles.detailsContent}>
                <Text style={styles.title}>{placeName}</Text>
                
                <View style={styles.detailCard}>
                    <Text style={styles.label}>Category</Text>
                    <Text style={styles.value}>
                        {placeCategories.map(c => c.name).join(', ') || 'General Interest'}
                    </Text>
                </View>

                <View style={styles.detailCard}>
                    <Text style={styles.label}>Location</Text>
                    <Text style={styles.value}>{placeAddress || 'Address not available'}</Text>
                </View>
                
                <Text style={styles.note}>
                    Note: Map rendering is handled by the client-side Leaflet library using OpenStreetMap data, requiring no commercial API key.
                </Text>
            </View>
        </View>
    );
};

export default LandmarkDetailsScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    mapContainer: { width: '100%', height: 250, backgroundColor: '#E0F2FE' },
    map: { flex: 1 }, 
    
    detailsContent: { padding: 20 },
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: '#0C1559' },
    detailCard: {
        backgroundColor: '#F0F8FF', 
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        borderLeftWidth: 3,
        borderLeftColor: '#C3E2F1',
    },
    label: { fontSize: 14, fontWeight: '600', color: '#555' },
    value: { fontSize: 18, marginTop: 2, color: '#333' },
    note: { marginTop: 30, fontSize: 12, color: '#888', fontStyle: 'italic' },
});
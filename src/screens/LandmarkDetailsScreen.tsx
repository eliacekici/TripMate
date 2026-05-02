import React, { useRef } from 'react';
import { 
    View, 
    Text, 
    ScrollView, 
    Platform,
} from 'react-native';
import styles from './LandmarkDetailsScreen.styles';
import { NativeStackScreenProps } from '@react-navigation/native-stack'; 
import WebView from 'react-native-webview';
import { WebView as WebViewType } from 'react-native-webview';
import AppFooter from './AppFooter'; 
import { RootStackParamList } from '../../App';


type Props = NativeStackScreenProps<RootStackParamList, 'LandmarkDetailsScreen'>;

const LandmarkDetailsScreen = ({ route, navigation }: Props) => {
    // Destructure all required parameters from route.params
    const { placeName, placeCategories, lat, lon, distanceDetail } = route.params;
    
    const webViewRef = useRef<WebViewType | null>(null);

    // Calculate footer height for padding the content
    const FOOTER_HEIGHT = 10 + 45 + (Platform.OS === 'ios' ? 30 : 5); 

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
            
            {/* Wrap scrollable content in ScrollView */}
            <ScrollView contentContainerStyle={{ paddingBottom: FOOTER_HEIGHT }}>
                <View style={styles.mapContainer}>
                    <WebView
                        ref={webViewRef}
                        source={require('../assets/map.html')}
                        style={styles.map}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        onMessage={onMapMessage}
                    />
                </View>
            
                <View style={styles.detailsContent}>
                    <Text style={styles.title}>{placeName}</Text>
                    
                    {/* Detail Card 1: Category */}
                    <View style={styles.detailCard}>
                        <Text style={styles.label}>Category</Text>
                        <Text style={styles.value}>
                            {placeCategories.map(c => c.name).join(', ') || 'General Interest'}
                        </Text>
                    </View>
                    
                    {/* distanceDetail */}
                    <View style={styles.detailCard}>
                        <Text style={styles.label}>Distance</Text>
                        <Text style={styles.value}>{distanceDetail}</Text>
                    </View>
                    
                </View>
            </ScrollView>

            <AppFooter navigation={navigation} activeScreen={'LandmarkDetailsScreen'} />
        </View>
    );
};

export default LandmarkDetailsScreen;


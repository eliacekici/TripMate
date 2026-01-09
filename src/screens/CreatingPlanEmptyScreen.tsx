import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App'; 
import AppFooter from './AppFooter';


interface CreatingPlanEmptyScreenProps {
  route: {
    params: {
      destination: string;
    };
  };
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

const { width, height } = Dimensions.get('window');

// Use require instead of import
const PlusIcon = require('../assets/images/plus_sign.png');

const CreatingPlanEmptyScreen: React.FC<CreatingPlanEmptyScreenProps> = ({
  route,
  navigation,
}) => {
  const { destination } = route.params;
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    // Fetch a photo from Unsplash API based on the destination
    const fetchPhoto = async () => {
      try {
        const response = await fetch(
          `https://api.unsplash.com/photos/random?query=${destination}&client_id=YOUR_UNSPLASH_ACCESS_KEY`
        );
        const data = await response.json();
        setPhotoUrl(data.urls?.regular);
      } catch (error) {
        console.log('Error fetching Unsplash photo:', error);
      }
    };

    fetchPhoto();
  }, [destination]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Image */}
      {photoUrl && (
        <ImageBackground
          source={{ uri: photoUrl }}
          style={styles.topImage}
          resizeMode="cover"
        />
      )}

      {/* Middle empty space */}
      <View style={styles.emptySpace} />

      {/* Bottom plus button and tooltip */}
      <View style={styles.bottomContainer}>
        <View style={styles.tooltip}>
          <Text style={styles.tooltipText}>Click + to start planning</Text>
        </View>

        <TouchableOpacity
            style={styles.plusButton}
            onPress={() => {
              // Do nothing, or add some other functionality here
              console.log('Plus button pressed'); // optional
            }}
          >
            <Image source={PlusIcon} style={styles.plusIcon} />
          </TouchableOpacity>
      </View>

      {/* Footer */}
      <AppFooter activeScreen="CreatingPlanEmptyScreen" navigation={navigation} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topImage: {
    width: width,
    height: height * 0.3,
  },
  emptySpace: {
    flex: 1,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 70, // leave room for footer
    right: 20,
    alignItems: 'center',
  },
  plusButton: {
    width: 60,
    height: 60,
  },
  plusIcon: {
    width: 60,
    height: 60,
  },
  tooltip: {
    marginBottom: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  tooltipText: {
    color: '#fff',
    fontSize: 14,
  },
});

export default CreatingPlanEmptyScreen;

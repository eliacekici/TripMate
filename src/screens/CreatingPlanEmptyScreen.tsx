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

import { UNSPLASH_ACCESS_KEY} from '@env';


interface CreatingPlanEmptyScreenProps {
  route: {
    params: {
      destination: string;
    };
  };
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

const { width, height } = Dimensions.get('window');

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
          `https://api.unsplash.com/search/photos?query=${destination}&per_page=1&client_id=${UNSPLASH_ACCESS_KEY}`
        );

        if (!response.ok) {
            console.log('Unsplash API Error:', response.status, await response.text());
            return;
        }

        const data = await response.json();

        //To get the first element
       const firstPhoto = data?.results?.[0];

        setPhotoUrl(firstPhoto?.urls?.regular || null);
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

     {/* DESTINATION HEADER BELOW THE IMAGE */}
      <View style={styles.destinationHeader}>
          <Text style={styles.destinationText}>
              On my way to {destination}
          </Text>
      </View>
      {/* ------------------------------------------- */}

      {/* Middle empty space */}
      <View style={styles.emptySpace} />

      {/* Bottom plus button and tooltip */}
      <View style={styles.bottomContainer}>
        {/* ... (tooltip and button remain the same) */}
        <View style={styles.tooltip}>
          <Text style={styles.tooltipText}>Click + to start planning</Text>
        </View>

        <TouchableOpacity
            style={styles.plusButton}
            onPress={() => {
              console.log('Plus button pressed'); 
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
    backgroundColor: '#E0F2FE',
  },
  topImage: {
    width: width,
    height: height * 0.3,
  },
  destinationHeader: {
        padding: 15,
        backgroundColor: '#E0F2FE', 
        marginBottom: 10,
    },
    destinationText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#000000',
        fontFamily: 'Labrada-Bold',
        textAlign: 'center',
    },
  emptySpace: {
    flex: 1,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 120, 
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  plusButton: {
    width: 60,
    height: 60,
    justifyContent: 'center',
  alignItems: 'center',
  },
  plusIcon: {
    width: 48,
    height: 42,
  },
  tooltip: {
    marginRight: 5, 
    backgroundColor: '#C3E2F1',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  tooltipText: {
    color: '#000000',
    fontSize: 14,
    fontFamily: 'Karma-Bold',
  },
});

export default CreatingPlanEmptyScreen;

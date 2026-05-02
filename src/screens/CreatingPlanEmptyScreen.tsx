import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
} from 'react-native';
import styles from './CreatingPlanEmptyScreen.styles';
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
  const [showTooltip, setShowTooltip] = useState(true);
  const [showCategoryFooter, setShowCategoryFooter] = useState(false);

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

    // Show tooltip for 6 seconds on first mount
    setShowTooltip(true);
    const timer = setTimeout(() => setShowTooltip(false), 6000);
    return () => clearTimeout(timer);
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
        {showTooltip && (
          <View style={styles.tooltip}>
            <Text style={styles.tooltipText}>Click + to start planning</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.plusButton}
          onPress={() => {
            setShowCategoryFooter(true);
          }}
        >
          <Image source={PlusIcon} style={styles.plusIcon} />
        </TouchableOpacity>
      </View>

      {/* Category Footer Overlay */}
      {showCategoryFooter && (
        <View style={styles.categoryFooterOverlay}>
          <CategoryIcon label="Flight" image={require('../assets/images/flight.png')} onPress={() => {}} />
          <CategoryIcon label="Hotel" image={require('../assets/images/hotel.png')} onPress={() => {}} />
          <CategoryIcon label="Food" image={require('../assets/images/food.png')} onPress={() => {}} />
          <CategoryIcon label="Spots" image={require('../assets/images/spots.png')} onPress={() => {}} />
          <CategoryIcon label="Transport" image={require('../assets/images/transportation.png')} onPress={() => {}} />
        </View>
      )}

      {/* Footer */}
      <AppFooter activeScreen="CreatingPlanEmptyScreen" navigation={navigation} />
    </SafeAreaView>
  );
};

// CategoryIcon component
const CategoryIcon = ({ label, image, onPress }: { label: string; image: any; onPress: () => void }) => (
  <TouchableOpacity style={styles.categoryIconContainer} onPress={onPress}>
    <Image source={image} style={styles.categoryIconImage} resizeMode="contain" />
    <Text style={styles.categoryIconLabel}>{label}</Text>
  </TouchableOpacity>
);

export default CreatingPlanEmptyScreen;
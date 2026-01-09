import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ImageBackground,
    Alert,
    StyleProp,
    ViewStyle,
    TextStyle,
    ScrollView,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

import AppFooter from './AppFooter'; 
import { RootStackParamList } from '../../App';

import { styles, gridStyles, COLORS } from './DashboardMyPlans.styles';


interface NominatimResult {
    display_name: string;
    lat: string;
    lon: string;
    type: string;
    importance?: number;
}

const HeaderImagePlaceholder = require('../assets/images/header_image_placeholder.png');

/* -------------------- CALENDAR GRID -------------------- */

interface CalendarGridProps {
    currentMonthYear: Date;
    startDate: Date | null;
    endDate: Date | null;
    onDayPress: (day: number, date: Date) => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
    currentMonthYear,
    startDate,
    endDate,
    onDayPress,
}) => {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    
    const daysInMonth = new Date(
        currentMonthYear.getFullYear(),
        currentMonthYear.getMonth() + 1,
        0
    ).getDate();

    
    const firstDayOfMonth = new Date(
        currentMonthYear.getFullYear(),
        currentMonthYear.getMonth(),
        1
    ).getDay();

    const renderGridItems = () => {
        const items = [];

        // Add empty boxes for the days before the 1st of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
            items.push(<View key={`empty-${i}`} style={gridStyles.dateBoxWrapper} />);
        }

        // Add the day boxes for the current month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(
                currentMonthYear.getFullYear(),
                currentMonthYear.getMonth(),
                day
            );
            // Reset hours, minutes, seconds for accurate comparison
            date.setHours(0, 0, 0, 0);

            const isStart = startDate?.toDateString() === date.toDateString();
            const isEnd = endDate?.toDateString() === date.toDateString();
            const isInRange =
                startDate &&
                endDate &&
                // Check if date is strictly between start and end
                date.getTime() > startDate.getTime() && 
                date.getTime() < endDate.getTime();

            let boxStyle: StyleProp<ViewStyle> = [
                gridStyles.dateBoxBase,
                gridStyles.dateBoxDefault,
            ];
            let textStyle: StyleProp<TextStyle> = gridStyles.dateBoxText;

            if (isStart || isEnd) {
                // Style for start/end date
                boxStyle = [gridStyles.dateBoxBase, gridStyles.dateBoxSelected];
                textStyle = gridStyles.dateBoxTextSelected;
            } else if (isInRange) {
                // Style for dates between start and end
                boxStyle = [gridStyles.dateBoxBase, gridStyles.dateBoxInRange];
            }

            items.push(
                <View key={day} style={gridStyles.dateBoxWrapper}>
                    <TouchableOpacity
                        style={boxStyle}
                        onPress={() => onDayPress(day, date)}
                        activeOpacity={0.7}
                    >
                        <Text style={textStyle}>{day}</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return items;
    };

    return (
        <View style={gridStyles.calendarContainer}>
            <View style={gridStyles.dayHeaderRow}>
                {daysOfWeek.map(day => (
                    <View key={day} style={gridStyles.dayHeaderWrapper}>
                        <Text style={gridStyles.dayHeaderText}>{day}</Text>
                    </View>
                ))}
            </View>
            <View style={gridStyles.gridRow}>{renderGridItems()}</View>
        </View>
    );
};

/* -------------------- MAIN SCREEN -------------------- */

const DashboardMyPlansScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const [destination, setDestination] = useState('');
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);

    // Initial state set to the first day of the current month
    const [currentMonthYear, setCurrentMonthYear] = useState(
        new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    );
    

    const [destinationError, setDestinationError] = useState('');
    const [validatingDestination, setValidatingDestination] = useState(false);

    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        AsyncStorage.getItem('userId').then(id => {
            console.log('Fetched userId:', id);  // <-- see in your Metro/console
            setUserId(id);
        });
    }, []);
    
    // Helper function to navigate to the previous month
    const goToPreviousMonth = () => {
        const newDate = new Date(currentMonthYear.getTime());
        newDate.setMonth(newDate.getMonth() - 1);
        setCurrentMonthYear(newDate);
    };

    // Helper function to navigate to the next month
    const goToNextMonth = () => {
        const newDate = new Date(currentMonthYear.getTime());
        newDate.setMonth(newDate.getMonth() + 1);
        setCurrentMonthYear(newDate);
    };


    const formatDate = (date: Date | null) =>
        date
            ? date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
              })
            : 'Select on calendar';
            
   
    const GENERIC_NOUN_BLACKLIST = [
        'table', 'chair', 'flower', 'clothes', 'bottle', 'car', 'tree', 'house', 'water', 'food',
        'book', 'pen', 'paper', 'computer', 'phone'
    ];
            
    // Strict types, increased importance score, and added blacklist.
    const validateDestinationWithNominatim = async (query: string) => {
        const normalizedQuery = query.trim().toLowerCase();
        
        // 0. Blacklist Check
        if (GENERIC_NOUN_BLACKLIST.includes(normalizedQuery)) {
            console.log(`Rejected query: ${query} (Blacklisted noun)`);
            return false;
        }

        // Minimum query length check for efficiency
        if (normalizedQuery.length < 3) return false; 
        
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                    query
                )}&limit=5`, 
                {
                    headers: { 'User-Agent': 'TripMateApp/1.0' },
                }
            );

            if (!res.ok) return false;
            const results = (await res.json()) as NominatimResult[];

            if (results.length === 0) return false;

            // Define STRICTLY acceptable administrative types related to travel/planning.
            const MAJOR_DESTINATION_TYPES = [
                'country', 
                'state', 
                'province', 
                'city', 
                'town', 
                'capital',
                'airport',
            ];

            // Check if ANY of the top results qualify as a major travel destination
            const isValidDestination = results.some(top => {
                // Ensure coordinates exist
                if (!top?.lat || !top?.lon) return false;

                // 1. Check if the type matches one of the STRICT travel/admin types
                const isMajorType = MAJOR_DESTINATION_TYPES.includes(top.type);
                
                // 2. Check for substantial importance (score >= 0.5) 
                const hasSubstantialImportance = (top.importance !== undefined && top.importance >= 0.5);
                
                return isMajorType || hasSubstantialImportance;
            });

            return isValidDestination;

        } catch {
            return false;
        }
    };

    // Date selection logic (corrected for better clarity and range handling)
    const handleDayPress = (_: number, date: Date) => {
        date.setHours(0, 0, 0, 0);

        // Case 1: No start date selected yet -> set as start date
        if (!startDate) {
            setStartDate(date);
            setEndDate(null);
            return;
        }
        
        // Case 2: Start date is selected, but no end date
        if (!endDate) {
            if (date.getTime() < startDate.getTime()) {
                setStartDate(date);
                return;
            }
            
            // If the selected date is the same as the start date, clear the selection
            if (date.toDateString() === startDate.toDateString()) {
                setStartDate(null);
                return;
            }
            
            // If the selected date is after the start date, set it as the end date
            setEndDate(date);
            return;
        }

        // Case 3: Both start and end dates are selected (reset the range)
        setStartDate(date);
        setEndDate(null);
    };

    const handleStartPlanning = async () => {
        if (!destination.trim()) {
            setDestinationError('Please enter a destination.');
            return;
        }
        if (!startDate || !endDate) {
            Alert.alert('Missing Dates', 'Please select start and end dates.');
            return;
        }
        if (!userId) {
            Alert.alert('Error', 'User not logged in. Please log in first.');
            return;
        }

        setValidatingDestination(true);
        const valid = await validateDestinationWithNominatim(destination);
        setValidatingDestination(false);

        if (!valid) {
            setDestinationError('Invalid destination. Please enter a city, country, or major travel spot.');
            return;
        }

        try {
        // Send trip to backend
            const response = await fetch('http://10.0.2.2:5000/api/trip-plans', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    destination,
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                    notes: null,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('Error saving trip:', data);
                Alert.alert('Error', 'Failed to save trip. Try again.');
                return;
            }

            // Show success alert
            Alert.alert(
                'Trip Saved!',
                `Destination: ${destination}\nDates: ${formatDate(startDate)} – ${formatDate(endDate)}`,
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            setTimeout(() => {
                            navigation.navigate('CreatingPlanEmptyScreen', { destination });
                            }, 100); // 100ms delay ensures the alert fully closes first
                        },
                    },
                ]
            );

            // Reset form
            setDestination('');
            setStartDate(null);
            setEndDate(null);
            setCurrentMonthYear(new Date(new Date().getFullYear(), new Date().getMonth(), 1));

        } catch (err) {
            console.error('Network error:', err);
            Alert.alert('Error', 'Network error. Could not save trip.');
        }
    }; 
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <ImageBackground source={HeaderImagePlaceholder} style={styles.headerImage} />

                <Text style={styles.planTitle}>Plan your trip</Text>

                <View style={styles.inputRow}>
                    <Text style={styles.inputLabel}>Traveling to:</Text>
                    <TextInput
                        style={styles.textInputFull}
                        value={destination}
                        onChangeText={text => {
                            setDestination(text);
                            setDestinationError('');
                        }}
                        placeholder="Paris, Rome, Japan"
                        placeholderTextColor={COLORS.DARK_TEXT}
                    />
                    {!!destinationError && (
                        <Text style={styles.errorText}>{destinationError}</Text>
                    )}
                </View>

                <View style={styles.monthSelectorRow}>
                    <TouchableOpacity 
                        onPress={goToPreviousMonth} 
                        style={styles.monthChangeButton}
                    >
                        <Text style={styles.monthChangeButtonText}>{'<'}</Text>
                    </TouchableOpacity>
                    
                    <View style={styles.monthSelector}>
                        <Text style={styles.monthSelectorText}>
                            {currentMonthYear.toLocaleDateString('en-US', {
                                month: 'long',
                                year: 'numeric',
                            })}
                        </Text>
                        <Text style={styles.selectionPrompt}>
                            Start: {formatDate(startDate)}
                        </Text>
                        <Text style={styles.selectionPrompt}>
                            End: {formatDate(endDate)}
                        </Text>
                    </View>
                    
                    <TouchableOpacity 
                        onPress={goToNextMonth} 
                        style={styles.monthChangeButton}
                    >
                        <Text style={styles.monthChangeButtonText}>{'>'}</Text>
                    </TouchableOpacity>
                </View>

                <CalendarGrid
                    currentMonthYear={currentMonthYear}
                    startDate={startDate}
                    endDate={endDate}
                    onDayPress={handleDayPress}
                />

                <TouchableOpacity
                    style={styles.planningButton}
                    onPress={handleStartPlanning}
                    disabled={validatingDestination} 
                >
                    <Text style={styles.planningButtonText}>
                        {validatingDestination ? 'Validating...' : 'Start planning'}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
            <AppFooter
                activeScreen="DashboardMyPlansScreen"
                navigation={navigation as any}
            />
        </SafeAreaView>
    );
};

export default DashboardMyPlansScreen;
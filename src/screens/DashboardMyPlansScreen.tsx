import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ImageBackground,
    Modal,
    Platform,
    Button,
    Alert,
    StyleProp,
    ViewStyle,
    TextStyle,
    ScrollView,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import AppFooter, { RootStackParamList } from './AppFooter';
import { styles, gridStyles, COLORS } from './DashboardMyPlans.styles';

interface NominatimResult {
    display_name: string;
    lat: string;
    lon: string;
    type: string;
    importance?: number;
}

interface TripPlanResponse {
    success: boolean;
    message?: string;
}

type NavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'DashboardMyPlansScreen'
>;

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

        for (let i = 0; i < firstDayOfMonth; i++) {
            items.push(<View key={`empty-${i}`} style={gridStyles.dateBoxWrapper} />);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(
                currentMonthYear.getFullYear(),
                currentMonthYear.getMonth(),
                day
            );

            const isStart = startDate?.toDateString() === date.toDateString();
            const isEnd = endDate?.toDateString() === date.toDateString();
            const isInRange =
                startDate &&
                endDate &&
                date > startDate &&
                date < endDate;

            let boxStyle: StyleProp<ViewStyle> = [
                gridStyles.dateBoxBase,
                gridStyles.dateBoxDefault,
            ];
            let textStyle: StyleProp<TextStyle> = gridStyles.dateBoxText;

            if (isStart || isEnd) {
                boxStyle = [gridStyles.dateBoxBase, gridStyles.dateBoxSelected];
                textStyle = gridStyles.dateBoxTextSelected;
            } else if (isInRange) {
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
    const navigation = useNavigation<NavigationProp>();

    const [destination, setDestination] = useState('');
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);

    const [currentMonthYear, setCurrentMonthYear] = useState(new Date());
    const [pickerValue, setPickerValue] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    const [destinationError, setDestinationError] = useState('');
    const [validatingDestination, setValidatingDestination] = useState(false);

    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        AsyncStorage.getItem('userId').then(setUserId);
    }, []);

    const formatDate = (date: Date | null) =>
        date
            ? date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
              })
            : 'N/A';

    const validateDestinationWithNominatim = async (query: string) => {
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                    query
                )}&limit=1`,
                {
                    headers: { 'User-Agent': 'TripMateApp/1.0' },
                }
            );

            if (!res.ok) return false;
            const [top] = (await res.json()) as NominatimResult[];
            if (!top?.lat || !top?.lon) return false;

           return (
        (top.importance !== undefined && top.importance >= 0.3) ||
        ['city', 'town', 'village', 'country'].includes(top.type)
    );
        } catch {
            return false;
        }
    };

    const handleDayPress = (_: number, date: Date) => {
        if (!startDate) {
            setStartDate(date);
            setEndDate(null);
            return;
        }
        if (!endDate) {
            if (date < startDate) {
                setStartDate(date);
                return;
            }
            if (date.toDateString() === startDate.toDateString()) {
                setStartDate(null);
                return;
            }
            setEndDate(date);
            return;
        }
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

        setValidatingDestination(true);
        const valid = await validateDestinationWithNominatim(destination);
        setValidatingDestination(false);

        if (!valid) {
            setDestinationError('Invalid destination.');
            return;
        }

        Alert.alert(
            'Trip Saved!',
            `${destination}\n${formatDate(startDate)} – ${formatDate(endDate)}`
        );
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

                <TouchableOpacity
                    style={styles.monthSelector}
                    onPress={() => {
                        if (!showDatePicker) {
                            setPickerValue(currentMonthYear);
                            setShowDatePicker(true);
                        }
                    }}
                >
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
                </TouchableOpacity>

                <CalendarGrid
                    currentMonthYear={currentMonthYear}
                    startDate={startDate}
                    endDate={endDate}
                    onDayPress={handleDayPress}
                />

                <TouchableOpacity
                    style={styles.planningButton}
                    onPress={handleStartPlanning}
                >
                    <Text style={styles.planningButtonText}>Start planning</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* ✅ FIXED MODAL */}
            <Modal
                transparent
                animationType="slide"
                visible={showDatePicker}
                onRequestClose={() => setShowDatePicker(false)}
            >
                <TouchableOpacity
                    style={styles.centeredView}
                    activeOpacity={1}
                    onPress={() => setShowDatePicker(false)}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        style={styles.modalView}
                        onPress={() => {}}
                    >
                        <DateTimePicker
                            value={pickerValue}
                            mode="date"
                            // CHANGE THIS LINE: Forces the picker to render inline, 
                            // making the 'Done' button visible and functional alongside it.
                            display="spinner" 
                            onChange={(_, d) => d && setPickerValue(d)}
                        />

                        <View style={{ marginTop: 20 }}>
                        <Button
                            title="Done"
                            onPress={() => {
                                setCurrentMonthYear(
                                    new Date(
                                        pickerValue.getFullYear(),
                                        pickerValue.getMonth(),
                                        1
                                    )
                                );
                                // This line will now be reached and close the surrounding Modal.
                                setShowDatePicker(false); 
                            }}
                        />
                    </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>

            <AppFooter
                activeScreen="DashboardMyPlansScreen"
                navigation={navigation as any}
            />
        </SafeAreaView>
    );
};

export default DashboardMyPlansScreen;

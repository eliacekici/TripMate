import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Dimensions,
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

import AppFooter, { RootStackParamList } from './AppFooter';

// --- TYPE DEFINITIONS ---
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'DashboardMyPlansScreen'>;

const HeaderImagePlaceholder = require('../assets/images/header_image_placeholder.png');

const { width: screenWidth } = Dimensions.get('window');

// --- COLORS ---
const COLORS = {
    NAVY_BLUE: '#00223D',
    LIGHT_BLUE_BACKGROUND: '#E0F2FE',
    INPUT_FIELD: '#C3E2F1',
    WHITE: '#FFFFFF',
    DARK_TEXT: '#000000',
    GRAY_TEXT: '#888888',
    BORDER_COLOR: '#0C1559',
    CALENDAR_BLUE: '#89CFF0',
    CALENDAR_HIGHLIGHT: '#FF9800',
    CALENDAR_RANGE: '#C3E2F1',
    NAVY_TEXT: '#00223D',
};

// --- CALENDAR GRID VISUAL ---
interface CalendarGridProps {
    currentMonthYear: Date;
    startDate: Date | null;
    endDate: Date | null;
    onDayPress: (dayOfMonth: number, date: Date) => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({ currentMonthYear, startDate, endDate, onDayPress }) => {

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const daysInMonth = new Date(currentMonthYear.getFullYear(), currentMonthYear.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentMonthYear.getFullYear(), currentMonthYear.getMonth(), 1).getDay(); // 0 = Sunday, 1 = Monday, etc.

    const renderGridItems = () => {
        const items = [];

        // --- Placeholders before the first day ---
        for (let i = 0; i < firstDayOfMonth; i++) {
            items.push(
                <View key={`empty-${i}`} style={gridStyles.dateBoxWrapper} />
            );
        }

        // --- Actual days ---
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentMonthYear.getFullYear(), currentMonthYear.getMonth(), day);
            const dateTimestamp = date.getTime();

            const isSelectedStart = startDate && date.toDateString() === startDate.toDateString();
            const isSelectedEnd = endDate && date.toDateString() === endDate.toDateString();

            const isInRange = startDate && endDate
                && dateTimestamp > startDate.getTime()
                && dateTimestamp < endDate.getTime();

            let boxStyle: StyleProp<ViewStyle>;
            let textStyle: StyleProp<TextStyle> = gridStyles.dateBoxText;

            if (isSelectedStart || isSelectedEnd) {
                boxStyle = [gridStyles.dateBoxBase, gridStyles.dateBoxSelected];
                textStyle = gridStyles.dateBoxTextSelected;
            } else if (isInRange) {
                boxStyle = [gridStyles.dateBoxBase, gridStyles.dateBoxInRange];
            } else {
                boxStyle = [gridStyles.dateBoxBase, gridStyles.dateBoxDefault];
            }

            items.push(
                <View key={`day-wrapper-${day}`} style={gridStyles.dateBoxWrapper}>
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

        // --- Placeholders after last day (Optional: ensures grid stays square) ---
        const totalCellsNeeded = firstDayOfMonth + daysInMonth;
        const totalSlots = Math.ceil(totalCellsNeeded / 7) * 7;
        const remainingSlots = totalSlots - items.length;

        for (let i = 0; i < remainingSlots; i++) {
            items.push(
                <View key={`empty-after-${i}`} style={gridStyles.dateBoxWrapper} />
            );
        }

        return items;
    };

    return (
        <View style={gridStyles.calendarContainer}>
            {/* Day Headers */}
            <View style={gridStyles.dayHeaderRow}>
                {daysOfWeek.map((day, index) => (
                    <View key={index} style={gridStyles.dayHeaderWrapper}>
                        <Text style={gridStyles.dayHeaderText}>{day}</Text>
                    </View>
                ))}
            </View>

            {/* Grid of Boxes */}
            <View style={gridStyles.gridRow}>
                {renderGridItems()}
            </View>
        </View>
    );
};

// --- SCREEN COMPONENT ---
const DashboardMyPlansScreen = () => {

    const navigation = useNavigation<NavigationProp>();

    const [destination, setDestination] = useState('');
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [currentPickerValue, setCurrentPickerValue] = useState<Date>(new Date());
    const [currentMonthYear, setCurrentMonthYear] = useState(new Date());

    // --- Handle day selection ---
    const handleDaySelection = (_day: number, selectedDate: Date) => {
        if (!startDate) {
            setStartDate(selectedDate);
            setEndDate(null);
            return;
        }
        if (startDate && !endDate) {
            if (selectedDate.getTime() < startDate.getTime()) {
                setStartDate(selectedDate);
                setEndDate(null);
            } else if (selectedDate.toDateString() === startDate.toDateString()) {
                setStartDate(null);
                setEndDate(null);
            } else {
                setEndDate(selectedDate);
            }
            return;
        }
        setStartDate(selectedDate);
        setEndDate(null);
    };

    // --- Handle month/year picker ---
    const handleDateChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') setShowDatePicker(false);

        if (selectedDate) {
            const newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
            setCurrentMonthYear(newDate);
        }
    };

    const openMonthYearPicker = () => {
        setCurrentPickerValue(currentMonthYear);
        setShowDatePicker(true);
    };

    const handleStartPlanning = () => {
        if (!destination || !startDate || !endDate) {
            Alert.alert("Missing Information", "Please fill in destination and select both a start date and an end date on the calendar.");
            return;
        }
        Alert.alert("Planning Started!", `Destination: ${destination}\nDates: ${formatDate(startDate)} - ${formatDate(endDate)}`);
        console.log('Starting trip planning with:', { destination, startDate, endDate });
    };

    const formatDate = (date: Date | null) => {
        return date ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';
    };

    // --- Date Picker Modal for iOS ---
    const DatePickerModal = () => (
        <Modal
            animationType="slide"
            transparent={true}
            visible={showDatePicker}
            onRequestClose={() => setShowDatePicker(false)}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>Select Month and Year</Text>
                    <DateTimePicker
                        value={currentPickerValue}
                        mode={'date'}
                        display={'spinner'}
                        onChange={(event, date) => {
                            if (date) setCurrentPickerValue(date);
                        }}
                    />
                    <Button
                        title="Done"
                        onPress={() => {
                            // Apply the selected date to currentMonthYear when "Done" is pressed
                            const newDate = new Date(currentPickerValue.getFullYear(), currentPickerValue.getMonth(), 1);
                            setCurrentMonthYear(newDate);
                            setShowDatePicker(false);
                        }}
                    />
                </View>
            </View>
        </Modal>
    );

    const displayCurrentMonth = currentMonthYear.toLocaleDateString('en-US', { month: 'long' });
    const displayCurrentYear = currentMonthYear.toLocaleDateString('en-US', { year: 'numeric' });

    return (
        <SafeAreaView style={styles.container}>
            {/* ScrollView for the main content */}
            <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
                
                {/* Header Photo */}
                <ImageBackground
                    source={HeaderImagePlaceholder}
                    style={styles.headerImage}
                    resizeMode="cover"
                >
                    <View style={styles.imageOverlay} />
                </ImageBackground>

                <Text style={styles.planTitle}>Plan your trip</Text>

                {/* Traveling To Input */}
                <View style={styles.inputRow}>
                    <Text style={styles.inputLabel}>Traveling to:</Text>
                    <TextInput
                        style={styles.textInputFull}
                        placeholder="Enter Destination"
                        placeholderTextColor={COLORS.DARK_TEXT}
                        value={destination}
                        onChangeText={setDestination}
                    />
                </View>

                {/* Month Selector and Calendar */}
                <View style={styles.calendarSection}>
                    <TouchableOpacity style={styles.monthSelector} onPress={openMonthYearPicker}>
                        <Text style={styles.monthSelectorText}>{`${displayCurrentMonth} ${displayCurrentYear}`}</Text>
                        <View>
                            <Text style={styles.selectionPrompt}>Start: {startDate ? formatDate(startDate) : 'Select start date'}</Text>
                            <Text style={styles.selectionPrompt}>End: {endDate ? formatDate(endDate) : 'Select end date'}</Text>
                        </View>
                    </TouchableOpacity>

                    <CalendarGrid
                        currentMonthYear={currentMonthYear}
                        startDate={startDate}
                        endDate={endDate}
                        onDayPress={handleDaySelection}
                    />
                </View>

                {/* Start Planning Button */}
                <TouchableOpacity style={styles.planningButton} onPress={handleStartPlanning}>
                    <Text style={styles.planningButtonText}>Start planning</Text>
                </TouchableOpacity>

            </ScrollView>

            {/* Date Picker Modals */}
            {showDatePicker && Platform.OS === 'ios' && <DatePickerModal />}
            {showDatePicker && Platform.OS === 'android' && (
                <DateTimePicker
                    value={currentPickerValue}
                    mode={'date'}
                    display="calendar"
                    onChange={handleDateChange}
                />
            )}

            {/* App Footer (fixed at the bottom) */}
            <AppFooter activeScreen="DashboardMyPlansScreen" navigation={navigation as any} />
        </SafeAreaView>
    );
};

export default DashboardMyPlansScreen;

// --- STYLES ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.LIGHT_BLUE_BACKGROUND,
        
    },
    // Style applied to the ScrollView content area
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 100, 
        alignItems: 'center',
    },
    headerImage: {
        width: screenWidth,
        height: 150,
        marginBottom: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: -20,
    },
    imageOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,34,61,0.2)',
    },
    planTitle: {
        fontSize: 22,
        fontFamily: 'Karma-Bold',
        color: COLORS.NAVY_BLUE,
        marginBottom: 15,
    },
    inputRow: {
        width: '100%',
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        color: COLORS.NAVY_BLUE,
        marginBottom: 5,
        fontFamily: 'Karma-SemiBold',
    },
    textInputFull: {
        width: '100%',
        height: 40,
        backgroundColor: COLORS.INPUT_FIELD,
        paddingHorizontal: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.BORDER_COLOR,
        color: COLORS.DARK_TEXT,
    },
    calendarSection: {
        width: '100%',
        marginBottom: 30, 
        alignItems: 'flex-start',
    },
    monthSelector: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        paddingVertical: 5,
        marginBottom: 12,
        width: '100%',
        justifyContent: 'space-between',
    },
    monthSelectorText: {
        fontSize: 18,
        fontFamily: 'Karma-Bold',
        color: COLORS.NAVY_TEXT,
        marginRight: 8,
    },
    selectionPrompt: {
        fontSize: 14,
        color: COLORS.NAVY_TEXT,
        fontWeight: '600',
        marginTop: 6,
    },
    planningButton: {
        width: '100%',
        backgroundColor: COLORS.NAVY_BLUE,
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 20, 
    },
    planningButtonText: {
        color: COLORS.WHITE,
        fontSize: 18,
        fontWeight: '700',
    },
    // Modal Styles
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 18,
        marginBottom: 15,
        fontFamily: 'Karma-Bold',
        color: COLORS.NAVY_BLUE,
    },
});

// --- CALENDAR GRID STYLES (Finalized) ---
const gridStyles = StyleSheet.create({
    calendarContainer: {
        width: '100%',
        backgroundColor: COLORS.WHITE,
        borderRadius: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: COLORS.BORDER_COLOR,
    },
    dayHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    dayHeaderWrapper: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dayHeaderText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.DARK_TEXT,
        paddingVertical: 5,
    },
    gridRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dateBoxWrapper: {
        width: `${100 / 7}%`,
        aspectRatio: 1,
        padding: 2,
    },

    dateBoxBase: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
    },

    dateBoxDefault: {
        backgroundColor: COLORS.CALENDAR_BLUE,
    },
    dateBoxSelected: {
        backgroundColor: COLORS.CALENDAR_HIGHLIGHT,
        borderWidth: 2,
        borderColor: COLORS.NAVY_TEXT,
    },
    dateBoxInRange: {
        backgroundColor: COLORS.CALENDAR_RANGE,
    },

    dateBoxText: {
        fontSize: 14,
        color: COLORS.NAVY_TEXT,
    },
    dateBoxTextSelected: {
        color: COLORS.WHITE,
        fontWeight: 'bold',
    },
});
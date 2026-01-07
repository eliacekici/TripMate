import { StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

export const COLORS = {
    NAVY_BLUE: '#00223D',
    LIGHT_BLUE_BACKGROUND: '#E0F2FE',
    INPUT_FIELD: '#C3E2F1',
    WHITE: '#FFFFFF',
    DARK_TEXT: '#000000',
    GRAY_TEXT: '#888888',
    BORDER_COLOR: '#0C1559',
    CALENDAR_BLUE: '#89CFF0',
    CALENDAR_HIGHLIGHT: '#00223D',
    CALENDAR_RANGE: '#C3E2F1',
    NAVY_TEXT: '#00223D',
};

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.LIGHT_BLUE_BACKGROUND,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
        alignItems: 'center',
    },
    headerImage: {
        width: screenWidth,
        height: 200,
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
        fontSize: 18,
        fontFamily: 'Karma-Bold',
        color: COLORS.NAVY_BLUE,
        marginBottom: 15,
    },
    inputRow: {
        width: '100%',
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 18,
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
    
    monthSelectorRow: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },

    monthSelector: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        paddingVertical: 5,
    },
    
    monthChangeButton: {
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
  
    monthChangeButtonText: {
        fontSize: 24,
        color: COLORS.NAVY_BLUE,
        fontWeight: 'bold',
    },
    monthSelectorText: {
        fontSize: 18,
        fontFamily: 'Karma-Bold',
        color: COLORS.NAVY_TEXT,
    },
    selectionPrompt: {
        fontSize: 14,
        color: COLORS.NAVY_TEXT,
        fontWeight: '600',
        marginTop: 6,
    },
    planningButtonWrapper: {
        width: '100%',
        alignItems: 'flex-end',
        marginBottom: 20,
    },
    planningButton: {
        width: 159,
        height: 44,
        backgroundColor: COLORS.NAVY_BLUE,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    planningButtonText: {
        color: COLORS.WHITE,
        fontSize: 16,
        fontFamily: 'Karma-Bold',
        fontWeight: '700',
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        elevation: 5,
    },
    modalTitle: {
        fontSize: 18,
        marginBottom: 15,
        fontFamily: 'Karma-Bold',
        color: COLORS.NAVY_BLUE,
    },
    errorText: {
        color: 'red',
        fontSize: 13,
        marginTop: 4,
    },
    validatingText: {
        color: COLORS.GRAY_TEXT,
        fontSize: 12,
        marginTop: 4,
    },
});

export const gridStyles = StyleSheet.create({
    calendarContainer: {
        width: '100%',
        backgroundColor: COLORS.LIGHT_BLUE_BACKGROUND,
        borderRadius: 10,
        padding: 10,
        marginBottom: 20, 
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
    },
    dayHeaderText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.NAVY_BLUE,
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
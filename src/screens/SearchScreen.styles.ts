import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    fullContainer: {
        flex: 1,
        backgroundColor: '#E0F2FE',
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 15,
        paddingTop: 15,
    },
    placeholder: {
        color: '#000000',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 20,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        backgroundColor: '#C3E2F1',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 6,
        marginBottom: 16,
    },
    input: {
        flex: 1,
        fontSize: 16,
        fontFamily: 'Karma-Bold',
        fontWeight: '700',
        marginRight: 8,
    },
    cancel: {
        color: '#00223D',
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 10,
    },
    suggestionsTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 10,
        color: '#00223D',
    },
    suggestionsContainer: {
        backgroundColor: 'transparent',
        borderRadius: 14,
        paddingHorizontal: 0,
        paddingVertical: 0,
        marginTop: 4,
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 8,
        borderBottomWidth: 0,
        borderBottomColor: 'transparent',
    },
    suggestionIcon: {
        width: 18,
        height: 18,
        marginRight: 10,
        tintColor: '#00223D',
    },
    suggestionText: {
        fontSize: 16,
        color: '#00223D',
    },
});

export default styles;

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
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#C3E2F1',
    },
    suggestionText: {
        fontSize: 16,
        color: '#00223D',
    },
});

export default styles;

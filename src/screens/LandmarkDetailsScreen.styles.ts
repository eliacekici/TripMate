import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E0F2FE',
    },
    mapContainer: {
        width: '100%',
        height: 250,
        backgroundColor: '#E0F2FE',
        borderRadius: 10,
    },
    map: {
        flex: 1,
    },
    detailsContent: {
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#00223D',
    },
    detailCard: {
        backgroundColor: '#C3E2F1',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        borderLeftWidth: 3,
        borderLeftColor: '#00223D',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#00223D',
    },
    value: {
        fontSize: 18,
        marginTop: 2,
        color: '#00223D',
    },
});

export default styles;

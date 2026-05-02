import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E0F2FE' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topImage: { width: '100%', height: 200 },
  headerContent: { paddingHorizontal: 16 },
  cityTitle: { fontSize: 24, fontWeight: '700', marginVertical: 16, color: '#00223D'},
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    backgroundColor: '#C3E2F1',
    borderRadius: 10,
    padding: 4,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  tabSelected: { backgroundColor: '#00223D', elevation: 3 },
  tabUnselected: { backgroundColor: 'transparent' },
  tabText: { fontSize: 16, fontWeight: '600' },
  tabTextSelected: { color: '#FFFFFF' },
  tabTextUnselected: { color: '#00223D' },
  placeItem: {
    padding: 16,
    backgroundColor: '#C3E2F1',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#00223D',
  },
  placeName: { fontSize: 18, fontWeight: '700' },
  placeKinds: { fontSize: 14, color: '#00223D', marginTop: 4 },
  placeAddress: { fontSize: 12, color: '#00223D', marginTop: 2 },
  emptyText: {
    textAlign: 'center',
    color: '#00223D',
    marginTop: 40,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default styles;

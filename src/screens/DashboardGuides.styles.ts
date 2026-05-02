import { StyleSheet, Dimensions } from 'react-native';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#E0F2FE',
  },
  topImage: {
    width: '100%',
    height: SCREEN_WIDTH * 0.48,
  },
  container: {
    flex: 1,
    backgroundColor: '#E0F2FE',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingHorizontal: SCREEN_WIDTH * 0.04,
    marginTop: -24,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C3E2F1',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 16,
    marginTop: 20, // Move search bar further down
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Karma-Bold',
    fontWeight: '700',
    marginRight: 8,
  },
  searchImage: {
    width: 19,
    height: 19,
    marginLeft: 8,
  },
  placeItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minWidth: 110, // Match increased city name width
    margin: 8,
    // Ensures equal spacing between items in the row and from row to row
  },
  placeImage: {
    width: 70,
    height: 70,
    marginBottom: 8,
    borderRadius: 35, // Make image fully round
    resizeMode: 'cover',
  },
    cityListContent: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 0,
    },
  placeName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00223D',
    width: 110, // Increased width to fit 'Amsterdam'
    textAlign: 'center',
    alignSelf: 'center',
  },
  // Tab styles
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    backgroundColor: '#C3E2F1',
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabSelected: {
    backgroundColor: '#00223D',
    elevation: 3,
  },
  tabUnselected: {
    backgroundColor: 'transparent',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  tabTextSelected: {
    color: '#FFFFFF',
  },
  tabTextUnselected: {
    color: '#00223D',
  },
  emptyText: {
    textAlign: 'center',
    color: '#00223D',
    marginTop: 40,
    fontSize: 16,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    paddingHorizontal: 16,
  },
  cityTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginVertical: 16,
    color: '#00223D',
  },
});

export default styles;

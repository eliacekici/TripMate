import { StyleSheet, Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0F2FE',
  },
  topImage: {
    width: width,
    height: height * 0.3,
  },
  destinationHeader: {
    padding: 15,
    backgroundColor: '#E0F2FE',
    marginBottom: 10,
  },
  destinationText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'Labrada-Bold',
    textAlign: 'center',
  },
  emptySpace: {
    flex: 1,
    paddingHorizontal: 14,
  },
  savedHotelsContainer: {
    paddingBottom: 170,
  },
  savedHotelsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00223D',
    marginBottom: 10,
    fontFamily: 'Labrada-Bold',
  },
  savedHotelsEmpty: {
    fontSize: 13,
    color: '#34556b',
    marginBottom: 10,
  },
  savedHotelCard: {
    backgroundColor: '#C3E2F1',
    borderColor: '#00223D',
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  savedHotelName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00223D',
    marginBottom: 6,
  },
  savedHotelDate: {
    fontSize: 13,
    color: '#243746',
    marginBottom: 2,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 120,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  plusButton: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusIcon: {
    width: 48,
    height: 42,
  },
  tooltip: {
    backgroundColor: '#00223D',
    borderRadius: 8,
    padding: 8,
    marginRight: 10,
  },
  tooltipText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  categoryFooterOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 90,
    backgroundColor: '#E0F2FE',
    borderRadius: 16,
    marginHorizontal: 8,
    paddingVertical: 12,
    paddingHorizontal: 2,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    elevation: 8,
  },
  categoryIconContainer: {
    flex: 1,
    alignItems: 'center',
    minWidth: 56,
    maxWidth: 72,
    marginRight: 6,
  },
  categoryIconImage: {
    width: 38,
    height: 38,
    marginBottom: 4,
  },
  categoryIconLabel: {
    fontSize: 11,
    color: '#00223D',
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.1,
    flexShrink: 1,
    maxWidth: 100,
    includeFontPadding: false,
  },
});

export default styles;

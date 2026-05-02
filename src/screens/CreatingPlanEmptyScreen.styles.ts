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
});

export default styles;

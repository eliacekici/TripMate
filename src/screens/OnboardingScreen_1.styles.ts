import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#E0F2FE',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 36,
    fontFamily: 'Karma-Bold',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    color: '#000000',
  },
  subtitle: {
    fontSize: 20,
    fontFamily: 'Karma-Regular',
    textAlign: 'center',
    marginBottom: 24,
    color: '#000000',
  },
  image: {
    width: 393,
    height: 356,
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#00223D',
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default styles;

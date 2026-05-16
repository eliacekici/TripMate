import { StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
// Original aspect ratio: 303 × 418 (tall portrait image)
// Cap height at 45% of screen height so it never overflows on small screens
const IMAGE_HEIGHT = Math.round(Math.min(SCREEN_HEIGHT * 0.45, 418));
const IMAGE_WIDTH = Math.round(IMAGE_HEIGHT * (303 / 418));

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#E0F2FE' },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    color: '#000000',
    marginBottom: 24,
  },
  image: {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#00223D',
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default styles;

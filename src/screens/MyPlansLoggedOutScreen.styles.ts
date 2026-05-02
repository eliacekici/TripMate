import { StyleSheet, Dimensions, Platform } from 'react-native';
const { height: screenHeight } = Dimensions.get('window');

const COLORS = {
  NAVY_BLUE: '#00223D',
  LIGHT_BLUE_BACKGROUND: '#E0F2FE',
  DARK_TEXT: '#000000',
  GRAY_TEXT: '#000000',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.LIGHT_BLUE_BACKGROUND,
  },
  headerImage: {
    width: '100%',
    height: screenHeight * 0.30,
    resizeMode: 'cover',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 60,
    paddingBottom: Platform.OS === 'ios' ? 120 : 90,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.DARK_TEXT,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.GRAY_TEXT,
    marginBottom: 40,
    textAlign: 'center',
    paddingBottom: 20,
  },
  loginButton: {
    backgroundColor: COLORS.NAVY_BLUE,
    borderRadius: 10,
    paddingHorizontal: 36,
    paddingVertical: 14,
    marginBottom: 16,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  signupText: {
    fontSize: 14,
    color: COLORS.DARK_TEXT,
    marginTop: 16,
  },
  signupLink: {
    fontSize: 16,
    color: COLORS.NAVY_BLUE,
    fontWeight: 'bold',
    marginTop: 4,
    textDecorationLine: 'underline',
  },
});

export default styles;

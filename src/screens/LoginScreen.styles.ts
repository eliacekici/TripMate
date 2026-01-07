import { StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

export const COLORS = {
  NAVY_BLUE: '#00223D',
  LIGHT_BLUE_BACKGROUND: '#E0F2FE',
  INPUT_FIELD: '#C3E2F1',
  WHITE: '#FFFFFF',
  DARK_TEXT: '#000000',
  GRAY_TEXT: '#888888',
  BORDER_COLOR: '#0C1559',
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.LIGHT_BLUE_BACKGROUND,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 20,
    alignItems: 'center',
  },

  tabContainer: {
    flexDirection: 'row',
    width: screenWidth - 60,
    height: 40,
    marginBottom: 30,
  },
  activeTab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 3,
    borderColor: COLORS.NAVY_BLUE,
  },
  activeTabText: {
    fontSize: 18,
    fontFamily: 'Karma-Bold',
    color: COLORS.NAVY_BLUE,
  },
  inactiveTab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: COLORS.GRAY_TEXT,
  },
  inactiveTabText: {
    fontSize: 16,
    fontFamily: 'Karma-Regular',
    color: COLORS.GRAY_TEXT,
  },

  welcomeTitle: {
    fontSize: 20,
    fontFamily: 'Karma-Bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
  },

  inputContainer: {
    width: '100%',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    height: 45,
    backgroundColor: COLORS.INPUT_FIELD,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.BORDER_COLOR,
    marginBottom: 15,
  },

  errorTextContainer: {
    marginBottom: 10,
    alignItems: 'flex-start', 
    width: '100%',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
  },
  signUpLinkText: {
    color: COLORS.NAVY_BLUE,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },

  loginButton: {
    width: '100%',
    backgroundColor: COLORS.NAVY_BLUE,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
  },
  loginButtonText: {
    color: COLORS.WHITE,
    fontSize: 18,
    fontWeight: '700',
  },

  loginLinkContainer: {
    flexDirection: 'row',
  },
  loginText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    color: COLORS.NAVY_BLUE,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

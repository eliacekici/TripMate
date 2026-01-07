// SignUpScreen.styles.ts
import { StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

export const COLORS = {
  NAVY_BLUE: '#00223D', 
  LIGHT_BLUE_BACKGROUND: '#E0F2FE', 
  INPUT_FIELD: '#C3E2F1', 
  DARK_TEXT: '#000000',
  GRAY_TEXT: '#888888',
  RED: '#E74C3C', 
  GREEN: '#2ECC71', 
  WHITE: '#FFFFFF',
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
    backgroundColor: COLORS.LIGHT_BLUE_BACKGROUND,
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
    backgroundColor: COLORS.LIGHT_BLUE_BACKGROUND,
  },
  inactiveTabText: {
    fontSize: 16,
    fontFamily: 'Karma-Regular',
    color: COLORS.GRAY_TEXT,
  },
  introText: {
    width: '100%',
    fontSize: 16,
    fontFamily: 'Karma-SemiBold',
    color: COLORS.DARK_TEXT,
    marginBottom: 40,
    textAlign: 'left',
  },
  input: {
    width: '100%',
    height: 45, 
    backgroundColor: COLORS.INPUT_FIELD,
    paddingHorizontal: 15,
    borderRadius: 8,
    fontSize: 16,
    color: COLORS.DARK_TEXT,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.BORDER_COLOR,
  },
  conditionsArea: {
    width: '100%',
    alignItems: 'flex-start',
    marginBottom: 30,
  },
  conditionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  conditionText: {
    fontSize: 14,
    color: COLORS.DARK_TEXT,
  },
  conditionIconImage: {
    width: 16, 
    height: 16,
    marginRight: 10,
  },
  checkboxRow: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    marginBottom: 50,
  },
  checkboxImage: { 
    width: 20, 
    height: 20,
    marginRight: 10,
  },
  privacyText: {
    fontSize: 14,
    color: COLORS.DARK_TEXT,
  },
  signUpButton: {
    width: '100%',
    backgroundColor: COLORS.NAVY_BLUE,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
  },
  signUpButtonText: {
    color: COLORS.WHITE,
    fontSize: 18,
    fontWeight: '700',
  },
  loginLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  loginText: {
    fontSize: 14,
    color: COLORS.DARK_TEXT,
  },
  loginLink: {
    fontSize: 14,
    color: COLORS.NAVY_BLUE,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

import AsyncStorage from '@react-native-async-storage/async-storage';

export const getStoredAuth = async () => {
  const token = await AsyncStorage.getItem('token');
  const userId = await AsyncStorage.getItem('userId');
  return { token, userId };
};

export const clearAuth = async () => {
  await AsyncStorage.removeItem('token');
  await AsyncStorage.removeItem('userId');
};

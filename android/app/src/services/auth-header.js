import AsyncStorage from '@react-native-async-storage/async-storage';

export default async function authHeader() {
  const userData = await AsyncStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;

  if (user && user.accessToken) {
    return { 'x-access-token': user.accessToken };
  } else {
    return {};
  }
}

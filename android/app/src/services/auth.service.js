import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = "https://tfgbackend-production-9065.up.railway.app/api/auth/";

class AuthService {
  async login(username, password) {
    const response = await axios.post(API_URL + "signin", {
      username,
      password,
    });

    if (response.data.accessToken) {
      await AsyncStorage.setItem("user", JSON.stringify(response.data));
    }

    return response.data;
  }

  async logout() {
    await AsyncStorage.removeItem("user");p
  }

  async register(name, surname, surname2, username, birthday, email, password, number, dni) {
    return axios.post(API_URL + "signup", {
      name,
      surname,
      surname2,
      username,
      birthday,
      email,
      password,
      number,
      dni,
    });
  }

  async getCurrentUser() {
    const user = await AsyncStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }
}

export default new AuthService();

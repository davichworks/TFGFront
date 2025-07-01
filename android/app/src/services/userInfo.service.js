// services/user.service.js
import axios from "axios";
import authHeader from "./auth-header";

const API_URL = "https://tfgbackend-production-9065.up.railway.app/api/";

class UserInfoService { 
  async getUserInfo() {
    const headers = await authHeader(); // authHeader es async
    return axios.get(API_URL + "getUserInfo", { headers });
  }

  async getUserHistory() {
    const headers = await authHeader();
    return axios.get(API_URL + 'getUserHistory', { headers });
  }

 

  async createUserInfo(gender, age, peso, altura, cadera, cintura, lvl) {
    const headers = await authHeader();
    return axios.post(
      API_URL + 'createUserInfo',
      { gender, age, peso, altura, cadera, cintura, lvl },
      { headers }
    );
}
}

export default new UserInfoService();

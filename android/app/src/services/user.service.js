// services/user.service.js
import axios from "axios";
import authHeader from "./auth-header";

const API_URL = "https://tfgbackend-production-9065.up.railway.app/api/";

class UserService {
  async getPublicContent() {
    const headers = await authHeader(); // authHeader es async
    return axios.get(API_URL + "all", { headers });
  }

  async getTrainers() {
    const headers = await authHeader();
    return axios.get(API_URL + 'alltrainers', { headers });
  }

  async changePassword(oldPassword, confirmOldPassword, newPassword) {
    const headers = await authHeader();
    return axios.post(
      API_URL + 'changePassword',
      { oldPassword, confirmOldPassword, newPassword },
      { headers }
    );
  }

  async updateUser(id, name, username, birthday, email, number, dni) {
    const headers = await authHeader();
      
    return axios.put(
      API_URL + `updateUser/${id}`,
      { name, username, birthday, email, number, dni },
      { headers }
    );
}
}

export default new UserService();

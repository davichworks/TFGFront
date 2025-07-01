import axios from "axios";
import authHeader from "./auth-header";

const API_URL = "https://tfgbackend-production-9065.up.railway.app/api/";

class AdminService {

    async updateUser(id, name, username, birthday, email, number, dni) {
    const headers = await authHeader();
    return axios.put(
      API_URL + `updateUser/${id}`,
      { name, username, birthday, email, number, dni },
      { headers }
    );
}


  async getAdminBoard() {
    const headers= await authHeader();

    return axios.get(API_URL + "admin", { headers });
  }

  async deleteUser(id) {
     const headers= await authHeader();
     return axios.delete(API_URL + "deleteUsuario", {
      headers,
      data: { id },
    });
  }

  async blockUser(id) {
     const headers= await authHeader();
    return axios.post(API_URL + "blockEmail", { id }, { headers });
  }

  async createTrainer(id) {
     const headers= await authHeader();
    return axios.post(API_URL + "createTrainer", { id }, { headers });
  }
}

export default new AdminService();

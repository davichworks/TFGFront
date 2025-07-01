// services/user.service.js
import axios from "axios";
import authHeader from "./auth-header";

const API_URL = "https://tfgbackend-production-9065.up.railway.app/api/";

class SpaceService {


  async createSpace(name,capacity,location,schedules) {
    const headers = await authHeader(); // authHeader es async
    return axios.post(API_URL + "createSpace",{name,capacity,location,schedules}, { headers });
  }

  async getSpaces() {
    const headers = await authHeader();
    return axios.get(API_URL + 'getSpaces', { headers });
  }

  async deleteSpace(id) {
    const headers = await authHeader();
    return axios.delete(
      API_URL + `deleteSpace/${id}`,
      { headers }
    );
  }

  async updateSpace(id, name,capacity,location,schedules) {
    const headers = await authHeader();
    return axios.put(
      API_URL + `updateSpace/${id}`,
      { name,capacity,location,schedules },
      { headers }
    );
}
}

export default new SpaceService();

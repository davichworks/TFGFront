// services/user.service.js
import axios from "axios";
import authHeader from "./auth-header";

const API_URL = "https://tfgbackend-production-9065.up.railway.app/api/";

class ActivityService {


  async createActivity(classname, location, description, capacity, monitor, schedules) {
    const headers = await authHeader(); // authHeader es async
    return axios.post(API_URL + "createActivity",{classname, location, description, capacity, monitor, schedules}, { headers });
  }

  async getActivities() {
    const headers = await authHeader();
    return axios.get(API_URL + 'getActivities', { headers });
  }

  async deleteActivity(id) {
    const headers = await authHeader();
    return axios.delete(
      API_URL + `deleteActivity/${id}`,
      { headers }
    );
  }

  async updateActivity(id, classname, location, description, capacity, monitor, schedules) {
    const headers = await authHeader();
    return axios.put(
      API_URL + `updateActivity/${id}`,
      { classname, location, description, capacity, monitor, schedules },
      { headers }
    );
}
}

export default new ActivityService();

// services/user.service.js
import axios from "axios";
import authHeader from "./auth-header";

const API_URL = "https://tfgbackend-production-9065.up.railway.app/api/";

class ReservationService {


  async createReservation(reservableType, reservableId, specificDate, startTime, endTime) {
    const headers = await authHeader(); // authHeader es async
    return axios.post(API_URL + "createReservation",{reservableType, reservableId, specificDate,startTime,endTime}, { headers });
  }

  async getReservations() {
    const headers = await authHeader();
    return axios.get(API_URL + 'getReservations', { headers });
  }

  async getReservation() {
    console.log("HOLLAAA");
    const headers = await authHeader();
    return axios.get(API_URL + "getReservation", { headers });
  }

  async deleteReservation(id) {
    const headers = await authHeader();
    return axios.delete(
      API_URL + `deleteReservation/${id}`,
      { headers }
    );
  }

  async updateReservation(id, reservableType, reservableId, specificDate, startTime, endTime) {
    const headers = await authHeader();
    return axios.put(
      API_URL + `updateReservation/${id}`,
      {reservableType, reservableId, specificDate, startTime, endTime},
      { headers }
    );
}
}

export default new ReservationService();

// services/user.service.js
import axios from "axios";
import authHeader from "./auth-header";

const API_URL = "https://tfgbackend-production-9065.up.railway.app/api/";

class RoutineService {

// HEALTH ROUTINES

  async createHealthRoutine(data) {
    const headers = await authHeader(); // authHeader es async
    return axios.post(API_URL + "createHealthRoutine", data , { headers });
  }

  async getRecommendedRoutines(params) {
    const headers = await authHeader();
    return axios.get(API_URL + 'getRecommendedRoutines',params, { headers });
  }

  async getHealthRoutines() {
    const headers = await authHeader();
    return axios.get(API_URL + 'getHealthRoutines', { headers });
  }
  async updateHealthRoutine(id,data) {
    const headers = await authHeader();
    return axios.delete(
      API_URL + `updateHealthRoutine/${id}`,
      data,
      { headers }
    );
  }

  //DIET PLANS 

  async createDietPlan(data) {
    const headers = await authHeader(); // authHeader es async
    return axios.post(API_URL + "createDietPlan", data , { headers });
  }

  async getDietPlans() {
    const headers = await authHeader();
    return axios.get(API_URL + 'getDietPlans', { headers });
  }

  async getDietPlan(id) {
    const headers = await authHeader();
    return axios.delete(
      API_URL + `getDietPlan/${id}`,
      { headers }
    );
  }
  async updateDietPlan(id, data) {
    const headers = await authHeader();
    return axios.put(
      API_URL + `updateDietPlan/${id}`,
      data,
      { headers }
    );
  }
  async deleteDietPlan(id) {
    const headers = await authHeader();
    return axios.delete(
      API_URL + `deleteDietPlan/${id}`,
      { headers }
    );
  }
  
  // EXERCISE PLANS

    async createExercisePlan(data) {
        const headers = await authHeader(); // authHeader es async
        return axios.post(API_URL + "createExercisePlan", data , { headers });
    }
    async getExercisePlans() {
        const headers = await authHeader();
        return axios.get(API_URL + 'getExercisePlans', { headers });
    }
    async getExercisePlan(id) {
        const headers = await authHeader();
        return axios.get(
            API_URL + `getExercisePlan/${id}`,
            { headers }
        );
    }
    async updateExercisePlan(id, data) {
        const headers = await authHeader();
        return axios.put(
            API_URL + `updateExercisePlan/${id}`,
            data,
            { headers }
        );
    }
    async deleteExercisePlan(id) {
        const headers = await authHeader();
        return axios.delete(
            API_URL + `deleteExercisePlan/${id}`,
            { headers }
        );
    }
}


export default new RoutineService();

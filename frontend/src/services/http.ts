import axios from "axios";

import { API_BASE_URL } from "@/utils/constants";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!navigator.onLine) {
      return Promise.reject(new Error("Perangkat offline"));
    }
    return Promise.reject(error);
  }
);

export default apiClient;

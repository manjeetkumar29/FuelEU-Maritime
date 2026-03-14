import axios from "axios";
import { FUEL_EU } from "../../../shared/constants/fueleu";

export const apiClient = axios.create({
  baseURL: FUEL_EU.API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10_000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ??
      error.message ??
      "An unexpected error occurred";
    return Promise.reject(new Error(message));
  },
);

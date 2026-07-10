import axios from "axios";

/**
 * Pre-configured Axios instance.
 * Base URL is set via the `EXPO_PUBLIC_API_URL` environment variable.
 */
const axiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

export default axiosInstance;

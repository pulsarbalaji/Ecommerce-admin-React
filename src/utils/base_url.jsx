
import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add interceptor to include token
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

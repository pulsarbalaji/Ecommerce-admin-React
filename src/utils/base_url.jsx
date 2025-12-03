import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/`,
  headers: {
    "Content-Type": "application/json",
  },
});

// -----------------------------------------------
// 🔐 REQUEST INTERCEPTOR (Attach JWT Token)
// -----------------------------------------------
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("access");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// -----------------------------------------------
// 🚨 RESPONSE INTERCEPTOR (Auto-Logout on Expired Token)
// -----------------------------------------------
api.interceptors.response.use(
  (response) => response,

  (error) => {
    const status = error?.response?.status;

    // Detect token expiration or invalid token
    if (status === 401 || status === 403) {
      console.warn("JWT expired or invalid → Auto logout triggered");

      // 🔥 Show toast only once
      toast.dismiss();
      toast.error("Session expired. Please log in again.");

      // 🔥 Clear session
      sessionStorage.clear();

      // 🔥 Redirect user to login
      setTimeout(() => {
        window.location.href = "/";
      }, 800); // slight delay so toast shows before redirect
    }

    return Promise.reject(error);
  }
);

export default api;

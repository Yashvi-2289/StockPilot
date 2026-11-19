
import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV
    ? "http://localhost:5000/api"
    : "https://stockpilot-backend-l6ns.onrender.com/api");

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json"
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("stockpilotToken");
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url;
    const isSignInRequest = url === "/auth/login" || url === "/auth/register";

    if (error.response?.status === 401 && !isSignInRequest) {
      localStorage.removeItem("stockpilotToken");
      window.dispatchEvent(new Event("stockpilot:unauthorized"));
    }
    return Promise.reject(error);
  }
);

export default api;

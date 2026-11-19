
import axios from "axios";

const api = axios.create({
  baseURL: "https://stockpilot-backend-l6ns.onrender.com/api",
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
    if (error.response?.status === 401) {
      localStorage.removeItem("stockpilotToken");
      window.dispatchEvent(new Event("stockpilot:unauthorized"));
    }
    return Promise.reject(error);
  }
);

export default api;

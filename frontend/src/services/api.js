
import axios from "axios";

const api = axios.create({
  baseURL: "https://stockpilot-backend-l6ns.onrender.com/api",
  headers: {
    "Content-Type": "application/json"
  },
});

export default api;

import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // defined in .env
  withCredentials: true,
});

export default api;

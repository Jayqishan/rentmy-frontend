import axios from "axios";

const BACKEND_URL = "https://blog-backend-nu-indol.vercel.app";

const api = axios.create({
  baseURL: import.meta.env.DEV ? "/api" : `${BACKEND_URL}/api`
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("rmo_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(err)
);

export default api;

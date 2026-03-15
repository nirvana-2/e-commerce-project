import axios from "axios";
import { API_BASE } from "./config";

const API_URL = `${API_BASE}/api/auth`;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});

export const registerUser = async (userName, email, password, role) => {
  const response = await api.post("/register", {
    name: userName,
    email,
    password,
    role
  });
  return response.data;
};

export const loginUser = async (email, password) => {
  const response = await api.post("/login", {
    email,
    password
  });
  return response.data;
};

export const getAllUsers = async (token) => {
  const response = await api.get("/admin/users", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

import axios from "axios";

import { API_BASE } from "./config";
const API_URL = `${API_BASE}/api/auth`;

// Create an instance so you don't have to repeat config
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Crucial for CORS with credentials
  headers: {
    "Content-Type": "application/json"
  }
});

// Register user
export const registerUser = async (userName, email, password, role) => {
  const response = await api.post("/auth/register", {
    name: userName,
    email,
    password,
    role
  });
  return response.data;
};

// Login user
export const loginUser = async (email, password) => {
  const response = await api.post("/auth/login", {
    email,
    password
  });
  return response.data;
};

// Get all users (admin only)
export const getAllUsers = async (token) => {
  const response = await api.get("/admin/users", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
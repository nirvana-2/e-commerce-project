import axios from "axios";

const API_URL = "http://localhost:3000/api/products";

export const getProducts = async (page = 1, limit = 8) => {
  const res = await axios.get(`${API_URL}?page=${page}&limit=${limit}`);
  return res.data;
};

export const addProduct = async (product) => {
  const token = localStorage.getItem("token");

  const res = await axios.post(API_URL, product, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

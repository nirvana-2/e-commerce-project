import axios from "axios";

const API_URL = "http://localhost:3000/api/cart";

// GET: Fetches the user's cart (Hits http://localhost:3000/api/cart/)
export const getCart = async () => {
  const token = localStorage.getItem("token");
  const res = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// POST: Adds an item (Hits http://localhost:3000/api/cart/add)
export const addToCart = async (productId, quantity = 1) => {
  const token = localStorage.getItem("token");
  // Added '/add' to match backend router.post('/add', ...)
  const res = await axios.post(`${API_URL}/add`, { productId, quantity }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// POST: Removes an item (Hits http://localhost:3000/api/cart/remove)
export const removeFromCart = async (productId) => {
  const token = localStorage.getItem("token");
  // Changed to POST and added '/remove' to match backend router.post('/remove', ...)
  const res = await axios.post(`${API_URL}/remove`, { productId }, { 
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
import axios from "axios";

// Ensure this matches your backend URL
const API_URL = "http://localhost:3000/api/orders";

/**
 * Place a new order
 * @param {Object} orderData - Includes userId, items, totalAmount, address, fullName, phoneNumber, paymentMethod, and usePoints
 */
export const placeOrder = async (orderData) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(API_URL, orderData, {
        headers: { 
            Authorization: `Bearer ${token}` 
        }
    });
    return response.data;
};

/**
 * Fetch orders for the logged-in user
 */
export const getMyOrders = async () => {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/my-orders`, {
        headers: { 
            Authorization: `Bearer ${token}` 
        },
    });
    // Ensure we return the data directly
    return response.data;
};

/**
 * Update Order Status (Admin Only)
 */
export const updateOrderStatusApi = async (id, status) => {
    const token = localStorage.getItem("token");
    // Added the full API_URL and /admin path to match your controller
    const response = await axios.put(`${API_URL}/admin/status/${id}`, 
        { status },
        {
            headers: { 
                Authorization: `Bearer ${token}` 
            }
        }
    );
    return response.data;
};

/**
 * Fetch a single order by ID (Useful for specific tracking/invoice pages)
 */
export const getOrderById = async (orderId) => {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/${orderId}`, {
        headers: { 
            Authorization: `Bearer ${token}` 
        },
    });
    return response.data;
};
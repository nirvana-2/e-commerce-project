import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminCart() {
  const [carts, setCarts] = useState([]); // Layer 1: Always start with an array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCarts = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:3000/api/cart/all", {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Layer 2: Only set state if the data is actually an array
        if (response.data && Array.isArray(response.data)) {
          setCarts(response.data);
        } else {
          console.error("Expected array but got:", response.data);
          setCarts([]); 
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to fetch carts. Check if you are logged in as Admin.");
      } finally {
        setLoading(false);
      }
    };
    fetchCarts();
  }, []);

  if (loading) return <div className="p-4 text-center">Loading carts...</div>;
  if (error) return <div className="p-4 text-red-500 bg-red-50 rounded">{error}</div>;

  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-bold mb-4 border-b pb-2">Admin: All User Carts</h2>
      
      {/* Layer 3: Defensive check using Array.isArray */}
      {Array.isArray(carts) && carts.length > 0 ? (
        carts.map((cart) => (
          <div key={cart._id} className="mb-6 p-4 border rounded-md bg-gray-50">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-indigo-600">
                User: {cart.user?.name || "Unknown/Deleted User"}
              </span>
              <span className="text-xs text-gray-400">ID: {cart._id}</span>
            </div>
            
            <ul className="space-y-1">
              {cart.products?.map((item, index) => (
                <li key={item.product?._id || index} className="text-sm text-gray-700 list-disc ml-5">
                  <span className="font-medium">{item.product?.name || "Missing Product"}</span> 
                  — ${item.product?.price || 0} x {item.quantity}
                </li>
              ))}
            </ul>
          </div>
        ))
      ) : (
        <div className="py-10 text-center text-gray-500 italic">
          No active carts found in the database.
        </div>
      )}
    </div>
  );
}
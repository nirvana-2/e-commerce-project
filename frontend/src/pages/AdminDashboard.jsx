import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // ✅ Added for navigation fix
import AdminSidebar from './AdminSidebar';
import StatsCards from './StatsCards';
import OrdersTable from './OrdersTable';
import ImageUpload from '../components/ImageUpload';

const AdminDashboard = () => {
  const navigate = useNavigate(); // ✅ Initialized navigate hook

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [currentView, setCurrentView] = useState('inventory');
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ price: '', stock: '' });

  const [formData, setFormData] = useState({
    name: '', price: '', stock: '', description: '',
    category: '', subCategory: '', image: ''
  });

  // ✅ FIXED: Security Check to prevent back-arrow history loops
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!token || user.role !== 'admin') {
      // replace: true removes the admin path from history so 'Back' works correctly
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const subCategoryMap = {
    clothing: ["shirt", "pants", "hoodies"],
    electronics: ["mobile", "laptop", "accessories"],
    gaming: ["console", "pc components", "games"],
    home: ["kitchen", "furniture", "decor"],
    beauty: ["skincare", "makeup"],
    sports: ["equipment", "shoes"]
  };

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      const [productRes, orderRes, statsRes] = await Promise.all([
        axios.get(`http://localhost:3000/api/products?page=${page}`, { headers }),
        axios.get("http://localhost:3000/api/admin/orders", { headers }),
        axios.get("http://localhost:3000/api/admin/stats", { headers })
      ]);

      setProducts(productRes.data.products || []);
      setTotalPages(productRes.data.totalPages || 1);
      setOrders(orderRes.data || []);

      // ✅ Log this to your console to see exactly what the backend is sending
      console.log("Stats from Backend:", statsRes.data);

      setStats(statsRes.data || null);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // handleStatusUpdate, handleUpdateProduct, and handleSubmit remain as you wrote them...
  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `http://localhost:3000/api/orders/admin/status/${orderId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order._id === orderId ? { ...order, status: newStatus } : order
          )
        );
        const statsRes = await axios.get("http://localhost:3000/api/admin/stats", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(statsRes.data);
      }
    } catch (error) {
      console.error("Status Update Error:", error);
    }
  };

  const handleUpdateProduct = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`http://localhost:3000/api/products/${id}`, editData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setEditingId(null);
        fetchData();
      }
    } catch (error) {
      console.error("Update Error:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:3000/api/products", formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Product Created!");
      setFormData({ name: '', price: '', stock: '', description: '', category: '', subCategory: '', image: '' });
      setCurrentView('inventory');
      fetchData();
    } catch (error) {
      console.error("Submit Error:", error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden fixed inset-0 z-[9999]">
      <AdminSidebar setView={setCurrentView} currentView={currentView} />

      <main className="flex-1 h-full overflow-y-auto">
        <header className="bg-white border-b border-gray-200 px-8 py-5 sticky top-0 z-10 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            {currentView === 'inventory' ? 'Inventory Management' :
              currentView === 'add-product' ? 'Product Management' :
                currentView === 'orders' ? 'Orders Management' : 'Stats Overview'}
          </h1>
          {currentView === 'inventory' && (
            <span className="bg-teal-50 text-teal-600 px-4 py-1.5 rounded-full text-xs font-black">
              Page {page} of {totalPages}
            </span>
          )}
        </header>

        <div className="p-8">
          {currentView === 'add-product' && (
            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 max-w-4xl mx-auto">
              <h3 className="text-lg font-bold mb-6">Add New Product</h3>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
                <input type="text" placeholder="Product Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="col-span-2 p-3 border rounded-xl" required />
                <textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="col-span-2 p-3 border rounded-xl h-24" required />
                <input type="number" placeholder="Price" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="p-3 border rounded-xl" required />
                <input type="number" placeholder="Stock" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} className="p-3 border rounded-xl" required />
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value, subCategory: '' })} className="p-3 border rounded-xl bg-white" required>
                  <option value="">Select Category</option>
                  {Object.keys(subCategoryMap).map(cat => <option key={cat} value={cat}>{cat.toUpperCase()}</option>)}
                </select>
                <select value={formData.subCategory} onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })} disabled={!formData.category} className="p-3 border rounded-xl bg-white">
                  <option value="">Select Sub-Category</option>
                  {formData.category && subCategoryMap[formData.category].map(sub => <option key={sub} value={sub}>{sub}</option>)}
                </select>
                <div className="col-span-2"><ImageUpload onUploadSuccess={(url) => setFormData({ ...formData, image: url })} /></div>
                <button type="submit" className="col-span-2 bg-teal-600 text-white py-4 rounded-xl font-bold">Create Product</button>
              </form>
            </section>
          )}

          {currentView === 'inventory' && (
            <div className="space-y-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((item) => (
                  <div key={item._id} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden group">
                    <div className="h-40 bg-gray-50 relative overflow-hidden">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="p-5">
                      <h4 className="font-bold text-gray-800 truncate mb-2">{item.name}</h4>
                      {editingId === item._id ? (
                        <div className="space-y-3">
                          <input type="number" value={editData.price} onChange={(e) => setEditData({ ...editData, price: e.target.value })} className="w-full p-1 border rounded text-sm" />
                          <input type="number" value={editData.stock} onChange={(e) => setEditData({ ...editData, stock: e.target.value })} className="w-full p-1 border rounded text-sm" />
                          <div className="flex gap-2">
                            <button onClick={() => handleUpdateProduct(item._id)} className="flex-1 bg-teal-600 text-white text-[10px] font-black py-2 rounded-lg">SAVE</button>
                            <button onClick={() => setEditingId(null)} className="flex-1 bg-gray-100 text-gray-400 text-[10px] font-black py-2 rounded-lg">CANCEL</button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-teal-600 font-black text-lg">Rs. {item.price?.toLocaleString()}</span>
                            <span className={`text-[10px] font-black px-2 py-1 rounded-md ${item.stock > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                              QTY: {item.stock}
                            </span>
                          </div>
                          <button onClick={() => { setEditingId(item._id); setEditData({ price: item.price, stock: item.stock }) }} className="w-full border border-teal-600 text-teal-600 text-[10px] font-black py-2.5 rounded-xl hover:bg-teal-600 hover:text-white">
                            EDIT PRICE & STOCK
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center items-center gap-4 mt-10 pb-20">
                <button disabled={page === 1} onClick={() => setPage(prev => prev - 1)} className="px-4 py-2 bg-white border-2 border-teal-600 text-teal-600 rounded-xl font-bold disabled:opacity-30">Prev</button>
                <button disabled={page === totalPages} onClick={() => setPage(prev => prev + 1)} className="px-4 py-2 bg-white border-2 border-teal-600 text-teal-600 rounded-xl font-bold disabled:opacity-30">Next</button>
              </div>
            </div>
          )}

          {currentView === 'stats' && stats && <StatsCards stats={stats} />}

          {currentView === 'orders' && (
            <OrdersTable
              orders={orders}
              onUpdateStatus={handleStatusUpdate}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
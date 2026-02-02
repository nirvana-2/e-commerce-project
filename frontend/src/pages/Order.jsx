import React, { useEffect, useState } from "react";
import { getMyOrders, updateOrderStatusApi } from "../api/order";
import axios from "axios";
import { toast } from 'react-toastify';

// 1. Invoice Template
const InvoiceTemplate = ({ order }) => (
  <div id={`invoice-${order._id}`} className="hidden p-12 bg-white text-black font-sans print:block">
    <div className="flex justify-between border-b-2 border-slate-900 pb-8">
      <div>
        <h1 className="text-4xl font-black text-teal-600 tracking-tighter">MyShop</h1>
        <p className="text-sm uppercase tracking-widest text-slate-500 mt-1">Official Invoice</p>
      </div>
      <div className="text-right">
        <h2 className="text-xl font-bold">Order #{order._id?.slice(-6).toUpperCase()}</h2>
        <p className="text-sm">{new Date(order.createdAt).toLocaleDateString('en-US', { dateStyle: 'long' })}</p>
      </div>
    </div>
    <div className="my-10">
      <h3 className="text-sm font-bold uppercase text-slate-400 mb-1">Deliver To:</h3>
      <p className="text-lg font-semibold">{order.fullName || "Valued Customer"}</p>
      <p className="text-md">{order.address || "No address provided"}</p>
      <p className="text-sm text-slate-500 mt-1">Payment Method: {order.paymentMethod}</p>
    </div>
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="border-b border-slate-200 text-slate-400 text-xs uppercase">
          <th className="py-4">Item Description</th>
          <th className="py-4 text-center">Qty</th>
          <th className="py-4 text-right">Price</th>
          <th className="py-4 text-right">Total</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {(order.items || order.products)?.map((item, idx) => (
          <tr key={idx} className="text-sm">
            <td className="py-4 font-medium">{item.product?.name || "Product Item"}</td>
            <td className="py-4 text-center">{item.quantity}</td>
            <td className="py-4 text-right">Rs. {item.product?.price?.toLocaleString()}</td>
            <td className="py-4 text-right font-bold">Rs. {(item.quantity * (item.product?.price || 0)).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
    <div className="mt-10 pt-6 border-t-2 border-slate-900 flex justify-end">
      <div className="text-right space-y-2">
        {order.discount > 0 && (
          <p className="text-emerald-600 text-sm font-bold uppercase">
            Style Perks Discount: - Rs. {order.discount.toLocaleString()}
          </p>
        )}
        <p className="text-slate-500 text-sm uppercase tracking-widest">Total Amount Due</p>
        <p className="text-4xl font-black">Rs. {order.totalAmount?.toLocaleString()}</p>
        <div className="flex flex-col items-end gap-1 mt-2">
          <span className={`px-3 py-1 rounded text-xs font-bold ${order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-500'}`}>
            Payment Status: {order.paymentStatus?.toUpperCase()}
          </span>
          {order.pointsEarned > 0 && (
            <span className="text-amber-600 text-[10px] font-bold italic">✨ Points Earned: {order.pointsEarned}</span>
          )}
        </div>
      </div>
    </div>
  </div>
);

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const tabs = [
    { id: "all", label: "All Orders" },
    { id: "pending", label: "Pending" },
    { id: "processing", label: "Processing" },
    { id: "shipped", label: "In Transit" },
    { id: "delivered", label: "Delivered" },
  ];

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const user = JSON.parse(atob(token.split('.')[1]));

      let data;
      if (user.role === 'admin') {
        // Admin still uses axios directly because we haven't created a getAdminOrders helper yet
        const res = await axios.get("http://localhost:3000/api/orders/admin/all", {
          headers: { Authorization: `Bearer ${token}` }
        });
        data = res.data;
      } else {
        // ✅ FIXED: Using getMyOrders() helper from api/order.js
        data = await getMyOrders();
      }

      setOrders(Array.isArray(data) ? data : data.orders || []);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    let result = orders;
    if (activeTab !== "all") {
      result = result.filter((order) => order.status?.toLowerCase() === activeTab);
    }
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter((order) =>
        order._id?.toLowerCase().includes(lowerTerm) ||
        order.fullName?.toLowerCase().includes(lowerTerm)
      );
    }
    setFilteredOrders(result);
  }, [orders, activeTab, searchTerm]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      // ✅ FIXED: Using updateOrderStatusApi helper
      const res = await updateOrderStatusApi(orderId, newStatus);

      if (res.success) {
        toast.success(`Order status updated to ${newStatus}!`);
        fetchOrders();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Status update failed.");
    }
  };

  const handlePrint = (orderId) => {
    const printContent = document.getElementById(`invoice-${orderId}`);
    const WindowPrt = window.open('', '', 'width=900,height=900');
    WindowPrt.document.write(`<html><head><title>Print Invoice</title><script src="https://cdn.tailwindcss.com"></script></head><body>${printContent.innerHTML}</body></html>`);
    WindowPrt.document.close();
    WindowPrt.focus();
    setTimeout(() => { WindowPrt.print(); WindowPrt.close(); }, 700);
  };

  const getStatusConfig = (status) => {
    const s = status?.toLowerCase();
    if (s === "delivered") return { color: "bg-emerald-100 text-emerald-800 border-emerald-200", label: "Delivered" };
    if (s === "shipped") return { color: "bg-blue-50 text-blue-700 border-blue-200", label: "In Transit" };
    if (s === "processing") return { color: "bg-amber-50 text-amber-700 border-amber-200", label: "Processing" };
    if (s === "cancelled") return { color: "bg-red-50 text-red-700 border-red-200", label: "Cancelled" };
    return { color: "bg-slate-100 text-slate-600 border-slate-200", label: "Pending" };
  };

  const getTrackingSteps = (status) => {
    const s = status?.toLowerCase();
    const statusOrder = ["pending", "processing", "shipped", "delivered"];
    const currentIdx = statusOrder.indexOf(s);
    return ["Placed", "Processing", "Shipped", "Delivered"].map((label, idx) => ({
      label, completed: idx <= currentIdx
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-20 pb-12 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Order History</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Manage orders and track your Style Perks.</p>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div className="flex bg-white dark:bg-slate-800 p-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-x-auto">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900" : "text-slate-600 dark:text-slate-300"}`}>
                {tab.label}
              </button>
            ))}
          </div>
          <input type="text" placeholder="Search ID or Name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full md:w-64 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-sm dark:text-white" />
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div></div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-700">📦 No matching orders</div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const trackingSteps = getTrackingSteps(order.status);
              const progressPercent = (["pending", "processing", "shipped", "delivered"].indexOf(order.status?.toLowerCase()) / 3) * 100;
              const statusConfig = getStatusConfig(order.status);

              return (
                <div key={order._id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                  <div className="p-6 border-b dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50/30 dark:bg-slate-800/50 gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white">#{order._id?.slice(-6).toUpperCase()}</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${statusConfig.color}`}>
                          {statusConfig.label}
                        </div>
                        {order.discount > 0 && (
                          <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black border border-amber-200 italic">
                            - Rs. {order.discount} Reward Applied
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-slate-900 dark:text-white">Rs. {order.totalAmount?.toLocaleString()}</p>
                      <p className={`text-[10px] font-bold uppercase tracking-widest ${order.paymentStatus === 'paid' ? 'text-emerald-500' : 'text-slate-400'}`}>
                        {order.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                      </p>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="mb-10 relative px-4 pt-4">
                      <div className="absolute left-10 right-10 top-8 h-1 bg-slate-100 dark:bg-slate-700 -z-10"></div>
                      <div className="absolute left-10 top-8 h-1 bg-teal-600 transition-all duration-1000 -z-10" style={{ width: `calc(${progressPercent}% - 20px)` }}></div>
                      <div className="flex justify-between">
                        {trackingSteps.map((step, idx) => (
                          <div key={idx} className="flex flex-col items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ring-4 ring-white dark:ring-slate-800 z-10 ${step.completed ? 'bg-teal-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>{step.completed ? '✓' : idx + 1}</div>
                            <span className={`text-[10px] font-bold uppercase ${step.completed ? 'text-teal-600' : 'text-slate-400'}`}>{step.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-8 flex flex-wrap justify-end gap-3 items-center">
                      <button onClick={() => handlePrint(order._id)} className="px-4 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg dark:text-slate-300">Invoice</button>
                      <button onClick={() => { setSelectedOrder(order); setIsModalOpen(true); }} className="px-5 py-2 text-sm font-bold bg-slate-900 dark:bg-emerald-600 text-white rounded-lg shadow-md hover:opacity-90 transition-all">Track Order</button>
                    </div>
                    <InvoiceTemplate order={order} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-6 border-b dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-700/50">
              <h2 className="text-xl font-bold dark:text-white">Live Tracking</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 p-2">✕</button>
            </div>
            <div className="p-8 space-y-8">
              {getTrackingSteps(selectedOrder.status).map((step, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm z-10 ${step.completed ? 'bg-teal-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>{step.completed ? "✓" : idx + 1}</div>
                  <div>
                    <p className={`font-bold ${step.completed ? 'text-slate-900 dark:text-white' : 'text-slate-300'}`}>{step.label}</p>
                    {step.completed && <p className="text-[10px] text-teal-600 font-bold uppercase tracking-wider">Completed</p>}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6">
              <button onClick={() => setIsModalOpen(false)} className="w-full py-3 bg-slate-900 dark:bg-teal-600 text-white rounded-xl font-bold hover:opacity-90 transition-opacity">Close Tracker</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
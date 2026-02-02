import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UserProfile = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    setLoading(false);
                    return;
                }

                const config = { headers: { Authorization: `Bearer ${token}` } };

                const [userRes, ordersRes] = await Promise.all([
                    axios.get("http://localhost:3000/api/users/profile", config),
                    axios.get("http://localhost:3000/api/orders/my-orders", config)
                ]);

                // ✅ FIXED: Ensure we capture the user object correctly from the response
                if (userRes.data.success) {
                    setUser(userRes.data.user);
                } else if (userRes.data) {
                    setUser(userRes.data);
                }

                if (Array.isArray(ordersRes.data)) {
                    setOrders(ordersRes.data);
                } else if (ordersRes.data.orders) {
                    setOrders(ordersRes.data.orders);
                }
            } catch (err) {
                console.error("Error fetching data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    // Logic for Statistics
    const totalOrdersCount = orders.length;
    const totalSpentAmount = orders.reduce((sum, order) => {
        return order.paymentStatus === "paid" ? sum + (Number(order.totalAmount) || 0) : sum;
    }, 0);

    // --- STYLE PERKS LOGIC ---
    // ✅ FIXED: Using optional chaining to match your nested rewards.points schema
    const pointsBalance = user?.rewards?.points || 0;
    const rewardValue = pointsBalance * 10; // Rs. 10 per point
    // -------------------------

    const formatDate = (dateString) => {
        if (!dateString) return "Recent Member";
        const date = new Date(dateString);
        return isNaN(date.getTime())
            ? "Recent Member"
            : date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 pt-24 transition-colors duration-300">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-800 shadow-xl ring-1 ring-slate-900/5 dark:ring-slate-700/50 transition-colors">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 opacity-90 dark:opacity-80"></div>
                    <div className="relative px-8 py-10 sm:px-12 sm:py-16">
                        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 sm:gap-10">
                            <img
                                className="relative h-28 w-28 rounded-full border-4 border-white shadow-lg object-cover"
                                src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=0D8ABC&color=fff`}
                                alt="Profile"
                            />
                            <div className="text-center sm:text-left text-white space-y-2">
                                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{user?.name || "Welcome!"}</h1>
                                <p className="text-teal-100 font-medium text-lg">{user?.email}</p>
                                <div className="text-teal-200 text-sm">
                                    <span className="inline-flex items-center rounded-full bg-teal-500/20 px-3 py-1 ring-1 ring-teal-300/30">
                                        Member since {formatDate(user?.createdAt)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md border-t border-white/10">
                        <div className="flex justify-center sm:justify-start">
                            {['profile', 'orders'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`py-4 px-8 text-sm font-medium transition-all capitalize ${activeTab === tab ? 'text-white border-b-4 border-white' : 'text-teal-100'}`}
                                >
                                    {tab === 'profile' ? 'Profile Details' : 'My Orders'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-3">
                        {activeTab === 'profile' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                
                                {/* Personal Info */}
                                <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Personal Information</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs font-bold text-slate-400 uppercase">Full Name</label>
                                            <p className="text-slate-700 dark:text-slate-300 font-medium">{user?.name}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-400 uppercase">Email Address</label>
                                            <p className="text-slate-700 dark:text-slate-300 font-medium">{user?.email}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Style Perks / Rewards Card */}
                                <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-8 rounded-2xl shadow-lg text-white relative overflow-hidden group">
                                    <div className="relative z-10">
                                        <h3 className="text-xl font-black mb-2 flex items-center gap-2">
                                            <span>Style Perks</span>
                                            <span className="bg-white/20 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">Active</span>
                                        </h3>
                                        <div className="mt-4">
                                            <p className="text-orange-100 text-sm font-medium">Available Balance</p>
                                            {/* ✅ Display pointsBalance state */}
                                            <p className="text-5xl font-black mt-1">{pointsBalance} <span className="text-lg">pts</span></p>
                                        </div>
                                        <div className="mt-6 pt-6 border-t border-white/20">
                                            <p className="text-sm font-bold">Estimated Savings:</p>
                                            <p className="text-2xl font-black text-amber-100">Rs. {rewardValue.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-4 -right-4 opacity-20 group-hover:scale-110 transition-transform duration-500">
                                        <svg width="120" height="120" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                                    </div>
                                </div>

                                {/* Account Statistics */}
                                <div className="bg-teal-600 dark:bg-teal-700 p-8 rounded-2xl shadow-lg text-white transition-colors">
                                    <h3 className="text-xl font-bold mb-6">Account Statistics</h3>
                                    <div className="space-y-4">
                                        <div className="bg-white/10 p-4 rounded-xl border border-white/10">
                                            <p className="text-teal-100 text-sm font-medium">Total Orders</p>
                                            <p className="text-3xl font-black mt-1">{totalOrdersCount}</p>
                                        </div>
                                        <div className="bg-white/10 p-4 rounded-xl border border-white/10">
                                            <p className="text-teal-100 text-sm font-medium">Total Spent</p>
                                            <p className="text-2xl font-black mt-1">Rs. {totalSpentAmount.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'orders' && (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors">
                                {orders.length > 0 ? (
                                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                                        {orders.map((order) => (
                                            <div key={order._id} className="p-6 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                                <div>
                                                    <h4 className="font-bold text-slate-900 dark:text-slate-100">Order #{order._id.slice(-6).toUpperCase()}</h4>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                                                    <div className="flex gap-2 mt-1">
                                                        <span className={`text-[10px] uppercase px-2 py-0.5 rounded font-bold ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                            {order.paymentStatus}
                                                        </span>
                                                        {/* ✅ Show points used if applicable */}
                                                        {order.pointsUsed > 0 && (
                                                            <span className="text-[10px] uppercase px-2 py-0.5 rounded font-bold bg-amber-100 text-amber-700">
                                                                {order.pointsUsed} Pts Used
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-slate-900 dark:text-white">Rs. {order.totalAmount}</p>
                                                    <p className="text-xs text-slate-400 capitalize">{order.status}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-20 text-center text-slate-400 font-medium">No orders found. Time for some shopping!</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
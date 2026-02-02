import React from 'react';

const OrdersTable = ({ orders, onUpdateStatus }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Order ID</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Customer</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Products</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Amount</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-center">Actions</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {orders.map((order) => (
                            <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-mono text-xs text-teal-600">
                                    #{order._id.slice(-6).toUpperCase()}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-gray-900">{order.fullName || order.user?.name}</span>
                                        <span className="text-xs text-gray-500">{order.phoneNumber || order.user?.email}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-600">
                                        {order.products?.map((item, i) => (
                                            <div key={i}>
                                                {item.product?.name} <span className="text-gray-400">x{item.quantity}</span>
                                            </div>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-semibold text-gray-900">
                                    Rs. {order.totalAmount.toLocaleString()}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${
                                        order.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                                        order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                                        order.status === 'shipped' ? 'bg-purple-100 text-purple-700' :
                                        'bg-green-100 text-green-700'
                                    }`}>
                                        {order.status}
                                    </span>
                                </td>

                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-center gap-2">
                                        {order.status === 'pending' && (
                                            <button 
                                                onClick={() => onUpdateStatus(order._id, 'processing')}
                                                className="px-3 py-1 bg-blue-600 text-white text-[10px] font-bold rounded shadow-sm hover:bg-blue-700 transition-all"
                                            >
                                                PROCESS
                                            </button>
                                        )}
                                        {order.status === 'processing' && (
                                            <button 
                                                onClick={() => onUpdateStatus(order._id, 'shipped')}
                                                className="px-3 py-1 bg-purple-600 text-white text-[10px] font-bold rounded shadow-sm hover:bg-purple-700 transition-all"
                                            >
                                                SHIP
                                            </button>
                                        )}
                                        {order.status === 'shipped' && (
                                            <button 
                                                // ✅ FIXED: Removed the extra 'paid' argument that was likely hanging the function
                                                onClick={() => onUpdateStatus(order._id, 'delivered')}
                                                className="px-3 py-1 bg-green-600 text-white text-[10px] font-bold rounded shadow-sm hover:bg-green-700 transition-all"
                                            >
                                                DELIVER
                                            </button>
                                        )}
                                        {order.status === 'delivered' && (
                                            <div className="flex flex-col items-center">
                                                <span className="text-[10px] text-green-600 font-bold uppercase italic">Delivered</span>
                                                <span className="text-[8px] text-gray-400 font-bold uppercase">Verified Paid</span>
                                            </div>
                                        )}
                                    </div>
                                </td>

                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {orders.length === 0 && (
                <div className="p-10 text-center text-gray-400 italic">No orders available for management.</div>
            )}
        </div>
    );
};

export default OrdersTable;
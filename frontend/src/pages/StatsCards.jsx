import React from 'react';

const StatsCards = ({ stats }) => {
    const data = stats?.success ? stats : (stats || {
        totalOrders: 0,
        totalUsers: 0,
        totalRevenue: 0,
        pendingOrders: 0
    });

    // This is the variable you calculated
    const customerCount = data.users
        ? data.users.filter(u => u.role === 'user').length
        : (data.totalUsers || 0);

    const cards = [
        {
            title: "Total Revenue",
            value: `Rs. ${(data.totalRevenue || 0).toLocaleString()}`,
            color: "text-green-600", bg: "bg-green-50", icon: "💰"
        },
        {
            title: "All Orders",
            value: data.totalOrders || 0,
            color: "text-blue-600", bg: "bg-blue-50", icon: "📦"
        },
        {
            title: "Total Customers",
            // ✅ FIXED: Use 'customerCount' (the variable) instead of 'data.customerCount'
            value: customerCount,
            color: "text-teal-600", bg: "bg-teal-50", icon: "👥"
        },
        {
            title: "Pending Actions",
            value: data.pendingOrders || 0,
            color: "text-orange-600", bg: "bg-orange-50", icon: "⏳"
        },
    ];

    if (!stats) {
        return <div className="grid grid-cols-4 gap-6 mb-8 animate-pulse">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>)}
        </div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {cards.map((card, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{card.title}</p>
                            <h3 className={`text-2xl font-bold mt-1 ${card.color}`}>{card.value}</h3>
                        </div>
                        <div className={`${card.bg} p-3 rounded-lg text-2xl`}>
                            {card.icon}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default StatsCards;
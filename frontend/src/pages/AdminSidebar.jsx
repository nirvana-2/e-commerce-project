import React from 'react';
// import { useNavigate } from 'react-router-dom';

const AdminSidebar = ({ setView, currentView }) => {
    // const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear(); 
    
    // 2. Hard redirect to the login page
    // This clears the React state and "reboots" the ProtectedRoute logic
    window.location.replace("/login")
    };

    const menuItems = [
        { id: "stats", name: "Stats overview", icon: "📊" },
        { id: "orders", name: "Orders Management", icon: "📦" },
        { id: "inventory", name: "Store Inventory", icon: "🏢" },
        { id: "add-product", name: "Product Management", icon: "➕" }, // ✅ Added for the form
    ];

    return (
        <aside className="w-64 bg-white border-r border-gray-200 p-5 hidden md:flex flex-col sticky top-0 h-screen">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 italic">
                    My<span className="text-blue-600">Shop</span> Admin
                </h2>
            </div>

            <nav className="flex flex-col gap-2 flex-grow">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => setView(item.id)} 
                        className={`flex items-center gap-3 p-3 rounded-lg font-medium transition-all ${
                            currentView === item.id 
                            ? "bg-blue-50 text-blue-600 shadow-sm" 
                            : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                        }`}
                    >
                        <span>{item.icon}</span>
                        {item.name}
                    </button>
                ))}
            </nav>

            <div className="mt-auto pt-6 border-t border-gray-100">
                <button
                    onClick={handleLogout}
                    className="w-full p-3 text-red-500 border border-red-100 rounded-lg hover:bg-red-50 transition-colors font-medium flex items-center justify-center gap-2"
                >
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
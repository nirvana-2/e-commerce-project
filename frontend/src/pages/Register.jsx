import { useState } from "react";
import { registerUser } from "../api/auth";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("user");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        // --- VALIDATION LOGIC (Stays the same) ---
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

        if (name.trim().length < 2) {
            return setMessage("Please enter your full name.");
        }
        if (!emailRegex.test(email)) {
            return setMessage("Please enter a valid email address.");
        }
        if (!passwordRegex.test(password)) {
            return setMessage("Password must be 8+ characters with at least one letter and one number.");
        }

        try {
            const data = await registerUser(name, email, password, role);

            // 1. Save all necessary data to localStorage
            localStorage.setItem("token", data.token);
            // ✅ Use data.user.role (from DB) to be 100% sure of the status
            localStorage.setItem("role", data.user.role);
            // ✅ Add this to keep it consistent with your Login.jsx
            localStorage.setItem("user", JSON.stringify(data.user));

            // 2. Direct based on the BACKEND'S data
            if (data.user.role === "admin") {
                navigate("/admindashboard");
            } else {
                navigate("/dashboard");
            }
        } catch (err) {
            setMessage(err.response?.data?.message || "Error registering");
        }
    };
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-500 via-emerald-500 to-teal-700 dark:from-teal-900 dark:via-emerald-900 dark:to-teal-950 p-4 transition-colors duration-500">
            <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-white/20">

                {/* Header Section */}
                <div className="p-8 text-center">
                    <h1 className="text-4xl font-extrabold text-white mb-2">Create Account</h1>
                    <p className="text-teal-100">Join thousands of happy shoppers today</p>
                </div>

                {/* Form Section */}
                <div className="bg-white dark:bg-slate-800 p-8 rounded-t-3xl transition-colors duration-300">
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                            <input
                                placeholder="John Doe"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 focus:border-teal-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900 transition-all outline-none dark:text-white dark:placeholder-gray-400"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                            <input
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 focus:border-teal-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900 transition-all outline-none dark:text-white dark:placeholder-gray-400"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 focus:border-teal-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900 transition-all outline-none dark:text-white dark:placeholder-gray-400"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Register as</label>
                            <div className="relative">
                                <select
                                    className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 focus:border-teal-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900 transition-all outline-none appearance-none dark:text-white"
                                    value={role}
                                    onChange={e => setRole(e.target.value)}
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full mt-2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transform transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                        >
                            Create Account
                        </button>
                    </form>

                    {message && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg text-center">
                            {message}
                        </div>
                    )}

                    <div className="mt-6 text-center">
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Already have an account?{" "}
                            <Link to="/login" className="text-teal-600 font-semibold hover:text-teal-800 hover:underline transition-colors">
                                Login here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
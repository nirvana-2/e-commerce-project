import { useState } from "react";
import { loginUser } from "../api/auth";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isSending, setIsSending] = useState(false);

  const navigate = useNavigate();

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsSending(true);
    setMessage("");

    // Validation for Forgot Password Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resetEmail)) {
      setMessage("Please enter a valid email address.");
      setIsSending(false);
      return;
    }

    try {
      const res = await axios.post("http://localhost:3000/api/users/forgot-password", {
        email: resetEmail,
      });
      setMessage(res.data.message || "Reset link sent! Check your email.");
      setResetEmail("");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to send reset link.");
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    // --- VALIDATION LOGIC ---
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

    if (!emailRegex.test(email)) {
      return setMessage("Please enter a valid email address.");
    }

    if (!passwordRegex.test(password)) {
      return setMessage("Password must be at least 8 characters long and include both letters and numbers.");
    }

    try {
      const data = await loginUser(email, password);

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("user", JSON.stringify(data.user));

      // ✅ ADDED { replace: true } HERE
      // This prevents the "Back Arrow" loop by removing /login from history
      const targetPath = data.user.role === "admin" ? "/admindashboard" : "/dashboard";
      navigate(targetPath, { replace: true });

    } catch (err) {
      setMessage(err.response?.data?.message || "Error logging in");
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-500 via-green-500 to-emerald-700 dark:from-emerald-900 dark:via-green-900 dark:to-emerald-950 p-4 transition-colors duration-500">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-white/20">

        {/* Header Section */}
        <div className="p-8 text-center">
          <h1 className="text-4xl font-extrabold text-white mb-2">Welcome Back</h1>
          <p className="text-emerald-100">Sign in to continue to Easy Shopping</p>
        </div>

        {/* Form Section */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-t-3xl transition-colors duration-300">
          {!isForgotPassword ? (
            <>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900 transition-all outline-none dark:text-white dark:placeholder-gray-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900 transition-all outline-none dark:text-white dark:placeholder-gray-400"
                    required
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => { setIsForgotPassword(true); setMessage(""); }}
                    className="text-sm text-emerald-600 hover:text-emerald-800 font-medium transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transform transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  Log In
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="mb-6 text-center">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Reset Password</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Enter your email to receive reset instructions.</p>
              </div>
              <form className="space-y-6" onSubmit={handleForgotPassword}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900 transition-all outline-none dark:text-white dark:placeholder-gray-400"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSending}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transform transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSending ? "Sending..." : "Send Reset Link"}
                </button>

                <button
                  type="button"
                  onClick={() => { setIsForgotPassword(false); setMessage(""); }}
                  className="w-full mt-4 text-center text-sm text-gray-500 hover:text-emerald-600 font-medium transition-colors"
                >
                  Back to Login
                </button>
              </form>
            </>
          )}

          {message && (
            <div className={`mt-4 p-3 border text-sm rounded-lg text-center ${message.toLowerCase().includes("sent") || message.toLowerCase().includes("check")
              ? "bg-green-50 border-green-100 text-green-600"
              : "bg-red-50 border-red-100 text-red-600"
              }`}>
              {message}
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Don't have an account?{" "}
              <Link to="/register" className="text-emerald-600 font-semibold hover:text-emerald-800 hover:underline transition-colors">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
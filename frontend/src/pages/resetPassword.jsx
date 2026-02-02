import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";


export default function ResetPassword() {
  const { token } = useParams(); // Grabs the token from the URL
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" }); // Clear messages

    // --- VALIDATION LOGIC ---
    // Password must be 8+ characters, contain at least one letter and one number
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

    if (!passwordRegex.test(password)) {
      return setMessage({
        type: "error",
        text: "Password must be at least 8 characters long and include both letters and numbers."
      });
    }

    if (password !== confirmPassword) {
      return setMessage({ type: "error", text: "Passwords do not match" });
    }
    // ------------------------

    setIsSubmitting(true);
    try {
      await axios.put(`http://localhost:3000/api/users/reset-password/${token}`, {
        password: password,
      });

      setMessage({ type: "success", text: "Password reset successful! Redirecting..." });

      // Redirect to login after 3 seconds
      setTimeout(() => navigate("/login"), 3000);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Link expired or invalid"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-500 via-emerald-500 to-teal-700 dark:from-teal-900 dark:via-emerald-900 dark:to-teal-950 p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-white/20">

        <div className="p-8 text-center text-white">
          <h1 className="text-4xl font-extrabold mb-2">New Password</h1>
          <p className="text-teal-100">Please enter your new secure password</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-8 rounded-t-3xl">
          <form className="space-y-6" onSubmit={handleResetSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 focus:border-teal-500 outline-none dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 focus:border-teal-500 outline-none dark:text-white"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transform transition-all disabled:opacity-50"
            >
              {isSubmitting ? "Updating..." : "Update Password"}
            </button>
          </form>

          {message.text && (
            <div className={`mt-6 p-3 rounded-lg text-center text-sm border ${message.type === "error"
                ? "bg-red-50 border-red-100 text-red-600"
                : "bg-green-50 border-green-100 text-green-600"
              }`}>
              {message.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
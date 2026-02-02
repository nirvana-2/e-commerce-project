import { NavLink, useNavigate, Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { Sun, Moon } from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    // 1. Remove all auth data
    localStorage.clear();


    navigate("/login", { replace: true });


    window.location.reload();
  };

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors duration-200 ${isActive ? "text-primary" : "text-slate-600 hover:text-primary"
    }`;

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/dashboard" className="flex items-center gap-2 group">
              <span className="text-2xl group-hover:scale-110 transition-transform duration-200">🛍️</span>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
                My<span className="text-dark dark:text-light">Shop</span>
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden sm:flex sm:items-center sm:space-x-8">
            <NavLink to="/dashboard" className={navLinkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/cart" className={navLinkClass}>
              Cart
            </NavLink>
            <NavLink to="/my-orders" className={navLinkClass}>
              My Orders
            </NavLink>
            <NavLink to="/profile" className={navLinkClass}>
              Profile
            </NavLink>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="h-6 w-px bg-slate-200 mx-2"></div>

            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all shadow-md hover:shadow-lg"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
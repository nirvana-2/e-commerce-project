import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/register";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Product from "./pages/product";
import Cart from "./pages/cart";
import Orders from "./pages/Order";
import ProductDetail from './pages/productDetail';
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailure from './pages/paymentFailure';
import UserProfile from "./pages/UserProfile";
import ResetPassword from "./pages/resetPassword";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// 1. ✅ UPDATED: ProtectedRoute now kicks Admins to AdminDashboard
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Allow Stripe/Payment redirects to pass through if they have data
  if (window.location.search.includes("data=")) return children;

  if (!token) return <Navigate to="/login" replace />;

  // CRITICAL: If an admin tries to access ANY user route, send them back to Admin panel
  if (user.role === "admin") {
    return <Navigate to="/admindashboard" replace />;
  }

  return children;
};

// 2. Admin Protection
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!token || user.role !== "admin") {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// 3. Smart PublicRoute (Redirects based on role)
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (token) {
    const target = user.role === "admin" ? "/admindashboard" : "/dashboard";
    return <Navigate to={target} replace />;
  }
  return children;
};

const NavigationWrapper = () => {
  const location = useLocation();
  const hideNavbarPaths = ["/admindashboard", "/login", "/register"];
  return hideNavbarPaths.includes(location.pathname.toLowerCase()) ? null : <Navbar />;
};

export default function App() {
  return (
    <div className="container mx-auto px-4">
      <NavigationWrapper />
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public Routes */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* Admin Routes */}
        <Route path="/admindashboard" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />

        {/* ✅ All these now use the Admin-Aware ProtectedRoute */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/products" element={<ProtectedRoute><Product /></ProtectedRoute>} />
        <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/my-orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/product/:id" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
        <Route path="/payment-success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />

        {/* Public or specialized routes */}
        <Route path="/payment-failure" element={<PaymentFailure />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}
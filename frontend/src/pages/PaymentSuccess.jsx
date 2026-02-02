import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState("verifying");

  useEffect(() => {
    const verifyPayment = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      let data = searchParams.get("data");

      if (!data) {
        setStatus("error");
        return;
      }

      try {
        // 1. Call Backend to verify eSewa
        const res = await axios.get(`http://localhost:3000/api/payment/verify-esewa?data=${data}`);

        if (res.data.success) {
          setStatus("success");

          // 2. Clear cart and notify Navbar
          localStorage.removeItem("cart");
          window.dispatchEvent(new Event("cartUpdated"));

          // 3. Redirect to /my-orders after 3 seconds
          setTimeout(() => navigate('/my-orders'), 3000);
        } else {
          setStatus("error");
        }
      } catch (err) {
        console.error("Verification error:", err.response?.data || err.message);
        setStatus("error");
      }
    };

    verifyPayment();
  }, [location, navigate]);

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-900 p-4 transition-colors">
      <div className="text-center p-10 bg-white dark:bg-slate-800 rounded-[40px] shadow-2xl max-w-sm w-full border border-slate-100 dark:border-slate-700">

        {status === "verifying" && (
          <div className="animate-in fade-in duration-500">
            <div className="w-16 h-16 border-[5px] border-teal-100 border-t-teal-600 rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Verifying Payment...</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">
              Please wait while we confirm your order.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="animate-in zoom-in duration-500">
            <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner">
              ✓
            </div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Payment Successful!</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-3 text-sm leading-relaxed font-medium">
              Your order has been placed. <br /> You can track it in your order history.
            </p>

            <div className="mt-8 flex items-center justify-center gap-2">
              <div className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce"></div>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
              ✕
            </div>
            <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Verification Failed</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
              We couldn't verify the payment. Please check your orders.
            </p>
            <button
              onClick={() => navigate('/my-orders')}
              className="mt-8 w-full py-3 bg-teal-600 text-white rounded-2xl font-black transition-all hover:bg-teal-700 active:scale-95"
            >
              Go to My Orders
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
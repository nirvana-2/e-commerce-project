import { useState, useEffect, useCallback } from "react";
import { getCart, removeFromCart } from "../api/cart";
import { placeOrder } from "../api/order";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { Banknote, User, Phone, MapPin, X, ShoppingBag } from "lucide-react";

export default function Cart({ isSidebar = false, usePoints = false, pointsValue = 0 }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(!!location.state?.openCheckout);
  const [address, setAddress] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isOrdering, setIsOrdering] = useState(false);

  const finalUsePoints = usePoints || !!location.state?.usePoints;
  const finalPointsValue = pointsValue || location.state?.pointsValue || 0;

  const subTotal = cart.reduce((sum, item) => {
    const price = item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  const discount = finalUsePoints ? finalPointsValue * 10 : 0;
  const finalTotalPrice = Math.max(0, subTotal - discount);

  const fetchCartData = useCallback(async () => {
    try {
      const cartData = await getCart();
      setCart(cartData.products || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching cart:", err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    const orderId = params.get("oid");

    if (status === "cancel" && orderId) {
      axios.delete(`http://localhost:3000/api/payment/cancel-order/${orderId}`)
        .then(() => {
          alert("Payment cancelled. Your items are still in the cart.");
          navigate("/cart", { replace: true });
        })
        .catch(err => console.error("Cleanup failed:", err));
    }

    fetchCartData();
    window.addEventListener("cartUpdated", fetchCartData);
    window.addEventListener("focus", fetchCartData);

    return () => {
      window.removeEventListener("cartUpdated", fetchCartData);
      window.removeEventListener("focus", fetchCartData);
    };
  }, [fetchCartData, navigate]);

  const handleRemove = async (item) => {
    const productId = item.product?._id;
    if (!productId) return;
    try {
      const updatedCart = await removeFromCart(productId);
      setCart(updatedCart.products || []);
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error("Remove failed:", err);
    }
  };

  const handleCheckoutClick = () => {
    if (cart.length === 0) return alert("Your cart is empty!");
    if (location.pathname !== '/cart') {
      navigate('/cart', {
        state: { openCheckout: true, usePoints: usePoints, pointsValue: pointsValue }
      });
      return;
    }
    setShowModal(true);
  };

  const handleConfirmOrder = async () => {
    if (!address.trim() || !fullName.trim() || !phoneNumber.trim()) {
      return alert("Please fill in all shipping details!");
    }
    const savedUser = JSON.parse(localStorage.getItem("user"));
    const userId = savedUser?._id || savedUser?.id;
    setIsOrdering(true);
    try {
      const orderData = {
        userId,
        items: cart.map(item => ({ product: item.product._id, quantity: item.quantity, price: item.product.price })),
        subTotal, discount, totalAmount: finalTotalPrice, address, fullName, phoneNumber,
        paymentMethod: paymentMethod === 'cod' ? "COD" : "eSewa",
        usePoints: finalUsePoints
      };

      if (paymentMethod === 'cod') {
        await placeOrder(orderData);
        toast.success("Order Placed! 🎉");
        setShowModal(false);
        setCart([]);
        window.dispatchEvent(new Event("cartUpdated"));
        navigate('/my-orders');
      } else {
        handleEsewaRedirect(userId);
      }
    } catch (error) {
      alert("Order failed: " + (error.response?.data?.message || "Error"));
    } finally {
      setIsOrdering(false);
    }
  };

  const handleEsewaRedirect = async (userId) => {
    setIsOrdering(true);
    try {
      const response = await axios.post("http://localhost:3000/api/payment/initiate-esewa", {
        userId, items: cart.map(item => ({ product: item.product._id, quantity: item.quantity, price: item.product.price })),
        subTotal, totalAmount: finalTotalPrice, address, fullName, phoneNumber, usePoints: finalUsePoints
      });
      if (response.data.success) {
        const { payment_data } = response.data;
        const form = document.createElement("form");
        form.method = "POST";
        form.action = "https://rc.esewa.com.np/api/epay/main/v2/form";
        Object.entries(payment_data).forEach(([key, value]) => {
          const input = document.createElement("input");
          input.type = "hidden"; input.name = key; input.value = value;
          form.appendChild(input);
        });
        document.body.appendChild(form);
        form.submit();
      }
    } catch (error) {
      alert("eSewa Initiation failed.");
    } finally {
      setIsOrdering(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center min-h-screen pt-24">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-600"></div>
    </div>
  );

  if (isSidebar) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[400px]">
        <div className="p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 flex justify-between items-center">
          <h2 className="font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            🛒 Cart <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full">{cart.length}</span>
          </h2>
        </div>
        <div className="overflow-y-auto flex-1 p-2 space-y-1">
          {cart.length === 0 ? (
            <p className="text-center py-10 text-slate-400 text-sm">Empty</p>
          ) : (
            cart.map((item) => (
              <div key={item.product?._id} className="p-3 flex gap-3 border-b border-slate-50 dark:border-slate-700">
                <img src={item.product?.image} className="w-10 h-10 object-cover rounded-lg" alt="" />
                <div className="flex-1">
                  <p className="font-bold text-xs dark:text-white line-clamp-1">{item.product?.name}</p>
                  <p className="text-[10px] text-slate-500">Qty: {item.quantity}</p>
                </div>
                <button onClick={() => handleRemove(item)} className="text-red-400 text-lg">&times;</button>
              </div>
            ))
          )}
        </div>
        <div className="p-5 bg-slate-50 dark:bg-slate-800 border-t">
          <div className="flex justify-between font-black text-slate-900 dark:text-white mb-4">
            <span>Total</span>
            <span>Rs. {finalTotalPrice.toLocaleString()}</span>
          </div>
          <button onClick={handleCheckoutClick} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold">Checkout</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-black mb-8 dark:text-white">Shopping Cart</h1>
        {cart.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 p-12 rounded-3xl text-center">
            <p className="text-slate-500 mb-6">Empty.</p>
            <button onClick={() => navigate('/dashboard')} className="bg-emerald-600 text-white px-8 py-3 rounded-xl">Shop Now</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-4">
              {cart.map((item) => (
                <div key={item.product?._id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl flex items-center gap-6 border">
                  <img src={item.product?.image} className="w-20 h-20 object-contain" alt="" />
                  <div className="flex-1">
                    <h3 className="font-bold dark:text-white">{item.product?.name}</h3>
                    <button onClick={() => handleRemove(item)} className="text-red-500 text-xs">Remove</button>
                  </div>
                  <p className="font-bold dark:text-white">Rs. {item.product?.price * item.quantity}</p>
                </div>
              ))}
            </div>
            <div className="lg:col-span-4">
              <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border">
                <h2 className="text-xl font-bold mb-6 dark:text-white">Summary</h2>
                <div className="flex justify-between text-2xl font-black dark:text-white border-t pt-4">
                  <span>Total</span>
                  <span className="text-emerald-600">Rs. {finalTotalPrice}</span>
                </div>
                <button onClick={handleCheckoutClick} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold mt-6">Checkout</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- PROFESSIONAL CHECKOUT MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-5xl h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl relative">

            {/* Left Side: Form & Payment */}
            <div className="flex-1 p-8 md:p-12 overflow-y-auto bg-white custom-scrollbar">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black text-slate-800 flex items-center gap-2">
                  <ShoppingBag className="w-8 h-8 text-emerald-600" /> Checkout
                </h2>
                {/* Mobile Close Button */}
                <button onClick={() => setShowModal(false)} className="md:hidden text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Personal Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 ml-1">Full Name</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <User size={20} />
                      </div>
                      <input
                        type="text"
                        placeholder="John Doe"
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none font-medium"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 ml-1">Phone Number</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <Phone size={20} />
                      </div>
                      <input
                        type="tel"
                        placeholder="+977 98..."
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none font-medium"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600 ml-1">Delivery Address</label>
                  <div className="relative">
                    <div className="absolute left-4 top-6 text-slate-400">
                      <MapPin size={20} />
                    </div>
                    <textarea
                      placeholder="Street Address, City, Landmark..."
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none h-32 resize-none font-medium"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                </div>

                {/* Payment Method Section */}
                <div className="pt-6">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span> Payment Method
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* COD Option */}
                    <button
                      onClick={() => setPaymentMethod('cod')}
                      className={`relative p-6 rounded-2xl border-2 flex flex-col items-center gap-4 transition-all duration-300 group overflow-hidden ${paymentMethod === 'cod'
                        ? 'border-emerald-500 bg-emerald-50/50 shadow-lg shadow-emerald-500/10'
                        : 'border-slate-100 bg-white hover:border-emerald-200 hover:bg-slate-50'
                        }`}
                    >
                      {paymentMethod === 'cod' && (
                        <div className="absolute top-3 right-3 text-emerald-600">
                          <div className="w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs">✓</div>
                        </div>
                      )}
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${paymentMethod === 'cod' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500'}`}>
                        <Banknote size={32} />
                      </div>
                      <div className="text-center">
                        <h4 className={`font-bold text-lg ${paymentMethod === 'cod' ? 'text-emerald-900' : 'text-slate-600'}`}>Cash on Delivery</h4>
                        <p className="text-xs text-slate-400 mt-1 font-medium">Pay when you receive</p>
                      </div>
                    </button>

                    {/* eSewa Option */}
                    <button
                      onClick={() => setPaymentMethod('esewa')}
                      className={`relative p-6 rounded-2xl border-2 flex flex-col items-center gap-4 transition-all duration-300 group overflow-hidden ${paymentMethod === 'esewa'
                        ? 'border-[#60bb46] bg-[#60bb46]/5 shadow-lg shadow-[#60bb46]/10'
                        : 'border-slate-100 bg-white hover:border-[#60bb46]/30 hover:bg-green-50/30'
                        }`}
                    >
                      {paymentMethod === 'esewa' && (
                        <div className="absolute top-3 right-3 text-[#60bb46]">
                          <div className="w-5 h-5 bg-[#60bb46] text-white rounded-full flex items-center justify-center text-xs">✓</div>
                        </div>
                      )}
                      <div className="w-16 h-16 rounded-full flex items-center justify-center bg-white border border-slate-100 p-2 overflow-hidden relative">
                        <img
                          src="https://esewa.com.np/common/images/esewa_logo.png"
                          alt="eSewa"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="text-center">
                        <h4 className={`font-bold text-lg ${paymentMethod === 'esewa' ? 'text-[#60bb46]' : 'text-slate-600'}`}>eSewa Wallet</h4>
                        <p className="text-xs text-slate-400 mt-1 font-medium">Digital Payment</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Order Summary */}
            <div className="w-full md:w-[400px] bg-slate-50/80 backdrop-blur p-8 border-l border-slate-200 flex flex-col h-[30vh] md:h-auto z-20">
              <div className="hidden md:flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold text-slate-800">Order Summary</h2>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 text-slate-500 hover:bg-red-100 hover:text-red-500 transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2 custom-scrollbar">
                {cart.map((item) => (
                  <div key={item.product?._id} className="flex gap-4 items-center bg-white p-3 rounded-xl border border-slate-100">
                    <img src={item.product?.image} className="w-12 h-12 object-contain bg-white rounded-lg border border-slate-50" alt="" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-slate-800 line-clamp-1">{item.product?.name}</p>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">Qty: {item.quantity} × Rs.{item.product?.price}</p>
                    </div>
                    <div className="font-bold text-sm text-slate-900">Rs. {(item.product?.price * item.quantity).toLocaleString()}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-6 border-t border-slate-200">
                <div className="flex justify-between text-sm text-slate-500 font-medium">
                  <span>Subtotal</span>
                  <span>Rs. {subTotal.toLocaleString()}</span>
                </div>
                {finalUsePoints && discount > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600 font-bold bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                    <span>✨ Style Perks</span>
                    <span>- Rs. {discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-2xl font-black text-slate-900 pt-2 border-t border-slate-200 border-dashed">
                  <span>Total</span>
                  <span>Rs. {finalTotalPrice.toLocaleString()}</span>
                </div>

                <button
                  disabled={isOrdering}
                  onClick={handleConfirmOrder}
                  className={`w-full mt-4 py-4 rounded-xl text-white font-bold text-lg shadow-xl shadow-emerald-900/10 hover:shadow-2xl hover:-translate-y-1 active:scale-[0.98] transition-all flex items-center justify-center gap-3 ${paymentMethod === 'cod'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-500'
                    : 'bg-[#60bb46]'
                    }`}
                >
                  {isOrdering ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <span>{paymentMethod === 'cod' ? "Confirm Order" : "Pay with eSewa"}</span>
                      <ShoppingBag size={20} className="text-white/80" />
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
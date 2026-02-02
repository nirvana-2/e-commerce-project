import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReviewForm from '../components/reviewForm';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [isEligible, setIsEligible] = useState(false);

  // Define the loader inside or outside with careful dependencies
  // Moving it inside useEffect is the safest way to avoid cascading renders
  useEffect(() => {
    const getProductData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // 1. Fetch product details
        const res = await axios.get(`http://localhost:3000/api/products/${id}`);
        setProduct(res.data);

        // 2. Check if user can review
        if (token) {
          const eligibilityRes = await axios.get(
            `http://localhost:3000/api/orders/check-review-eligibility/${id}`,
            { headers }
          );
          setIsEligible(eligibilityRes.data.eligible);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    getProductData();
  }, [id]); // Only runs when the Product ID in the URL changes

  const handleAddToCart = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      await axios.post(
        "http://localhost:3000/api/cart/add",
        { productId: id, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Product successfully added to your cart.");
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error("Cart Error:", err.response?.data?.message || err.message);
    }
  };

  // Function to refresh data passed to ReviewForm
  const refreshData = () => {
    // This manually triggers a refresh without causing a loop
    axios.get(`http://localhost:3000/api/products/${id}`).then(res => setProduct(res.data));
  };

  if (!product) return <div className="h-screen flex items-center justify-center font-bold text-slate-400">Loading Product...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 lg:p-12 pt-24 transition-colors duration-300">
      <button onClick={() => navigate(-1)} className="mb-8 text-gray-500 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 font-bold transition-colors">
        ← Back to Shop
      </button>

      {/* Product Info Section */}
      <div className="max-w-6xl mx-auto bg-white dark:bg-slate-800 rounded-[40px] shadow-2xl flex flex-col md:flex-row border border-gray-100 dark:border-slate-700 overflow-hidden mb-12 transition-colors">
        <div className="md:w-3/5 bg-gray-50 dark:bg-slate-700/50 p-10 flex items-center justify-center">
          <img src={product.image} alt={product.name} className="max-h-[500px] object-contain hover:scale-105 transition-transform duration-500" />
        </div>

        <div className="md:w-2/5 p-10 flex flex-col justify-center">
          <span className="bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 px-3 py-1 rounded-full text-xs font-black uppercase mb-4 w-fit">
            {product.category}
          </span>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2">{product.name}</h1>

          <div className="flex items-center gap-2 mb-4">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <span key={i}>{i < Math.round(product.averageRating) ? "★" : "☆"}</span>
              ))}
            </div>
            <span className="text-sm font-bold text-gray-400">({product.numReviews} Reviews)</span>
          </div>

          <p className="text-gray-500 dark:text-gray-300 mb-8 leading-relaxed">{product.description}</p>

          <div className="flex items-center gap-6 mb-10 pb-8 border-b border-gray-100 dark:border-slate-700">
            <span className="text-4xl font-black text-teal-600 dark:text-teal-400">Rs. {product.price?.toLocaleString()}</span>
            <span className={`px-3 py-1 rounded-lg text-xs font-bold ${product.stock > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {product.stock > 0 ? `${product.stock} In Stock` : 'Out of Stock'}
            </span>
          </div>

          <button onClick={handleAddToCart} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-black py-5 rounded-2xl shadow-xl transition-all active:scale-95">
            Add to Cart
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="h-full">
          {isEligible ? (
            <ReviewForm productId={id} onReviewPosted={refreshData} />
          ) : (
            <div className="bg-white dark:bg-slate-800 p-8 rounded-[30px] shadow-lg border border-gray-50 dark:border-slate-700 h-full flex flex-col items-center justify-center text-center py-10">
              <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-2xl mb-4">🔒</div>
              <p className="text-gray-500 dark:text-gray-400 font-bold px-6">
                Only verified customers who have received and paid for this item can leave a review.
              </p>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 p-8 rounded-[30px] shadow-lg border border-gray-50 dark:border-slate-700 transition-colors h-full">
          <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6 flex items-center justify-between">
            Customer Feedback
            <span className="text-sm font-bold bg-gray-100 dark:bg-slate-700 px-3 py-1 rounded-full text-gray-500 dark:text-gray-300">{product.reviews?.length || 0}</span>
          </h3>
          <div className="reviews-list">
        {product.reviews && product.reviews.map((review) => (
            <div key={review._id} className="review-item" style={{ borderBottom: '1px solid #ddd', padding: '10px 0' }}>
                <strong>{review.name}</strong>
                <div className="stars">
                    {/* Simple star display logic */}
                    {"⭐".repeat(review.rating)}
                </div>
                <p className="review-date">{new Date(review.createdAt).toLocaleDateString()}</p>
                <p>{review.comment}</p>
            </div>
        ))}
    </div>

          <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {product.reviews && product.reviews.length > 0 ? (
              product.reviews.map((rev) => (
                <div key={rev._id} className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-2xl border border-gray-100 dark:border-slate-700">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-gray-800 dark:text-gray-200">{rev.name}</h4>
                        <span className="text-[9px] bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-black uppercase">Verified Purchase</span>
                      </div>
                      <div className="flex text-amber-400 text-xs">
                        {[...Array(5)].map((_, i) => (
                          <span key={i}>{i < rev.rating ? "★" : "☆"}</span>
                        ))}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm italic">"{rev.comment}"</p>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-400 font-medium">No reviews yet. Be the first to share your thoughts!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
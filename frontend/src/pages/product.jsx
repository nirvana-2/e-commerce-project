import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// 1. HELPER COMPONENT: StaticStars
// This displays the average rating and review count
const StaticStars = ({ rating = 0, numReviews = 0 }) => {
    return (
        <div className="flex items-center gap-1.5 mt-1 mb-2">
            <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                        key={star}
                        className={`w-3.5 h-3.5 ${star <= Math.round(rating) ? "text-amber-400" : "text-slate-200"
                            }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                ))}
            </div>
            <span className="text-[11px] font-bold text-slate-400">
                {rating > 0 ? `${rating.toFixed(1)} (${numReviews})` : "No reviews"}
            </span>
        </div>
    );
};

export default function Products({ items, currentPage, setCurrentPage, totalPages }) {
    const navigate = useNavigate();

    const handleAddToCart = async (e, productId) => {
        e.stopPropagation();
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("Please login first!");
                return;
            }
            await axios.post(
                "http://localhost:3000/api/cart/add",
                { productId, quantity: 1 },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            window.dispatchEvent(new Event("cartUpdated"));
        } catch (err) {
            console.error("Cart Error:", err.message);
            alert("Failed to add to cart.");
        }
    };

    if (!items || items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors duration-300">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">No products found</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Try adjusting your search or filters</p>
            </div>
        );
    }

    return (
        <div className="pb-10">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Store Inventory</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {items.map((p) => (
                    <div
                        key={p._id}
                        onClick={() => navigate(`/product/${p._id}`)}
                        className="group relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-300 flex flex-col cursor-pointer overflow-hidden"
                    >
                        {/* Image Container with Badge */}
                        <div className="relative aspect-[4/5] overflow-hidden bg-slate-100 dark:bg-slate-700">
                            <div className="absolute top-3 left-3 z-10">
                                <span className="px-2 py-0.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur text-[10px] font-bold uppercase tracking-wider text-slate-900 dark:text-white rounded shadow-sm">
                                    {p.category}
                                </span>
                            </div>

                            <img
                                src={p.image || "https://via.placeholder.com/300?text=No+Image"}
                                alt={p.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                            />
                        </div>

                        {/* Content */}
                        <div className="p-4 flex flex-col flex-grow">
                            <div className="mb-2">
                                <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-tight mb-1 line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                    {p.name}
                                </h3>
                                {/* Star Ratings */}
                                <StaticStars rating={p.averageRating} numReviews={p.numReviews} />
                            </div>

                            <div className="mt-auto pt-3 border-t border-slate-50 dark:border-slate-700/50 flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-400 font-bold uppercase">Price</span>
                                    <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                                        Rs. {p.price?.toLocaleString()}
                                    </span>
                                </div>
                                <button
                                    onClick={(e) => handleAddToCart(e, p._id)}
                                    className="w-full py-2.5 bg-emerald-950 text-white dark:bg-white dark:text-emerald-950 text-xs font-bold rounded-xl hover:bg-emerald-600 dark:hover:bg-emerald-400 hover:text-white dark:hover:text-emerald-950 transition-all shadow-lg shadow-emerald-900/10 active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center items-center gap-3 mt-12">
                <button
                    disabled={currentPage === 1}
                    onClick={() => {
                        setCurrentPage(prev => prev - 1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 disabled:opacity-30 transition-all font-medium text-slate-600 dark:text-slate-300"
                >
                    Previous
                </button>

                <div className="flex gap-2">
                    {[...Array(totalPages)].map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                setCurrentPage(idx + 1);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className={`w-10 h-10 rounded-xl font-bold transition-all ${currentPage === idx + 1
                                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                                : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-emerald-400 hover:text-emerald-600"
                                }`}
                        >
                            {idx + 1}
                        </button>
                    ))}
                </div>

                <button
                    disabled={currentPage === totalPages}
                    onClick={() => {
                        setCurrentPage(prev => prev + 1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-30 transition-all font-medium text-slate-600 dark:text-slate-300"
                >
                    Next
                </button>
            </div>
        </div>
    );
}
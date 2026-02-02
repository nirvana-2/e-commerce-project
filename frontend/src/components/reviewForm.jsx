import React, { useState } from 'react';
import axios from 'axios';

const ReviewForm = ({ productId, onReviewPosted }) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (rating === 0) {
            return alert("Please select a star rating!");
        }

        try {
            setIsSubmitting(true);
            const token = localStorage.getItem("token");
            
            // This hits your review submission endpoint
            const res = await axios.post(
                `http://localhost:3000/api/products/${productId}/reviews`,
                { rating, comment },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.success) {
                alert("Review posted successfully!");
                setRating(0);
                setComment("");
                // This triggers the refresh in productDetail.jsx
                if (onReviewPosted) onReviewPosted();
            }
        } catch (err) {
            alert(err.response?.data?.message || "Something went wrong while posting the review.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[30px] shadow-lg border border-gray-50 dark:border-slate-700 transition-colors">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tight">
                Write a Review
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Verified Badge to remind user they are eligible */}
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-xl border border-green-100 dark:border-green-800 flex items-center gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span className="text-[10px] font-black text-green-700 dark:text-green-400 uppercase tracking-widest">
                        Verified Purchase - Eligibility Confirmed
                    </span>
                </div>

                {/* Star Rating Logic */}
                <div>
                    <label className="block text-xs font-black text-gray-400 uppercase mb-3">Your Rating</label>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className={`text-4xl transition-all ${
                                    star <= (hover || rating) ? "text-amber-400 scale-110" : "text-gray-200"
                                } hover:scale-125`}
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHover(star)}
                                onMouseLeave={() => setHover(0)}
                            >
                                ★
                            </button>
                        ))}
                    </div>
                </div>

                {/* Comment Area */}
                <div>
                    <label className="block text-xs font-black text-gray-400 uppercase mb-3">Your Feedback</label>
                    <textarea
                        className="w-full p-5 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all min-h-[150px] dark:text-white text-sm leading-relaxed"
                        placeholder="What did you like or dislike about this product?"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        required
                    />
                </div>

                <button
                    disabled={isSubmitting}
                    type="submit"
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-teal-500/20 transition-all active:scale-95 disabled:bg-gray-300 disabled:shadow-none uppercase tracking-widest text-xs"
                >
                    {isSubmitting ? "Uploading Feedback..." : "Post My Review"}
                </button>
            </form>
        </div>
    );
};

export default ReviewForm;
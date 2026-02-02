import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Products from "./product";
import Cart from "../pages/cart";
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();

  // --- STATE MANAGEMENT ---
  const [allProducts, setAllProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeSubCategory, setActiveSubCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // --- STYLE PERKS STATE ---
  const [userPoints, setUserPoints] = useState(0);
  const [rewardApplied, setRewardApplied] = useState(false);

  const subCategoryMap = {
    clothing: ["shirt", "pants", "hoodies"],
    electronics: ["mobile", "laptop", "accessories"],
    gaming: ["console", "pc components", "games"],
    home: ["kitchen", "furniture", "decor"],
    beauty: ["skincare", "makeup"],
    sports: ["equipment", "shoes"]
  };

  const capitalizeText = (text) => {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  // 1. FETCH USER POINTS & PROFILE
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get("http://localhost:3000/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });

        const points = res.data.user?.rewards?.points || res.data.rewards?.points || 0;
        setUserPoints(points);
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    };
    fetchUserProfile();
  }, []);

  // 2. REWARD TOGGLE LOGIC
  const handleApplyReward = () => {
    if (userPoints < 10) {
      alert(`Minimum 10 points required to redeem. You have ${userPoints}.`);
      return;
    }
    setRewardApplied(!rewardApplied);
  };

  // 3. ESEWA REDIRECT HANDLER
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const esewaData = params.get("data");
    if (esewaData) {
      navigate(`/payment-success?data=${esewaData}`, { replace: true });
    }
  }, [navigate]);

  // 4. SEARCH DEBOUNCE
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // 5. FETCH PRODUCTS
  const fetchData = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      setError(null);

      let url = `http://localhost:3000/api/products?page=${currentPage}&limit=8&search=${debouncedSearch}&sort=${sortOrder}`;
      if (activeCategory !== "all") url += `&category=${activeCategory}`;
      if (activeSubCategory !== "all") url += `&subCategory=${activeSubCategory}`;

      const res = await axios.get(url);
      const products = res.data.products || [];
      const total = res.data.totalPages || 1;

      setAllProducts(Array.isArray(products) ? products : []);
      setTotalPages(total);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, activeCategory, activeSubCategory, debouncedSearch, sortOrder]);

  useEffect(() => {
    fetchData();
    const handleSilentUpdate = () => fetchData(true);
    window.addEventListener("cartUpdated", handleSilentUpdate);
    return () => window.removeEventListener("cartUpdated", handleSilentUpdate);
  }, [fetchData]);

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setActiveSubCategory("all");
    setCurrentPage(1);
    setSearchTerm("");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-20 pb-12 transition-colors duration-300">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl flex items-center justify-between">
            <span className="text-sm font-bold">⚠️ {error}</span>
            <button onClick={() => fetchData()} className="text-xs font-black uppercase underline">Retry</button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 min-w-0">
            {/* Hero Section */}
            <div className="relative mb-6 rounded-[2rem] overflow-hidden bg-emerald-950 shadow-xl isolate">
              {/* Background with noise and gradient overlay */}
              <div className="absolute inset-0 opacity-40 mix-blend-overlay z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-green-900 to-teal-900 opacity-90 z-[-1]"></div>

              {/* Animated Glow Effects */}
              <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
              <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

              <div className="relative z-10 px-5 py-3 md:px-6 md:py-4 flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="max-w-xl">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-emerald-300 text-[9px] font-bold border border-white/10 mb-1.5 uppercase tracking-widest">
                    <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"></span>
                    New Collection
                  </span>
                  <h1 className="text-lg md:text-2xl font-black text-white leading-tight mb-1.5 tracking-tight">
                    Upgrade Your <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-teal-200 to-emerald-200">Lifestyle.</span>
                  </h1>
                  <p className="text-emerald-100/80 text-[10px] mb-2 leading-relaxed max-w-xs font-light">
                    Experience performance & style. Elevate your everyday.
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <button className="px-3 py-1.5 bg-white text-emerald-950 rounded-lg font-black text-[10px] hover:bg-emerald-50 transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-1">
                      Shop Now
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </button>
                    <button className="px-3 py-1.5 bg-white/10 backdrop-blur-md text-white border border-white/10 rounded-lg font-black text-[10px] hover:bg-white/20 transition-all transform hover:-translate-y-0.5 active:scale-95">
                      View Lookbook
                    </button>
                  </div>
                </div>

                {/* Decorative Element / Image Placeholder */}
                <div className="hidden lg:block relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl rotate-6 opacity-30 group-hover:rotate-12 transition-transform duration-500 blur-xl"></div>
                  <div className="relative bg-white/5 backdrop-blur-xl border border-white/20 p-3 rounded-2xl shadow-xl transform transition-transform duration-500 hover:scale-[1.02]">
                    <div className="w-32 h-20 flex items-center justify-center text-white/20 font-black text-xl border-2 border-dashed border-white/20 rounded-xl">
                      FEATURED
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters & Sorting Toolbar */}
            <div className="mb-8">
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-3 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-black/20 transition-all">
                <div className="flex flex-col gap-4">
                  {/* Row 1: Search - Full Width */}
                  <div className="relative w-full group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-slate-400 group-focus-within:text-teal-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-10 pr-3 py-3 bg-slate-100 dark:bg-slate-700/50 border-0 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-teal-500/20 focus:bg-white dark:focus:bg-slate-700 transition-all"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    />
                  </div>

                  {/* Row 2: Categories & Sorting */}
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full">

                    {/* Categories */}
                    <div className="flex-1 overflow-x-auto no-scrollbar flex items-center gap-2 w-full">
                      {["all", ...Object.keys(subCategoryMap)].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => handleCategoryChange(cat)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap active:scale-95 ${activeCategory === cat
                            ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20 dark:bg-white dark:text-slate-900"
                            : "bg-transparent text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50 dark:text-slate-400"
                            }`}
                        >
                          {capitalizeText(cat)}
                        </button>
                      ))}
                    </div>

                    <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden md:block"></div>

                    {/* Sort */}
                    <div className="relative min-w-[140px] w-full md:w-auto">
                      <select
                        value={sortOrder}
                        onChange={(e) => { setSortOrder(e.target.value); setCurrentPage(1); }}
                        className="w-full appearance-none bg-slate-50 dark:bg-slate-700/50 border-0 rounded-xl py-2.5 pl-4 pr-8 text-xs font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-teal-500/20 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        <option value="newest">Newest First</option>
                        <option value="priceLow">Price: Low to High</option>
                        <option value="priceHigh">Price: High to Low</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sub-Category Bar - Animated Expand */}
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${activeCategory !== "all" ? "max-h-20 opacity-100 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700" : "max-h-0 opacity-0 mt-0 pt-0 border-none"}`}>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-[10px] font-black uppercase text-slate-400 self-center mr-2 tracking-wider">Refine:</span>
                    <button
                      onClick={() => { setActiveSubCategory("all"); setCurrentPage(1); }}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${activeSubCategory === "all"
                        ? "bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-700"
                        : "text-slate-500 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                        }`}
                    >
                      All
                    </button>
                    {subCategoryMap[activeCategory]?.map((sub) => (
                      <button
                        key={sub}
                        onClick={() => { setActiveSubCategory(sub); setCurrentPage(1); }}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${activeSubCategory === sub
                          ? "bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-700"
                          : "text-slate-500 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                          }`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="min-h-[400px]">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                  <p className="text-slate-400 font-bold">Syncing Inventory...</p>
                </div>
              ) : (
                <Products items={allProducts} currentPage={currentPage} setCurrentPage={setCurrentPage} totalPages={totalPages} />
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-96">
            <div className="lg:sticky lg:top-24 space-y-4">
              <Cart isSidebar={true} usePoints={rewardApplied} pointsValue={userPoints} />

              <div className="bg-gradient-to-br from-emerald-900 to-green-800 dark:from-emerald-900 dark:to-teal-950 rounded-[24px] p-5 text-white shadow-xl relative overflow-hidden group">
                <div className="relative z-10">
                  <h3 className="text-lg font-black mb-0.5">Style <span className="text-emerald-300">Perks</span></h3>
                  <p className="text-emerald-100/70 text-[10px] mb-3">Redeem points for instant discounts.</p>

                  <div className="bg-white/5 rounded-xl p-3 mb-4 border border-white/10">
                    <p className="text-[9px] font-black uppercase text-emerald-300">Your Wallet</p>
                    <p className="text-2xl font-black">{userPoints} <span className="text-[10px] font-medium text-emerald-100/60">Points</span></p>
                    {userPoints >= 10 && (
                      <p className="text-[9px] mt-0.5 text-emerald-300 font-bold">✨ Worth Rs. {userPoints * 10} Discount</p>
                    )}
                  </div>

                  <button
                    onClick={handleApplyReward}
                    className={`w-full py-2.5 rounded-xl text-xs font-black transition-all active:scale-95 ${rewardApplied
                      ? "bg-emerald-500 text-white shadow-emerald-500/20"
                      : "bg-white text-emerald-900 hover:bg-emerald-50"
                      }`}
                  >
                    {rewardApplied ? "Reward Active ✓" : "Use Points"}
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
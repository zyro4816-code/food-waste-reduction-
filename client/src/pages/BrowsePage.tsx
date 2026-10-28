// client/src/pages/BrowsePage.tsx
import React, { useState, useEffect } from 'react';
import { FoodListing, FoodCategory } from '../types';
import { api } from '../services/api';
import { FoodCard } from '../components/food/FoodCard';
import { RequestModal } from '../components/food/RequestModal';
import { Search, Filter, Utensils, Carrot, Apple, Croissant, Milk, Package, Coffee, RefreshCw } from 'lucide-react';

export const BrowsePage: React.FC = () => {
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [categories, setCategories] = useState<FoodCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const [selectedListing, setSelectedListing] = useState<FoodListing | null>(null);

  const fetchCategories = async () => {
    try {
      const res = await api.getAdminCategories();
      if (res.success && res.categories) {
        setCategories(res.categories);
      }
    } catch (e) {}
  };

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        status: 'available',
        sort: sortBy
      };
      if (searchQuery.trim()) params.q = searchQuery.trim();
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (selectedCity.trim()) params.city = selectedCity.trim();

      const res = await api.getListings(params);
      if (res.success && res.listings) {
        setListings(res.listings);
      }
    } catch (err) {
      console.error('Failed to fetch listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchListings();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, selectedCity, sortBy]);

  const categoryIcons: Record<string, any> = {
    'cooked-meals': Utensils,
    'vegetables': Carrot,
    'fruits': Apple,
    'bakery': Croissant,
    'dairy': Milk,
    'packaged': Package,
    'beverages': Coffee
  };

  return (
    <div className="min-h-screen pt-32 pb-24 bg-saveplate-black px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-10 text-center sm:text-left">
        <span className="text-xs font-mono uppercase tracking-widest text-saveplate-neon">
          Live Food Recovery Directory
        </span>
        <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-white mt-1 mb-3">
          Browse Available Surplus Food
        </h1>
        <p className="text-sm text-saveplate-muted max-w-2xl">
          Discover certified wholesome food listings from local restaurants, organic grocers, and commercial bakeries available for immediate collection.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-6 rounded-3xl bg-saveplate-deep/90 border border-saveplate-border backdrop-blur-2xl shadow-glass mb-10 space-y-5">
        {/* Search & City row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-saveplate-muted absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by meal name, ingredients, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-saveplate-card border border-white/10 text-sm text-white placeholder:text-saveplate-muted/60 focus:outline-none focus:border-saveplate-neon transition-colors"
            />
          </div>

          <div className="md:col-span-3">
            <input
              type="text"
              placeholder="Filter by city (e.g. San Francisco)"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-saveplate-card border border-white/10 text-sm text-white placeholder:text-saveplate-muted/60 focus:outline-none focus:border-saveplate-neon transition-colors"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-saveplate-card border border-white/10 text-sm text-white focus:outline-none focus:border-saveplate-neon transition-colors cursor-pointer"
            >
              <option value="newest" className="bg-saveplate-deep">Sort: Newest First</option>
              <option value="ending_soon" className="bg-saveplate-deep">Sort: Ending Soonest</option>
              <option value="servings_desc" className="bg-saveplate-deep">Sort: Most Servings</option>
              <option value="quantity_desc" className="bg-saveplate-deep">Sort: Largest Quantity</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-saveplate-neon text-black shadow-neon'
                : 'bg-white/5 text-saveplate-cream hover:bg-white/10 border border-white/10'
            }`}
          >
            All Categories
          </button>

          {categories.map((cat) => {
            const Icon = categoryIcons[cat.slug] || Utensils;
            const active = selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  active
                    ? 'bg-saveplate-neon text-black shadow-neon'
                    : 'bg-white/5 text-saveplate-cream hover:bg-white/10 border border-white/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Food Listings Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-96 rounded-3xl bg-white/5 animate-pulse border border-white/10" />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-24 rounded-3xl bg-saveplate-deep/50 border border-white/10 p-8">
          <Utensils className="w-12 h-12 text-saveplate-muted mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-display font-bold text-white mb-2">No listings found</h3>
          <p className="text-xs text-saveplate-muted max-w-md mx-auto mb-6">
            We couldn't find any surplus listings matching your filters. Try clearing filters or check back shortly.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedCity('');
            }}
            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((item) => (
            <FoodCard
              key={item.id}
              listing={item}
              onRequest={(listing) => setSelectedListing(listing)}
            />
          ))}
        </div>
      )}

      {/* Request Modal */}
      <RequestModal
        listing={selectedListing}
        onClose={() => setSelectedListing(null)}
        onSuccess={() => {
          fetchListings();
        }}
      />
    </div>
  );
};


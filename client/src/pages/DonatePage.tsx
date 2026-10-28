// client/src/pages/DonatePage.tsx
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FoodListing, FoodCategory, FoodRequest } from '../types';
import {
  PlusCircle,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  MapPin,
  Utensils,
  Image,
  ChevronRight,
  ShieldCheck,
  Package,
  Layers,
  XCircle,
  Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DonatePage: React.FC = () => {
  const { user, isAuthenticated, isDonor, isAdmin } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create');
  const [categories, setCategories] = useState<FoodCategory[]>([]);
  const [myListings, setMyListings] = useState<FoodListing[]>([]);
  const [donorRequests, setDonorRequests] = useState<FoodRequest[]>([]);
  const [loadingListings, setLoadingListings] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('1');
  const [quantity, setQuantity] = useState('20');
  const [unit, setUnit] = useState('meals');
  const [servings, setServings] = useState('20');
  const [prepTime, setPrepTime] = useState('');
  const [expiryTime, setExpiryTime] = useState('');
  const [pickupDeadline, setPickupDeadline] = useState('');
  const [storage, setStorage] = useState('Refrigerated (2°C - 4°C)');
  const [allergens, setAllergens] = useState('None');
  const [pickupAddress, setPickupAddress] = useState(user?.address || '452 Organic Way');
  const [city, setCity] = useState(user?.city || 'San Francisco');
  const [postalCode, setPostalCode] = useState(user?.postalCode || '94107');
  const [contactPhone, setContactPhone] = useState(user?.phone || '+1-555-234-5678');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // High-res realistic photo presets for rapid listing
  const photoPresets = [
    { label: 'Gourmet Meal Boxes', url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=80' },
    { label: 'Fresh Vegetables Crates', url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=80' },
    { label: 'Artisan Sourdough Loaves', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1000&q=80' },
    { label: 'Seasonal Fresh Fruits', url: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=1000&q=80' },
    { label: 'Warm Soups & Stews', url: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=80' },
    { label: 'Dry Pantry & Pasta', url: 'https://images.unsplash.com/photo-1621996346565-e3d5d62817cc?auto=format&fit=crop&w=1000&q=80' }
  ];

  useEffect(() => {
    // Set default pickup deadline to 6 hours from now
    const now = new Date();
    now.setHours(now.getHours() + 8);
    const deadlineStr = now.toISOString().slice(0, 16);
    setPickupDeadline(deadlineStr);

    // Fetch categories
    api.getAdminCategories()
      .then((res) => {
        if (res.success && res.categories) setCategories(res.categories);
      })
      .catch(() => {});
  }, []);

  const loadDonorData = async () => {
    if (!isAuthenticated) return;
    setLoadingListings(true);
    try {
      const [listRes, reqRes] = await Promise.all([
        api.getMyListings(),
        api.getDonorRequests()
      ]);
      if (listRes.success) setMyListings(listRes.listings || []);
      if (reqRes.success) setDonorRequests(reqRes.requests || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingListings(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadDonorData();
    }
  }, [isAuthenticated, activeTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !quantity || !pickupDeadline || !pickupAddress || !city || !contactPhone) {
      toast.error('Please complete all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category_id', categoryId);
      formData.append('quantity', quantity);
      formData.append('unit', unit);
      formData.append('estimated_servings', servings);
      if (prepTime) formData.append('prep_time', prepTime);
      if (expiryTime) formData.append('expiry_time', expiryTime);
      formData.append('pickup_deadline', pickupDeadline);
      formData.append('storage_instructions', storage);
      formData.append('allergens', allergens);
      formData.append('pickup_address', pickupAddress);
      formData.append('city', city);
      formData.append('postal_code', postalCode);
      formData.append('contact_phone', contactPhone);

      if (imageFile) {
        formData.append('image', imageFile);
      } else if (imageUrl) {
        formData.append('primary_image_url', imageUrl);
      }

      const res = await api.createListing(formData);
      if (res.success) {
        toast.success('Food donation listing successfully published!');
        setTitle('');
        setDescription('');
        setImageUrl('');
        setImageFile(null);
        setActiveTab('manage');
        loadDonorData();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to publish listing.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (requestId: number, newStatus: string) => {
    try {
      const res = await api.updateRequestStatus(requestId, {
        status: newStatus,
        donor_notes: `Marked as ${newStatus} by donor`
      });
      if (res.success) {
        toast.success(`Request marked as ${newStatus}!`);
        loadDonorData();
      }
    } catch (err: any) {
      toast.error(err.message || 'Status update failed.');
    }
  };

  const handleCloseListing = async (listingId: number) => {
    if (!window.confirm('Are you sure you want to close this listing?')) return;
    try {
      await api.deleteListing(listingId);
      toast.success('Listing closed.');
      loadDonorData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to close listing.');
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-24 bg-saveplate-black px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="mb-10 text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-saveplate-neon">
            Donor Surplus Management
          </span>
          <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-white mt-1 mb-2">
            Donate Surplus Food
          </h1>
          <p className="text-sm text-saveplate-muted max-w-2xl">
            Prevent edible food from reaching landfills. List your extra conference trays, bakery loaves, or wholesale produce for local recovery.
          </p>
        </div>

        {/* Tab switcher */}
        {isAuthenticated && (
          <div className="inline-flex p-1.5 rounded-2xl bg-saveplate-deep border border-white/10 shrink-0">
            <button
              onClick={() => setActiveTab('create')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'create'
                  ? 'bg-saveplate-neon text-black shadow-neon'
                  : 'text-saveplate-muted hover:text-white'
              }`}
            >
              Post New Listing
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'manage'
                  ? 'bg-saveplate-neon text-black shadow-neon'
                  : 'text-saveplate-muted hover:text-white'
              }`}
            >
              My Listings & Requests ({myListings.length})
            </button>
          </div>
        )}
      </div>

      {!isAuthenticated ? (
        /* Unauthenticated Prompt */
        <div className="p-8 sm:p-12 rounded-3xl bg-saveplate-deep/80 border border-white/10 text-center max-w-xl mx-auto">
          <Utensils className="w-12 h-12 text-saveplate-neon mx-auto mb-4" />
          <h2 className="text-2xl font-display font-bold text-white mb-2">
            Sign In to Donate Surplus Food
          </h2>
          <p className="text-sm text-saveplate-muted mb-6">
            Join restaurants, commercial grocers, and event caterers redirecting thousands of kilograms of wholesome nourishment.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/login"
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-6 py-3 rounded-xl bg-saveplate-neon text-black font-bold text-xs shadow-neon"
            >
              Register Donor Account
            </Link>
          </div>
        </div>
      ) : activeTab === 'create' ? (
        /* CREATE LISTING FORM */
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Food Details */}
          <div className="p-6 sm:p-10 rounded-3xl bg-saveplate-deep/90 border border-saveplate-border backdrop-blur-2xl shadow-glass space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-xl font-display font-bold text-white">1. Food Information</h2>
              <p className="text-xs text-saveplate-muted">Describe the surplus food accurately.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Title */}
              <div className="md:col-span-8">
                <label className="block text-xs font-semibold text-saveplate-cream mb-2">
                  Food Listing Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Artisan Roasted Mediterranean Vegetable & Grain Bowls"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-saveplate-card border border-white/15 text-sm text-white focus:outline-none focus:border-saveplate-neon"
                />
              </div>

              {/* Category */}
              <div className="md:col-span-4">
                <label className="block text-xs font-semibold text-saveplate-cream mb-2">
                  Category *
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-saveplate-card border border-white/15 text-sm text-white focus:outline-none focus:border-saveplate-neon cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id} className="bg-saveplate-deep">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="md:col-span-12">
                <label className="block text-xs font-semibold text-saveplate-cream mb-2">
                  Detailed Description *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Specify preparation ingredients, sealed packaging, state of freshness, and handling background..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-saveplate-card border border-white/15 text-sm text-white focus:outline-none focus:border-saveplate-neon resize-none"
                />
              </div>

              {/* Quantity, Unit, Servings */}
              <div className="md:col-span-4">
                <label className="block text-xs font-semibold text-saveplate-cream mb-2">
                  Quantity *
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-saveplate-card border border-white/15 text-sm text-white focus:outline-none focus:border-saveplate-neon"
                />
              </div>

              <div className="md:col-span-4">
                <label className="block text-xs font-semibold text-saveplate-cream mb-2">
                  Unit of Measurement *
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-saveplate-card border border-white/15 text-sm text-white focus:outline-none focus:border-saveplate-neon cursor-pointer"
                >
                  <option value="meals" className="bg-saveplate-deep">Prepared Meals</option>
                  <option value="kg" className="bg-saveplate-deep">Kilograms (kg)</option>
                  <option value="boxes" className="bg-saveplate-deep">Boxes / Crates</option>
                  <option value="loaves" className="bg-saveplate-deep">Loaves</option>
                  <option value="portions" className="bg-saveplate-deep">Portions</option>
                  <option value="packets" className="bg-saveplate-deep">Sealed Packets</option>
                </select>
              </div>

              <div className="md:col-span-4">
                <label className="block text-xs font-semibold text-saveplate-cream mb-2">
                  Estimated Servings (~People Fed)
                </label>
                <input
                  type="number"
                  min="1"
                  value={servings}
                  onChange={(e) => setServings(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-saveplate-card border border-white/15 text-sm text-white focus:outline-none focus:border-saveplate-neon"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Storage, Safety & Deadlines */}
          <div className="p-6 sm:p-10 rounded-3xl bg-saveplate-deep/90 border border-saveplate-border backdrop-blur-2xl shadow-glass space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-xl font-display font-bold text-white">2. Safety, Storage & Deadlines</h2>
              <p className="text-xs text-saveplate-muted">Accurate cold-chain specifications protect recipients.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Pickup Deadline */}
              <div className="md:col-span-6">
                <label className="block text-xs font-semibold text-saveplate-cream mb-2">
                  Strict Pickup Deadline *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={pickupDeadline}
                  onChange={(e) => setPickupDeadline(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-saveplate-card border border-white/15 text-sm text-white focus:outline-none focus:border-saveplate-neon"
                />
              </div>

              {/* Storage Requirements */}
              <div className="md:col-span-6">
                <label className="block text-xs font-semibold text-saveplate-cream mb-2">
                  Storage Protocol *
                </label>
                <select
                  value={storage}
                  onChange={(e) => setStorage(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-saveplate-card border border-white/15 text-sm text-white focus:outline-none focus:border-saveplate-neon cursor-pointer"
                >
                  <option value="Refrigerated (2°C - 4°C)" className="bg-saveplate-deep">Refrigerated (2°C - 4°C)</option>
                  <option value="Frozen (-18°C or below)" className="bg-saveplate-deep">Frozen (-18°C or below)</option>
                  <option value="Keep in cool, dry pantry" className="bg-saveplate-deep">Keep in cool, dry pantry</option>
                  <option value="Hot-held (>65°C) — immediate pickup" className="bg-saveplate-deep">Hot-held (&gt;65°C) — immediate pickup</option>
                </select>
              </div>

              {/* Allergen Information */}
              <div className="md:col-span-12">
                <label className="block text-xs font-semibold text-saveplate-cream mb-2">
                  Allergen Disclosures *
                </label>
                <input
                  type="text"
                  placeholder="E.g., Contains Gluten, Tree Nuts, Dairy, Shellfish, or 'None'"
                  value={allergens}
                  onChange={(e) => setAllergens(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-saveplate-card border border-white/15 text-sm text-white focus:outline-none focus:border-saveplate-neon"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Food Photography & Visuals */}
          <div className="p-6 sm:p-10 rounded-3xl bg-saveplate-deep/90 border border-saveplate-border backdrop-blur-2xl shadow-glass space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-xl font-display font-bold text-white">3. Food Photography</h2>
              <p className="text-xs text-saveplate-muted">Select a high-resolution preset or upload actual container photographs.</p>
            </div>

            {/* Curated Presets Selection */}
            <div>
              <label className="block text-xs font-semibold text-saveplate-cream mb-3">
                Quick Select Realistic Photography Preset:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {photoPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setImageUrl(preset.url);
                      setImageFile(null);
                    }}
                    className={`relative rounded-xl overflow-hidden h-24 border text-left p-2 flex flex-col justify-end transition-all ${
                      imageUrl === preset.url
                        ? 'border-saveplate-neon ring-2 ring-saveplate-neon/40 scale-105'
                        : 'border-white/10 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.label}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <span className="relative z-10 text-[10px] font-bold text-white leading-tight">
                      {preset.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom File Upload */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-saveplate-cream mb-2">
                Or Upload Photograph from Device:
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setImageFile(e.target.files[0]);
                    setImageUrl('');
                  }
                }}
                className="w-full text-xs text-saveplate-muted file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-saveplate-neon file:text-black hover:file:bg-[#32e012] file:cursor-pointer"
              />
            </div>
          </div>

          {/* Section 4: Pickup Logistics & Location */}
          <div className="p-6 sm:p-10 rounded-3xl bg-saveplate-deep/90 border border-saveplate-border backdrop-blur-2xl shadow-glass space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-xl font-display font-bold text-white">4. Pickup Location & Logistics</h2>
              <p className="text-xs text-saveplate-muted">Where the recipient or NGO delivery vehicle should collect the items.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-8">
                <label className="block text-xs font-semibold text-saveplate-cream mb-2">
                  Pickup Street Address *
                </label>
                <input
                  type="text"
                  required
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-saveplate-card border border-white/15 text-sm text-white focus:outline-none focus:border-saveplate-neon"
                />
              </div>

              <div className="md:col-span-4">
                <label className="block text-xs font-semibold text-saveplate-cream mb-2">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-saveplate-card border border-white/15 text-sm text-white focus:outline-none focus:border-saveplate-neon"
                />
              </div>

              <div className="md:col-span-6">
                <label className="block text-xs font-semibold text-saveplate-cream mb-2">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-saveplate-card border border-white/15 text-sm text-white focus:outline-none focus:border-saveplate-neon"
                />
              </div>

              <div className="md:col-span-6">
                <label className="block text-xs font-semibold text-saveplate-cream mb-2">
                  Direct Contact Telephone *
                </label>
                <input
                  type="text"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-saveplate-card border border-white/15 text-sm text-white focus:outline-none focus:border-saveplate-neon"
                />
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex justify-end gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="px-10 py-4 rounded-2xl font-display font-bold text-base bg-saveplate-neon text-black hover:bg-[#32e012] transition-all shadow-neon hover:shadow-neon-strong active:scale-95 disabled:opacity-50"
            >
              {submitting ? 'Publishing Food Listing...' : 'Publish Surplus Food Listing'}
            </button>
          </div>
        </form>
      ) : (
        /* MANAGE MY LISTINGS & REQUESTS TAB */
        <div className="space-y-12">
          {/* Active Listings Table */}
          <div className="p-6 sm:p-8 rounded-3xl bg-saveplate-deep/90 border border-saveplate-border backdrop-blur-2xl shadow-glass">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-display font-bold text-white">Your Listed Surplus</h2>
                <p className="text-xs text-saveplate-muted">Manage active listings, quantities, and status.</p>
              </div>
              <button
                onClick={() => setActiveTab('create')}
                className="px-4 py-2 rounded-xl bg-saveplate-neon text-black font-bold text-xs shadow-neon flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>New Listing</span>
              </button>
            </div>

            {loadingListings ? (
              <p className="text-xs text-saveplate-muted py-8 text-center">Loading your food listings...</p>
            ) : myListings.length === 0 ? (
              <p className="text-xs text-saveplate-muted py-8 text-center">You have not posted any food listings yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-white/10 text-saveplate-muted uppercase font-mono text-[10px]">
                    <tr>
                      <th className="py-3 px-3">Food Item</th>
                      <th className="py-3 px-3">Available</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3">Pickup Deadline</th>
                      <th className="py-3 px-3">Requests</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {myListings.map((item) => (
                      <tr key={item.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 px-3">
                          <div className="font-semibold text-white">{item.title}</div>
                          <div className="text-[11px] text-saveplate-muted">{item.category_name}</div>
                        </td>
                        <td className="py-3.5 px-3 font-mono font-bold text-saveplate-neon">
                          {item.remaining_quantity} / {item.initial_quantity} {item.unit}
                        </td>
                        <td className="py-3.5 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                            item.status === 'available'
                              ? 'bg-saveplate-neon/20 text-saveplate-neon'
                              : item.status === 'partially_claimed'
                              ? 'bg-amber-400/20 text-amber-300'
                              : 'bg-white/10 text-saveplate-muted'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-saveplate-cream">
                          {new Date(item.pickup_deadline).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-3 text-white">
                          {item.total_requests || 0} ({item.pending_requests || 0} pending)
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          {item.status !== 'closed' && (
                            <button
                              onClick={() => handleCloseListing(item.id)}
                              className="px-3 py-1 rounded-lg bg-red-950/40 text-red-400 hover:bg-red-900/60 text-[11px] transition-colors"
                            >
                              Close Listing
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Incoming Food Requests */}
          <div className="p-6 sm:p-8 rounded-3xl bg-saveplate-deep/90 border border-saveplate-border backdrop-blur-2xl shadow-glass">
            <h2 className="text-xl font-display font-bold text-white mb-1">Incoming Recipient Requests</h2>
            <p className="text-xs text-saveplate-muted mb-6">Review requests from verified shelters and recipients, approve allocations, and confirm pickups.</p>

            {donorRequests.length === 0 ? (
              <p className="text-xs text-saveplate-muted py-8 text-center">No incoming requests at the moment.</p>
            ) : (
              <div className="space-y-4">
                {donorRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-5 rounded-2xl bg-saveplate-card border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-white text-sm">{req.recipient_name}</span>
                        {req.recipient_org && (
                          <span className="text-xs text-saveplate-neon font-medium">({req.recipient_org})</span>
                        )}
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-white/10 text-saveplate-muted">
                          {req.recipient_role}
                        </span>
                      </div>

                      <div className="text-xs text-saveplate-cream mb-1">
                        Requested: <span className="font-bold text-saveplate-neon">{req.requested_quantity} {req.unit}</span> for "{req.listing_title}"
                      </div>

                      {req.recipient_notes && (
                        <p className="text-xs text-saveplate-muted italic mt-1">"{req.recipient_notes}"</p>
                      )}

                      {req.verification_code && req.status === 'ready_for_pickup' && (
                        <div className="mt-2 text-xs font-mono font-bold text-saveplate-neon">
                          Verification Code: {req.verification_code}
                        </div>
                      )}
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-xl text-xs font-bold uppercase tracking-wider ${
                        req.status === 'pending'
                          ? 'bg-amber-400/20 text-amber-300'
                          : req.status === 'approved'
                          ? 'bg-blue-400/20 text-blue-300'
                          : req.status === 'ready_for_pickup'
                          ? 'bg-saveplate-neon/20 text-saveplate-neon'
                          : req.status === 'completed'
                          ? 'bg-emerald-400/20 text-emerald-300'
                          : 'bg-white/10 text-saveplate-muted'
                      }`}>
                        {req.status}
                      </span>

                      {req.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(req.id, 'approved')}
                            className="px-3 py-1.5 rounded-xl bg-saveplate-neon text-black font-bold text-xs"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(req.id, 'rejected')}
                            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs"
                          >
                            Decline
                          </button>
                        </>
                      )}

                      {req.status === 'approved' && (
                        <button
                          onClick={() => handleUpdateStatus(req.id, 'ready_for_pickup')}
                          className="px-3 py-1.5 rounded-xl bg-saveplate-neon text-black font-bold text-xs"
                        >
                          Mark Ready for Pickup
                        </button>
                      )}

                      {req.status === 'ready_for_pickup' && (
                        <button
                          onClick={() => handleUpdateStatus(req.id, 'completed')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-400 text-black font-bold text-xs shadow-neon"
                        >
                          Confirm Handover & Complete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};


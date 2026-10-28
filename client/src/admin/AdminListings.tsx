// client/src/admin/AdminListings.tsx
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { FoodListing } from '../types';
import { Search, Filter, Check, X, Clock, MapPin, Eye, AlertTriangle } from 'lucide-react';

export const AdminListings: React.FC = () => {
  const toast = useToast();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedModeration, setSelectedModeration] = useState('all');

  const [selectedListing, setSelectedListing] = useState<any | null>(null);
  const [modNotes, setModNotes] = useState('');

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (searchQuery.trim()) params.q = searchQuery.trim();
      if (selectedStatus !== 'all') params.status = selectedStatus;
      if (selectedModeration !== 'all') params.moderation = selectedModeration;

      const res = await api.getAdminListings(params);
      if (res.success && res.listings) {
        setListings(res.listings);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchListings();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedStatus, selectedModeration]);

  const handleModerate = async (id: number, modStatus: 'approved' | 'rejected') => {
    const reason = prompt(`Enter reason for ${modStatus.toUpperCase()}:`, modStatus === 'approved' ? 'Food safety & hygiene requirements verified.' : 'Missing proper cold-chain transport parameters.');
    if (reason === null) return;

    try {
      const res = await api.moderateListing(id, {
        moderation_status: modStatus,
        moderation_notes: reason,
        status: modStatus === 'approved' ? 'available' : 'rejected'
      });
      if (res.success) {
        toast.success(`Listing ${modStatus} successfully.`);
        fetchListings();
      }
    } catch (err: any) {
      toast.error(err.message || 'Moderation action failed.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-white">Food Listing Moderation</h2>
        <p className="text-xs text-saveplate-muted">
          Review, approve, or reject surplus food listings for compliance with safety standards.
        </p>
      </div>

      {/* Filter Row */}
      <div className="p-4 rounded-2xl bg-saveplate-deep/90 border border-white/10 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-saveplate-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search food title, city, donor org..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-saveplate-card border border-white/10 text-xs text-white focus:outline-none focus:border-saveplate-neon"
          />
        </div>

        <select
          value={selectedModeration}
          onChange={(e) => setSelectedModeration(e.target.value)}
          className="px-3 py-2 rounded-xl bg-saveplate-card border border-white/10 text-xs text-white focus:outline-none focus:border-saveplate-neon cursor-pointer"
        >
          <option value="all" className="bg-saveplate-deep">All Moderation States</option>
          <option value="approved" className="bg-saveplate-deep">Approved</option>
          <option value="pending_review" className="bg-saveplate-deep">Pending Review</option>
          <option value="rejected" className="bg-saveplate-deep">Rejected</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 rounded-xl bg-saveplate-card border border-white/10 text-xs text-white focus:outline-none focus:border-saveplate-neon cursor-pointer"
        >
          <option value="all" className="bg-saveplate-deep">All Lifecycle Statuses</option>
          <option value="available" className="bg-saveplate-deep">Available</option>
          <option value="partially_claimed" className="bg-saveplate-deep">Partially Claimed</option>
          <option value="fully_claimed" className="bg-saveplate-deep">Fully Claimed</option>
          <option value="expired" className="bg-saveplate-deep">Expired</option>
          <option value="closed" className="bg-saveplate-deep">Closed</option>
        </select>
      </div>

      {/* Listings Table */}
      <div className="rounded-3xl bg-saveplate-deep/90 border border-saveplate-border backdrop-blur-2xl shadow-glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-saveplate-forest/30 text-saveplate-muted uppercase font-mono text-[10px]">
              <tr>
                <th className="py-3 px-4">Food Item & Category</th>
                <th className="py-3 px-4">Donor / Location</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Pickup Deadline</th>
                <th className="py-3 px-4">Moderation</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-saveplate-muted">
                    Loading listings...
                  </td>
                </tr>
              ) : listings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-saveplate-muted">
                    No food listings match current filters.
                  </td>
                </tr>
              ) : (
                listings.map((l) => (
                  <tr key={l.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{l.title}</div>
                      <div className="text-[11px] text-saveplate-muted">{l.category_name}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-saveplate-cream font-medium">{l.donor_org || l.donor_name}</div>
                      <div className="text-[11px] text-saveplate-muted">{l.city}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-saveplate-neon">
                      {l.remaining_quantity} / {l.initial_quantity} {l.unit}
                    </td>
                    <td className="py-3 px-4 text-saveplate-cream text-[11px]">
                      {new Date(l.pickup_deadline).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                        l.moderation_status === 'approved'
                          ? 'bg-saveplate-neon/20 text-saveplate-neon'
                          : l.moderation_status === 'pending_review'
                          ? 'bg-amber-400/20 text-amber-300 animate-pulse'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {l.moderation_status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold bg-white/10 text-saveplate-muted">
                        {l.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5">
                      {l.moderation_status !== 'approved' && (
                        <button
                          onClick={() => handleModerate(l.id, 'approved')}
                          className="px-2.5 py-1 rounded-lg bg-saveplate-neon text-black font-bold text-[11px] hover:bg-[#32e012] transition-colors"
                          title="Approve Listing"
                        >
                          Approve
                        </button>
                      )}
                      {l.moderation_status !== 'rejected' && (
                        <button
                          onClick={() => handleModerate(l.id, 'rejected')}
                          className="px-2.5 py-1 rounded-lg bg-red-950/40 text-red-400 hover:bg-red-900/60 text-[11px] transition-colors"
                          title="Reject Listing"
                        >
                          Reject
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


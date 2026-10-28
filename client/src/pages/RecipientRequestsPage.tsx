// client/src/pages/RecipientRequestsPage.tsx
import React, { useState, useEffect } from 'react';
import { FoodRequest } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Package, Clock, MapPin, Phone, QrCode, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export const RecipientRequestsPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();

  const [requests, setRequests] = useState<FoodRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await api.getMyRequests();
      if (res.success && res.requests) {
        setRequests(res.requests);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [isAuthenticated]);

  const handleCancel = async (id: number) => {
    if (!window.confirm('Are you sure you want to cancel this food request?')) return;
    try {
      const res = await api.updateRequestStatus(id, {
        status: 'cancelled',
        donor_notes: 'Cancelled by recipient'
      });
      if (res.success) {
        toast.info('Request cancelled.');
        fetchRequests();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel request.');
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-24 bg-saveplate-black px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div className="mb-10 text-center sm:text-left">
        <span className="text-xs font-mono uppercase tracking-widest text-saveplate-neon">
          Collection & Handover Logistics
        </span>
        <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-white mt-1 mb-2">
          My Food Requests
        </h1>
        <p className="text-sm text-saveplate-muted max-w-2xl">
          Track the status of your surplus food allocations, view pickup instructions, and present verification codes upon arrival.
        </p>
      </div>

      {!isAuthenticated ? (
        <div className="text-center p-10 rounded-3xl bg-saveplate-deep/80 border border-white/10">
          <p className="text-sm text-saveplate-muted mb-4">Please log in to review your submitted food requests.</p>
          <Link to="/login" className="px-6 py-2.5 rounded-xl bg-saveplate-neon text-black font-bold text-xs">
            Log In
          </Link>
        </div>
      ) : loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-3xl bg-white/5 animate-pulse border border-white/10" />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-20 rounded-3xl bg-saveplate-deep/40 border border-white/10 p-8">
          <Package className="w-12 h-12 text-saveplate-muted mx-auto mb-3 opacity-60" />
          <h3 className="text-lg font-bold text-white mb-1">No Active Food Requests</h3>
          <p className="text-xs text-saveplate-muted mb-6">
            You haven't requested any surplus food yet. Browse available meals from local donors.
          </p>
          <Link
            to="/browse"
            className="px-6 py-3 rounded-xl bg-saveplate-neon text-black font-bold text-xs shadow-neon"
          >
            Find Food to Rescue
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {requests.map((req) => (
            <div
              key={req.id}
              className="p-6 rounded-3xl bg-saveplate-deep/90 border border-saveplate-border backdrop-blur-xl shadow-glass flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              {/* Left Column: Details */}
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    req.status === 'pending'
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                      : req.status === 'approved'
                      ? 'bg-blue-400/20 text-blue-300 border border-blue-400/30'
                      : req.status === 'ready_for_pickup'
                      ? 'bg-saveplate-neon/20 text-saveplate-neon border border-saveplate-neon/40 shadow-neon'
                      : req.status === 'completed'
                      ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30'
                      : 'bg-white/10 text-saveplate-muted border border-white/10'
                  }`}>
                    {req.status.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs text-saveplate-muted">
                    Requested on {new Date(req.created_at).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-xl font-display font-bold text-white">
                  {req.listing_title}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-saveplate-cream/80">
                  <div className="flex items-center gap-2">
                    <span className="text-saveplate-muted">Reserved Amount:</span>
                    <span className="font-bold text-saveplate-neon">{req.requested_quantity} {req.unit}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-saveplate-muted">Donor:</span>
                    <span className="text-white font-medium">{req.donor_org || req.donor_name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:col-span-2">
                    <MapPin className="w-3.5 h-3.5 text-saveplate-neon shrink-0" />
                    <span>{req.pickup_address}, {req.city}</span>
                  </div>
                  {req.donor_phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-saveplate-neon shrink-0" />
                      <span>{req.donor_phone}</span>
                    </div>
                  )}
                  {req.pickup_deadline && (
                    <div className="flex items-center gap-1.5 text-amber-300">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>Deadline: {new Date(req.pickup_deadline).toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {req.donor_notes && (
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-saveplate-muted">
                    <span className="text-saveplate-neon font-semibold">Donor Note: </span>
                    {req.donor_notes}
                  </div>
                )}
              </div>

              {/* Right Column: Verification Code & QR Handoff */}
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-saveplate-forest/30 border border-white/10 min-w-[200px] text-center">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-saveplate-neon mb-2">
                  <QrCode className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-saveplate-muted mb-1">
                  Pickup Handover Code
                </span>
                <span className="text-2xl font-mono font-black text-saveplate-neon tracking-wider mb-2">
                  {req.verification_code || 'PENDING'}
                </span>

                {req.status === 'pending' && (
                  <button
                    onClick={() => handleCancel(req.id)}
                    className="text-[11px] text-red-400 hover:text-red-300 transition-colors mt-2"
                  >
                    Cancel Request
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


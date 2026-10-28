// client/src/admin/AdminDonations.tsx
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { PackageCheck, Clock, MapPin, User, Search, Filter } from 'lucide-react';

export const AdminDonations: React.FC = () => {
  const toast = useToast();
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await api.getAdminDonations(params);
      if (res.success && res.donations) {
        setDonations(res.donations);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch donations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-white">Donations & Requests Management</h2>
          <p className="text-xs text-saveplate-muted">
            Trace food handover requests, verify collection codes, and investigate any reported logistics disputes.
          </p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-saveplate-card border border-white/10 text-xs text-white focus:outline-none focus:border-saveplate-neon cursor-pointer"
        >
          <option value="all" className="bg-saveplate-deep">All Lifecycle Statuses</option>
          <option value="pending" className="bg-saveplate-deep">Pending</option>
          <option value="approved" className="bg-saveplate-deep">Approved</option>
          <option value="ready_for_pickup" className="bg-saveplate-deep">Ready for Pickup</option>
          <option value="completed" className="bg-saveplate-deep">Completed</option>
          <option value="cancelled" className="bg-saveplate-deep">Cancelled</option>
        </select>
      </div>

      <div className="rounded-3xl bg-saveplate-deep/90 border border-saveplate-border backdrop-blur-2xl shadow-glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-saveplate-forest/30 text-saveplate-muted uppercase font-mono text-[10px]">
              <tr>
                <th className="py-3 px-4">Req # & Date</th>
                <th className="py-3 px-4">Food Item</th>
                <th className="py-3 px-4">Quantity</th>
                <th className="py-3 px-4">Donor Organization</th>
                <th className="py-3 px-4">Recipient</th>
                <th className="py-3 px-4">Verification Code</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-saveplate-muted">
                    Loading records...
                  </td>
                </tr>
              ) : donations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-saveplate-muted">
                    No requests or donation records found.
                  </td>
                </tr>
              ) : (
                donations.map((d) => (
                  <tr key={d.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-saveplate-muted">
                      #{d.id} • {new Date(d.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {d.listing_title}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-saveplate-neon">
                      {d.requested_quantity} {d.unit}
                    </td>
                    <td className="py-3.5 px-4 text-saveplate-cream">
                      {d.donor_org || d.donor_name}
                    </td>
                    <td className="py-3.5 px-4 text-saveplate-cream">
                      {d.recipient_org || d.recipient_name}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-saveplate-neon">
                      {d.verification_code || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                        d.status === 'completed'
                          ? 'bg-emerald-400/20 text-emerald-300'
                          : d.status === 'ready_for_pickup'
                          ? 'bg-saveplate-neon/20 text-saveplate-neon'
                          : d.status === 'approved'
                          ? 'bg-blue-400/20 text-blue-300'
                          : d.status === 'pending'
                          ? 'bg-amber-400/20 text-amber-300'
                          : 'bg-white/10 text-saveplate-muted'
                      }`}>
                        {d.status.replace(/_/g, ' ')}
                      </span>
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


// client/src/admin/AdminOverview.tsx
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Users,
  Utensils,
  PackageCheck,
  Scale,
  CloudSun,
  ShieldAlert,
  Clock,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  Building2,
  CheckCircle2
} from 'lucide-react';

export const AdminOverview: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAdminMetrics()
      .then((res) => {
        if (res.success && res.metrics) {
          setData(res.metrics);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-3xl bg-white/5 animate-pulse border border-white/10" />
          ))}
        </div>
      </div>
    );
  }

  const { users, listings, requests, impact, recentUsers, recentDonations, recentAudit } = data;

  const topCards = [
    {
      title: 'Total Food Rescued',
      value: `${impact.totalKgRescued.toLocaleString()} kg`,
      subtitle: `~${impact.totalServingsRescued.toLocaleString()} meals provided`,
      icon: Scale,
      color: 'text-saveplate-neon',
      bg: 'bg-saveplate-neon/10'
    },
    {
      title: 'Active Food Listings',
      value: listings.active,
      subtitle: `${listings.pending} pending review`,
      icon: Utensils,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10'
    },
    {
      title: 'Completed Donations',
      value: impact.completedDonations,
      subtitle: `${requests.pending} requests awaiting approval`,
      icon: PackageCheck,
      color: 'text-lime-300',
      bg: 'bg-lime-400/10'
    },
    {
      title: 'Platform Users',
      value: users.total,
      subtitle: `${users.donors} donors • ${users.ngos} NGOs`,
      icon: Users,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10'
    }
  ];

  return (
    <div className="space-y-8">
      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {topCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-saveplate-deep/80 border border-white/10 hover:border-saveplate-neon/40 backdrop-blur-xl shadow-glass transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-saveplate-muted uppercase tracking-wider">
                  {card.title}
                </span>
                <div className={`w-9 h-9 rounded-xl ${card.bg} ${card.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-display font-black text-white mb-1">
                {card.value}
              </div>
              <div className="text-xs text-saveplate-muted">
                {card.subtitle}
              </div>
            </div>
          );
        })}
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="p-5 rounded-2xl bg-saveplate-card border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-saveplate-muted block mb-1">Est. CO₂e Emissions Prevented</span>
            <span className="text-xl font-bold font-mono text-emerald-400">
              {impact.estimatedCo2SavedKg.toLocaleString()} kg
            </span>
          </div>
          <CloudSun className="w-8 h-8 text-emerald-400/50" />
        </div>

        <div className="p-5 rounded-2xl bg-saveplate-card border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-saveplate-muted block mb-1">Registered Food Pantries & NGOs</span>
            <span className="text-xl font-bold font-mono text-saveplate-neon">
              {users.ngos} Organizations
            </span>
          </div>
          <Building2 className="w-8 h-8 text-saveplate-neon/50" />
        </div>

        <div className="p-5 rounded-2xl bg-saveplate-card border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-saveplate-muted block mb-1">Account Safety Status</span>
            <span className="text-xl font-bold font-mono text-white">
              {users.suspended} Suspended / {users.total} Total
            </span>
          </div>
          <ShieldAlert className="w-8 h-8 text-purple-400/50" />
        </div>
      </div>

      {/* Tables Section: Recent Donations & Registrations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Donations Table */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-saveplate-deep/90 border border-saveplate-border backdrop-blur-2xl shadow-glass">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-base text-white">Recent Completed Donations</h3>
            <span className="text-[11px] font-mono text-saveplate-neon uppercase tracking-wider">Verified Handovers</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 text-saveplate-muted uppercase font-mono text-[10px]">
                <tr>
                  <th className="py-2.5 px-2">Food Listing</th>
                  <th className="py-2.5 px-2">Rescued</th>
                  <th className="py-2.5 px-2">Donor</th>
                  <th className="py-2.5 px-2">Recipient</th>
                  <th className="py-2.5 px-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentDonations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-saveplate-muted">
                      No completed donations recorded yet.
                    </td>
                  </tr>
                ) : (
                  recentDonations.map((d: any) => (
                    <tr key={d.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-2 font-medium text-white truncate max-w-[150px]">
                        {d.listing_title}
                      </td>
                      <td className="py-3 px-2 font-mono text-saveplate-neon font-bold">
                        {d.quantity} {d.unit}
                      </td>
                      <td className="py-3 px-2 text-saveplate-muted truncate max-w-[100px]">
                        {d.donor_name}
                      </td>
                      <td className="py-3 px-2 text-saveplate-muted truncate max-w-[100px]">
                        {d.recipient_name}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold bg-emerald-500/20 text-emerald-300">
                          {d.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Registrations Table */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-saveplate-deep/90 border border-saveplate-border backdrop-blur-2xl shadow-glass">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-base text-white">Recent Users</h3>
            <span className="text-[11px] font-mono text-saveplate-muted uppercase tracking-wider">New Registrations</span>
          </div>

          <div className="space-y-3">
            {recentUsers.map((u: any) => (
              <div key={u.id} className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-white">{u.full_name || u.email}</div>
                  <div className="text-[11px] text-saveplate-muted">{u.email}</div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-white/10 text-saveplate-neon">
                    {u.role}
                  </span>
                  <div className="text-[10px] text-saveplate-muted mt-1">
                    {new Date(u.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Admin Audit Log Stream */}
      <div className="p-6 rounded-3xl bg-saveplate-deep/90 border border-saveplate-border backdrop-blur-2xl shadow-glass">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-purple-400" />
            <h3 className="font-display font-bold text-base text-white">Recent Security Audit Events</h3>
          </div>
          <span className="text-[11px] font-mono text-purple-400 uppercase tracking-wider">Immutable Event Log</span>
        </div>

        <div className="space-y-2 text-xs">
          {recentAudit.map((log: any) => (
            <div key={log.id} className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 font-mono text-[10px] font-bold">
                  {log.action}
                </span>
                <span className="text-saveplate-cream">{log.details}</span>
              </div>
              <div className="flex items-center gap-4 text-[11px] text-saveplate-muted font-mono shrink-0">
                <span>By: {log.admin_name || 'System Admin'}</span>
                <span>{new Date(log.created_at).toLocaleTimeString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


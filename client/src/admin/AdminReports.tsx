// client/src/admin/AdminReports.tsx
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Download, BarChart3, TrendingUp, Calendar, Trophy } from 'lucide-react';

export const AdminReports: React.FC = () => {
  const toast = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAdminAnalytics()
      .then((res) => {
        if (res.success && res.analytics) {
          setData(res.analytics);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleExportCsv = () => {
    toast.info('Generating official platform CSV report...');
    api.downloadCsvReport();
  };

  const COLORS = ['#39FF14', '#10B981', '#14B8A6', '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899'];

  if (loading || !data) {
    return <p className="text-xs text-saveplate-muted py-12 text-center">Loading analytics reports...</p>;
  }

  const { redistributionTrends, categoryBreakdown, topDonors } = data;

  return (
    <div className="space-y-8">
      {/* Header and CSV Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-white">Reports & Platform Analytics</h2>
          <p className="text-xs text-saveplate-muted">
            Visualize surplus food flow, donor performance rankings, and export verified datasets.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="px-5 py-2.5 rounded-xl bg-saveplate-neon text-black font-display font-bold text-xs shadow-neon hover:bg-[#32e012] transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* Main Chart: Monthly Redistribution Volume */}
      <div className="p-6 rounded-3xl bg-saveplate-deep/90 border border-saveplate-border backdrop-blur-2xl shadow-glass">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-display font-bold text-base text-white">Monthly Surplus Recovery Trends</h3>
            <p className="text-xs text-saveplate-muted">Kilograms of surplus food listed vs. successfully rescued</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-white/70">
              <span className="w-3 h-3 rounded-full bg-saveplate-neon" /> Rescued Food (kg)
            </span>
            <span className="flex items-center gap-1.5 text-white/40">
              <span className="w-3 h-3 rounded-full bg-white/20" /> Listed Surplus (kg)
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={redistributionTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRescued" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#39FF14" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#39FF14" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorListed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffffff" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#ffffff" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="#A6AEA8" fontSize={11} tickLine={false} />
              <YAxis stroke="#A6AEA8" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#071A11', borderColor: '#39FF14', borderRadius: '12px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Area type="monotone" dataKey="listedKg" stroke="#888888" fillOpacity={1} fill="url(#colorListed)" strokeWidth={2} />
              <Area type="monotone" dataKey="rescuedKg" stroke="#39FF14" fillOpacity={1} fill="url(#colorRescued)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Category Breakdown and Top Donors */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Category Breakdown Bar Chart */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-saveplate-deep/90 border border-saveplate-border backdrop-blur-2xl shadow-glass">
          <h3 className="font-display font-bold text-base text-white mb-1">Listings by Category</h3>
          <p className="text-xs text-saveplate-muted mb-6">Distribution of food inventory across taxonomies</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#A6AEA8" fontSize={10} tickLine={false} interval={0} angle={-15} textAnchor="end" height={40} />
                <YAxis stroke="#A6AEA8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#071A11', borderColor: '#39FF14', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="listing_count" fill="#39FF14" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Donors Leaderboard */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-saveplate-deep/90 border border-saveplate-border backdrop-blur-2xl shadow-glass">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-4 h-4 text-saveplate-neon" />
            <h3 className="font-display font-bold text-base text-white">Top Food Donors</h3>
          </div>
          <p className="text-xs text-saveplate-muted mb-6">Highest surplus volume redirected</p>

          <div className="space-y-4">
            {topDonors.map((donor: any, idx: number) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-saveplate-forest border border-saveplate-neon/40 flex items-center justify-center font-bold text-saveplate-neon text-[10px]">
                    #{idx + 1}
                  </span>
                  <div>
                    <div className="font-semibold text-white">{donor.organization_name || donor.full_name}</div>
                    <div className="text-[10px] text-saveplate-muted">{donor.completed_donations} completed handovers</div>
                  </div>
                </div>

                <div className="font-mono font-bold text-saveplate-neon text-right">
                  {donor.total_kg} kg
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};


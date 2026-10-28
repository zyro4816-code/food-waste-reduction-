// client/src/admin/AdminAuditLogs.tsx
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ShieldAlert, Search, Lock, Clock, Terminal } from 'lucide-react';

export const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('all');

  useEffect(() => {
    api.getAdminAuditLogs()
      .then((res) => {
        if (res.success && res.logs) {
          setLogs(res.logs);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filterAction === 'all'
    ? logs
    : logs.filter((l) => l.action.toLowerCase().includes(filterAction.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-purple-400" />
            <h2 className="text-2xl font-display font-bold text-white">Immutable Administrative Audit Logs</h2>
          </div>
          <p className="text-xs text-saveplate-muted mt-1">
            Tamper-resistant security trail recording every privileged action, moderation decision, and account modification.
          </p>
        </div>

        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="px-3 py-2 rounded-xl bg-saveplate-card border border-white/10 text-xs text-white focus:outline-none focus:border-saveplate-neon cursor-pointer"
        >
          <option value="all" className="bg-saveplate-deep">All Audit Actions</option>
          <option value="MODERAT" className="bg-saveplate-deep">Moderation Events</option>
          <option value="USER" className="bg-saveplate-deep">User Profile / Status</option>
          <option value="ORG" className="bg-saveplate-deep">NGO Verifications</option>
          <option value="ADMIN" className="bg-saveplate-deep">Admin Provisioning</option>
        </select>
      </div>

      <div className="rounded-3xl bg-saveplate-deep/90 border border-saveplate-border backdrop-blur-2xl shadow-glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="border-b border-white/10 bg-purple-950/30 text-purple-300 uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Timestamp (UTC)</th>
                <th className="py-3 px-4">Admin Actor</th>
                <th className="py-3 px-4">Action Code</th>
                <th className="py-3 px-4">Target Type & ID</th>
                <th className="py-3 px-4">Audit Details / Reason</th>
                <th className="py-3 px-4 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-saveplate-muted font-sans">
                    Reading immutable audit logs from database...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-saveplate-muted font-sans">
                    No matching audit entries recorded.
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 text-saveplate-muted whitespace-nowrap">
                      {new Date(log.created_at).toISOString().replace('T', ' ').slice(0, 19)}
                    </td>
                    <td className="py-3 px-4 text-white font-sans font-medium">
                      <div>{log.admin_name || 'Central Admin'}</div>
                      <div className="text-[10px] text-saveplate-muted font-mono">{log.admin_email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 font-bold text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-saveplate-cream">
                      {log.target_type}:{log.target_id || 'sys'}
                    </td>
                    <td className="py-3 px-4 text-saveplate-cream font-sans max-w-sm truncate" title={log.details}>
                      {log.details}
                    </td>
                    <td className="py-3 px-4 text-right text-saveplate-muted">
                      {log.ip_address || '127.0.0.1'}
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


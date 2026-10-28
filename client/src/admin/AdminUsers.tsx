// client/src/admin/AdminUsers.tsx
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Search, Filter, ShieldCheck, UserX, UserCheck, Edit3, ShieldAlert } from 'lucide-react';

export const AdminUsers: React.FC = () => {
  const toast = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const [editingUser, setEditingUser] = useState<any | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (searchQuery.trim()) params.q = searchQuery.trim();
      if (selectedRole !== 'all') params.role = selectedRole;
      if (selectedStatus !== 'all') params.status = selectedStatus;

      const res = await api.getAdminUsers(params);
      if (res.success && res.users) {
        setUsers(res.users);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedRole, selectedStatus]);

  const handleToggleStatus = async (user: any) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    const confirmMsg = `Are you sure you want to ${newStatus === 'suspended' ? 'SUSPEND' : 'ACTIVATE'} ${user.email}?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await api.updateAdminUser(user.id, {
        status: newStatus,
        notes: `Admin manually toggled status to ${newStatus}`
      });
      if (res.success) {
        toast.success(`User ${user.email} marked as ${newStatus}.`);
        fetchUsers();
      }
    } catch (err: any) {
      toast.error(err.message || 'Action failed.');
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    if (!window.confirm(`Change role to ${newRole.toUpperCase()}?`)) return;

    try {
      const res = await api.updateAdminUser(userId, {
        role: newRole,
        notes: `Role changed to ${newRole}`
      });
      if (res.success) {
        toast.success('User role updated successfully.');
        setEditingUser(null);
        fetchUsers();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update role.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-white">User Management</h2>
          <p className="text-xs text-saveplate-muted">
            Manage account roles, active statuses, and access permissions across the network.
          </p>
        </div>
      </div>

      {/* Filters row */}
      <div className="p-4 rounded-2xl bg-saveplate-deep/90 border border-white/10 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-saveplate-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search email, name, organization..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-saveplate-card border border-white/10 text-xs text-white focus:outline-none focus:border-saveplate-neon"
          />
        </div>

        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="px-3 py-2 rounded-xl bg-saveplate-card border border-white/10 text-xs text-white focus:outline-none focus:border-saveplate-neon cursor-pointer"
        >
          <option value="all" className="bg-saveplate-deep">All Roles</option>
          <option value="donor" className="bg-saveplate-deep">Donor</option>
          <option value="recipient" className="bg-saveplate-deep">Recipient</option>
          <option value="ngo" className="bg-saveplate-deep">NGO / Food Bank</option>
          <option value="volunteer" className="bg-saveplate-deep">Volunteer</option>
          <option value="admin" className="bg-saveplate-deep">Admin</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 rounded-xl bg-saveplate-card border border-white/10 text-xs text-white focus:outline-none focus:border-saveplate-neon cursor-pointer"
        >
          <option value="all" className="bg-saveplate-deep">All Statuses</option>
          <option value="active" className="bg-saveplate-deep">Active Only</option>
          <option value="suspended" className="bg-saveplate-deep">Suspended</option>
        </select>
      </div>

      {/* Users Data Table */}
      <div className="rounded-3xl bg-saveplate-deep/90 border border-saveplate-border backdrop-blur-2xl shadow-glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-saveplate-forest/30 text-saveplate-muted uppercase font-mono text-[10px]">
              <tr>
                <th className="py-3 px-4">User Details</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Organization / City</th>
                <th className="py-3 px-4">Activity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-saveplate-muted">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-saveplate-muted">
                    No users match current filters.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{u.full_name || 'Unnamed'}</div>
                      <div className="text-[11px] text-saveplate-muted">{u.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                        u.role === 'admin'
                          ? 'bg-purple-950/60 text-purple-300 border border-purple-500/30'
                          : u.role === 'donor'
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                          : u.role === 'ngo'
                          ? 'bg-blue-950/60 text-blue-300 border border-blue-500/30'
                          : 'bg-white/10 text-saveplate-cream'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-saveplate-cream">
                      <div>{u.organization_name || 'Individual'}</div>
                      <div className="text-[11px] text-saveplate-muted">{u.city || 'N/A'}</div>
                    </td>
                    <td className="py-3.5 px-4 text-saveplate-muted">
                      <div>{u.listing_count} listings</div>
                      <div>{u.request_count} requests</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                        u.status === 'active'
                          ? 'bg-saveplate-neon/20 text-saveplate-neon'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      {/* Role selector */}
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="px-2 py-1 rounded bg-saveplate-card border border-white/15 text-[11px] text-white focus:outline-none"
                      >
                        <option value="donor" className="bg-saveplate-deep">donor</option>
                        <option value="recipient" className="bg-saveplate-deep">recipient</option>
                        <option value="ngo" className="bg-saveplate-deep">ngo</option>
                        <option value="volunteer" className="bg-saveplate-deep">volunteer</option>
                        <option value="admin" className="bg-saveplate-deep">admin</option>
                      </select>

                      {/* Suspend / Activate toggle */}
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          u.status === 'active'
                            ? 'bg-red-950/40 text-red-400 hover:bg-red-900/60'
                            : 'bg-saveplate-neon/20 text-saveplate-neon hover:bg-saveplate-neon/30'
                        }`}
                        title={u.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                      >
                        {u.status === 'active' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                      </button>
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


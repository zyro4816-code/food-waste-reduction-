// client/src/pages/AdminPage.tsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AdminLayout } from '../admin/AdminLayout';
import { AdminOverview } from '../admin/AdminOverview';
import { AdminUsers } from '../admin/AdminUsers';
import { AdminListings } from '../admin/AdminListings';
import { AdminDonations } from '../admin/AdminDonations';
import { AdminOrganizations } from '../admin/AdminOrganizations';
import { AdminCategories } from '../admin/AdminCategories';
import { AdminReports } from '../admin/AdminReports';
import { AdminAuditLogs } from '../admin/AdminAuditLogs';
import { AdminInquiries } from '../admin/AdminInquiries';
import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminPage: React.FC = () => {
  const { user, isAuthenticated, isAdmin, loading } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');

  if (loading) {
    return (
      <div className="min-h-screen bg-saveplate-black flex items-center justify-center text-saveplate-muted text-xs">
        Authenticating administrative session...
      </div>
    );
  }

  // Security Gate: Non-admin users are strictly rejected
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen pt-32 pb-20 bg-saveplate-black px-4 flex items-center justify-center">
        <div className="p-8 rounded-3xl bg-saveplate-deep/90 border border-red-500/30 text-center max-w-md shadow-glass">
          <ShieldAlert className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-display font-bold text-white mb-2">Access Restricted</h2>
          <p className="text-xs text-saveplate-muted mb-6">
            The SavePlate Administrator Dashboard requires verified administrative security clearance. Your current role is <span className="text-saveplate-neon font-bold">{user?.role || 'Guest'}</span>.
          </p>
          <div className="flex justify-center gap-3">
            <Link
              to="/login"
              className="px-5 py-2.5 rounded-xl bg-saveplate-neon text-black font-bold text-xs shadow-neon"
            >
              Sign In as Admin
            </Link>
            <Link
              to="/"
              className="px-5 py-2.5 rounded-xl bg-white/10 text-white font-medium text-xs hover:bg-white/20"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout activeSection={activeSection} onSelectSection={setActiveSection}>
      {activeSection === 'overview' && <AdminOverview />}
      {activeSection === 'users' && <AdminUsers />}
      {activeSection === 'listings' && <AdminListings />}
      {activeSection === 'donations' && <AdminDonations />}
      {activeSection === 'organizations' && <AdminOrganizations />}
      {activeSection === 'categories' && <AdminCategories />}
      {activeSection === 'reports' && <AdminReports />}
      {activeSection === 'audit-logs' && <AdminAuditLogs />}
      {activeSection === 'inquiries' && <AdminInquiries />}
    </AdminLayout>
  );
};


// client/src/admin/AdminOrganizations.tsx
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Building2, ShieldCheck, ShieldAlert, Check, X, ExternalLink } from 'lucide-react';

export const AdminOrganizations: React.FC = () => {
  const toast = useToast();
  const [orgs, setOrgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrgs = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminOrganizations();
      if (res.success && res.organizations) {
        setOrgs(res.organizations);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch organizations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgs();
  }, []);

  const handleVerify = async (id: number, status: 'verified' | 'rejected') => {
    const notes = prompt(`Enter verification review note for ${status.toUpperCase()}:`, status === 'verified' ? '501(c)(3) tax exemption and health inspections verified.' : 'Missing formal registration document.');
    if (notes === null) return;

    try {
      const res = await api.verifyOrganization(id, {
        verification_status: status,
        notes
      });
      if (res.success) {
        toast.success(`Organization marked as ${status}!`);
        fetchOrgs();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update organization status.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-white">NGO & Business Verification</h2>
        <p className="text-xs text-saveplate-muted">
          Review legal credentials, non-profit tax exemptions, and health inspection certificates.
        </p>
      </div>

      <div className="rounded-3xl bg-saveplate-deep/90 border border-saveplate-border backdrop-blur-2xl shadow-glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-saveplate-forest/30 text-saveplate-muted uppercase font-mono text-[10px]">
              <tr>
                <th className="py-3 px-4">Organization Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Credentials & Tax ID</th>
                <th className="py-3 px-4">Contact Person / Email</th>
                <th className="py-3 px-4">Verification</th>
                <th className="py-3 px-4 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-saveplate-muted">
                    Loading organizations...
                  </td>
                </tr>
              ) : orgs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-saveplate-muted">
                    No registered organizations found.
                  </td>
                </tr>
              ) : (
                orgs.map((org) => (
                  <tr key={org.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <span>{org.org_name}</span>
                        {org.is_verified === 1 && (
                          <span title="Verified Partner Badge">
                            <ShieldCheck className="w-4 h-4 text-saveplate-neon" />
                          </span>
                        )}
                      </div>
                      {org.website && (
                        <a
                          href={org.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-saveplate-neon/80 hover:underline flex items-center gap-1 mt-0.5"
                        >
                          {org.website} <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </td>
                    <td className="py-3.5 px-4 uppercase font-mono text-[10px] text-saveplate-muted">
                      {org.org_type}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-saveplate-cream">
                      <div>Reg: {org.registration_number || 'Pending submission'}</div>
                      <div className="text-saveplate-muted">Tax/EIN: {org.tax_id || 'Pending'}</div>
                    </td>
                    <td className="py-3.5 px-4 text-saveplate-cream">
                      <div>{org.contact_person || org.full_name}</div>
                      <div className="text-[11px] text-saveplate-muted">{org.contact_email || org.user_email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                        org.is_verified === 1
                          ? 'bg-saveplate-neon/20 text-saveplate-neon'
                          : org.verification_status === 'pending'
                          ? 'bg-amber-400/20 text-amber-300 animate-pulse'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {org.verification_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      {org.verification_status !== 'verified' && (
                        <button
                          onClick={() => handleVerify(org.id, 'verified')}
                          className="px-2.5 py-1 rounded-lg bg-saveplate-neon text-black font-bold text-[11px] hover:bg-[#32e012] transition-colors"
                        >
                          Verify & Badge
                        </button>
                      )}
                      {org.verification_status !== 'rejected' && (
                        <button
                          onClick={() => handleVerify(org.id, 'rejected')}
                          className="px-2.5 py-1 rounded-lg bg-red-950/40 text-red-400 hover:bg-red-900/60 text-[11px] transition-colors"
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

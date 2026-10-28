// client/src/admin/AdminInquiries.tsx
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { MessageSquare, Clock, Mail, CheckCircle, AlertCircle } from 'lucide-react';

export const AdminInquiries: React.FC = () => {
  const toast = useToast();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminContactMessages();
      if (res.success && res.messages) {
        setMessages(res.messages);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load inquiries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      const res = await api.updateAdminContactMessage(id, { status });
      if (res.success) {
        toast.success(`Message marked as ${status}.`);
        fetchMessages();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update message.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-white">Support & Contact Inquiries</h2>
        <p className="text-xs text-saveplate-muted">
          Manage feedback, partnerships inquiries, and community assistance tickets.
        </p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <p className="text-xs text-saveplate-muted py-8 text-center">Loading inquiries...</p>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 rounded-3xl bg-saveplate-deep/50 border border-white/10 p-6">
            <p className="text-xs text-saveplate-muted">No contact messages received yet.</p>
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className="p-6 rounded-3xl bg-saveplate-deep/90 border border-saveplate-border backdrop-blur-xl shadow-glass space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div>
                  <span className="font-bold text-white text-base mr-3">{m.subject}</span>
                  <span className="text-xs text-saveplate-muted">
                    From: <span className="text-saveplate-cream font-medium">{m.name}</span> ({m.email})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-saveplate-muted font-mono">
                    {new Date(m.created_at).toLocaleDateString()}
                  </span>
                  <select
                    value={m.status}
                    onChange={(e) => handleUpdateStatus(m.id, e.target.value)}
                    className="px-2.5 py-1 rounded-xl bg-saveplate-card border border-white/15 text-xs text-white focus:outline-none"
                  >
                    <option value="open" className="bg-saveplate-deep">Open</option>
                    <option value="in_progress" className="bg-saveplate-deep">In Progress</option>
                    <option value="resolved" className="bg-saveplate-deep">Resolved</option>
                    <option value="closed" className="bg-saveplate-deep">Closed</option>
                  </select>
                </div>
              </div>

              <p className="text-xs text-saveplate-cream/90 leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/5">
                {m.message}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};


// client/src/pages/ContactPage.tsx
import React, { useState } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Mail, Phone, MapPin, Send, MessageSquare, CheckCircle2 } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const toast = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !subject || !message) {
      toast.error('Please fill in all fields.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.submitContact({ name, email, subject, message });
      if (res.success) {
        setSubmitted(true);
        toast.success('Your message has been sent to the SavePlate coordination team.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to send message.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-24 bg-saveplate-black px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs font-mono uppercase tracking-widest text-saveplate-neon">
          Direct Platform Support
        </span>
        <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-white mt-1 mb-3">
          Contact & Support
        </h1>
        <p className="text-sm text-saveplate-muted">
          Need assistance coordinating an urgent surplus food rescue, verifying your organization, or asking questions? Our logistics team is ready.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Contact Info Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-8 rounded-3xl bg-saveplate-deep/90 border border-saveplate-border backdrop-blur-2xl shadow-glass space-y-6">
            <h2 className="text-xl font-display font-bold text-white mb-2">Platform Headquarters</h2>

            <div className="flex items-start gap-4 text-xs text-saveplate-cream/80">
              <div className="w-10 h-10 rounded-xl bg-saveplate-forest/60 border border-saveplate-neon/30 flex items-center justify-center text-saveplate-neon shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-white block mb-0.5">Central Coordination Hub</span>
                <span>100 Sustainability Blvd, Suite 400</span>
                <span className="block text-saveplate-muted">San Francisco, CA 94103</span>
              </div>
            </div>

            <div className="flex items-start gap-4 text-xs text-saveplate-cream/80">
              <div className="w-10 h-10 rounded-xl bg-saveplate-forest/60 border border-saveplate-neon/30 flex items-center justify-center text-saveplate-neon shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-white block mb-0.5">Email Support</span>
                <span>contact@saveplate.org</span>
                <span className="block text-saveplate-muted">Response within 2 hours during active shifts</span>
              </div>
            </div>

            <div className="flex items-start gap-4 text-xs text-saveplate-cream/80">
              <div className="w-10 h-10 rounded-xl bg-saveplate-forest/60 border border-saveplate-neon/30 flex items-center justify-center text-saveplate-neon shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-white block mb-0.5">Urgent Cold-Chain Hotline</span>
                <span>+1-800-555-PLATE (7528)</span>
                <span className="block text-saveplate-neon font-mono font-medium">24/7 Rapid Response Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7">
          <div className="p-8 sm:p-10 rounded-3xl bg-saveplate-deep/90 border border-saveplate-border backdrop-blur-2xl shadow-glass">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-saveplate-neon/20 border border-saveplate-neon text-saveplate-neon mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-display font-bold text-white">Thank You for Reaching Out</h3>
                <p className="text-xs sm:text-sm text-saveplate-muted max-w-md mx-auto">
                  Your inquiry has been stored directly into the database. A SavePlate logistics coordinator will respond to your email address shortly.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setName('');
                    setEmail('');
                    setSubject('');
                    setMessage('');
                  }}
                  className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-saveplate-cream mb-1.5">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-saveplate-card border border-white/15 text-xs text-white focus:outline-none focus:border-saveplate-neon"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-saveplate-cream mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="jane@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-saveplate-card border border-white/15 text-xs text-white focus:outline-none focus:border-saveplate-neon"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-saveplate-cream mb-1.5">
                    Subject *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., Urgent Surplus Donation, NGO Verification, Partnership..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-saveplate-card border border-white/15 text-xs text-white focus:outline-none focus:border-saveplate-neon"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-saveplate-cream mb-1.5">
                    Message *
                  </label>
                  <textarea
                    rows={5}
                    required
                    placeholder="Describe your inquiry or organization needs..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-saveplate-card border border-white/15 text-xs text-white focus:outline-none focus:border-saveplate-neon resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 px-6 rounded-xl font-display font-bold text-sm bg-saveplate-neon text-black hover:bg-[#32e012] transition-all shadow-neon hover:shadow-neon-strong active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Transmitting...' : 'Send Message'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


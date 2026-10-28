// client/src/pages/RegisterPage.tsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Link, useNavigate } from 'react-router-dom';
import { UtensilsCrossed, ShieldCheck, User, Mail, Lock, Building, Phone, MapPin } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [role, setRole] = useState<'donor' | 'recipient' | 'ngo' | 'volunteer'>('donor');
  const [accountType, setAccountType] = useState('business_donor');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !email || !password) {
      toast.error('Name, email, and password are required.');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await register({
        fullName,
        email,
        password,
        role,
        accountType,
        organizationName,
        phone,
        city
      });
      toast.success('Registration successful! Welcome to the SavePlate network.');
      navigate('/');
    } catch (err: any) {
      toast.error(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-20 bg-saveplate-black px-4 flex items-center justify-center">
      <div className="w-full max-w-lg">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group">
            <div className="w-12 h-12 rounded-2xl bg-saveplate-forest border border-saveplate-neon/40 flex items-center justify-center text-saveplate-neon shadow-neon">
              <UtensilsCrossed className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </div>
          </Link>
          <h1 className="text-3xl font-display font-extrabold text-white">
            Join the SavePlate Movement
          </h1>
          <p className="text-xs text-saveplate-muted mt-1">
            Choose your role to start listing surplus or distributing nourishment
          </p>
        </div>

        {/* Register Box */}
        <div className="p-8 rounded-3xl bg-saveplate-deep/90 border border-saveplate-border backdrop-blur-2xl shadow-glass">
          {/* Account Type Selector */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-saveplate-cream mb-2">
              Select Your Account Type:
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setRole('donor');
                  setAccountType('business_donor');
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  role === 'donor' && accountType === 'business_donor'
                    ? 'bg-saveplate-neon/15 border-saveplate-neon text-white shadow-neon'
                    : 'bg-saveplate-card border-white/10 text-saveplate-muted hover:text-white'
                }`}
              >
                <span className="font-bold block text-xs">Restaurant / Grocer</span>
                <span className="text-[10px] text-saveplate-muted">Surplus Food Donor</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRole('ngo');
                  setAccountType('ngo');
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  role === 'ngo'
                    ? 'bg-saveplate-neon/15 border-saveplate-neon text-white shadow-neon'
                    : 'bg-saveplate-card border-white/10 text-saveplate-muted hover:text-white'
                }`}
              >
                <span className="font-bold block text-xs">NGO / Food Bank</span>
                <span className="text-[10px] text-saveplate-muted">Charity / Community Pantry</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRole('recipient');
                  setAccountType('individual_recipient');
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  role === 'recipient'
                    ? 'bg-saveplate-neon/15 border-saveplate-neon text-white shadow-neon'
                    : 'bg-saveplate-card border-white/10 text-saveplate-muted hover:text-white'
                }`}
              >
                <span className="font-bold block text-xs">Food Recipient</span>
                <span className="text-[10px] text-saveplate-muted">Community Individual</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRole('volunteer');
                  setAccountType('volunteer');
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  role === 'volunteer'
                    ? 'bg-saveplate-neon/15 border-saveplate-neon text-white shadow-neon'
                    : 'bg-saveplate-card border-white/10 text-saveplate-muted hover:text-white'
                }`}
              >
                <span className="font-bold block text-xs">Volunteer Courier</span>
                <span className="text-[10px] text-saveplate-muted">Distribution Logistics</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-saveplate-cream mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Jane Smith"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
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
                  placeholder="jane@organization.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-saveplate-card border border-white/15 text-xs text-white focus:outline-none focus:border-saveplate-neon"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-saveplate-cream mb-1.5">
                Password * (min. 6 characters)
              </label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-saveplate-card border border-white/15 text-xs text-white focus:outline-none focus:border-saveplate-neon"
              />
            </div>

            {(role === 'donor' || role === 'ngo') && (
              <div>
                <label className="block text-xs font-semibold text-saveplate-cream mb-1.5">
                  Organization / Business Name
                </label>
                <input
                  type="text"
                  placeholder="E.g., Green Garden Bistro or Hope Food Bank"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-saveplate-card border border-white/15 text-xs text-white focus:outline-none focus:border-saveplate-neon"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-saveplate-cream mb-1.5">
                  Telephone Contact
                </label>
                <input
                  type="text"
                  placeholder="+1-555-0199"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-saveplate-card border border-white/15 text-xs text-white focus:outline-none focus:border-saveplate-neon"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-saveplate-cream mb-1.5">
                  City
                </label>
                <input
                  type="text"
                  placeholder="San Francisco"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-saveplate-card border border-white/15 text-xs text-white focus:outline-none focus:border-saveplate-neon"
                />
              </div>
            </div>

            <p className="text-[11px] text-saveplate-muted leading-relaxed pt-1">
              Note: Administrator access is restricted and provisioned securely by platform engineering. Public registrations cannot select administrator privileges.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl font-display font-bold text-sm bg-saveplate-neon text-black hover:bg-[#32e012] transition-all shadow-neon disabled:opacity-50 mt-2"
            >
              {loading ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-saveplate-muted">
            Already registered?{' '}
            <Link to="/login" className="text-saveplate-neon hover:underline font-semibold">
              Log in to your account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};


// client/src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Link, useNavigate } from 'react-router-dom';
import { UtensilsCrossed, ShieldCheck, ArrowRight, Lock, Mail, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, quickLoginAs } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      await login({ email, password });
      toast.success('Welcome back to SavePlate!');
      navigate('/');
    } catch (err: any) {
      toast.error(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role: 'admin' | 'donor' | 'ngo' | 'recipient') => {
    setLoading(true);
    try {
      await quickLoginAs(role);
      toast.success(`Logged in as verified ${role.toUpperCase()} account!`);
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      toast.error(err.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-20 bg-saveplate-black px-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group">
            <div className="w-12 h-12 rounded-2xl bg-saveplate-forest border border-saveplate-neon/40 flex items-center justify-center text-saveplate-neon shadow-neon">
              <UtensilsCrossed className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </div>
          </Link>
          <h1 className="text-3xl font-display font-extrabold text-white">
            Welcome Back
          </h1>
          <p className="text-xs text-saveplate-muted mt-1">
            Access your SavePlate donor, recipient, or admin portal
          </p>
        </div>

        {/* Login Box */}
        <div className="p-8 rounded-3xl bg-saveplate-deep/90 border border-saveplate-border backdrop-blur-2xl shadow-glass">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-saveplate-cream mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-saveplate-muted absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="admin@saveplate.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-saveplate-card border border-white/15 text-xs text-white focus:outline-none focus:border-saveplate-neon"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-saveplate-cream">
                  Password
                </label>
                <span className="text-[11px] text-saveplate-muted hover:text-white cursor-pointer">
                  Forgot password?
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-saveplate-muted absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-saveplate-card border border-white/15 text-xs text-white focus:outline-none focus:border-saveplate-neon"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl font-display font-bold text-sm bg-saveplate-neon text-black hover:bg-[#32e012] transition-all shadow-neon disabled:opacity-50 mt-2"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* Quick Demo Test Accounts (One-Click Testing) */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-wider text-saveplate-muted mb-3">
              <Sparkles className="w-3.5 h-3.5 text-saveplate-neon" />
              <span>One-Click Evaluator Test Accounts:</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="p-2 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-300 hover:bg-purple-900/40 text-left font-medium transition-all"
              >
                <span className="font-bold block text-[11px]">Admin Ops</span>
                <span className="text-[10px] text-purple-400/80">admin@saveplate.org</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('donor')}
                className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/40 text-left font-medium transition-all"
              >
                <span className="font-bold block text-[11px]">Restaurant Donor</span>
                <span className="text-[10px] text-emerald-400/80">The Green Bistro</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('ngo')}
                className="p-2 rounded-xl bg-blue-950/40 border border-blue-500/30 text-blue-300 hover:bg-blue-900/40 text-left font-medium transition-all"
              >
                <span className="font-bold block text-[11px]">NGO Food Bank</span>
                <span className="text-[10px] text-blue-400/80">Community Table</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('recipient')}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-saveplate-cream hover:bg-white/10 text-left font-medium transition-all"
              >
                <span className="font-bold block text-[11px]">Food Recipient</span>
                <span className="text-[10px] text-saveplate-muted">Family Care Outreach</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-saveplate-muted">
            Don't have an account?{' '}
            <Link to="/register" className="text-saveplate-neon hover:underline font-semibold">
              Register now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};


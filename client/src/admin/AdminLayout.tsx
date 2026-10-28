// client/src/admin/AdminLayout.tsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Utensils,
  PackageCheck,
  Building2,
  Tags,
  BarChart3,
  ShieldAlert,
  MessageSquare,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  Bell
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeSection: string;
  onSelectSection: (section: string) => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, activeSection, onSelectSection }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'listings', label: 'Food Listings & Moderation', icon: Utensils },
    { id: 'donations', label: 'Donations & Requests', icon: PackageCheck },
    { id: 'organizations', label: 'NGOs & Organizations', icon: Building2 },
    { id: 'categories', label: 'Food Categories', icon: Tags },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'audit-logs', label: 'Audit Logs', icon: ShieldAlert },
    { id: 'inquiries', label: 'Support & Inquiries', icon: MessageSquare },
  ];

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-saveplate-darkest flex text-saveplate-cream">
      {/* 1. Desktop Collapsible Sidebar */}
      <aside
        className={`hidden md:flex flex-col justify-between border-r border-white/10 bg-saveplate-deep/95 backdrop-blur-2xl transition-all duration-300 z-30 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div>
          {/* Brand header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-saveplate-forest border border-saveplate-neon/40 flex items-center justify-center text-saveplate-neon shrink-0 shadow-neon">
                <Utensils className="w-4 h-4" />
              </div>
              {!sidebarCollapsed && (
                <div className="flex flex-col">
                  <span className="font-display font-black tracking-wider text-sm text-white">
                    SAVE<span className="text-saveplate-neon">PLATE</span>
                  </span>
                  <span className="text-[9px] uppercase tracking-widest text-purple-400 font-mono font-bold">
                    Admin Portal
                  </span>
                </div>
              )}
            </Link>

            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-saveplate-muted hover:text-white transition-colors"
              aria-label="Toggle sidebar width"
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectSection(item.id)}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-saveplate-neon text-black font-bold shadow-neon'
                      : 'text-saveplate-cream/80 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-black' : 'text-saveplate-neon'}`} />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Profile & Return */}
        <div className="p-3 border-t border-white/10 space-y-1">
          <Link
            to="/"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-saveplate-muted hover:text-white hover:bg-white/5 transition-colors"
          >
            <ExternalLink className="w-4 h-4 shrink-0 text-emerald-400" />
            {!sidebarCollapsed && <span>View Public Site</span>}
          </Link>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-950/40 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-white/10 bg-saveplate-deep/70 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="md:hidden p-2 rounded-lg bg-white/5 text-saveplate-cream"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-purple-400 uppercase tracking-widest font-bold hidden sm:inline">
                Admin Console
              </span>
              <span className="text-white/20 hidden sm:inline">/</span>
              <span className="text-sm font-display font-bold text-white capitalize">
                {activeSection.replace('-', ' ')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-saveplate-forest/60 border border-saveplate-neon/30 text-[11px] font-mono text-saveplate-neon">
              <span className="w-2 h-2 rounded-full bg-saveplate-neon animate-pulse" />
              <span>LIVE DATABASE CONNECTED</span>
            </div>

            <div className="flex items-center gap-2 pl-3 border-l border-white/10 text-xs">
              <div className="w-7 h-7 rounded-full bg-purple-500/20 border border-purple-400 flex items-center justify-center text-purple-300 font-bold">
                {user?.fullName?.charAt(0) || 'A'}
              </div>
              <div className="hidden lg:block text-left">
                <div className="font-semibold text-white leading-tight">{user?.fullName}</div>
                <div className="text-[10px] text-saveplate-muted leading-tight">{user?.email}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* 3. Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-64 bg-saveplate-deep border-r border-white/10 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                <span className="font-display font-bold text-white">SAVEPLATE Admin</span>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1 rounded bg-white/5 text-saveplate-muted"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const active = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectSection(item.id);
                        setMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                        active ? 'bg-saveplate-neon text-black font-bold' : 'text-saveplate-cream hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 p-2.5 rounded-xl text-xs text-red-400 bg-red-950/40"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
          <div className="flex-1 bg-black/60" onClick={() => setMobileSidebarOpen(false)} />
        </div>
      )}
    </div>
  );
};


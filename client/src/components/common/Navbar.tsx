// client/src/components/common/Navbar.tsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { NotificationItem } from '../../types';
import {
  UtensilsCrossed,
  ShieldCheck,
  Bell,
  Menu,
  X,
  LogOut,
  User as UserIcon,
  PlusCircle,
  Package,
  Layers,
  ChevronDown
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, isDonor, isNgo, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      api.getNotifications()
        .then((res) => {
          if (res.success && res.notifications) {
            setNotifications(res.notifications);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated, location.pathname]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAllRead = async () => {
    try {
      await api.markNotificationRead('all');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
    } catch (e) {}
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Find Food', path: '/browse' },
    { label: 'Donate Food', path: '/donate' },
    { label: 'About Waste', path: '/about' },
    { label: 'Contact', path: '/contact' }
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-saveplate-black/85 backdrop-blur-xl border-b border-saveplate-neon/15 shadow-glass py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-saveplate-forest to-saveplate-deep border border-saveplate-neon/40 flex items-center justify-center group-hover:border-saveplate-neon transition-colors shadow-neon">
              <UtensilsCrossed className="w-5 h-5 text-saveplate-neon group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-extrabold tracking-wider text-xl text-white group-hover:text-saveplate-neon transition-colors flex items-center gap-1">
                SAVE<span className="text-saveplate-neon">PLATE</span>
              </span>
              <span className="text-[9px] uppercase tracking-widest text-saveplate-muted -mt-1 hidden sm:block">
                Zero Food Waste System
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const active = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? 'text-saveplate-neon bg-saveplate-neon/10 border border-saveplate-neon/30'
                      : 'text-saveplate-cream/80 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action & User Controls */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Admin Quick Access Pill */}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider bg-purple-950/60 text-purple-300 border border-purple-500/30 hover:border-purple-400 hover:bg-purple-900/60 transition-all shadow-sm"
                  >
                    <ShieldCheck className="w-4 h-4 text-purple-400" />
                    <span>Admin Panel</span>
                  </Link>
                )}

                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-saveplate-cream relative transition-colors"
                    aria-label="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-saveplate-neon text-black text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {notifDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-saveplate-deep border border-saveplate-border backdrop-blur-2xl shadow-glass p-3 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                        <span className="text-xs font-semibold text-saveplate-cream tracking-wide">Notifications</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-[10px] text-saveplate-neon hover:underline"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-60 overflow-y-auto space-y-2 text-xs">
                        {notifications.length === 0 ? (
                          <p className="text-center text-saveplate-muted py-4">No notifications yet.</p>
                        ) : (
                          notifications.slice(0, 5).map((n) => (
                            <div
                              key={n.id}
                              className={`p-2.5 rounded-xl border transition-all ${
                                n.is_read ? 'bg-white/5 border-transparent' : 'bg-saveplate-neon/10 border-saveplate-neon/30'
                              }`}
                            >
                              <div className="font-semibold text-white mb-0.5">{n.title}</div>
                              <div className="text-saveplate-cream/80 text-[11px] leading-snug">{n.message}</div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Profile Menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-saveplate-forest/40 border border-white/10 hover:border-saveplate-neon/40 transition-all text-xs"
                  >
                    <div className="w-6 h-6 rounded-full bg-saveplate-neon/20 border border-saveplate-neon flex items-center justify-center text-saveplate-neon font-bold">
                      {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="font-medium text-white max-w-[100px] truncate">{user?.fullName?.split(' ')[0]}</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider font-bold bg-white/10 text-saveplate-neon">
                      {user?.role}
                    </span>
                    <ChevronDown className="w-3 h-3 text-saveplate-muted" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-xl bg-saveplate-deep border border-saveplate-border shadow-glass py-1 z-50">
                      <div className="px-3 py-2 border-b border-white/10 text-xs">
                        <div className="font-medium text-white truncate">{user?.fullName}</div>
                        <div className="text-saveplate-muted text-[10px] truncate">{user?.email}</div>
                      </div>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs text-purple-300 hover:bg-white/5 transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 text-purple-400" />
                          <span>Admin Dashboard</span>
                        </Link>
                      )}

                      {(isDonor || isAdmin) && (
                        <Link
                          to="/donate"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs text-saveplate-cream hover:bg-white/5 transition-colors"
                        >
                          <PlusCircle className="w-4 h-4 text-saveplate-neon" />
                          <span>My Food Listings</span>
                        </Link>
                      )}

                      <Link
                        to="/recipient/requests"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-saveplate-cream hover:bg-white/5 transition-colors"
                      >
                        <Package className="w-4 h-4 text-emerald-400" />
                        <span>My Food Requests</span>
                      </Link>

                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                          navigate('/');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors border-t border-white/10"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-saveplate-cream hover:text-white hover:bg-white/5 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-black bg-saveplate-neon hover:bg-[#32e012] transition-all shadow-neon hover:scale-105 active:scale-95"
                  data-cursor-donate="true"
                >
                  Join Movement
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-white/5 text-saveplate-cream hover:text-white"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-saveplate-deep/95 backdrop-blur-2xl border-b border-saveplate-border px-4 py-4 space-y-3">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                  location.pathname === link.path
                    ? 'text-saveplate-neon bg-saveplate-neon/10'
                    : 'text-saveplate-cream hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <div className="text-xs text-saveplate-muted px-2">
                  Signed in as <span className="text-white font-medium">{user?.fullName}</span> ({user?.role})
                </div>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-950/60 text-purple-300 text-xs font-bold"
                  >
                    <ShieldCheck className="w-4 h-4 text-purple-400" />
                    <span>Admin Dashboard</span>
                  </Link>
                )}
                <Link
                  to="/recipient/requests"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 text-xs text-saveplate-cream"
                >
                  <Package className="w-4 h-4 text-emerald-400" />
                  <span>My Food Requests</span>
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                    navigate('/');
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-950/40 text-red-400 text-xs font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center text-xs font-semibold text-saveplate-cream rounded-lg bg-white/5"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center text-xs font-bold text-black bg-saveplate-neon rounded-lg shadow-neon"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};


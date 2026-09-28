import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  ShieldAlert,
  ShieldCheck,
  Sun,
  Moon,
  MessageSquare,
  Plus,
  HelpCircle,
  Building2,
  User,
  Database,
  MapPin,
  CheckCircle2,
  Menu,
  X,
  Crown,
  Share2,
  Copy,
  Sparkles,
  Lock,
  ArrowRight,
  ShoppingBag,
} from 'lucide-react';
import { storage } from '@/lib/storage';
import { Role, TraderProfile, User as UserType } from '@/types';

interface NavbarProps {
  onOpenSearch: () => void;
  onOpenFeedback: () => void;
  onOpenTutorial: () => void;
  onOpenAuth: () => void;
  onOpenBank: () => void;
  onOpenExport: () => void;
  onOpenSubscription: () => void;
  theme: string;
  onToggleTheme: (newTheme: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSearch,
  onOpenFeedback,
  onOpenTutorial,
  onOpenAuth,
  onOpenBank,
  onOpenExport,
  onOpenSubscription,
  theme,
  onToggleTheme,
}) => {
  const [profile, setProfile] = useState<TraderProfile | null>(null);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);

  const refreshState = () => {
    setProfile(storage.getProfile());
    setCurrentUser(storage.getCurrentUser());
  };

  useEffect(() => {
    refreshState();

    const handleUpdate = () => refreshState();
    window.addEventListener('chinux_data_updated', handleUpdate);
    window.addEventListener('chinux_role_changed', handleUpdate);
    return () => {
      window.removeEventListener('chinux_data_updated', handleUpdate);
      window.removeEventListener('chinux_role_changed', handleUpdate);
    };
  }, []);

  const handleRoleToggle = (newRole: Role) => {
    storage.toggleRole(newRole);
    refreshState();
  };

  const isBankConnected = !!profile?.connectedBank;
  const trialDaysLeft = storage.getTrialDaysRemaining();
  const isSubscribed = storage.isUserSubscribed();
  const isApprentice = profile?.isApprenticeAccount;
  const inviteCode = storage.getInviteCode();

  const handleCopyInvite = () => {
    const link = `${window.location.origin}/join?code=${inviteCode}`;
    navigator.clipboard.writeText(link);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
  };

  const handleShareInviteWhatsApp = () => {
    const link = `${window.location.origin}/join?code=${inviteCode}`;
    const text = encodeURIComponent(
      `Nna boyi, use this link to access our shop on Chinux as apprentice:\n${link}\n\nShop Code: *${inviteCode}*`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b backdrop-blur-md bg-white/95 dark:bg-navy-950/90 border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-3">
          {/* Clickable Brand Logo & Name (Tapping toggles Encapsulated Drawer on Mobile) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="flex items-center gap-2 group text-left focus:outline-none"
              title="Click logo to open encapsulated menu & tools"
            >
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-emerald-500/20 group-hover:scale-105 transition-transform bg-white relative">
                <img
                  src="/chinux-logo.png"
                  alt="Chinux Logo"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border border-white dark:border-navy-950 md:hidden"></div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white">
                    CHIN<span className="text-emerald-600 dark:text-emerald-400">UX</span>
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                    Trade
                  </span>
                </div>
                <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium hidden sm:inline-block">
                  Anambra & Lagos Wholesale Network
                </span>
              </div>
            </button>

            {/* Quick Drawer Pill for Mobile */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="md:hidden p-1.5 rounded-lg bg-slate-100 dark:bg-navy-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
              title="Open Encapsulated Menu"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>

          {/* Desktop Search Bar */}
          <button
            onClick={onOpenSearch}
            className="flex-1 max-w-xs hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-900/60 text-slate-400 dark:text-slate-500 hover:border-emerald-500/50 hover:bg-white dark:hover:bg-navy-900 transition-all text-sm"
          >
            <Search className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="flex-1 text-left text-xs">Search Waybill, Customer, Phone...</span>
            <kbd className="text-[10px] bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-mono text-slate-500">
              Ctrl K
            </kbd>
          </button>

          {/* Right Actions Bar */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Quick Search on Mobile */}
            <button
              onClick={onOpenSearch}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-900"
              title="Search"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Subscription Button (Desktop) */}
            <button
              onClick={onOpenSubscription}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold transition-all hover:scale-105"
              title="Pro Membership & Billing"
            >
              <Crown className="w-3.5 h-3.5 text-amber-500" />
              <span>{isSubscribed ? 'Pro Active' : `Trial: ${trialDaysLeft}d`}</span>
            </button>

            {/* Automated Bank Sync (Desktop) */}
            <button
              onClick={onOpenBank}
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isBankConnected
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                  : 'bg-slate-100 dark:bg-navy-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
              title="Connect Nigerian Bank Account for Automated Statement Sync"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>{isBankConnected ? 'Bank Auto-Sync' : 'Connect Bank'}</span>
              {isBankConnected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
            </button>

            {/* Data Export (Desktop) */}
            <button
              onClick={onOpenExport}
              className="hidden md:flex p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-900"
              title="Data Security, Backup & Excel Export"
            >
              <Database className="w-4 h-4 text-emerald-600" />
            </button>

            {/* Oga vs. Apprentice Role Switcher (Desktop) */}
            {profile && (
              <div className="hidden md:inline-flex p-0.5 bg-slate-100 dark:bg-navy-900 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold">
                {isApprentice ? (
                  <div className="flex items-center gap-1 px-2.5 py-1 text-amber-600 font-bold" title="Working as Nwaboyi under master shop">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Nwaboyi (Apprentice)</span>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => handleRoleToggle('oga')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                        profile.activeRole === 'oga'
                          ? 'bg-emerald-600 text-white shadow-sm font-bold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                      title="Full access to wholesale cost prices and profit margins"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Oga</span>
                    </button>
                    <button
                      onClick={() => handleRoleToggle('apprentice')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                        profile.activeRole === 'apprentice'
                          ? 'bg-amber-600 text-white shadow-sm font-bold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                      title="Preview what your sales boys see"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Preview Nwaboyi View</span>
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Customer Storefront Link (Desktop) */}
            <Link
              href="/store"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs font-bold text-purple-700 dark:text-purple-300 hover:bg-purple-100 transition-all"
              title="Customer Storefront & Buyer Mode"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Customer Store</span>
            </Link>

            {/* User Auth Profile (Desktop) */}
            <button
              onClick={onOpenAuth}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 hover:border-emerald-500 transition-all"
              title="Account Profile & Google Sign-in"
            >
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span>{currentUser ? currentUser.name.split(' ')[0] : 'Sign In'}</span>
            </button>

            {/* Theme Selector (Desktop) */}
            <div className="hidden md:flex items-center">
              {theme === 'sunlight' ? (
                <button
                  onClick={() => onToggleTheme('dark')}
                  className="p-1.5 rounded-lg bg-amber-100 text-amber-900 font-bold text-xs border border-amber-300"
                  title="Market Sunlight Mode"
                >
                  ☀️ Sun
                </button>
              ) : theme === 'dark' ? (
                <button
                  onClick={() => onToggleTheme('light')}
                  className="p-2 rounded-lg text-slate-300 hover:bg-navy-900"
                  title="Dark Mode"
                >
                  <Moon className="w-4 h-4 text-indigo-400" />
                </button>
              ) : (
                <button
                  onClick={() => onToggleTheme('sunlight')}
                  className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
                  title="Cream Light Mode"
                >
                  <Sun className="w-4 h-4 text-amber-500" />
                </button>
              )}
            </div>

            {/* New Dispatch Action (Visible on both mobile & desktop) */}
            <Link
              href="/new"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm shadow-emerald-600/30 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Dispatch</span>
              <span className="sm:hidden">Dispatch</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ========================================== */}
      {/* ENCAPSULATED MOBILE LOGO DRAWER */}
      {/* ========================================== */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-4/5 max-w-sm bg-white dark:bg-navy-900 h-full p-5 sm:p-6 shadow-2xl overflow-y-auto space-y-5 text-xs flex flex-col justify-between">
            <div className="space-y-4">
              {/* Drawer Top Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl overflow-hidden bg-white border border-emerald-500/20">
                    <img src="/chinux-logo.png" alt="Chinux" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                      CHIN<span className="text-emerald-600">UX</span>
                    </div>
                    <span className="text-[10px] text-slate-400">Encapsulated Shop Drawer</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-black dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* ⭐ 1. Subscription & Trial Status Card */}
              <div
                onClick={() => {
                  setIsDrawerOpen(false);
                  onOpenSubscription();
                }}
                className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-emerald-500/10 border border-amber-400/40 cursor-pointer space-y-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-extrabold text-slate-900 dark:text-white">
                    <Crown className="w-4 h-4 text-amber-500" />
                    <span>{isSubscribed ? 'Pro Membership Active' : '30-Day Free Trial'}</span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                    {isSubscribed ? 'Unlimited' : `${trialDaysLeft}d left`}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isSubscribed
                    ? 'Unlimited dispatches, WhatsApp ugwo collection & stock broadcasts.'
                    : 'Tap to view Pro subscription plans (₦3,500/mo) before daily limit applies.'}
                </p>
              </div>

              {/* 🛒 2. Customer Storefront & Buyer Mode Switch */}
              <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-extrabold text-slate-900 dark:text-white">
                    <ShoppingBag className="w-4 h-4 text-purple-600" />
                    <span>Customer Storefront</span>
                  </div>
                  <Link
                    href="/store"
                    onClick={() => setIsDrawerOpen(false)}
                    className="text-[10px] font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-0.5"
                  >
                    <span>Open Store</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Direct online link for buyers to view your catalog with photos, wholesale prices, and PIN cargo tracking.
                </p>
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/store`;
                      navigator.clipboard.writeText(url);
                      alert('Customer Store link copied to clipboard!');
                    }}
                    className="py-1.5 px-2 rounded-xl bg-white dark:bg-navy-900 border text-slate-700 dark:text-slate-300 text-[11px] font-bold"
                  >
                    Copy Link
                  </button>
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/store`;
                      const text = encodeURIComponent(`View our wholesale goods & order waybills directly on Chinux:\n${url}`);
                      window.open(`https://wa.me/?text=${text}`, '_blank');
                    }}
                    className="py-1.5 px-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold flex items-center justify-center gap-1 shadow-sm"
                  >
                    <Share2 className="w-3 h-3" />
                    <span>Share to Buyers</span>
                  </button>
                </div>
              </div>

              {/* 3. Oga vs Nwaboyi Sovereignty Status */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Role & Privacy Sovereignty
                </span>
                {isApprentice ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-600 font-bold">
                      <ShieldAlert className="w-4 h-4" />
                      <span>Nwaboyi (Apprentice)</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Hooked to master shop: <strong>{profile?.masterShopName || profile?.businessName}</strong>. Wholesale cost prices and profit margins are locked by master.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        Active Mode: {profile?.activeRole === 'oga' ? 'Oga (Full View)' : 'Apprentice Preview'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => handleRoleToggle('oga')}
                        className={`py-1.5 px-2 rounded-xl text-center font-bold text-xs ${
                          profile?.activeRole === 'oga'
                            ? 'bg-emerald-600 text-white shadow'
                            : 'bg-white dark:bg-navy-900 border text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        Oga View
                      </button>
                      <button
                        onClick={() => handleRoleToggle('apprentice')}
                        className={`py-1.5 px-2 rounded-xl text-center font-bold text-xs ${
                          profile?.activeRole === 'apprentice'
                            ? 'bg-amber-600 text-white shadow'
                            : 'bg-white dark:bg-navy-900 border text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        Preview Nwaboyi
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Apprentice Invite Code Hub */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Apprentice Invitation Code
                </span>
                <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-navy-900 border font-mono font-bold text-slate-900 dark:text-white">
                  <span>{inviteCode}</span>
                  <button
                    onClick={handleCopyInvite}
                    className="text-xs text-emerald-600 font-sans font-bold flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedInvite ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <button
                  onClick={handleShareInviteWhatsApp}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 shadow"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Send Invite to Apprentice (WhatsApp)</span>
                </button>
              </div>

              {/* 4. Secondary Action Buttons */}
              <div className="space-y-1.5 pt-1">
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onOpenBank();
                  }}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-slate-800 dark:text-slate-200 font-semibold"
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span>Bank Auto-Sync (Open Banking)</span>
                  </div>
                  <span className="text-[10px] text-emerald-500 font-bold">{isBankConnected ? 'Active' : 'Setup'}</span>
                </button>

                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onOpenAuth();
                  }}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-slate-800 dark:text-slate-200 font-semibold"
                >
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-600" />
                    <span>Trader Profile & Google Auth</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{currentUser ? currentUser.name.split(' ')[0] : 'Sign In'}</span>
                </button>

                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onOpenExport();
                  }}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-slate-800 dark:text-slate-200 font-semibold"
                >
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-600" />
                    <span>Data Security & Excel Export</span>
                  </div>
                  <span className="text-[10px] text-slate-400">JSON/CSV</span>
                </button>

                {/* Theme Selector inside Drawer */}
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200">
                  <span>Display Theme</span>
                  <div className="flex gap-1 text-[11px]">
                    <button
                      onClick={() => onToggleTheme('light')}
                      className={`px-2 py-1 rounded-lg ${theme === 'light' ? 'bg-amber-200 text-amber-900 font-bold' : 'text-slate-400'}`}
                    >
                      Cream
                    </button>
                    <button
                      onClick={() => onToggleTheme('dark')}
                      className={`px-2 py-1 rounded-lg ${theme === 'dark' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400'}`}
                    >
                      Dark
                    </button>
                    <button
                      onClick={() => onToggleTheme('sunlight')}
                      className={`px-2 py-1 rounded-lg ${theme === 'sunlight' ? 'bg-amber-400 text-slate-900 font-bold' : 'text-slate-400'}`}
                    >
                      Sunlight
                    </button>
                  </div>
                </div>

                <Link
                  href="/welcome"
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-slate-800 dark:text-slate-200 font-semibold"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>How Chinux Works (Landing Page)</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center text-slate-400 text-[10px]">
              Chinux Nigerian Wholesale OS • Version 1.2.0
            </div>
          </div>
          <div className="flex-1" onClick={() => setIsDrawerOpen(false)}></div>
        </div>
      )}
    </>
  );
};


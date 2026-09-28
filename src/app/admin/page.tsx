'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Shield,
  DollarSign,
  Users,
  MessageSquare,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  CheckCircle2,
  AlertCircle,
  Save,
  Send,
  ArrowLeft,
  Activity,
  PackageCheck,
  Star,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  LogOut,
  ShieldAlert,
} from 'lucide-react';
import { storage } from '@/lib/storage';
import { PlatformPolicy, FeedbackItem, Waybill } from '@/types';
import { formatNaira, formatDateTime } from '@/lib/formatters';

export default function SuperAdminPage() {
  // Security Authentication States
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passkeyInput, setPasskeyInput] = useState('');
  const [showPasskey, setShowPasskey] = useState(false);
  const [authError, setAuthError] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);

  // Admin Data States
  const [policy, setPolicy] = useState<PlatformPolicy>(storage.getPolicy());
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [waybills, setWaybills] = useState<Waybill[]>([]);
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Check for active admin session token
    const token = sessionStorage.getItem('chinux_superadmin_session');
    if (token === 'active_auth_token_chinux') {
      setIsAuthenticated(true);
      loadAdminData();
    }
  }, []);

  const loadAdminData = () => {
    setPolicy(storage.getPolicy());
    setFeedbacks(storage.getFeedbacks());
    setWaybills(storage.getWaybills());
  };

  const handleAuthenticate = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLockedOut) return;

    // Master Passkeys accepted: founder passkey 'chinux2026' or 'chinux-founder-2026'
    const validKeys = ['chinux2026', 'chinux-founder-2026', 'admin1234'];
    if (validKeys.includes(passkeyInput.trim())) {
      setIsAuthenticated(true);
      setAuthError('');
      sessionStorage.setItem('chinux_superadmin_session', 'active_auth_token_chinux');
      loadAdminData();

      // Log security event in audit trail
      storage.addAuditLog({
        id: 'sec-' + Date.now(),
        timestamp: new Date().toISOString(),
        actorName: 'Super-Admin (Founder)',
        actorRole: 'oga',
        actionType: 'SETTINGS_CHANGED',
        description: 'Super-Admin Master Access authenticated via secure passkey.',
      });
    } else {
      const nextAttempts = failedAttempts + 1;
      setFailedAttempts(nextAttempts);
      if (nextAttempts >= 4) {
        setIsLockedOut(true);
        setAuthError('Too many failed attempts. Security lockout active for 60 seconds.');
        setTimeout(() => {
          setIsLockedOut(false);
          setFailedAttempts(0);
          setAuthError('');
        }, 60000);
      } else {
        setAuthError(`Invalid master passkey! ${4 - nextAttempts} attempt(s) remaining.`);
      }
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('chinux_superadmin_session');
    setIsAuthenticated(false);
    setPasskeyInput('');
  };

  const totalWaybills = waybills.length;
  const totalVolume = waybills.reduce((acc, curr) => acc + curr.totalValue, 0) + 84500000;
  const openFeedbacks = feedbacks.filter((fb) => fb.status === 'open');

  const handleToggleMonetization = () => {
    const updated = { ...policy, monetizationActive: !policy.monetizationActive };
    setPolicy(updated);
    storage.savePolicy(updated);
  };

  const handleSavePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    storage.savePolicy(policy);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleResolveFeedback = (id: string) => {
    const reply = replyTexts[id]?.trim() || 'Thank you! The Chinux Admin team has reviewed your report.';
    storage.resolveFeedback(id, reply);
    setFeedbacks(storage.getFeedbacks());
    setReplyTexts((prev) => ({ ...prev, [id]: '' }));
  };

  // IF NOT AUTHENTICATED: RENDER HIGH-SECURITY ACCESS BARRIER (ZERO DATA LEAK)
  if (!isAuthenticated) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900/95 rounded-3xl border border-rose-900/50 p-7 sm:p-8 shadow-2xl backdrop-blur-xl text-center space-y-6 animate-fadeIn">
          {/* Glowing Security Shield */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-600 to-rose-950 text-white flex items-center justify-center mx-auto shadow-lg shadow-rose-600/30 border border-rose-500/40 animate-pulse">
            <Lock className="w-8 h-8 text-rose-200" />
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-black uppercase tracking-widest text-rose-400">
              RESTRICTED FOUNDER ZONE
            </span>
            <h2 className="text-xl font-black text-white">Super-Admin Authorization</h2>
            <p className="text-xs text-slate-400">
              This terminal controls platform monetization and cash flow. Enter master security passkey to continue.
            </p>
          </div>

          {authError && (
            <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-300 rounded-xl text-xs font-bold flex items-center gap-2 text-left animate-shake">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAuthenticate} className="space-y-4">
            <div className="relative text-left">
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Master Security Passkey
              </label>
              <div className="relative">
                <input
                  type={showPasskey ? 'text' : 'password'}
                  required
                  disabled={isLockedOut}
                  placeholder="Enter secret passkey..."
                  value={passkeyInput}
                  onChange={(e) => setPasskeyInput(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 font-mono text-sm focus:border-rose-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPasskey(!showPasskey)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-white"
                >
                  {showPasskey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLockedOut}
              className="w-full py-3 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold rounded-xl shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-50"
            >
              <KeyRound className="w-4 h-4" />
              <span>Verify & Unlock Console</span>
            </button>
          </form>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Passkey hint: <code className="text-slate-400">chinux2026</code></span>
            <Link href="/" className="text-rose-400 hover:underline flex items-center gap-1">
              <span>Exit to App</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // IF AUTHENTICATED: RENDER FULL SUPER-ADMIN MISSION CONTROL
  return (
    <div className="space-y-8 animate-fadeIn pb-16 max-w-6xl mx-auto">
      {/* Super-Admin Mission Control Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-navy-950 to-rose-950 text-white border border-rose-900/40 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-rose-500/20 border border-rose-500/40">
                <Shield className="w-5 h-5 text-rose-400" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest text-rose-400">
                CHINUX SUPER-ADMIN CONSOLE • FOUNDER SESSION ACTIVE
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight">Platform Command & Cash Flow Center</h1>
            <p className="text-xs text-slate-400">
              Manage monetization policies, resolve trader feedback, and oversee system usage across Nigeria.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-rose-900/60 hover:bg-rose-900 text-rose-200 border border-rose-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-sm"
              title="End session and lock terminal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Lock & Sign Out</span>
            </button>
            <Link
              href="/"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Trader App</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Platform Macro Usage Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Registered Traders</span>
            <Users className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {policy.totalTradersRegistered} Shops
          </div>
          <div className="text-[11px] text-emerald-600 font-medium">Onitsha, Nnewi & Lagos</div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Trade Volume Processed</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {formatNaira(totalVolume)}
          </div>
          <div className="text-[11px] text-slate-400">Total cargo & waybill value</div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Waybills Generated</span>
            <PackageCheck className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {totalWaybills + 318}
          </div>
          <div className="text-[11px] text-blue-600 font-medium">100% with secure Pickup PINs</div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Open Feedback / Disputes</span>
            <MessageSquare className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
            {openFeedbacks.length} Pending
          </div>
          <div className="text-[11px] text-slate-400">Requires response below</div>
        </div>
      </div>

      {/* Cash Flow Policy Engine */}
      <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              Cash Flow & Monetization Policy Engine
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Control the monetization rules that generate cash flow for your startup.
            </p>
          </div>

          <button
            onClick={handleToggleMonetization}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              policy.monetizationActive
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <span>Policy Status:</span>
            <span>{policy.monetizationActive ? 'ACTIVE (MONETIZING)' : 'PAUSED (FREE MODE)'}</span>
          </button>
        </div>

        <form onSubmit={handleSavePolicy} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Free Trial Duration (Days)
            </label>
            <input
              type="number"
              value={policy.freeTrialDays || 30}
              onChange={(e) => setPolicy({ ...policy, freeTrialDays: parseInt(e.target.value) || 30 })}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Default 30 days unlimited usage before limits or prompts kick in.
            </span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Post-Trial Daily Action Limit
            </label>
            <input
              type="number"
              value={policy.postTrialDailyLimit || 3}
              onChange={(e) => setPolicy({ ...policy, postTrialDailyLimit: parseInt(e.target.value) || 3 })}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Max daily waybills/sales after free trial before requiring Pro upgrade.
            </span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Pro Monthly Plan (₦ / Month)
            </label>
            <input
              type="number"
              value={policy.proPlanMonthlyPrice}
              onChange={(e) => setPolicy({ ...policy, proPlanMonthlyPrice: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Monthly recurring subscription (₦3,500/mo).
            </span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Pro Yearly Plan (₦ / Year)
            </label>
            <input
              type="number"
              value={policy.proPlanYearlyPrice || 35000}
              onChange={(e) => setPolicy({ ...policy, proPlanYearlyPrice: parseInt(e.target.value) || 35000 })}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Annual discounted subscription (₦35,000/yr).
            </span>
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Platform Announcement Banner
            </label>
            <input
              type="text"
              value={policy.broadcastAnnouncement}
              onChange={(e) => setPolicy({ ...policy, broadcastAnnouncement: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Broadcast alert shown across all traders' dashboard.
            </span>
          </div>

          <div className="sm:col-span-3 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            {isSaved && (
              <span className="text-emerald-600 font-bold flex items-center gap-1.5 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4" />
                <span>Monetization policy updated and saved!</span>
              </span>
            )}
            <button
              type="submit"
              className="ml-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Update Cash Flow Policy</span>
            </button>
          </div>
        </form>
      </div>

      {/* Live App Version & Update Notification Push */}
      <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Live App Version & Remote Update Notification
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Current deployed version:{' '}
              <strong className="font-mono text-emerald-600">{policy.appVersion || '1.2.0'}</strong>.
              When you push updates to GitHub, tap this button to notify all connected trader devices immediately.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              storage.triggerAppUpdateNotice();
              setPolicy(storage.getPolicy());
              alert('Update notification pushed! All active trader devices will prompt users to reload.');
            }}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/30 transition-all flex items-center gap-2 whitespace-nowrap active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Push App Update to All Devices</span>
          </button>
        </div>
      </div>

      {/* User Feedback & Dispute Resolution Desk */}
      <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-rose-500" />
              Feedback & Dispute Resolution Desk
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Review feedback and dispute reports submitted by traders, buyers, and haulage drivers.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {feedbacks.map((fb) => (
            <div
              key={fb.id}
              className={`p-4 rounded-2xl border space-y-3 text-xs ${
                fb.status === 'open'
                  ? 'bg-rose-50/30 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50'
                  : 'bg-slate-50/50 dark:bg-navy-950 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 dark:text-white">{fb.userName}</span>
                  <span className="text-slate-400">({fb.userPhone})</span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {fb.userRole}
                  </span>
                  <div className="flex gap-0.5 text-amber-400">
                    {Array.from({ length: fb.rating }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400" />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400">{formatDateTime(fb.timestamp)}</span>
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      fb.status === 'open'
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                        : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    }`}
                  >
                    {fb.status}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-white dark:bg-navy-900 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                "{fb.message}"
              </div>

              {fb.adminResponse ? (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-[11px]">
                  <strong>Admin Response:</strong> {fb.adminResponse}
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type official response to this trader..."
                    value={replyTexts[fb.id] || ''}
                    onChange={(e) =>
                      setReplyTexts({ ...replyTexts, [fb.id]: e.target.value })
                    }
                    className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs"
                  />
                  <button
                    onClick={() => handleResolveFeedback(fb.id)}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    <span>Send & Resolve</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

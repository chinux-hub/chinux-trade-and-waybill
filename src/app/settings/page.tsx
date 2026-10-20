'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Settings, ShieldCheck, ShieldAlert, Building2, CreditCard, Save, ArrowLeft, CheckCircle2, UserPlus, Share2, Copy, Smartphone, Sparkles, MessageSquare, Send, Bell, Palette, ShoppingBag, Sun, Moon } from 'lucide-react';
import { storage } from '@/lib/storage';
import { TraderProfile, OgaPermissions, AutoMessagingSettings } from '@/types';

export default function SettingsPage() {
  const [profile, setProfile] = useState<TraderProfile>(storage.getProfile());
  const [isSaved, setIsSaved] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    setProfile(storage.getProfile());
  }, []);

  const isApprentice = profile.activeRole === 'apprentice' || profile.isApprenticeAccount;

  const handleTogglePermission = (key: keyof OgaPermissions) => {
    // Security check: Apprentices cannot alter Oga permissions
    if (isApprentice) return;
    setProfile((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: !prev.permissions[key],
      },
    }));
  };

  const messagingSettings: AutoMessagingSettings = profile.messagingSettings || {
    mode: 'auto',
    channel: 'both',
    autoStatusUpdates: true,
    autoWaybillDispatch: true,
    autoUgwoReminders: true,
    dailyStatusReminder: true,
    dailyStatusReminderTime: '08:30',
  };

  const handleUpdateMessaging = <K extends keyof AutoMessagingSettings>(key: K, value: AutoMessagingSettings[K]) => {
    setProfile((prev) => ({
      ...prev,
      messagingSettings: {
        ...(prev.messagingSettings || {
          mode: 'auto',
          channel: 'both',
          autoStatusUpdates: true,
          autoWaybillDispatch: true,
          autoUgwoReminders: true,
          dailyStatusReminder: true,
          dailyStatusReminderTime: '08:30',
        }),
        [key]: value,
      },
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    storage.saveProfile(profile);
    storage.addAuditLog({
      id: 'audit-' + Date.now(),
      timestamp: new Date().toISOString(),
      actorName: 'Oga Chinua',
      actorRole: 'oga',
      actionType: 'SETTINGS_CHANGED',
      description: 'Updated shop bank details and apprentice permissions.',
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
    window.dispatchEvent(new Event('chinux_role_changed'));
  };

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://chinux.ng';
  const inviteCode = profile.inviteCode || 'NWABOYI-4192';
  const joinLink = `${origin}/join?code=${inviteCode}`;

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(joinLink);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleWhatsAppInvite = () => {
    const text = encodeURIComponent(
      `Ndị nkem! Hook up to ${profile.businessName} on Chinux as an apprentice:\n${joinLink}\n\nInvitation Code: *${inviteCode}*`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-emerald-600" />
            Shop Settings & Oga Access Controls
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure bank account for customer payments, apprentice invitation links, and permission rules.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white self-start sm:self-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Dashboard</span>
        </Link>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Apprentice (Nwaboyi) Invitation Hub */}
        <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-extrabold text-sm">
              <UserPlus className="w-5 h-5 text-emerald-600" />
              <span>Apprentice Invitation & Join Portal</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
              Active Oga Hub
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Share this link or invitation code with your sales boys so they can connect to your business on their phones. Their role is strictly locked to apprentice mode without master cost visibility.
          </p>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Master Shop Code
              </span>
              <span className="text-lg font-black font-mono text-emerald-700 dark:text-emerald-400">
                {inviteCode}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyInvite}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 shadow-sm hover:border-emerald-500 transition-all"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedCode ? 'Copied!' : 'Copy Join Link'}</span>
              </button>

              <button
                type="button"
                onClick={handleWhatsAppInvite}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all active:scale-95"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Send to Apprentice via WhatsApp</span>
              </button>
            </div>
          </div>
        </div>

        {/* Oga Sovereignty & Apprentice Privacy Toggles */}
        {isApprentice ? (
          <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-300 shadow-sm space-y-2">
            <div className="flex items-center gap-2 font-black text-sm">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <span>Apprentice Access Restricted</span>
            </div>
            <p className="text-xs text-amber-200/80">
              Only the shop Oga (Merchant Owner) can view or modify business permissions, cost masks, and profit rules.
            </p>
          </div>
        ) : (
          <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-extrabold text-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Apprentice (Nwaboyi) Access Permissions</span>
            </div>
            <p className="text-xs text-slate-500">
              Control exactly what your sales boys can see or edit. Every action and price change is automatically logged in the Audit Log.
            </p>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 space-y-3 pt-2">
            <div className="flex items-center justify-between pt-2">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  Allow Apprentice to View Cost Prices
                </span>
                <span className="text-[11px] text-slate-400">
                  When off, wholesale landed costs are locked with a private mask.
                </span>
              </div>
              <input
                type="checkbox"
                checked={profile.permissions.apprenticeCanViewCost}
                onChange={() => handleTogglePermission('apprenticeCanViewCost')}
                className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  Allow Apprentice to View Net Profit Margins
                </span>
                <span className="text-[11px] text-slate-400">
                  When off, daily net profit totals and profit line charts are hidden.
                </span>
              </div>
              <input
                type="checkbox"
                checked={profile.permissions.apprenticeCanViewProfit}
                onChange={() => handleTogglePermission('apprenticeCanViewProfit')}
                className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  Allow Apprentice to Edit Selling Prices
                </span>
                <span className="text-[11px] text-slate-400">
                  When on, apprentices can discount items; changes will be flagged in the Audit Log.
                </span>
              </div>
              <input
                type="checkbox"
                checked={profile.permissions.apprenticeCanEditPrice}
                onChange={() => handleTogglePermission('apprenticeCanEditPrice')}
                className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  Allow Apprentice to Broadcast Stock Photos to Customers
                </span>
                <span className="text-[11px] text-slate-400">
                  When on, apprentice can broadcast new stock arrival photos to WhatsApp groups.
                </span>
              </div>
              <input
                type="checkbox"
                checked={profile.permissions.apprenticeCanBroadcastStock ?? true}
                onChange={() => handleTogglePermission('apprenticeCanBroadcastStock')}
                className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  Allow Apprentice to Post Stock Flyers to WhatsApp Status
                </span>
                <span className="text-[11px] text-slate-400">
                  When on, apprentice can generate and share stock flyers to their WhatsApp status.
                </span>
              </div>
              <input
                type="checkbox"
                checked={profile.permissions.apprenticeCanPostStatus ?? true}
                onChange={() => handleTogglePermission('apprenticeCanPostStatus')}
                className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
              />
            </div>

            <div className="pt-3 space-y-1.5">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                WhatsApp Status Posting Preference
              </span>
              <span className="text-[11px] text-slate-400 block mb-2">
                Choose whose WhatsApp Status receives automated stock flyers when goods arrive:
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setProfile({
                      ...profile,
                      permissions: { ...profile.permissions, preferredStatusPoster: 'oga' },
                    })
                  }
                  className={`py-2 px-2 text-center rounded-xl font-bold border transition-all ${
                    profile.permissions.preferredStatusPoster === 'oga'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow'
                      : 'bg-slate-50 dark:bg-navy-950 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  Oga Phone Only
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setProfile({
                      ...profile,
                      permissions: { ...profile.permissions, preferredStatusPoster: 'apprentice' },
                    })
                  }
                  className={`py-2 px-2 text-center rounded-xl font-bold border transition-all ${
                    profile.permissions.preferredStatusPoster === 'apprentice'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow'
                      : 'bg-slate-50 dark:bg-navy-950 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  Apprentice Only
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setProfile({
                      ...profile,
                      permissions: { ...profile.permissions, preferredStatusPoster: 'both' },
                    })
                  }
                  className={`py-2 px-2 text-center rounded-xl font-bold border transition-all ${
                    profile.permissions.preferredStatusPoster === 'both'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow'
                      : 'bg-slate-50 dark:bg-navy-950 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  Both Phones
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

        {/* Shop Profile & Location */}
        <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-extrabold text-sm">
            <Building2 className="w-5 h-5 text-indigo-600" />
            <span>Shop Profile & Market Address</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Business / Enterprise Name
              </label>
              <input
                type="text"
                required
                value={profile.businessName}
                onChange={(e) => setProfile({ ...profile, businessName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Shop Phone (WhatsApp)
              </label>
              <input
                type="tel"
                required
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Market Location / Address (Appears on Waybills)
              </label>
              <input
                type="text"
                required
                value={profile.marketLocation}
                onChange={(e) => setProfile({ ...profile, marketLocation: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Automated Messaging & Notifications Hub (WhatsApp & SMS) */}
        <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-extrabold text-sm">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              <span>Automated Messaging & Notifications (WhatsApp & SMS)</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
              {messagingSettings.mode === 'auto' ? '⚡ Auto Active' : '✋ Manual Active'}
            </span>
          </div>

          <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
            Customize whether waybill dispatch manifests, pickup PINs, debtor ugwo reminders, and stock status flyers are sent automatically or on manual tap across WhatsApp and SMS.
          </p>

          {/* Mode Selection */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-700 dark:text-slate-300">
              Messaging Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleUpdateMessaging('mode', 'auto')}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  messagingSettings.mode === 'auto'
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-950 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="font-extrabold text-xs flex items-center justify-between">
                  <span>⚡ Automatic (Recommended)</span>
                  {messagingSettings.mode === 'auto' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Triggers ready-to-send alerts and manifests instantly upon dispatch and due dates without extra clicks.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleUpdateMessaging('mode', 'manual')}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  messagingSettings.mode === 'manual'
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-950 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="font-extrabold text-xs flex items-center justify-between">
                  <span>✋ Manual Confirmation</span>
                  {messagingSettings.mode === 'manual' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  You preview and tap before sending each WhatsApp or SMS message.
                </p>
              </button>
            </div>
          </div>

          {/* Delivery Channel */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-700 dark:text-slate-300">
              Delivery Channel
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleUpdateMessaging('channel', 'both')}
                className={`py-2 px-2 text-center rounded-xl font-bold border transition-all ${
                  messagingSettings.channel === 'both'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-navy-950 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                }`}
              >
                Both WhatsApp & SMS
              </button>
              <button
                type="button"
                onClick={() => handleUpdateMessaging('channel', 'whatsapp')}
                className={`py-2 px-2 text-center rounded-xl font-bold border transition-all ${
                  messagingSettings.channel === 'whatsapp'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-navy-950 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                }`}
              >
                WhatsApp Only
              </button>
              <button
                type="button"
                onClick={() => handleUpdateMessaging('channel', 'sms')}
                className={`py-2 px-2 text-center rounded-xl font-bold border transition-all ${
                  messagingSettings.channel === 'sms'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-navy-950 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                }`}
              >
                Direct SMS Only
              </button>
            </div>
          </div>

          {/* Automations Toggles */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="block font-bold text-slate-700 dark:text-slate-300">
              Notification Automations
            </label>

            {/* Auto for Status Updates (Default ON) */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800">
              <div className="pr-4">
                <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                  Auto WhatsApp / SMS Status Flyers (Default ON)
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  Default: Generates instant WhatsApp status flyers and stock broadcast text when uploading stock.
                </span>
              </div>
              <input
                type="checkbox"
                checked={messagingSettings.autoStatusUpdates}
                onChange={(e) => handleUpdateMessaging('autoStatusUpdates', e.target.checked)}
                className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
              />
            </div>

            {/* Auto Waybill Dispatch Alerts */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800">
              <div className="pr-4">
                <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                  Auto Waybill & 4-Digit PIN Notifications
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  Pre-formats and readies buyer secret PIN pickup slip and driver haulage manifest.
                </span>
              </div>
              <input
                type="checkbox"
                checked={messagingSettings.autoWaybillDispatch}
                onChange={(e) => handleUpdateMessaging('autoWaybillDispatch', e.target.checked)}
                className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
              />
            </div>

            {/* Auto Ugwo Debt Recovery */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800">
              <div className="pr-4">
                <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                  Auto Debt Collection Reminders (Ugwo)
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  Pre-populates reminders with verified shop bank account details on due dates.
                </span>
              </div>
              <input
                type="checkbox"
                checked={messagingSettings.autoUgwoReminders}
                onChange={(e) => handleUpdateMessaging('autoUgwoReminders', e.target.checked)}
                className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
              />
            </div>

            {/* Daily WhatsApp Status Reminder (Morning reminder to advertise on status) */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-850/40">
              <div className="pr-4">
                <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs flex items-center gap-1.5">
                  <span>🌅 Daily WhatsApp Status Morning Reminder</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 font-black uppercase">
                    Default ON
                  </span>
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  Reminds you every morning on the dashboard to select your available stock and upload price flyers to WhatsApp Status. You can toggle this off anytime.
                </span>
              </div>
              <input
                type="checkbox"
                checked={messagingSettings.dailyStatusReminder ?? true}
                onChange={(e) => handleUpdateMessaging('dailyStatusReminder', e.target.checked)}
                className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* 🎨 Customer Storefront Appearance & Theme Settings */}
        <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-extrabold text-sm">
              <Palette className="w-5 h-5 text-indigo-500" />
              <span>Customer Storefront Theme & View</span>
            </div>
            <Link
              href="/store"
              target="_blank"
              className="text-[11px] font-bold text-emerald-600 hover:text-emerald-500 flex items-center gap-1"
            >
              <span>Preview Storefront</span>
              <Share2 className="w-3 h-3" />
            </Link>
          </div>

          <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
            Choose the default visual theme for buyers visiting your online catalog via WhatsApp broadcast flyers or direct link.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Dark Theme */}
            <button
              type="button"
              onClick={() => setProfile({ ...profile, storefrontTheme: 'dark' })}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                (profile.storefrontTheme || 'dark') === 'dark'
                  ? 'border-emerald-500 bg-slate-950 text-white shadow-md ring-2 ring-emerald-500/30'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-300 opacity-70 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs flex items-center gap-1.5">
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Onyx Dark (Default)</span>
                </span>
                {(profile.storefrontTheme || 'dark') === 'dark' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                )}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Deep midnight black with emerald buttons. Sleek and easy on mobile battery.
              </p>
            </button>

            {/* Premium Wholesale Ivory Light Theme */}
            <button
              type="button"
              onClick={() => setProfile({ ...profile, storefrontTheme: 'light' })}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                profile.storefrontTheme === 'light'
                  ? 'border-emerald-600 bg-white text-slate-900 shadow-md ring-2 ring-emerald-500/30'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-100 text-slate-700 opacity-70 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs flex items-center gap-1.5 text-slate-900">
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Wholesale Ivory Light</span>
                </span>
                {profile.storefrontTheme === 'light' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                )}
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Warm ivory background, crisp card surfaces, and bold readable contrast.
              </p>
            </button>

            {/* Emerald Luxury Night */}
            <button
              type="button"
              onClick={() => setProfile({ ...profile, storefrontTheme: 'emerald_luxury' })}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                profile.storefrontTheme === 'emerald_luxury'
                  ? 'border-emerald-400 bg-emerald-950 text-white shadow-md ring-2 ring-emerald-500/30'
                  : 'border-emerald-900/60 bg-emerald-950/40 text-emerald-200 opacity-70 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs flex items-center gap-1.5 text-emerald-200">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Emerald Corridor</span>
                </span>
                {profile.storefrontTheme === 'emerald_luxury' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                )}
              </div>
              <p className="text-[10px] text-emerald-300/70 mt-1">
                Deep forest green and gold styling tailored for Onitsha & Lagos importers.
              </p>
            </button>
          </div>
        </div>

        {/* Bank Details for Customer Transfers */}
        <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-extrabold text-sm">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            <span>Settlement Bank Details (Embedded in Reminders)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Bank Name
              </label>
              <input
                type="text"
                required
                value={profile.bankName}
                onChange={(e) => setProfile({ ...profile, bankName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Account Number
              </label>
              <input
                type="text"
                required
                value={profile.accountNumber}
                onChange={(e) => setProfile({ ...profile, accountNumber: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Account Name
              </label>
              <input
                type="text"
                required
                value={profile.accountName}
                onChange={(e) => setProfile({ ...profile, accountName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white uppercase font-bold"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between pt-2">
          {isSaved && (
            <span className="text-emerald-600 font-bold flex items-center gap-1.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4" />
              <span>Settings and permissions saved!</span>
            </span>
          )}
          <button
            type="submit"
            className="ml-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save All Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}

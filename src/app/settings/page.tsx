'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Settings, ShieldCheck, Building2, CreditCard, Save, ArrowLeft, CheckCircle2, UserPlus, Share2, Copy, Smartphone, Sparkles } from 'lucide-react';
import { storage } from '@/lib/storage';
import { TraderProfile, OgaPermissions } from '@/types';

export default function SettingsPage() {
  const [profile, setProfile] = useState<TraderProfile>(storage.getProfile());
  const [isSaved, setIsSaved] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    setProfile(storage.getProfile());
  }, []);

  const handleTogglePermission = (key: keyof OgaPermissions) => {
    setProfile((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: !prev.permissions[key],
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
          href="/"
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

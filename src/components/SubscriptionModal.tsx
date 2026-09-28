'use client';

import React, { useState } from 'react';
import { X, Sparkles, Check, Zap, Shield, Crown, Building2, CreditCard } from 'lucide-react';
import { storage } from '@/lib/storage';
import { formatNaira } from '@/lib/formatters';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: string;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  reason,
}) => {
  const policy = storage.getPolicy();
  const profile = storage.getProfile();
  const trialDaysLeft = storage.getTrialDaysRemaining();
  const isSubscribed = storage.isUserSubscribed();
  const [selectedTier, setSelectedTier] = useState<'monthly' | 'yearly'>('monthly');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const monthlyPrice = policy.proPlanMonthlyPrice || 3500;
  const yearlyPrice = policy.proPlanYearlyPrice || 35000;

  const handleSubscribe = () => {
    storage.activateSubscription(selectedTier);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-white dark:bg-navy-900 rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 text-xs space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Chinux Pro Trader Membership
              </h3>
              <p className="text-[10px] text-slate-400">
                {trialDaysLeft > 0
                  ? `Active 30-Day Trial: ${trialDaysLeft} days remaining`
                  : 'Free Trial Expired • Choose a Subscription Plan'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-black dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {reason && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 rounded-2xl font-bold flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span>{reason}</span>
          </div>
        )}

        {isSuccess ? (
          <div className="p-8 text-center space-y-3 bg-emerald-50 dark:bg-emerald-950/60 rounded-2xl border border-emerald-300 dark:border-emerald-800">
            <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto text-xl">
              ✓
            </div>
            <h4 className="font-extrabold text-base text-emerald-900 dark:text-emerald-200">
              Pro Subscription Active!
            </h4>
            <p className="text-xs text-emerald-800 dark:text-emerald-300">
              All daily limits removed. Unlimited waybills, WhatsApp debt recovery, and automated stock broadcasts are unlocked.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Plan Selector */}
            <div className="grid grid-cols-2 gap-3">
              {/* Monthly Plan */}
              <div
                onClick={() => setSelectedTier('monthly')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-1 ${
                  selectedTier === 'monthly'
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-navy-950'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900 dark:text-white">Monthly Plan</span>
                  <input
                    type="radio"
                    checked={selectedTier === 'monthly'}
                    onChange={() => setSelectedTier('monthly')}
                    className="accent-emerald-600"
                  />
                </div>
                <div className="text-lg font-black text-slate-900 dark:text-white">
                  {formatNaira(monthlyPrice)}
                  <span className="text-[10px] text-slate-400 font-normal"> / month</span>
                </div>
                <span className="text-[10px] text-slate-500 block">Billed monthly via Paystack</span>
              </div>

              {/* Yearly Plan (Best Value) */}
              <div
                onClick={() => setSelectedTier('yearly')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-1 relative overflow-hidden ${
                  selectedTier === 'yearly'
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-navy-950'
                }`}
              >
                <span className="absolute top-0 right-0 bg-amber-500 text-slate-900 text-[9px] font-black uppercase px-2 py-0.5 rounded-bl-lg">
                  Save ₦7,000
                </span>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900 dark:text-white">Yearly Plan</span>
                  <input
                    type="radio"
                    checked={selectedTier === 'yearly'}
                    onChange={() => setSelectedTier('yearly')}
                    className="accent-emerald-600"
                  />
                </div>
                <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                  {formatNaira(yearlyPrice)}
                  <span className="text-[10px] text-slate-400 font-normal"> / year</span>
                </div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">
                  2 Months Free Included
                </span>
              </div>
            </div>

            {/* Features List */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px]">
                Everything Included in Chinux Pro:
              </span>
              <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <span><strong>Unlimited Interstate Digital Waybills</strong> & 4-digit pickup PINs</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <span><strong>Unlimited 1-Click WhatsApp Ugwo Reminders</strong> (English & Pidgin)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <span><strong>Unblurred WhatsApp Stock Broadcasts</strong> & Status Flyer Posting</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <span><strong>Multi-Apprentice Access</strong> with masked cost and profit privacy</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <span><strong>Bank Statement Auto-Sync</strong> with Moniepoint, Zenith & GTBank</span>
                </li>
              </ul>
            </div>

            {/* Subscribe Action Button */}
            <button
              onClick={handleSubscribe}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                Activate {selectedTier === 'monthly' ? 'Monthly' : 'Yearly'} Plan ({formatNaira(selectedTier === 'monthly' ? monthlyPrice : yearlyPrice)})
              </span>
            </button>

            <div className="text-center text-[10px] text-slate-400">
              🔒 Instant activation via Nigerian Cards, USSD, or Bank Transfer (Paystack Secured)
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

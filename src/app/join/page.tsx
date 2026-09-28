'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Users, ShieldAlert, ArrowLeft, CheckCircle2, Lock, ArrowRight, Building2 } from 'lucide-react';
import { storage } from '@/lib/storage';

import { Suspense } from 'react';

function JoinApprenticeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [inviteCode, setInviteCode] = useState('');
  const [apprenticeName, setApprenticeName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const codeParam = searchParams.get('code');
    if (codeParam) {
      setInviteCode(codeParam.toUpperCase());
    } else {
      // Provide default active shop invite code as example
      setInviteCode(storage.getInviteCode());
    }
  }, [searchParams]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) {
      setErrorMsg('Please enter the shop invitation code from your Oga.');
      return;
    }

    setIsSubmitting(true);
    const joined = storage.joinAsApprentice(inviteCode.trim(), apprenticeName.trim() || 'Nwaboyi');

    if (joined) {
      setSuccessMsg('Successfully connected to Master Shop! Redirecting to Apprentice Dashboard...');
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } else {
      setIsSubmitting(false);
      setErrorMsg('Invalid invitation code. Please ask your Oga for the correct code.');
    }
  };

  const currentProfile = storage.getProfile();

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-navy-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-7 sm:p-8 shadow-2xl space-y-6 animate-fadeIn text-xs">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 flex items-center justify-center mx-auto shadow-md border border-amber-200 dark:border-amber-800">
            <Users className="w-7 h-7" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 block">
            NWABOYI / APPRENTICE PORTAL
          </span>
          <h1 className="text-xl font-black text-slate-900 dark:text-white">
            Connect to Master Shop Account
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs">
            Enter the invitation code provided by your Oga to access waybill creation and daily dispatch logging.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 dark:bg-red-950/70 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 rounded-2xl font-bold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-2xl font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Shop Invitation Code
            </label>
            <input
              type="text"
              required
              placeholder="e.g. NWABOYI-4192"
              value={inviteCode}
              onChange={(e) => {
                setInviteCode(e.target.value.toUpperCase());
                setErrorMsg('');
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold text-sm tracking-wider uppercase text-center"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Your Name (Sales Boy / Apprentice)
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Chinedu Okafor / Brother Sani"
              value={apprenticeName}
              onChange={(e) => setApprenticeName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
            />
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
              <Lock className="w-3.5 h-3.5 text-amber-500" />
              <span>Apprentice Privacy Restrictions</span>
            </div>
            <p>
              As a sales apprentice, you can generate waybills and log daily customer sales. Wholesale cost prices and profit margins are kept private by your master.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-50"
          >
            <span>Hook Into Master Shop</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
          <Link href="/" className="text-slate-500 hover:text-slate-800 dark:hover:text-white inline-flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Regular App</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function JoinApprenticePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] flex items-center justify-center text-xs text-slate-400">
          Loading apprentice portal...
        </div>
      }
    >
      <JoinApprenticeContent />
    </Suspense>
  );
}

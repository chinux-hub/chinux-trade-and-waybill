'use client';

import React, { useState } from 'react';
import { X, UserCheck, Mail, LogOut, CheckCircle2, ShieldCheck, MapPin } from 'lucide-react';
import { storage } from '@/lib/storage';
import { User, MarketHub } from '@/types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(storage.getCurrentUser());
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [marketHub, setMarketHub] = useState<MarketHub>('onitsha');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleGoogleAuth = () => {
    const user = storage.loginWithGoogle(email || 'trader@gmail.com', name || 'Google Verified Trader');
    setCurrentUser(user);
    setSuccessMsg('Logged in with Google account!');
    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 1500);
  };

  const handleEmailAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    if (mode === 'login') {
      const user = storage.loginWithEmail(email);
      setCurrentUser(user);
      setSuccessMsg('Logged in successfully!');
    } else {
      const user = storage.signup(name || 'Trader', email, businessName || 'Wholesale Enterprise', marketHub);
      setCurrentUser(user);
      setSuccessMsg('Account created successfully!');
    }

    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 1500);
  };

  const handleLogout = () => {
    storage.logout();
    setCurrentUser(null);
    setSuccessMsg('Logged out.');
    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white dark:bg-navy-900 rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 text-xs space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              CX
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {currentUser ? 'Trader Profile & Account' : mode === 'login' ? 'Sign In to Chinux' : 'Register Wholesale Account'}
              </h3>
              <p className="text-[10px] text-slate-400">Anambra & Lagos Interstate Trade Network</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-black dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {successMsg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 rounded-2xl flex items-center gap-2 font-bold animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {currentUser ? (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-white">{currentUser.name}</span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  {currentUser.authProvider === 'google' ? 'Google Account' : 'Email Verified'}
                </span>
              </div>
              <div className="text-slate-500">{currentUser.email}</div>
              <div className="text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1 text-[11px]">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                <span>{storage.getMarketHubLabel(currentUser.marketHub)}</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full py-2.5 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all border border-red-200 dark:border-red-900"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Google One-Tap Login Button */}
            <button
              onClick={handleGoogleAuth}
              type="button"
              className="w-full py-2.5 px-4 bg-white dark:bg-navy-950 hover:bg-slate-50 text-slate-800 dark:text-slate-200 font-bold rounded-2xl border border-slate-300 dark:border-slate-700 shadow-sm flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="flex items-center my-3">
              <div className="flex-1 border-t border-slate-200 dark:border-slate-800"></div>
              <span className="px-3 text-slate-400 text-[10px] uppercase tracking-wider font-semibold">Or with email</span>
              <div className="flex-1 border-t border-slate-200 dark:border-slate-800"></div>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-3">
              {mode === 'signup' && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Chief Emeka / Alhaji Danladi"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Shop / Business Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Chinux Spare Parts Global Ltd"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Primary Wholesale Market</label>
                    <select
                      value={marketHub}
                      onChange={(e) => setMarketHub(e.target.value as MarketHub)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium"
                    >
                      <option value="onitsha">Main Market / Bridgehead, Onitsha (Anambra)</option>
                      <option value="nnewi">Nkwo Nnewi Industrial Cluster (Anambra)</option>
                      <option value="trade_fair_lagos">Trade Fair Complex, Badagry Expressway (Lagos)</option>
                      <option value="alaba_lagos">Alaba International Market, Ojo (Lagos)</option>
                      <option value="idumota_lagos">Idumota / Balogun Market (Lagos Island)</option>
                      <option value="ladipo_lagos">Ladipo Auto Spare Parts Market, Mushin (Lagos)</option>
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="trader@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all"
              >
                {mode === 'login' ? 'Sign In' : 'Create Trader Account'}
              </button>
            </form>

            <div className="text-center pt-1 text-slate-500">
              {mode === 'login' ? (
                <span>
                  New to Chinux?{' '}
                  <button onClick={() => setMode('signup')} className="font-bold text-emerald-600 hover:underline">
                    Create an account
                  </button>
                </span>
              ) : (
                <span>
                  Already have an account?{' '}
                  <button onClick={() => setMode('login')} className="font-bold text-emerald-600 hover:underline">
                    Sign in
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

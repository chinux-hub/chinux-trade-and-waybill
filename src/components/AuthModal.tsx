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
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [marketHub, setMarketHub] = useState<MarketHub>('onitsha');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setErrorMsg('');
    const res = await storage.loginWithGoogle(email || 'trader@gmail.com', name || 'Google Verified Trader');
    setIsLoading(false);
    if (res.error) {
      setErrorMsg(res.error);
      return;
    }
    if (res.user) {
      setCurrentUser(res.user);
      setSuccessMsg('Logged in with Google account!');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1500);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setErrorMsg('');

    if (mode === 'login') {
      const res = await storage.loginWithEmail(email, password, username);
      setIsLoading(false);
      if (res.error) {
        setErrorMsg(res.error);
        return;
      }
      if (res.user) {
        setCurrentUser(res.user);
        setSuccessMsg('Logged in successfully! Entering Oga Dashboard...');
        setTimeout(() => {
          setSuccessMsg('');
          onClose();
          window.location.href = '/dashboard';
        }, 900);
      }
    } else {
      const res = await storage.signup(name || 'Trader', email, password, businessName || 'Wholesale Enterprise', marketHub, username);
      setIsLoading(false);
      if (res.error) {
        setErrorMsg(res.error);
        return;
      }
      if (res.user) {
        setCurrentUser(res.user);
        setSuccessMsg('Wholesale account created! Launching Oga View...');
        setTimeout(() => {
          setSuccessMsg('');
          onClose();
          window.location.href = '/dashboard';
        }, 900);
      }
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    await storage.logout();
    setIsLoading(false);
    setCurrentUser(null);
    setSuccessMsg('Logged out successfully.');
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
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

        {errorMsg && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 rounded-2xl flex items-center gap-2 font-bold animate-fadeIn">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {currentUser ? (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white block">{currentUser.name}</span>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">{currentUser.businessName || 'Wholesale Enterprise'}</span>
                </div>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Active
                </span>
              </div>
              <div className="text-slate-500 text-[11px]">{currentUser.email}</div>
              <div className="text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1 text-[10px]">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                <span>{storage.getMarketHubLabel(currentUser.marketHub)}</span>
              </div>
            </div>

            {/* Connected Apprentices for this Shop (1-Click Switch) */}
            {storage.getSavedAccounts().filter((acc) => acc.id !== currentUser.id).length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Connected Apprentices for this Shop:
                </span>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {storage.getSavedAccounts()
                    .filter((acc) => acc.id !== currentUser.id)
                    .map((acc) => (
                      <div
                        key={acc.id}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between hover:border-emerald-500/50 transition-all"
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px]">
                              {acc.name}
                            </span>
                            {acc.username && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                                @{acc.username}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">{acc.businessName || acc.email}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            storage.switchAccount(acc);
                            setCurrentUser(acc);
                            setSuccessMsg(`Switched to ${acc.name}!`);
                            setTimeout(() => {
                              setSuccessMsg('');
                              onClose();
                            }, 1000);
                          }}
                          className="px-2.5 py-1 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-600 hover:text-white rounded-lg font-bold text-[10px] transition-all"
                        >
                          Switch
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setCurrentUser(null);
                  setMode('login');
                }}
                className="py-2.5 px-3 bg-slate-100 dark:bg-navy-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 font-bold rounded-xl text-center text-xs transition-all border border-slate-200 dark:border-slate-700"
              >
                + Add / Log In Another
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="py-2.5 px-3 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all border border-rose-200 dark:border-rose-900 text-xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
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
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Unique Username (@handle)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-slate-400 font-bold">@</span>
                      <input
                        type="text"
                        placeholder="emeka_parts / brother_sani"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        className="w-full pl-7 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono text-xs"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Differentiates your login even if multiple partners or apprentices share the same email address.
                    </p>
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
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {mode === 'login' ? 'Email Address or @Username' : 'Email Address'}
                </label>
                <input
                  type={mode === 'login' ? 'text' : 'email'}
                  required
                  placeholder={mode === 'login' ? 'trader@gmail.com or @emeka_parts' : 'trader@gmail.com'}
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

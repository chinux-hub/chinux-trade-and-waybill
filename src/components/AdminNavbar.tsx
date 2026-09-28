'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, ArrowUpRight, DollarSign, MessageSquare, Activity, LogOut } from 'lucide-react';
import { storage } from '@/lib/storage';

export const AdminNavbar: React.FC = () => {
  const policy = storage.getPolicy();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-slate-950/95 border-rose-950/60 backdrop-blur-md text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Admin Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 to-rose-900 flex items-center justify-center shadow-lg shadow-rose-600/30 border border-rose-500/30">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-base tracking-tight text-white">
                CHINUX <span className="text-rose-500">ADMIN</span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-rose-950 text-rose-400 border border-rose-800">
                FOUNDER PORTAL
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Cash Flow & Platform Mission Control
            </span>
          </div>
        </div>

        {/* Live Status Indicators */}
        <div className="hidden md:flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300 font-medium">Core Engine: </span>
            <strong className="text-emerald-400">Operational</strong>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-300 font-medium">Policy: </span>
            <strong className={policy.monetizationActive ? 'text-emerald-400' : 'text-amber-400'}>
              {policy.monetizationActive ? 'Monetizing' : 'Free Mode'}
            </strong>
          </div>
        </div>

        {/* Action: Switch to Trader App */}
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <span>Exit to Trader App</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>
        </div>
      </div>
    </header>
  );
};

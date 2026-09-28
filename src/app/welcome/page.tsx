'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  PackageCheck,
  AlertCircle,
  TrendingUp,
  Building2,
  Share2,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  Smartphone,
  Users,
  ChevronRight,
} from 'lucide-react';

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white pb-20">
      {/* Top Banner Navigation */}
      <nav className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-emerald-500/20 bg-white">
              <img src="/chinux-logo.png" alt="Chinux" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-white">
                CHIN<span className="text-emerald-400">UX</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Nigerian Wholesale OS</span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/join"
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold transition-all"
            >
              Apprentice Join
            </Link>
            <Link
              href="/"
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all flex items-center gap-1"
            >
              <span>Enter App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 pb-16 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-bold uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Tailored for Onitsha, Nnewi & Lagos Wholesale Hubs
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto">
          The Digital Operating System for <span className="text-emerald-400">Nigerian Wholesale</span> Commerce
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Stop motor park cargo theft with <strong>4-digit secret pickup PINs</strong>, recover credit debts (*ugwo*) with <strong>1-click WhatsApp reminders</strong>, and mask profit margins from apprentices while automating sales.
        </p>

        {/* Hero CTA Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Link
            href="/"
            className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-2xl shadow-xl shadow-emerald-600/30 text-sm flex items-center gap-2 transition-all hover:scale-105"
          >
            <span>Launch Trader Portal (Day-1 Ready)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/join"
            className="px-5 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold rounded-2xl text-sm transition-all"
          >
            Join with Apprentice Code
          </Link>
        </div>

        <div className="text-[11px] text-slate-400 pt-2 flex items-center justify-center gap-4">
          <span>✓ 30-Day Unlimited Free Trial</span>
          <span>•</span>
          <span>✓ Moniepoint, Zenith & GTBank Auto-Sync</span>
          <span>•</span>
          <span>✓ Works Offline</span>
        </div>
      </header>

      {/* 5 Core Pillars Grid */}
      <section aria-label="Core platform pillars" className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-white">How Chinux Protects & Scales Your Wholesale Trade</h2>
          <p className="text-xs text-slate-400">Designed specifically for bustling Nigerian market realities</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Pillar 1: PIN Waybills */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg hover:border-emerald-500/50 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              <PackageCheck className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-white">4-Digit Pickup PIN Waybills</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              When shipping goods via Upper Iweka, Badagry Expressway, or Ojota parks, the haulage driver receives strict orders: <strong>release goods only when the buyer confirms their secret 4-digit PIN</strong>. Stops fake driver theft completely.
            </p>
          </div>

          {/* Pillar 2: Ugwo Recovery */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg hover:border-emerald-500/50 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center font-bold">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-white">1-Click WhatsApp Ugwo Reminders</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Track customer debts with overdue alert timers. Send pre-formatted invoice reminders in <strong>Polite British English</strong> or <strong>Friendly Local Pidgin</strong> with verified shop bank account details.
            </p>
          </div>

          {/* Pillar 3: Oga Sovereignty */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg hover:border-emerald-500/50 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-white">Oga vs. Nwaboyi Privacy</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Apprentices hook into your business using an <strong>invitation code</strong>. They log daily dispatches and sales, but your wholesale landed costs and net profit margins are <strong>completely masked</strong> from them.
            </p>
          </div>

          {/* Pillar 4: Bank Auto-Sync */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg hover:border-emerald-500/50 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-white">Automated Bank Statement Sync</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Connect your Moniepoint, Zenith, GTBank, or OPay account. Incoming customer transfers are automatically detected, matched to waybills, and logged into your Daily Sales Logbook.
            </p>
          </div>

          {/* Pillar 5: WhatsApp Stock Flyers */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg hover:border-emerald-500/50 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
              <Share2 className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-white">New Stock WhatsApp Broadcast & Status</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload product photos and broadcast new arrivals to customer WhatsApp chats or generate high-converting WhatsApp Status flyers in 1 click, based on Oga and apprentice settings.
            </p>
          </div>

          {/* Pillar 6: Mobile PWA */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg hover:border-emerald-500/50 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-white">Install as Mobile App (PWA)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tap "Add to Home Screen" on Android or iPhone to use Chinux as a native full-screen app. Fast, offline-capable, and optimized for low battery usage in open-air markets.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <footer className="max-w-4xl mx-auto px-4 sm:px-6 pt-16 text-center space-y-4">
        <div className="p-8 rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 border border-emerald-500/30 text-white space-y-4 shadow-2xl">
          <h2 className="text-2xl font-black">Ready to Modernize Your Wholesale Shop?</h2>
          <p className="text-xs text-emerald-100 max-w-lg mx-auto">
            Join hundreds of wholesale traders in Onitsha Main Market, Nnewi, and Lagos Trade Fair. Start your 30-day free trial right now.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link
              href="/"
              className="px-6 py-3 bg-white text-emerald-900 font-extrabold rounded-xl shadow-lg hover:bg-emerald-50 transition-all text-xs"
            >
              Enter Chinux Trader App →
            </Link>
          </div>
        </div>
        <p className="text-[11px] text-slate-500">
          Chinux Wholesale Operating System • Anambra & Lagos Commercial Corridors
        </p>
      </footer>
    </div>
  );
}

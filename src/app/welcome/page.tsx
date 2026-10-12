'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  MapPin,
  Truck,
  Store,
  Boxes,
  BadgeCheck,
  LogIn,
} from 'lucide-react';
import { storage } from '@/lib/storage';
import { User } from '@/types';
import { AuthModal } from '@/components/AuthModal';

export default function WelcomePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    setCurrentUser(storage.getCurrentUser());

    const handleUpdate = () => {
      setCurrentUser(storage.getCurrentUser());
    };
    window.addEventListener('chinux_data_updated', handleUpdate);
    return () => window.removeEventListener('chinux_data_updated', handleUpdate);
  }, []);

  const handleLaunchApp = () => {
    if (storage.getCurrentUser()) {
      router.push('/dashboard');
    } else {
      setIsAuthOpen(true);
    }
  };

  const marketHubs = [
    {
      name: 'Onitsha Main Market & Bridgehead',
      state: 'Anambra State',
      description: 'The largest commercial wholesale market in West Africa. Primary hub for direct importers of auto parts, textiles, and building materials.',
      image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80',
      badge: 'Headquarters Hub',
    },
    {
      name: 'Trade Fair Complex (Badagry Exp.)',
      state: 'Lagos State',
      description: 'The premier Nigerian interstate redistribution center. Bulk cosmetics, machinery, auto accessories, and nationwide cargo haulage.',
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
      badge: 'Interstate Cargo Hub',
    },
    {
      name: 'Alaba International Market',
      state: 'Lagos State (Ojo)',
      description: 'The global electronics, solar inverters, electrical appliances, and heavy generator wholesale capital of Nigeria.',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
      badge: 'Electronics & Solar',
    },
    {
      name: 'Nkwo Nnewi Industrial Cluster',
      state: 'Anambra State',
      description: 'The industrial manufacturing powerhouse and motorcycle/heavy-duty truck spare parts capital of Africa.',
      image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      badge: 'Auto Spare Parts',
    },
  ];

  const shopGalleries = [
    {
      title: 'Interstate Haulage & Loading Bays',
      location: 'Upper Iweka (Onitsha) & Ojota / Trade Fair (Lagos)',
      desc: 'Drivers receive waybill manifest with strict 4-digit pickup PIN release verification before goods leave the bus.',
      image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80',
      tag: 'Cargo Security',
    },
    {
      title: 'Wholesale Lockup Shops & Lines',
      location: 'Zone B Main Market & ASPMDA Trade Fair',
      desc: 'Apprentices record customer orders and carton counts while wholesale cost prices and landed margins remain locked by Oga.',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
      tag: 'Lockup Operations',
    },
    {
      title: 'Direct Importer Cargo Warehouses',
      location: 'Head Bridge Commercial Corridors',
      desc: 'Bulk stock carton management, restock notifications, and instant WhatsApp broadcasts with direct customer storefront links.',
      image: 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=800&q=80',
      tag: 'Bulk Storage',
    },
    {
      title: 'Cash Flow & Bank Reconciliations',
      location: 'Moniepoint, Zenith, GTBank & OPay Desks',
      desc: 'Automated statement sync instantly reconciles incoming transfer alerts against customer credit ledgers (Ugwo).',
      image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
      tag: 'Automated Ledgers',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white pb-20 relative overflow-hidden">
      {/* Dynamic Ambient Background Glow Orbs */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-emerald-500/20 rounded-full blur-[130px] pointer-events-none animate-pulseGlow" />
      <div className="absolute top-[850px] -left-36 w-[550px] h-[550px] bg-teal-500/15 rounded-full blur-[120px] pointer-events-none animate-floatSlow" />
      <div className="absolute top-[1700px] -right-36 w-[600px] h-[600px] bg-emerald-600/15 rounded-full blur-[125px] pointer-events-none animate-pulseGlow" />
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/20 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Banner Navigation */}
      <nav className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-emerald-500/20 bg-white">
              <img src="/chinux-logo.png" alt="Chinux" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-white">
                  CHIN<span className="text-emerald-400">UX</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  TradeBill
                </span>
              </div>
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

            {currentUser ? (
              <Link
                href="/dashboard"
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all flex items-center gap-1.5"
              >
                <span>Dashboard ({currentUser.name.split(' ')[0]})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In / Enter App</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 pb-14 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-bold uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Tailored for Anambra & Lagos Wholesale Corridors
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto">
          The Digital Operating System for <span className="text-emerald-400">Nigerian Wholesale</span> Trade
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Eliminate motor park cargo theft with <strong>4-digit secret pickup PINs</strong>, recover credit debts (<em>ugwo</em>) with <strong>1-click WhatsApp reminders</strong>, and mask profit margins from apprentices while automating sales.
        </p>

        {/* Hero CTA Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {currentUser ? (
            <Link
              href="/dashboard"
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-2xl shadow-xl shadow-emerald-600/30 text-sm flex items-center gap-2 transition-all hover:scale-105"
            >
              <span>Go to {currentUser.businessName || 'Shop'} Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <button
              onClick={() => setIsAuthOpen(true)}
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-2xl shadow-xl shadow-emerald-600/30 text-sm flex items-center gap-2 transition-all hover:scale-105"
            >
              <span>Launch Trader Portal (Day-1 Ready)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <Link
            href="/join"
            className="px-5 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold rounded-2xl text-sm transition-all"
          >
            Join with Apprentice Code
          </Link>
        </div>

        <div className="text-[11px] text-slate-400 pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-5">
          <span>✓ 30-Day Unlimited Free Trial</span>
          <span>•</span>
          <span>✓ Moniepoint, Zenith & GTBank Auto-Sync</span>
          <span>•</span>
          <span>✓ 100% Works Offline</span>
          <span>•</span>
          <span>✓ Supabase Cloud Backup</span>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 📍 SECTION: MAJOR COMMERCIAL MARKETS & HUBS */}
      {/* ========================================================================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-bold uppercase tracking-widest">
            <MapPin className="w-4 h-4" />
            <span>Commercial Corridors Connected</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">Major Markets & Commercial Hubs Involved</h2>
          <p className="text-xs text-slate-400 max-w-xl mx-auto">
            Powering cross-state wholesale logistics between Anambra direct importers and Lagos distribution networks.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {marketHubs.map((hub, idx) => (
            <div
              key={idx}
              className="rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl group card-glow-scroll hover:border-emerald-500/80 transition-all flex flex-col justify-between"
            >
              <div className="relative h-44 w-full overflow-hidden bg-slate-800">
                <img
                  src={hub.image}
                  alt={hub.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500 text-white shadow-md">
                  {hub.badge}
                </span>
                <span className="absolute bottom-2 left-3 text-[11px] font-bold text-emerald-300 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {hub.state}
                </span>
              </div>
              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-white group-hover:text-emerald-400 transition-colors">
                    {hub.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                    {hub.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 🛡️ 6 CORE PLATFORM PILLARS GRID */}
      {/* ========================================================================= */}
      <section aria-label="Core platform pillars" className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-white">How Chinux Protects & Scales Your Wholesale Trade</h2>
          <p className="text-xs text-slate-400">Engineered specifically for the real-life demands of bustling Nigerian markets</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Pillar 1: PIN Waybills */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg card-glow-scroll hover:border-emerald-500/80 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              <PackageCheck className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-white">4-Digit Pickup PIN Waybills</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              When shipping goods via Upper Iweka, Badagry Expressway, or Ojota parks, the haulage driver receives strict orders: <strong>release goods only when the buyer confirms their secret 4-digit PIN</strong>. Stops fake driver theft completely.
            </p>
          </div>

          {/* Pillar 2: Ugwo Recovery */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg card-glow-scroll hover:border-emerald-500/80 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center font-bold">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-white">1-Click WhatsApp Ugwo Reminders</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Track customer debts with overdue alert timers. Send pre-formatted invoice reminders in <strong>Polite British English</strong> or <strong>Friendly Local Pidgin</strong> with verified shop bank account details.
            </p>
          </div>

          {/* Pillar 3: Oga Sovereignty */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg card-glow-scroll hover:border-emerald-500/80 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-white">Oga vs. Nwaboyi Privacy</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Apprentices hook into your business using an <strong>invitation code</strong>. They log daily dispatches and sales, but your wholesale landed costs and net profit margins are <strong>completely masked</strong> from them.
            </p>
          </div>

          {/* Pillar 4: Bank Auto-Sync */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg card-glow-scroll hover:border-emerald-500/80 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-white">Automated Bank Statement Sync</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Connect your Moniepoint, Zenith, GTBank, or OPay account. Incoming customer transfers are automatically detected, matched to waybills, and logged into your Daily Sales Logbook.
            </p>
          </div>

          {/* Pillar 5: WhatsApp Stock Flyers */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg card-glow-scroll hover:border-emerald-500/80 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
              <Share2 className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-white">New Stock WhatsApp Broadcast & Status</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload product photos from your device gallery and broadcast new arrivals to customer WhatsApp chats or generate high-converting WhatsApp Status flyers in 1 click, complete with direct online customer storefront links.
            </p>
          </div>

          {/* Pillar 6: Mobile PWA & Offline Engine */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg card-glow-scroll hover:border-emerald-500/80 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-white">Install as Mobile App (100% Offline)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Install Chinux TradeBill as a native app on Android or iPhone. Work completely offline in market conditions with zero network; all your data automatically syncs to Supabase when reconnected.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 🏬 SECTION: SHOPS, WAREHOUSES & OPERATIONS IN ACTION */}
      {/* ========================================================================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-6">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-bold uppercase tracking-widest">
            <Store className="w-4 h-4" />
            <span>On-The-Ground Commercial Reality</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">Wholesale Shops & Warehouses in Action</h2>
          <p className="text-xs text-slate-400 max-w-xl mx-auto">
            From motor park dispatch bays to bustling lockup counters and importer warehouses across the trade corridor.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {shopGalleries.map((shop, idx) => (
            <div
              key={idx}
              className="rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl group card-glow-scroll hover:border-emerald-500/80 transition-all flex flex-col justify-between"
            >
              <div className="relative h-44 w-full overflow-hidden bg-slate-800">
                <img
                  src={shop.image}
                  alt={shop.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-600 text-white shadow-md">
                  {shop.tag}
                </span>
              </div>
              <div className="p-4 space-y-1.5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-white group-hover:text-emerald-400 transition-colors">
                    {shop.title}
                  </h3>
                  <p className="text-[10px] font-bold text-emerald-400/90">{shop.location}</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                    {shop.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <footer className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 text-center space-y-4">
        <div className="p-8 rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 border border-emerald-500/30 text-white space-y-4 shadow-2xl card-glow-scroll hover:border-emerald-400/70">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
            <BadgeCheck className="w-4 h-4 text-emerald-400" />
            <span>Built by Traders, for Traders</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">Ready to Modernize Your Wholesale Shop?</h2>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-lg mx-auto leading-relaxed">
            Join hundreds of wholesale traders in Onitsha Main Market, Nnewi, and Lagos Trade Fair. Start your 30-day free trial right now with zero card required.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            {currentUser ? (
              <Link
                href="/dashboard"
                className="px-6 py-3.5 bg-white text-emerald-900 font-extrabold rounded-2xl shadow-lg hover:bg-emerald-50 transition-all text-xs sm:text-sm flex items-center gap-2"
              >
                <span>Launch Chinux TradeBill App</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="px-6 py-3.5 bg-white text-emerald-900 font-extrabold rounded-2xl shadow-lg hover:bg-emerald-50 transition-all text-xs sm:text-sm flex items-center gap-2"
              >
                <span>Launch Chinux TradeBill App</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <Link
              href="/store"
              className="px-5 py-3.5 bg-slate-900/80 hover:bg-slate-900 text-white border border-white/20 font-bold rounded-2xl transition-all text-xs sm:text-sm"
            >
              Preview Customer Storefront
            </Link>
          </div>
        </div>
        <p className="text-[11px] text-slate-500">
          Chinux TradeBill • Anambra & Lagos Interstate Wholesale Operating System
        </p>
      </footer>

      {/* Auth Modal for 1-Click Sign In / Register */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => {
          setIsAuthOpen(false);
          const user = storage.getCurrentUser();
          setCurrentUser(user);
          if (user) {
            router.push('/dashboard');
          }
        }}
      />
    </div>
  );
}

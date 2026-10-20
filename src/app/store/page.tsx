'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ShoppingBag,
  Search,
  Phone,
  MessageCircle,
  Truck,
  ShieldCheck,
  MapPin,
  Sparkles,
  ArrowRight,
  KeyRound,
  CheckCircle2,
  Layers,
  ArrowLeft,
  PackageCheck,
  Grid3X3,
  ListFilter,
  CreditCard,
  Sun,
  Moon,
  Copy,
  Check,
  Share2,
  Store,
  LayoutGrid,
} from 'lucide-react';
import { storage } from '@/lib/storage';
import { CatalogProduct, TraderProfile, Waybill, StorefrontTheme, StorefrontViewMode } from '@/types';
import { formatNaira } from '@/lib/formatters';
import { createWhatsAppLink } from '@/lib/whatsapp';

function CustomerStorefrontContent() {
  const searchParams = useSearchParams();
  const highlightProductId = searchParams.get('product') || searchParams.get('id');

  const [profile, setProfile] = useState<TraderProfile>(storage.getProfile());
  const [catalog, setCatalog] = useState<CatalogProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [viewMode, setViewMode] = useState<StorefrontViewMode>('grid');
  const [themeOverride, setThemeOverride] = useState<StorefrontTheme | null>(null);
  const [copiedProductId, setCopiedProductId] = useState<string | null>(null);
  const [copiedStorefront, setCopiedStorefront] = useState(false);

  // Waybill Tracker State for Customers
  const [trackingCode, setTrackingCode] = useState('');
  const [trackedWaybill, setTrackedWaybill] = useState<Waybill | null>(null);
  const [trackSearched, setTrackSearched] = useState(false);

  useEffect(() => {
    const prof = storage.getProfile();
    setProfile(prof);
    setCatalog(storage.getCatalog());

    const savedView = localStorage.getItem('chinux_store_view_mode') as StorefrontViewMode;
    if (savedView) setViewMode(savedView);

    const savedTheme = localStorage.getItem('chinux_storefront_theme_override') as StorefrontTheme;
    if (savedTheme) {
      setThemeOverride(savedTheme);
    } else if (prof.storefrontTheme) {
      setThemeOverride(prof.storefrontTheme);
    }
  }, []);

  const activeTheme: StorefrontTheme = themeOverride || profile.storefrontTheme || 'dark';

  const handleToggleTheme = () => {
    const nextTheme: StorefrontTheme =
      activeTheme === 'dark' ? 'light' : activeTheme === 'light' ? 'emerald_luxury' : 'dark';
    setThemeOverride(nextTheme);
    localStorage.setItem('chinux_storefront_theme_override', nextTheme);
  };

  const handleSetViewMode = (mode: StorefrontViewMode) => {
    setViewMode(mode);
    localStorage.setItem('chinux_store_view_mode', mode);
  };

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://chinux.ng';
  const storefrontUrl = `${origin}/store`;

  const featuredProduct = highlightProductId
    ? catalog.find(
        (p) =>
          p.id === highlightProductId ||
          p.name.toLowerCase().includes(highlightProductId.toLowerCase())
      )
    : null;

  const categories = [
    'All',
    'Auto Spare Parts',
    'Solar & Power',
    'Industrial Haulage',
    'Building Materials',
    'Electronics & Appliances',
  ];

  const filteredProducts = catalog.filter((p) => {
    const matchesCat = activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleOrderViaWhatsApp = (prod: CatalogProduct) => {
    const productUrl = `${origin}/store?product=${prod.id}`;
    const message = `Hello *${profile?.businessName || 'Wholesale Store'}*,\nI am viewing your wholesale catalog on Chinux (${productUrl}).\n\n📦 *I want to order:*\n- *Item:* ${prod.name}\n- *Category:* ${prod.category}\n- *Wholesale Price:* ${formatNaira(prod.wholesalePrice)} / carton\n- *Stock Available:* ${prod.stockCount} cartons\n\nPlease confirm carton availability, payment account, and waybill dispatch schedule to my city.`;

    const url = createWhatsAppLink(profile?.phone || '', message);
    window.open(url, '_blank');
  };

  const handleCopyProductLink = (prod: CatalogProduct) => {
    const url = `${origin}/store?product=${prod.id}`;
    navigator.clipboard.writeText(url);
    setCopiedProductId(prod.id);
    setTimeout(() => setCopiedProductId(null), 2500);
  };

  const handleCopyStorefrontLink = () => {
    navigator.clipboard.writeText(storefrontUrl);
    setCopiedStorefront(true);
    setTimeout(() => setCopiedStorefront(false), 2500);
  };

  const handleTrackWaybill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingCode.trim()) return;

    setTrackSearched(true);
    const waybills = storage.getWaybills();
    const clean = trackingCode.trim().toUpperCase();

    const found = waybills.find(
      (wb) =>
        wb.pickupPin === clean ||
        wb.waybillNumber.toUpperCase() === clean ||
        wb.customerPhone.includes(clean)
    );
    setTrackedWaybill(found || null);
  };

  // Dynamic Theme Class Configurations
  const isLight = activeTheme === 'light';
  const isEmerald = activeTheme === 'emerald_luxury';

  const themeClasses = {
    wrapper: isLight
      ? 'bg-slate-100 text-slate-900'
      : isEmerald
      ? 'bg-[#051c14] text-white'
      : 'bg-slate-950 text-slate-100',
    card: isLight
      ? 'bg-white border-slate-200 shadow-sm'
      : isEmerald
      ? 'bg-[#0a2f22] border-emerald-800/80 shadow-md'
      : 'bg-slate-900 border-slate-800 shadow-sm',
    innerCard: isLight
      ? 'bg-slate-50 border-slate-200'
      : isEmerald
      ? 'bg-[#06241a] border-emerald-900'
      : 'bg-slate-950/70 border-slate-800',
    input: isLight
      ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-emerald-500'
      : isEmerald
      ? 'bg-[#06241a] border-emerald-800 text-white placeholder-emerald-300/40 focus:ring-emerald-400'
      : 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:ring-emerald-500',
    subText: isLight
      ? 'text-slate-500'
      : isEmerald
      ? 'text-emerald-300/80'
      : 'text-slate-400',
    titleText: isLight
      ? 'text-slate-900'
      : 'text-white',
    categoryActive: 'bg-emerald-600 text-white shadow-sm',
    categoryInactive: isLight
      ? 'bg-white border-slate-200 text-slate-700 hover:border-emerald-500'
      : isEmerald
      ? 'bg-[#0a2f22] border-emerald-800/60 text-emerald-200 hover:border-emerald-500'
      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-emerald-500',
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${themeClasses.wrapper}`}>
      <div className="space-y-6 animate-fadeIn pb-24 max-w-5xl mx-auto px-3 sm:px-4 pt-4 sm:pt-6">
        {/* Top Header Bar */}
        <div className={`flex items-center justify-between pb-3 border-b ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl overflow-hidden bg-white border border-emerald-500/20 shadow-sm">
              <img src="/chinux-logo.png" alt="Chinux" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className={`font-black text-sm tracking-tight ${themeClasses.titleText}`}>
                CHIN<span className="text-emerald-500">UX</span>
              </span>
              <span className={`text-[10px] font-medium block -mt-0.5 ${themeClasses.subText}`}>
                Wholesale Storefront
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            {/* Quick Theme Switcher Pill */}
            <button
              type="button"
              onClick={handleToggleTheme}
              className={`p-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                isLight
                  ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  : isEmerald
                  ? 'bg-[#0a2f22] border-emerald-800 text-emerald-300'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
              title={`Switch Theme (Current: ${activeTheme})`}
            >
              {isLight ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-[11px] hidden sm:inline">Light</span>
                </>
              ) : isEmerald ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[11px] hidden sm:inline">Emerald</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-[11px] hidden sm:inline">Dark</span>
                </>
              )}
            </button>

            <Link
              href="/dashboard"
              className={`text-[11px] font-bold flex items-center gap-1 transition-colors px-2.5 py-1.5 rounded-xl border ${
                isLight
                  ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  : 'border-slate-800 bg-slate-900 text-slate-300 hover:text-white'
              }`}
            >
              <span>Shop Owner Login</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* ⭐ SPOTLIGHT: Featured Product from WhatsApp Status link (?product=ID) */}
        {featuredProduct && (
          <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-navy-950 border-2 border-emerald-500 shadow-2xl space-y-4 animate-fadeIn text-white">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-wider text-emerald-300">
                  Item Broadcasted on WhatsApp Status
                </span>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500 text-white shadow-sm">
                {featuredProduct.isAvailable ? `In Stock (${featuredProduct.stockCount} cartons)` : 'Out of Stock'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
              <div className="relative h-60 sm:h-72 rounded-2xl overflow-hidden bg-slate-800 border border-slate-700">
                {featuredProduct.imageUrl ? (
                  <img
                    src={featuredProduct.imageUrl}
                    alt={featuredProduct.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                    Photo Preview
                  </div>
                )}
              </div>

              <div className="space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                    {featuredProduct.category}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
                    {featuredProduct.name}
                  </h2>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-400">
                    {formatNaira(featuredProduct.wholesalePrice)}
                    <span className="text-xs font-normal text-slate-300"> / carton wholesale</span>
                  </div>
                  {featuredProduct.retailPrice && (
                    <p className="text-xs text-slate-300">
                      Suggested Retail Guide: <strong>{formatNaira(featuredProduct.retailPrice)}</strong>
                    </p>
                  )}
                  <p className="text-xs text-slate-300 leading-relaxed pt-1">
                    Ready for instant nationwide waybill dispatch from <strong>{profile.businessName || 'Wholesale Store'}</strong> in {profile.marketLocation || 'Commercial Hub'}.
                  </p>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => handleOrderViaWhatsApp(featuredProduct)}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Order This Product via WhatsApp Now</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyProductLink(featuredProduct)}
                    className="w-full py-2 bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
                  >
                    {copiedProductId === featuredProduct.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedProductId === featuredProduct.id ? 'Product Link Copied!' : 'Copy Direct Link to this Item'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Seller Storefront Profile Header Card */}
        <div className={`p-5 sm:p-6 rounded-3xl border ${themeClasses.card} space-y-4`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shrink-0 ${
                isLight
                  ? 'bg-emerald-100 border border-emerald-200 text-emerald-800'
                  : 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
              }`}>
                {profile.businessName?.charAt(0) || 'C'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className={`text-lg sm:text-xl font-black ${themeClasses.titleText}`}>
                    {profile.businessName || 'Verified Wholesale Importer'}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                    <ShieldCheck className="w-3 h-3" />
                    Verified Trader
                  </span>
                </div>
                <div className={`flex items-center gap-1.5 text-xs ${themeClasses.subText} mt-0.5`}>
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{profile.marketLocation || 'Onitsha & Lagos Wholesale Hubs'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {profile.phone && (
                <a
                  href={`tel:${profile.phone}`}
                  className={`px-4 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                    isLight
                      ? 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      : 'border-slate-800 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Store</span>
                </a>
              )}
              <a
                href={createWhatsAppLink(profile?.phone || '', `Hello *${profile?.businessName || 'Store'}*, I am viewing your Chinux online catalog and would like to make an inquiry.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 active:scale-95"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp Shop</span>
              </a>
            </div>
          </div>

          {/* Store Perks Bar */}
          <div className={`grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t ${isLight ? 'border-slate-100 text-slate-600' : 'border-slate-800/80 text-slate-400'} text-[11px]`}>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Nationwide Waybill via Motor Park Haulage</span>
            </div>
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Secure 4-Digit Pickup PIN for Every Cargo</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
              <span>Direct Wholesale Container Rates</span>
            </div>
          </div>
        </div>

        {/* Track Cargo by Pickup PIN / Waybill Code */}
        <div className={`p-4 sm:p-5 rounded-3xl border ${themeClasses.innerCard} space-y-3`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-emerald-600" />
              <h2 className={`text-xs font-black uppercase tracking-wider ${themeClasses.titleText}`}>
                Track Your Waybill Cargo (No Login Needed)
              </h2>
            </div>
            <span className={`text-[10px] font-medium ${themeClasses.subText}`}>
              Enter 4-digit PIN or Waybill No.
            </span>
          </div>

          <form onSubmit={handleTrackWaybill} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. 8391 or WB-9421"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              className={`flex-1 px-3.5 py-2 rounded-xl border text-xs uppercase font-bold ${themeClasses.input}`}
            />
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
            >
              Track Cargo
            </button>
          </form>

          {trackSearched && (
            <div className="pt-2 animate-fadeIn">
              {trackedWaybill ? (
                <div className={`p-4 rounded-2xl border ${themeClasses.card} space-y-2`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className={`font-extrabold text-xs ${themeClasses.titleText}`}>
                        Waybill #{trackedWaybill.waybillNumber}
                      </span>
                      <span className={`text-[10px] block ${themeClasses.subText}`}>
                        Destination: {trackedWaybill.destinationCity} ({trackedWaybill.parkName})
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        trackedWaybill.status === 'collected'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                          : trackedWaybill.status === 'arrived'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                      }`}
                    >
                      {trackedWaybill.status === 'in_transit'
                        ? 'In Transit (On the Way)'
                        : trackedWaybill.status === 'arrived'
                        ? 'Arrived at Park (Ready for Pickup)'
                        : 'Collected'}
                    </span>
                  </div>
                  <div className={`grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1 border-t ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
                    <div>
                      <span className={`block text-[10px] ${themeClasses.subText}`}>Cartons:</span>
                      <span className={`font-bold ${themeClasses.titleText}`}>{trackedWaybill.cartonCount} pkgs</span>
                    </div>
                    <div>
                      <span className={`block text-[10px] ${themeClasses.subText}`}>Driver Name:</span>
                      <span className={`font-bold ${themeClasses.titleText}`}>{trackedWaybill.driverName}</span>
                    </div>
                    <div>
                      <span className={`block text-[10px] ${themeClasses.subText}`}>Driver Phone:</span>
                      <a href={`tel:${trackedWaybill.driverPhone}`} className="font-bold text-emerald-600">
                        {trackedWaybill.driverPhone}
                      </a>
                    </div>
                    <div>
                      <span className={`block text-[10px] ${themeClasses.subText}`}>Pickup PIN:</span>
                      <span className="font-black text-amber-600 font-mono">{trackedWaybill.pickupPin}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300 text-xs">
                  No active waybill found for &quot;{trackingCode}&quot;. Please verify your 4-digit PIN or contact {profile.businessName}.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Search, Filter & VIEW MODE SWITCHER Bar */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search products, brands, or spare parts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-9 pr-4 py-2.5 rounded-2xl border text-xs ${themeClasses.input}`}
              />
            </div>

            {/* View Mode Switcher: Grid, List, Card */}
            <div className={`flex rounded-2xl p-1 border self-start sm:self-auto ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}>
              <button
                type="button"
                onClick={() => handleSetViewMode('grid')}
                className={`p-2 rounded-xl transition-all ${
                  viewMode === 'grid'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'
                }`}
                title="Grid View (2 columns)"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleSetViewMode('list')}
                className={`p-2 rounded-xl transition-all ${
                  viewMode === 'list'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'
                }`}
                title="Wholesale List Scan"
              >
                <ListFilter className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleSetViewMode('card')}
                className={`p-2 rounded-xl transition-all ${
                  viewMode === 'card'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'
                }`}
                title="Showcase Card View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex gap-1.5 overflow-x-auto text-xs no-scrollbar pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all border ${
                  activeCategory === cat ? themeClasses.categoryActive : themeClasses.categoryInactive
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ============================================================== */}
        {/* PRODUCT CATALOG IN SELECTED VIEW MODE                          */}
        {/* ============================================================== */}

        {/* 1. ⊞ GRID VIEW (2-column on mobile, 3 on desktop) */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {filteredProducts.map((prod) => (
              <div
                key={prod.id}
                className={`rounded-2xl border overflow-hidden transition-all flex flex-col justify-between ${themeClasses.card} ${
                  prod.id === highlightProductId ? 'border-2 border-emerald-500 ring-2 ring-emerald-500/30' : ''
                }`}
              >
                <div className="relative aspect-square bg-slate-100 dark:bg-slate-950 overflow-hidden">
                  {prod.imageUrl ? (
                    <img
                      src={prod.imageUrl}
                      alt={prod.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                      <Layers className="w-6 h-6 opacity-40" />
                      <span className="text-[10px] mt-1">No photo</span>
                    </div>
                  )}

                  <div className="absolute top-2 left-2">
                    {prod.isAvailable && prod.stockCount > 0 ? (
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-sm">
                        In Stock ({prod.stockCount})
                      </span>
                    ) : (
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-red-600 text-white shadow-sm">
                        Out of Stock
                      </span>
                    )}
                  </div>
                </div>

                {/* Pic description and direct redirect link */}
                <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">
                      {prod.category}
                    </span>
                    <h3 className={`font-black text-xs mt-0.5 line-clamp-2 leading-tight ${themeClasses.titleText}`}>
                      {prod.name}
                    </h3>
                  </div>

                  <div className={`space-y-2 pt-2 border-t ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
                    <div>
                      <span className={`text-[9px] block font-medium ${themeClasses.subText}`}>Wholesale Rate</span>
                      <div className={`text-sm font-black ${themeClasses.titleText}`}>
                        {formatNaira(prod.wholesalePrice)}
                        <span className="text-[9px] font-normal text-slate-400"> / carton</span>
                      </div>
                    </div>

                    {/* Direct link and WhatsApp order action buttons */}
                    <div className="space-y-1.5">
                      <button
                        type="button"
                        onClick={() => handleOrderViaWhatsApp(prod)}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] rounded-xl shadow-sm transition-all flex items-center justify-center gap-1 active:scale-95"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Order via WhatsApp</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopyProductLink(prod)}
                        className={`w-full py-1 text-[10px] font-bold rounded-lg border transition-all flex items-center justify-center gap-1 ${
                          isLight
                            ? 'border-slate-200 text-slate-600 hover:bg-slate-50'
                            : 'border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {copiedProductId === prod.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedProductId === prod.id ? 'Link Copied!' : 'Copy Item Link'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 2. ☰ WHOLESALE LIST SCAN VIEW (Compact B2B Rows) */}
        {viewMode === 'list' && (
          <div className="space-y-2">
            {filteredProducts.map((prod) => (
              <div
                key={prod.id}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${themeClasses.card} ${
                  prod.id === highlightProductId ? 'border-2 border-emerald-500 ring-2 ring-emerald-500/30' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-950 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-800">
                    {prod.imageUrl ? (
                      <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Layers className="w-5 h-5 opacity-40" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <span className="text-[9px] uppercase font-bold text-emerald-600 dark:text-emerald-400">
                      {prod.category}
                    </span>
                    <h3 className={`font-black text-xs sm:text-sm truncate ${themeClasses.titleText}`}>
                      {prod.name}
                    </h3>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Available: <strong>{prod.stockCount} cartons</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className={`text-[9px] block ${themeClasses.subText}`}>Wholesale</span>
                    <div className={`text-xs sm:text-sm font-black ${themeClasses.titleText}`}>
                      {formatNaira(prod.wholesalePrice)}
                    </div>
                    <span className="text-[9px] text-slate-400">/ carton</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleCopyProductLink(prod)}
                      className={`p-2 rounded-xl border transition-all ${
                        isLight ? 'border-slate-200 text-slate-600 hover:bg-slate-50' : 'border-slate-800 text-slate-400'
                      }`}
                      title="Copy Direct Link to this Item"
                    >
                      {copiedProductId === prod.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOrderViaWhatsApp(prod)}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1 active:scale-95"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Order via WhatsApp</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 3. 🗂 SHOWCASE CARD VIEW (Expanded High-Impact Cards) */}
        {viewMode === 'card' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProducts.map((prod) => (
              <div
                key={prod.id}
                className={`rounded-3xl border overflow-hidden shadow-sm flex flex-col justify-between ${themeClasses.card} ${
                  prod.id === highlightProductId ? 'border-2 border-emerald-500 ring-2 ring-emerald-500/30' : ''
                }`}
              >
                <div className="relative h-56 bg-slate-100 dark:bg-slate-950 overflow-hidden">
                  {prod.imageUrl ? (
                    <img
                      src={prod.imageUrl}
                      alt={prod.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs gap-1">
                      <Layers className="w-8 h-8 opacity-40" />
                      <span>No photo available</span>
                    </div>
                  )}

                  <div className="absolute top-2.5 left-2.5">
                    {prod.isAvailable && prod.stockCount > 0 ? (
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-600 text-white shadow-sm">
                        In Stock ({prod.stockCount} cartons in store)
                      </span>
                    ) : (
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-red-600 text-white shadow-sm">
                        Out of Stock
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">
                      {prod.category}
                    </span>
                    <h3 className={`font-black text-sm mt-0.5 leading-snug ${themeClasses.titleText}`}>
                      {prod.name}
                    </h3>
                  </div>

                  <div className={`space-y-3 border-t pt-3 ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className={`text-[10px] block font-medium ${themeClasses.subText}`}>Wholesale Rate</span>
                        <span className={`text-base font-black ${themeClasses.titleText}`}>
                          {formatNaira(prod.wholesalePrice)}
                        </span>
                        <span className="text-[10px] text-slate-400"> / carton</span>
                      </div>

                      {prod.retailPrice && (
                        <div className="text-right">
                          <span className={`text-[10px] block font-medium ${themeClasses.subText}`}>Retail Guide</span>
                          <span className="text-xs font-bold text-slate-500">
                            {formatNaira(prod.retailPrice)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleOrderViaWhatsApp(prod)}
                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5 active:scale-95"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Order via WhatsApp</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopyProductLink(prod)}
                        className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1 ${
                          isLight
                            ? 'border-slate-200 text-slate-700 hover:bg-slate-50'
                            : 'border-slate-800 text-slate-300 hover:bg-slate-800'
                        }`}
                        title="Copy direct product link"
                      >
                        {copiedProductId === prod.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredProducts.length === 0 && (
          <div className={`p-12 text-center rounded-3xl border space-y-2 ${themeClasses.card}`}>
            <Layers className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className={`text-sm font-bold ${themeClasses.titleText}`}>No matching products found</h3>
            <p className={`text-xs ${themeClasses.subText}`}>Try changing your search keywords or category filter.</p>
          </div>
        )}

        {/* ============================================================== */}
        {/* 🏁 THE FINAL SLIDE / END OF CATALOG STORE FRONT LINK CARD      */}
        {/* ============================================================== */}
        <div className="mt-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-navy-950 border-2 border-emerald-500/80 shadow-2xl text-white space-y-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center mx-auto">
            <Store className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400 block">
              Official Digital Wholesale Storefront
            </span>
            <h2 className="text-xl sm:text-2xl font-black">
              {profile.businessName || 'Wholesale Importer & Distributor'}
            </h2>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              You have viewed all {catalog.length} available inventory items in store. Bookmark this link to check daily arrivals and new container dispatches.
            </p>
          </div>

          {/* Solely the direct link to the store front */}
          <div className="p-3.5 rounded-2xl bg-black/50 border border-emerald-500/40 max-w-lg mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div className="font-mono text-xs sm:text-sm font-black text-emerald-300 truncate max-w-full">
              {storefrontUrl}
            </div>
            <button
              type="button"
              onClick={handleCopyStorefrontLink}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow transition-all shrink-0 flex items-center gap-1.5 active:scale-95"
            >
              {copiedStorefront ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedStorefront ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
            <a
              href={createWhatsAppLink(profile?.phone || '', `Hello *${profile?.businessName || 'Store'}*, I viewed your Chinux wholesale catalog (${storefrontUrl}) and want to discuss a bulk purchase.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5 active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Contact Store on WhatsApp</span>
            </a>

            {profile.phone && (
              <a
                href={`tel:${profile.phone}`}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call {profile.phone}</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CustomerStorefrontPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-xs text-slate-400">
          Loading wholesale storefront...
        </div>
      }
    >
      <CustomerStorefrontContent />
    </Suspense>
  );
}
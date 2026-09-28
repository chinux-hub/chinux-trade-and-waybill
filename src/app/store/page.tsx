'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  RefreshCw,
  KeyRound,
  CheckCircle2,
  Clock,
  Layers,
  ArrowLeft,
} from 'lucide-react';
import { storage } from '@/lib/storage';
import { CatalogProduct, TraderProfile, Waybill } from '@/types';
import { formatNaira } from '@/lib/formatters';

export default function CustomerStorefrontPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<TraderProfile>(storage.getProfile());
  const [catalog, setCatalog] = useState<CatalogProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Waybill Tracker State for Customers
  const [trackingCode, setTrackingCode] = useState('');
  const [trackedWaybill, setTrackedWaybill] = useState<Waybill | null>(null);
  const [trackSearched, setTrackSearched] = useState(false);

  useEffect(() => {
    setProfile(storage.getProfile());
    setCatalog(storage.getCatalog());
  }, []);

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
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://chinux.ng';
    const message = `Hello *${profile.businessName}*,
I am viewing your wholesale catalog on Chinux (${origin}/store).

📦 *I want to order:*
- *Item:* ${prod.name}
- *Category:* ${prod.category}
- *Wholesale Price:* ${formatNaira(prod.wholesalePrice)} / carton
- *Stock Available:* ${prod.stockCount} cartons

Please confirm carton availability, payment account, and waybill dispatch schedule to my city.`;

    let cleanPhone = profile.phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = '234' + cleanPhone.slice(1);
    const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
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

  return (
    <div className="space-y-6 animate-fadeIn pb-16 max-w-5xl mx-auto">
      {/* Switcher Banner: Customer <-> Trader Mode */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 p-4 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
            <RefreshCw className="w-5 h-5 text-emerald-100" />
          </div>
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-200 block">
              Buyer / Reseller Mode Active
            </span>
            <p className="text-xs text-white/90">
              Do you sell goods or need to issue waybills & record profits?
            </p>
          </div>
        </div>

        <Link
          href="/"
          className="px-4 py-2 bg-white text-emerald-800 hover:bg-emerald-50 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 whitespace-nowrap active:scale-95"
        >
          <span>Switch to Trader / Oga Mode</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Seller Storefront Profile Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-700 dark:text-purple-300 font-black text-xl shrink-0">
              {profile.businessName.charAt(0) || 'C'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  {profile.businessName}
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                  <ShieldCheck className="w-3 h-3" />
                  Verified Trader
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{profile.marketLocation}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${profile.phone}`}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-navy-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-all"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Store</span>
            </a>
            <a
              href={`https://api.whatsapp.com/send?phone=${profile.phone.replace(/\D/g, '')}`}
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
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
      <div className="p-5 rounded-3xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Track Your Waybill Cargo (No Login Needed)
            </h2>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">
            Enter 4-digit PIN or Waybill No.
          </span>
        </div>

        <form onSubmit={handleTrackWaybill} className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. 8391 or WB-9421"
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value)}
            className="flex-1 px-3.5 py-2 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white uppercase font-bold focus:ring-1 focus:ring-emerald-500"
          />
          <button
            type="submit"
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
          >
            Track Cargo
          </button>
        </form>

        {trackSearched && (
          <div className="pt-2 animate-fadeIn">
            {trackedWaybill ? (
              <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-emerald-200 dark:border-emerald-800/60 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                      Waybill #{trackedWaybill.waybillNumber}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
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
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1 border-t border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Cartons:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{trackedWaybill.cartonCount} pkgs</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Driver Name:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{trackedWaybill.driverName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Driver Phone:</span>
                    <a href={`tel:${trackedWaybill.driverPhone}`} className="font-bold text-emerald-600">
                      {trackedWaybill.driverPhone}
                    </a>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Pickup PIN:</span>
                    <span className="font-black text-amber-600 font-mono">{trackedWaybill.pickupPin}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300 text-xs">
                No active waybill found for "{trackingCode}". Please verify your 4-digit PIN or contact {profile.businessName}.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Catalog Search & Category Filters */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search products, brands, or spare parts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto text-xs no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-purple-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((prod) => (
          <div
            key={prod.id}
            className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div className="relative h-48 bg-slate-100 dark:bg-navy-950 overflow-hidden">
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
                {prod.isAvailable ? (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-sm">
                    In Stock ({prod.stockCount} cartons)
                  </span>
                ) : (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-red-600 text-white shadow-sm animate-pulse">
                    Out of Stock
                  </span>
                )}
              </div>
            </div>

            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400 tracking-wider">
                  {prod.category}
                </span>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mt-0.5 line-clamp-2">
                  {prod.name}
                </h3>
              </div>

              <div className="space-y-3 border-t border-slate-100 dark:border-slate-800 pt-3">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Wholesale Rate</span>
                    <span className="text-base font-black text-slate-900 dark:text-white">
                      {formatNaira(prod.wholesalePrice)}
                    </span>
                    <span className="text-[10px] text-slate-400"> / carton</span>
                  </div>

                  {prod.retailPrice && (
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-medium">Retail Guide</span>
                      <span className="text-xs font-bold text-slate-500">
                        {formatNaira(prod.retailPrice)}
                      </span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleOrderViaWhatsApp(prod)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Order via WhatsApp / Request Waybill</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <Layers className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No matching products found</h3>
          <p className="text-xs text-slate-400">Try changing your search keywords or category filter.</p>
        </div>
      )}
    </div>
  );
}

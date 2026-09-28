'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Layers, Bell, CheckCircle2, ArrowLeft, Plus, Sparkles, AlertCircle, Share2, Lock, Smartphone, Camera } from 'lucide-react';
import { storage } from '@/lib/storage';
import { CatalogProduct, TraderProfile } from '@/types';
import { formatNaira } from '@/lib/formatters';
import { RestockAlarmModal } from '@/components/RestockAlarmModal';
import { StockBroadcastModal } from '@/components/StockBroadcastModal';
import { AddStockModal } from '@/components/AddStockModal';

export default function CatalogPage() {
  const [profile, setProfile] = useState<TraderProfile>(storage.getProfile());
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedProductForAlarm, setSelectedProductForAlarm] = useState<CatalogProduct | null>(null);
  const [selectedProductForBroadcast, setSelectedProductForBroadcast] = useState<CatalogProduct | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    setProfile(storage.getProfile());
    setProducts(storage.getCatalog());
  }, []);

  const isUnlocked = storage.isStockBroadcastUnlocked();
  const categories = ['All', 'Auto Spare Parts', 'Solar & Power', 'Industrial Haulage', 'Building Materials', 'Electronics & Appliances'];

  const filtered = products.filter(
    (p) => activeCategory === 'All' || p.category === activeCategory
  );

  return (
    <div className="space-y-6 animate-fadeIn pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-purple-600" />
            New Arrivals & Stock Catalog
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Both Oga & Apprentice can upload stock photos, broadcast arrival flyers to customer WhatsApp and Status, and link buyers to the online storefront.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
          >
            <Camera className="w-4 h-4" />
            <span>Upload New Stock</span>
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>

      {/* WhatsApp Stock Broadcast & Status Automation Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-purple-200 dark:border-purple-900/60 bg-gradient-to-r from-purple-50 via-white to-purple-50/50 dark:from-purple-950/30 dark:via-navy-900 dark:to-purple-950/20 p-5 shadow-sm">
        {/* If locked (30-day trial expired), blur out the entire feature */}
        {!isUnlocked && (
          <div className="absolute inset-0 z-20 backdrop-blur-md bg-white/75 dark:bg-navy-950/80 flex flex-col items-center justify-center p-4 text-center space-y-2">
            <div className="p-2.5 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-600">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              WhatsApp Stock Broadcast & Status Automation Locked
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md">
              Your 30-day free trial has expired. Subscribe to Chinux Pro to broadcast arrival photos to customers and auto-post stock flyers to WhatsApp Status.
            </p>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('chinux-open-subscription'));
                }
              }}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-xl shadow-md shadow-purple-600/30 transition-all active:scale-95"
            >
              Subscribe to Pro (₦3,500/mo) to Unlock
            </button>
          </div>
        )}

        <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 ${!isUnlocked ? 'filter blur-sm select-none' : ''}`}>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 text-[10px] font-extrabold uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              <span>Automated WhatsApp Marketing & Status</span>
            </div>
            <h2 className="text-base font-black text-slate-900 dark:text-white">
              Broadcast New Goods & Post Status Flyers
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
              Broadcast arrival photos to customers on WhatsApp with a direct link to your store. Status posts target:{' '}
              <strong className="text-purple-600 dark:text-purple-400 font-bold">
                {profile.permissions?.preferredStatusPoster === 'both' ? 'Both Oga & Apprentice Phones' : profile.permissions?.preferredStatusPoster === 'oga' ? "Oga's Phone Only" : "Apprentice's Phone Only"}
              </strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Camera className="w-4 h-4" />
              <span>Snap / Add Stock</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (products.length > 0) {
                  setSelectedProductForBroadcast(products[0]);
                }
              }}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-600/30 transition-all flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              <span>Broadcast Arrival</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto text-xs no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
              activeCategory === cat
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-purple-400'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.map((prod) => (
          <div
            key={prod.id}
            className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col justify-between"
          >
            <div className="relative h-40 bg-slate-100 dark:bg-navy-950 overflow-hidden">
              {prod.imageUrl ? (
                <img
                  src={prod.imageUrl}
                  alt={prod.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                  Photo
                </div>
              )}

              {/* In Stock vs Out of Stock Pill */}
              <div className="absolute top-2.5 left-2.5">
                {prod.isAvailable ? (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-white shadow-sm">
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
                <h3 className="font-extrabold text-xs text-slate-900 dark:text-white mt-0.5 line-clamp-2">
                  {prod.name}
                </h3>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-end border-t border-slate-100 dark:border-slate-800 pt-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Wholesale Rate</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      {formatNaira(prod.wholesalePrice)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedProductForBroadcast(prod)}
                    className="w-full py-1.5 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800/80 text-purple-700 dark:text-purple-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>WhatsApp Broadcast</span>
                  </button>

                  {prod.isAvailable ? (
                    <Link
                      href="/new"
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                    >
                      <span>Dispatch Cartons</span>
                    </Link>
                  ) : (
                    <button
                      onClick={() => setSelectedProductForAlarm(prod)}
                      className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>Set Restock Alarm</span>
                    </button>
                  )}
                </div>

                {prod.restockSubscribers.length > 0 && (
                  <div className="text-[10px] text-amber-600 dark:text-amber-400 text-center font-medium">
                    🔔 {prod.restockSubscribers.length} buyers waiting for restock
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Restock Alarm Modal */}
      <RestockAlarmModal
        product={selectedProductForAlarm}
        isOpen={!!selectedProductForAlarm}
        onClose={() => setSelectedProductForAlarm(null)}
      />

      {/* WhatsApp Stock Broadcast Modal */}
      <StockBroadcastModal
        product={selectedProductForBroadcast}
        isOpen={!!selectedProductForBroadcast}
        onClose={() => setSelectedProductForBroadcast(null)}
      />

      {/* Snap / Upload New Stock Modal */}
      <AddStockModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onProductAdded={(newProd, triggerBroadcast) => {
          setProducts(storage.getCatalog());
          if (triggerBroadcast) {
            setSelectedProductForBroadcast(newProd);
          }
        }}
      />
    </div>
  );
}

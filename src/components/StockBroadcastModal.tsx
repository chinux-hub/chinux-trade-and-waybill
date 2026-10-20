'use client';

import React, { useState, useEffect } from 'react';
import {
  Share2,
  X,
  Send,
  Smartphone,
  Sparkles,
  Lock,
  CheckCircle,
  ShieldAlert,
  Image as ImageIcon,
  MessageSquare,
  CheckSquare,
  Square,
  Package,
  Layers,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Copy,
  Store,
} from 'lucide-react';
import { CatalogProduct, TraderProfile } from '@/types';
import { storage } from '@/lib/storage';
import { formatNaira } from '@/lib/formatters';
import { createSmsLink } from '@/lib/whatsapp';

interface StockBroadcastModalProps {
  product?: CatalogProduct | null;
  isOpen: boolean;
  onClose: () => void;
}

export function StockBroadcastModal({ product, isOpen, onClose }: StockBroadcastModalProps) {
  const [profile, setProfile] = useState<TraderProfile>(storage.getProfile());
  const [catalog, setCatalog] = useState<CatalogProduct[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [mode, setMode] = useState<'status_slides' | 'combined' | 'direct'>('status_slides');
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [customerPhone, setCustomerPhone] = useState('');
  const [customNote, setCustomNote] = useState(
    'Fresh wholesale stock just arrived! Limited cartons available, click the link to reserve and request waybill.'
  );
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      const prof = storage.getProfile();
      setProfile(prof);
      const allProds = storage.getCatalog();
      setCatalog(allProds);

      if (product) {
        setSelectedProductIds([product.id]);
        setActiveSlideIndex(0);
      } else if (allProds.length > 0) {
        // Pre-select in-stock products, or all products
        const inStock = allProds.filter((p) => p.isAvailable && p.stockCount > 0);
        setSelectedProductIds(inStock.length > 0 ? inStock.map((p) => p.id) : allProds.map((p) => p.id));
        setActiveSlideIndex(0);
      }
    }
  }, [isOpen, product]);

  if (!isOpen) return null;

  const isUnlocked = storage.isStockBroadcastUnlocked();
  const isApprentice = profile.activeRole === 'apprentice';
  const apprenticeAllowed = !isApprentice || (profile.permissions.apprenticeCanBroadcastStock ?? true);
  const selectedProducts = catalog.filter((p) => selectedProductIds.includes(p.id));

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://chinux.ng';
  const storefrontUrl = `${origin}/store`;

  // Total slides = Selected products + 1 final slide (solely for the storefront link)
  const totalSlides = selectedProducts.length + 1;
  const isFinalSlide = activeSlideIndex === selectedProducts.length;
  const currentProduct = !isFinalSlide ? selectedProducts[activeSlideIndex] : null;

  // Generate text for each slide
  const getProductSlideText = (prod: CatalogProduct, index: number) => {
    const productUrl = `${origin}/store?product=${prod.id}`;
    return `📦 *[${index + 1}/${selectedProducts.length}] ${prod.name}*
💰 *Wholesale Rate:* ${formatNaira(prod.wholesalePrice)} / carton
📊 *Available Quantity:* ${prod.stockCount} cartons in store
🏷️ *Category:* ${prod.category}
🏢 *Store:* ${profile.businessName || 'Wholesale Importer'} (${profile.marketHub})
📍 *Location:* ${profile.marketLocation}

💬 "${customNote}"

👉 *Click to View Details & Place Waybill Order:*
${productUrl}

📞 *Call/WhatsApp:* ${profile.phone}
_⚡ Secure 4-digit pickup PIN for every waybill cargo_`;
  };

  const getFinalSlideText = () => {
    return `🛒 *VISIT OUR COMPLETE WHOLESALE CATALOG ONLINE* 🛒
🏢 *${profile.businessName || 'Wholesale Store'}* (${profile.marketHub})
📍 *Shop Location:* ${profile.marketLocation}

👇 *CLICK THE LINK BELOW TO BROWSE ALL PRODUCTS & PHOTOS:*
👉 ${storefrontUrl}

🚚 *Nationwide Waybill via Motor Park Haulage*
🔐 *Secure 4-Digit Pickup PIN for Every Cargo*
📞 *Call / WhatsApp Shop:* ${profile.phone}
_⚡ Powered by Chinux Wholesale Trade & Logistics_`;
  };

  const currentSlideText = isFinalSlide
    ? getFinalSlideText()
    : currentProduct
    ? getProductSlideText(currentProduct, activeSlideIndex)
    : '';

  // Combined text for all selected products
  const getCombinedText = () => {
    if (selectedProducts.length === 0) return '';
    const items = selectedProducts
      .map(
        (p, idx) =>
          `${idx + 1}️⃣ *${p.name}*\n   • Wholesale: *${formatNaira(p.wholesalePrice)}* / carton\n   • In Stock: ${p.stockCount} cartons\n   👉 Order item: ${origin}/store?product=${p.id}`
      )
      .join('\n\n');

    return `📢 *TODAY'S WHOLESALE ARRIVALS & INVENTORY* 📢
🏢 *${profile.businessName || 'Wholesale Store'}* (${profile.marketHub})
📍 *Shop Location:* ${profile.marketLocation}

📦 *AVAILABLE STOCK LIST (${selectedProducts.length} Items):*

${items}

🛒 *VIEW FULL STOREFRONT & BROWSE ALL PHOTOS:*
👉 ${storefrontUrl}

📞 *Call/WhatsApp to Reserve & Waybill:* ${profile.phone}
_⚡ Instant nationwide motor park haulage with secure 4-digit pickup PIN_`;
  };

  const handleToggleProduct = (id: string) => {
    setSelectedProductIds((prev) => {
      const next = prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id];
      if (activeSlideIndex >= next.length && next.length > 0) {
        setActiveSlideIndex(0);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedProductIds(catalog.map((p) => p.id));
    setActiveSlideIndex(0);
  };

  const handleSelectInStock = () => {
    const inStock = catalog.filter((p) => p.isAvailable && p.stockCount > 0);
    setSelectedProductIds(inStock.map((p) => p.id));
    setActiveSlideIndex(0);
  };

  const handleDeselectAll = () => {
    setSelectedProductIds([]);
    setActiveSlideIndex(0);
  };

  const handleSendToWhatsApp = (text: string) => {
    if (!isUnlocked) {
      window.dispatchEvent(new CustomEvent('chinux-open-subscription'));
      return;
    }

    let url = '';
    if (mode === 'direct' && customerPhone.trim()) {
      let clean = customerPhone.replace(/\D/g, '');
      if (clean.startsWith('0')) clean = '234' + clean.slice(1);
      url = `https://api.whatsapp.com/send?phone=${clean}&text=${encodeURIComponent(text)}`;
    } else {
      url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    }

    window.open(url, '_blank');
  };

  const handleCopySlideText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white dark:bg-navy-900 w-full max-w-2xl rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[94vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                WhatsApp Status Broadcast Studio
              </h2>
              <span className="text-[11px] text-slate-500 block">
                Slide-by-slide product adverts with direct links + final storefront slide
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-navy-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lock Overlay if 30-Day Trial Expired and not subscribed */}
        {!isUnlocked && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 space-y-2">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs">
              <Lock className="w-4 h-4 text-amber-600" />
              <span>30-Day Free Trial Expired - Feature Locked</span>
            </div>
            <p className="text-[11px] text-amber-700 dark:text-amber-400">
              Automated WhatsApp Stock Broadcast & Status Flyers are available on the Chinux Pro plan.
            </p>
            <button
              type="button"
              onClick={() => {
                onClose();
                window.dispatchEvent(new CustomEvent('chinux-open-subscription'));
              }}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all"
            >
              Upgrade to Pro (₦3,500/mo) to Unlock
            </button>
          </div>
        )}

        {/* Apprentice Restriction Warning if Oga turned it off */}
        {isApprentice && !apprenticeAllowed && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
            <span>Oga has restricted apprentices from broadcasting stock. Ask Oga for permission in Settings.</span>
          </div>
        )}

        {/* Broadcast Modes: Slide-by-Slide Status vs All-in-One vs Direct */}
        <div className="flex rounded-2xl bg-slate-100 dark:bg-navy-950 p-1 text-xs">
          <button
            type="button"
            onClick={() => setMode('status_slides')}
            className={`flex-1 py-2 font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              mode === 'status_slides'
                ? 'bg-white dark:bg-navy-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-purple-500" />
            <span>Status Slides Sequence</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('combined')}
            className={`flex-1 py-2 font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              mode === 'combined'
                ? 'bg-white dark:bg-navy-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-500" />
            <span>All-in-One Catalog</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('direct')}
            className={`flex-1 py-2 font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              mode === 'direct'
                ? 'bg-white dark:bg-navy-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <Send className="w-3.5 h-3.5 text-blue-500" />
            <span>Direct to Buyer</span>
          </button>
        </div>

        {/* 📦 BATCH PRODUCT SELECTION: Select All Products at once */}
        <div className="space-y-2 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 bg-slate-50/70 dark:bg-navy-950/50">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Package className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-black text-slate-900 dark:text-white">
                Select Products to Upload ({selectedProductIds.length} of {catalog.length} items)
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={handleSelectAll}
                className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold hover:bg-emerald-200 transition-colors"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={handleSelectInStock}
                className="px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold hover:bg-blue-200 transition-colors"
              >
                In-Stock Only
              </button>
              <button
                type="button"
                onClick={handleDeselectAll}
                className="px-2 py-1 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Product Checklist */}
          {catalog.length === 0 ? (
            <div className="p-3 text-center text-xs text-slate-400">
              No products found in catalog. Add items in Catalog first.
            </div>
          ) : (
            <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 no-scrollbar">
              {catalog.map((prod) => {
                const isChecked = selectedProductIds.includes(prod.id);
                return (
                  <div
                    key={prod.id}
                    onClick={() => handleToggleProduct(prod.id)}
                    className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                      isChecked
                        ? 'bg-white dark:bg-navy-800 border-emerald-500 shadow-sm'
                        : 'bg-white/60 dark:bg-navy-900/40 border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-navy-950 overflow-hidden shrink-0">
                        {prod.imageUrl ? (
                          <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <ImageIcon className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 dark:text-white truncate text-[11px]">
                          {prod.name}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {formatNaira(prod.wholesalePrice)} / carton • {prod.stockCount} cartons
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 ${
                        prod.isAvailable && prod.stockCount > 0
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
                      }`}
                    >
                      {prod.isAvailable && prod.stockCount > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 🎬 SLIDE-BY-SLIDE WHATSAPP STATUS GENERATOR */}
        {mode === 'status_slides' && (
          <div className="space-y-3 border-2 border-purple-500/40 dark:border-purple-600/30 rounded-3xl p-4 bg-purple-50/40 dark:bg-purple-950/20">
            {/* Slide Navigation Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-purple-700 dark:text-purple-300">
                  {isFinalSlide
                    ? `🏁 Final Slide: Storefront Link`
                    : `Slide ${activeSlideIndex + 1} of ${totalSlides}: Product Advert`}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-200 font-bold">
                  WhatsApp Status Sequence
                </span>
              </div>

              {/* Prev / Next controls */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={activeSlideIndex === 0}
                  onClick={() => setActiveSlideIndex((prev) => Math.max(0, prev - 1))}
                  className="p-1 rounded-lg bg-white dark:bg-navy-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 px-1">
                  {activeSlideIndex + 1}/{totalSlides}
                </span>
                <button
                  type="button"
                  disabled={activeSlideIndex === totalSlides - 1}
                  onClick={() => setActiveSlideIndex((prev) => Math.min(totalSlides - 1, prev + 1))}
                  className="p-1 rounded-lg bg-white dark:bg-navy-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Slide Pills Row */}
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {selectedProducts.map((p, idx) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActiveSlideIndex(idx)}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                    activeSlideIndex === idx
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-white dark:bg-navy-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span>#{idx + 1}</span>
                  <span className="truncate max-w-[90px]">{p.name}</span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => setActiveSlideIndex(selectedProducts.length)}
                className={`px-3 py-1 rounded-xl text-[10px] font-black whitespace-nowrap transition-all flex items-center gap-1 ${
                  isFinalSlide
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                }`}
              >
                <Store className="w-3 h-3" />
                <span>Final Slide (Storefront Link)</span>
              </button>
            </div>

            {/* Current Slide Display Card */}
            {!isFinalSlide && currentProduct ? (
              <div className="p-3.5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-20 h-20 rounded-xl bg-slate-100 dark:bg-navy-950 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                    {currentProduct.imageUrl ? (
                      <img
                        src={currentProduct.imageUrl}
                        alt={currentProduct.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                      {currentProduct.category}
                    </span>
                    <h3 className="font-black text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                      {currentProduct.name}
                    </h3>
                    <div className="text-xs font-black text-emerald-600">
                      {formatNaira(currentProduct.wholesalePrice)} / carton wholesale
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      In Stock: <strong>{currentProduct.stockCount} cartons</strong>
                    </div>
                  </div>
                </div>

                {/* Direct redirect link pill */}
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-emerald-500/30 text-[11px] space-y-1">
                  <div className="text-[10px] font-extrabold uppercase text-slate-400 flex items-center gap-1">
                    <ExternalLink className="w-3 h-3 text-emerald-500" />
                    <span>Customer Redirect Link (Under Product Pic & Description):</span>
                  </div>
                  <div className="font-mono text-emerald-600 dark:text-emerald-400 break-all text-[11px]">
                    {origin}/store?product={currentProduct.id}
                  </div>
                </div>

                {/* Slide Caption Preview & Quick Actions */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-slate-400">
                      WhatsApp Status Caption For This Slide
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopySlideText(currentSlideText, activeSlideIndex)}
                      className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                    >
                      {copiedIndex === activeSlideIndex ? (
                        <CheckCircle className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>{copiedIndex === activeSlideIndex ? 'Copied!' : 'Copy Slide Caption'}</span>
                    </button>
                  </div>

                  <pre className="p-2.5 rounded-xl bg-slate-900 text-slate-200 text-[10px] font-mono whitespace-pre-wrap leading-relaxed max-h-24 overflow-y-auto border border-slate-800">
                    {currentSlideText}
                  </pre>
                </div>

                {/* Upload This Slide to WhatsApp Status */}
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleSendToWhatsApp(currentSlideText)}
                    className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-xl shadow-md shadow-purple-600/20 transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Upload Slide #{activeSlideIndex + 1} to WhatsApp Status</span>
                  </button>
                  {activeSlideIndex < totalSlides - 1 && (
                    <button
                      type="button"
                      onClick={() => setActiveSlideIndex((prev) => prev + 1)}
                      className="px-3 py-2.5 bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all"
                    >
                      Next Slide →
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* 🏁 THE FINAL SLIDE: SOLELY THE STORE FRONT LINK */
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/80 via-slate-900 to-navy-950 border-2 border-emerald-500 shadow-xl text-white space-y-3.5">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Store className="w-5 h-5 text-emerald-400" />
                  <span className="font-black text-xs uppercase tracking-wider">
                    Final Slide: Complete Wholesale Storefront Link
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-black/40 border border-emerald-500/40 space-y-1.5 text-center">
                  <span className="text-[10px] text-emerald-300 uppercase tracking-widest font-black block">
                    Solely Direct Storefront Link
                  </span>
                  <div className="font-mono text-sm sm:text-base font-black text-emerald-300 break-all">
                    {storefrontUrl}
                  </div>
                  <p className="text-[10px] text-slate-300">
                    Customers tapping this link from WhatsApp Status land on your full digital catalog to view all stock, search items, and track haulage waybills.
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-slate-400">
                      Final Slide Status Text
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopySlideText(currentSlideText, 999)}
                      className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                    >
                      {copiedIndex === 999 ? <CheckCircle className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedIndex === 999 ? 'Copied!' : 'Copy Final Slide'}</span>
                    </button>
                  </div>
                  <pre className="p-2.5 rounded-xl bg-slate-900/90 text-slate-200 text-[10px] font-mono whitespace-pre-wrap leading-relaxed max-h-24 overflow-y-auto border border-slate-800">
                    {currentSlideText}
                  </pre>
                </div>

                <button
                  type="button"
                  onClick={() => handleSendToWhatsApp(currentSlideText)}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span>Upload Final Storefront Slide to WhatsApp Status</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* COMBINED / ALL-IN-ONE OR DIRECT MODE */}
        {(mode === 'combined' || mode === 'direct') && (
          <div className="space-y-3">
            {mode === 'direct' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Customer WhatsApp Number (Optional - leave blank to pick contact in WhatsApp)
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 08031234567"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Custom Broadcast Note / Urgency Pitch
              </label>
              <textarea
                rows={2}
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="e.g. Fresh batch cleared from warehouse, limited cartons available..."
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white resize-none"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-400">
                  Combined Catalog Text Preview ({selectedProducts.length} Items)
                </span>
                <button
                  type="button"
                  onClick={() => handleCopySlideText(getCombinedText(), 555)}
                  className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  {copiedIndex === 555 ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedIndex === 555 ? 'Copied!' : 'Copy Catalog Text'}</span>
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-slate-900 text-slate-200 text-[10px] font-mono whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto border border-slate-800">
                {getCombinedText()}
              </pre>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                disabled={(isApprentice && !apprenticeAllowed) || selectedProducts.length === 0}
                onClick={() => handleSendToWhatsApp(getCombinedText())}
                className="py-3 rounded-2xl font-black text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>
                  {mode === 'direct' ? 'Send Catalog via WhatsApp' : 'Post Full Catalog to WhatsApp'}
                </span>
              </button>

              <button
                type="button"
                disabled={(isApprentice && !apprenticeAllowed) || selectedProducts.length === 0}
                onClick={() => {
                  const smsUrl = createSmsLink(customerPhone, getCombinedText());
                  window.open(smsUrl, '_self');
                }}
                className="py-3 rounded-2xl font-black text-xs text-slate-100 bg-slate-900 hover:bg-slate-800 border border-slate-700 shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>Send via Direct SMS</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
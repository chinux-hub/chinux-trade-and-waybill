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
  DollarSign,
  AlertTriangle,
  Camera,
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
  const [policy, setPolicy] = useState(storage.getPolicy());
  const [catalog, setCatalog] = useState<CatalogProduct[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [mode, setMode] = useState<'status_slides' | 'combined' | 'direct'>('status_slides');
  const [includePrice, setIncludePrice] = useState(true);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [customerPhone, setCustomerPhone] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isSharingPhoto, setIsSharingPhoto] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const prof = storage.getProfile();
      setProfile(prof);
      setPolicy(storage.getPolicy());
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

  // Generate concise text for each slide (STRICTLY complying with WhatsApp 10-line / 700-char limit)
  const getProductSlideText = (prod: CatalogProduct) => {
    const params = new URLSearchParams();
    params.set('product', prod.id);
    params.set('title', prod.name);
    if (includePrice) {
      params.set('price', formatNaira(prod.wholesalePrice));
    }
    if (prod.imageUrl && prod.imageUrl.startsWith('http')) {
      params.set('img', prod.imageUrl);
    }
    const productUrl = `${origin}/store?${params.toString()}`;

    if (includePrice) {
      return `📦 *${prod.name}*
💰 *${formatNaira(prod.wholesalePrice)}* / carton
👉 *Order:* ${productUrl}`;
    }
    return `📦 *${prod.name}*
👉 *Order:* ${productUrl}`;
  };

  const handleSharePhotoStatus = async (prod: CatalogProduct, caption: string) => {
    if (!prod.imageUrl) {
      handleSendToWhatsApp(caption);
      return;
    }

    setIsSharingPhoto(true);
    try {
      let file: File | null = null;
      if (prod.imageUrl.startsWith('data:')) {
        const arr = prod.imageUrl.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], { type: mime });
        file = new File([blob], `${prod.name.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`, { type: mime });
      } else {
        const res = await fetch(prod.imageUrl);
        const blob = await res.blob();
        file = new File([blob], `${prod.name.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`, { type: blob.type || 'image/jpeg' });
      }

      if (file && typeof navigator !== 'undefined' && (navigator as any).canShare && (navigator as any).canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: prod.name,
          text: caption,
        });
        setIsSharingPhoto(false);
        return;
      }
    } catch (err) {
      console.log('Native image share fallback:', err);
    }
    setIsSharingPhoto(false);
    handleSendToWhatsApp(caption);
  };

  const getFinalSlideText = () => {
    return `🛒 *Visit Our Wholesale Storefront:*
🏢 *${profile.businessName || 'Wholesale Store'}*
👉 ${storefrontUrl}`;
  };

  const currentSlideText = isFinalSlide
    ? getFinalSlideText()
    : currentProduct
    ? getProductSlideText(currentProduct)
    : '';

  // Combined text for selected products (compacted to strictly stay within WhatsApp 10 lines)
  const getCombinedText = () => {
    if (selectedProducts.length === 0) return '';
    const maxItems = 7;
    const items = selectedProducts.slice(0, maxItems).map((p, idx) => {
      if (includePrice) {
        return `${idx + 1}. *${p.name}* - ${formatNaira(p.wholesalePrice)}`;
      }
      return `${idx + 1}. *${p.name}*`;
    }).join('\n');

    return `📦 *Available Wholesale Stock:*
${items}
👉 *View Storefront:* ${storefrontUrl}`;
  };

  const activeText = mode === 'status_slides' ? currentSlideText : getCombinedText();
  const lineCount = activeText.split('\n').length;
  const charCount = activeText.length;
  const isSafeForWhatsApp = lineCount <= 10 && charCount <= 700;

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
      <div className="bg-white dark:bg-navy-900 w-full max-w-xl rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[94vh] overflow-y-auto">
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
                Product name + direct link (fits WhatsApp 10-line / 700-char limit)
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
              <span>{policy.freeTrialDays || 30}-Day Free Trial Expired - Feature Locked</span>
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
              Go Premium (₦3,500/mo) to Unlock
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

        {/* Mode Selector */}
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
            <span>Quick 10-Line Status</span>
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

        {/* ⚙️ MERCHANT PREFERENCES: Optional Price Display */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-navy-950/70 border border-slate-200 dark:border-slate-800">
          <div className="pr-3">
            <span className="font-extrabold text-xs text-slate-900 dark:text-white block">
              Show Product Price on Status
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Optional — turn off if you prefer buyers to tap your link or DM for current market rate.
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={includePrice}
              onChange={(e) => setIncludePrice(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {/* 📦 BATCH PRODUCT SELECTION */}
        <div className="space-y-2 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 bg-slate-50/50 dark:bg-navy-950/40">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Package className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-black text-slate-900 dark:text-white">
                Select Products ({selectedProductIds.length} of {catalog.length})
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={handleSelectAll}
                className="px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold hover:bg-emerald-200"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={handleSelectInStock}
                className="px-2 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold hover:bg-blue-200"
              >
                In-Stock
              </button>
              <button
                type="button"
                onClick={handleDeselectAll}
                className="px-2 py-0.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
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
            <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1 no-scrollbar">
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
                      <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-navy-950 overflow-hidden shrink-0">
                        {prod.imageUrl ? (
                          <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <ImageIcon className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 dark:text-white truncate text-[11px]">
                          {prod.name}
                        </div>
                        {includePrice && (
                          <div className="text-[10px] text-emerald-600 font-semibold">
                            {formatNaira(prod.wholesalePrice)} / carton
                          </div>
                        )}
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

        {/* 🎬 SLIDE-BY-SLIDE MODE (Under WhatsApp 10-line limit per slide) */}
        {mode === 'status_slides' && (
          <div className="space-y-3 border-2 border-purple-500/40 dark:border-purple-600/30 rounded-3xl p-4 bg-purple-50/40 dark:bg-purple-950/20">
            {/* Slide Navigation Header */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-purple-700 dark:text-purple-300">
                {isFinalSlide
                  ? `🏁 Final Slide: Storefront Link`
                  : `Slide ${activeSlideIndex + 1} of ${totalSlides}: ${currentProduct?.name || 'Product'}`}
              </span>

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
                  <span className="truncate max-w-[80px]">{p.name}</span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => setActiveSlideIndex(selectedProducts.length)}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-black whitespace-nowrap transition-all flex items-center gap-1 ${
                  isFinalSlide
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                }`}
              >
                <Store className="w-3 h-3" />
                <span>Final Slide (Storefront Link)</span>
              </button>
            </div>

            {/* Slide Preview Card */}
            {!isFinalSlide && currentProduct ? (
              <div className="p-3.5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-navy-950 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                    {currentProduct.imageUrl ? (
                      <img
                        src={currentProduct.imageUrl}
                        alt={currentProduct.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-black text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                      {currentProduct.name}
                    </h3>
                    {includePrice && (
                      <div className="text-xs font-black text-emerald-600">
                        {formatNaira(currentProduct.wholesalePrice)} / carton
                      </div>
                    )}
                  </div>
                </div>

                {/* WhatsApp Status Compliance Live Counter */}
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className={isSafeForWhatsApp ? 'text-emerald-600 dark:text-emerald-400 flex items-center gap-1' : 'text-red-500'}>
                    <CheckCircle className="w-3 h-3" />
                    <span>WhatsApp Safe: {lineCount}/10 lines • {charCount}/700 chars</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopySlideText(currentSlideText, activeSlideIndex)}
                    className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1 font-bold"
                  >
                    {copiedIndex === activeSlideIndex ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedIndex === activeSlideIndex ? 'Copied!' : 'Copy Caption'}</span>
                  </button>
                </div>

                <pre className="p-2.5 rounded-xl bg-slate-900 text-slate-200 text-[11px] font-mono whitespace-pre-wrap leading-relaxed border border-slate-800">
                  {currentSlideText}
                </pre>

                {/* Upload Actions: Native Photo Status vs Text Link Status */}
                <div className="space-y-2 pt-1">
                  {currentProduct.imageUrl ? (
                    <button
                      type="button"
                      disabled={isSharingPhoto}
                      onClick={() => handleSharePhotoStatus(currentProduct, currentSlideText)}
                      className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                      <Camera className="w-4 h-4 text-emerald-200" />
                      <span>
                        {isSharingPhoto ? 'Opening WhatsApp with Photo...' : `Post Photo Slide #${activeSlideIndex + 1} to WhatsApp Status`}
                      </span>
                    </button>
                  ) : null}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleSendToWhatsApp(currentSlideText)}
                      className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Post Text Status Link</span>
                    </button>
                    {activeSlideIndex < totalSlides - 1 && (
                      <button
                        type="button"
                        onClick={() => setActiveSlideIndex((prev) => prev + 1)}
                        className="px-4 py-2 bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-navy-700"
                      >
                        Next →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* FINAL SLIDE: SOLELY THE STOREFRONT LINK */
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950 via-slate-900 to-navy-950 border-2 border-emerald-500 shadow-xl text-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Store className="w-4 h-4 text-emerald-400" />
                    <span className="font-black text-xs uppercase">Final Slide: Storefront Link</span>
                  </div>
                  <span className="text-[10px] text-emerald-300 font-mono">
                    {lineCount}/10 lines
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-emerald-500/40 text-center space-y-1">
                  <span className="text-[10px] text-emerald-300 uppercase font-black block">
                    Direct Link to Storefront
                  </span>
                  <div className="font-mono text-xs sm:text-sm font-black text-emerald-300 break-all">
                    {storefrontUrl}
                  </div>
                </div>

                <pre className="p-2.5 rounded-xl bg-slate-900/90 text-slate-200 text-[11px] font-mono whitespace-pre-wrap leading-relaxed border border-slate-800">
                  {currentSlideText}
                </pre>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleSendToWhatsApp(currentSlideText)}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <Send className="w-4 h-4" />
                    <span>Upload Final Slide to WhatsApp Status</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopySlideText(currentSlideText, 999)}
                    className="px-3 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold"
                  >
                    {copiedIndex === 999 ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* COMBINED MODE (Strictly within WhatsApp 10-line limit) */}
        {mode === 'combined' && (
          <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-black text-slate-900 dark:text-white">
                Ultra-Compact Status Text ({selectedProducts.length} items)
              </span>
              <span className={isSafeForWhatsApp ? 'text-[10px] font-bold text-emerald-600 dark:text-emerald-400' : 'text-[10px] font-bold text-amber-500'}>
                {lineCount}/10 lines max • {charCount}/700 chars
              </span>
            </div>

            {selectedProducts.length > 7 && (
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Showing first 7 items to guarantee WhatsApp&apos;s 10-line limit. Use &quot;Status Slides&quot; to post every item individually.</span>
              </div>
            )}

            <pre className="p-3 rounded-xl bg-slate-900 text-slate-200 text-[11px] font-mono whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto border border-slate-800">
              {getCombinedText()}
            </pre>

            <button
              type="button"
              disabled={(isApprentice && !apprenticeAllowed) || selectedProducts.length === 0}
              onClick={() => handleSendToWhatsApp(getCombinedText())}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>Post to WhatsApp Status (Fits in 10 Lines)</span>
            </button>
          </div>
        )}

        {/* DIRECT TO BUYER MODE */}
        {mode === 'direct' && (
          <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Customer WhatsApp Number (Optional)
              </label>
              <input
                type="tel"
                placeholder="e.g. 08031234567"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
              />
            </div>

            <pre className="p-3 rounded-xl bg-slate-900 text-slate-200 text-[11px] font-mono whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto border border-slate-800">
              {getCombinedText()}
            </pre>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSendToWhatsApp(getCombinedText())}
                className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>Send WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const smsUrl = createSmsLink(customerPhone, getCombinedText());
                  window.open(smsUrl, '_self');
                }}
                className="py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-100 border border-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>Send SMS</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
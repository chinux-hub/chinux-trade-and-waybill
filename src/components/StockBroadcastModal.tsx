'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Download,
  Flame,
  Images,
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
  const [isGeneratingFlyer, setIsGeneratingFlyer] = useState(false);
  const [isSharingBatch, setIsSharingBatch] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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

      // Auto-migrate any base64 images to public cloud storage for WhatsApp previews
      allProds.forEach((prod) => {
        if (prod.imageUrl && prod.imageUrl.startsWith('data:')) {
          fetch('/api/upload-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ base64: prod.imageUrl, filename: prod.id }),
          })
            .then((res) => res.json())
            .then((data) => {
              if (data?.publicUrl) {
                storage.updateCatalogProduct({ ...prod, imageUrl: data.publicUrl });
                setCatalog(storage.getCatalog());
              }
            })
            .catch((err) => console.log('Auto-migration failed for prod:', prod.id, err));
        }
      });
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

  // ==============================================================
  // HELPER: Convert base64 data URL or remote URL to File
  // ==============================================================
  const urlToFile = async (url: string, filename: string): Promise<File | null> => {
    try {
      if (url.startsWith('data:')) {
        const arr = url.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], { type: mime });
        return new File([blob], filename, { type: mime });
      } else {
        const res = await fetch(url);
        const blob = await res.blob();
        return new File([blob], filename, { type: blob.type || 'image/jpeg' });
      }
    } catch (e) {
      console.log('urlToFile error:', e);
      return null;
    }
  };

  // ==============================================================
  // ⚡ METHOD 1: GENERATE ALL-IN-ONE CATALOG FLYER (CANVAS)
  // ==============================================================
  const generateCatalogFlyerBlob = async (): Promise<Blob | null> => {
    const canvas = document.createElement('canvas');
    const width = 1080;
    // Calculate height dynamically based on product count
    const cols = 2;
    const rows = Math.ceil(selectedProducts.length / cols);
    const itemHeight = 320;
    const headerHeight = 360;
    const footerHeight = 260;
    const height = Math.max(1920, headerHeight + rows * itemHeight + footerHeight);

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#061325');
    grad.addColorStop(0.5, '#0a1d37');
    grad.addColorStop(1, '#020b18');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Decorative glow top right
    const glow = ctx.createRadialGradient(900, 150, 20, 900, 150, 400);
    glow.addColorStop(0, 'rgba(16, 185, 129, 0.25)');
    glow.addColorStop(1, 'rgba(16, 185, 129, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, 500);

    // HEADER SECTION
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('⚡ CHINUX VERIFIED WHOLESALE CATALOG', 60, 90);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 64px sans-serif';
    const bizName = (profile.businessName || 'WHOLESALE DISTRIBUTOR').toUpperCase();
    ctx.fillText(bizName, 60, 170);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 28px sans-serif';
    ctx.fillText(`📍 ${profile.marketLocation || 'Onitsha & Lagos Wholesale Hubs'}`, 60, 220);

    // Sub-banner
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.roundRect(60, 255, 960, 60, 16);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`📢 TODAY'S WHOLESALE ARRIVALS & PRICES (${selectedProducts.length} ITEMS)`, width / 2, 296);
    ctx.textAlign = 'left';

    // PRODUCTS GRID
    const startY = headerHeight;
    const colWidth = 460;
    const gapX = 40;
    const startX = 60;

    for (let i = 0; i < selectedProducts.length; i++) {
      const p = selectedProducts[i];
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (colWidth + gapX);
      const y = startY + row * itemHeight;

      // Card Box
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(x, y, colWidth, itemHeight - 30, 24);
      ctx.fill();
      ctx.stroke();

      // Thumbnail
      const imgSize = 130;
      const imgX = x + 20;
      const imgY = y + 20;

      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(imgX, imgY, imgSize, imgSize, 16);
      ctx.fill();

      if (p.imageUrl) {
        try {
          const imgEl = new Image();
          imgEl.crossOrigin = 'anonymous';
          imgEl.src = p.imageUrl;
          await new Promise((resolve) => {
            imgEl.onload = resolve;
            imgEl.onerror = resolve;
          });
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(imgX, imgY, imgSize, imgSize, 16);
          ctx.clip();
          ctx.drawImage(imgEl, imgX, imgY, imgSize, imgSize);
          ctx.restore();
        } catch (e) {
          // ignore error
        }
      }

      // Title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 30px sans-serif';
      const maxTitleWidth = colWidth - imgSize - 50;
      let title = p.name;
      if (ctx.measureText(title).width > maxTitleWidth) {
        while (ctx.measureText(title + '...').width > maxTitleWidth && title.length > 0) {
          title = title.slice(0, -1);
        }
        title += '...';
      }
      ctx.fillText(title, x + imgSize + 40, y + 60);

      // Category
      ctx.fillStyle = '#94a3b8';
      ctx.font = '22px sans-serif';
      ctx.fillText(p.category, x + imgSize + 40, y + 95);

      // Price
      if (includePrice) {
        ctx.fillStyle = '#34d399';
        ctx.font = '900 36px sans-serif';
        ctx.fillText(formatNaira(p.wholesalePrice), x + imgSize + 40, y + 145);
      } else {
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText('DM for Wholesale Rate', x + imgSize + 40, y + 145);
      }

      // Stock badge
      ctx.fillStyle = p.isAvailable && p.stockCount > 0 ? '#059669' : '#dc2626';
      ctx.beginPath();
      ctx.roundRect(x + 20, y + 175, 140, 40, 12);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        p.isAvailable && p.stockCount > 0 ? `In Stock (${p.stockCount})` : 'Out of Stock',
        x + 20 + 70,
        y + 202
      );
      ctx.textAlign = 'left';
    }

    // FOOTER SECTION
    const footY = height - footerHeight + 20;

    // Order CTA Banner
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.roundRect(60, footY, 960, 110, 24);
    ctx.fill();

    ctx.fillStyle = '#061325';
    ctx.font = '900 34px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('👉 ORDER & TRACK ONLINE: ' + storefrontUrl.replace(/^https?:\/\//, ''), width / 2, footY + 50);

    ctx.fillStyle = '#022c22';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(`📞 CALL/WHATSAPP: ${profile.phone} • NATIONWIDE MOTOR PARK WAYBILL`, width / 2, footY + 90);
    ctx.textAlign = 'left';

    return new Promise((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.92);
    });
  };

  // 1-Click Upload Catalog Flyer to WhatsApp Status
  const handleShareFlyerStatus = async () => {
    setIsGeneratingFlyer(true);
    try {
      const blob = await generateCatalogFlyerBlob();
      if (!blob) {
        alert('Could not generate flyer image.');
        setIsGeneratingFlyer(false);
        return;
      }
      const file = new File([blob], `${(profile.businessName || 'chinux').replace(/\s+/g, '_')}_catalog_flyer.jpg`, {
        type: 'image/jpeg',
      });

      const caption = `🛒 *Wholesale Catalog & Today's Stock*
🏢 *${profile.businessName || 'Wholesale Store'}*
👉 *Order online:* ${storefrontUrl}
📞 ${profile.phone}`;

      if (typeof navigator !== 'undefined' && (navigator as any).canShare && (navigator as any).canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `${profile.businessName} Wholesale Catalog`,
          text: caption,
        });
      } else {
        // Fallback: download flyer image
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${(profile.businessName || 'chinux').replace(/\s+/g, '_')}_wholesale_flyer.jpg`;
        a.click();
        URL.revokeObjectURL(url);
        handleSendToWhatsApp(caption);
      }
    } catch (err) {
      console.log('handleShareFlyerStatus error:', err);
    }
    setIsGeneratingFlyer(false);
  };

  // 1-Click Download Flyer
  const handleDownloadFlyer = async () => {
    setIsGeneratingFlyer(true);
    try {
      const blob = await generateCatalogFlyerBlob();
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${(profile.businessName || 'chinux').replace(/\s+/g, '_')}_wholesale_flyer.jpg`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.log('handleDownloadFlyer error:', err);
    }
    setIsGeneratingFlyer(false);
  };

  // ==============================================================
  // 📸 METHOD 2: MULTI-PHOTO NATIVE BATCH SHARE
  // ==============================================================
  const handleShareAllPhotosBatch = async () => {
    setIsSharingBatch(true);
    try {
      const prodsWithImage = selectedProducts.filter((p) => !!p.imageUrl);
      if (prodsWithImage.length === 0) {
        alert('None of the selected products have photos. Please add photos to catalog items first.');
        setIsSharingBatch(false);
        return;
      }

      const files: File[] = [];
      for (const p of prodsWithImage) {
        const f = await urlToFile(p.imageUrl!, `${p.name.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`);
        if (f) files.push(f);
      }

      if (files.length === 0) {
        alert('Could not prepare image files.');
        setIsSharingBatch(false);
        return;
      }

      const caption = `🛒 *${profile.businessName || 'Wholesale Store'}* Today's Arrivals
👉 *View & Order Online:* ${storefrontUrl}
📞 ${profile.phone}`;

      if (typeof navigator !== 'undefined' && (navigator as any).canShare && (navigator as any).canShare({ files })) {
        await navigator.share({
          files: files,
          title: `${profile.businessName} Wholesale Stock`,
          text: caption,
        });
      } else {
        alert(
          'Multi-photo direct sharing is supported on Android & iPhone Chrome/Safari. On this browser, you can post using the All-in-One Catalog Flyer or Slide Sequence.'
        );
      }
    } catch (err) {
      console.log('handleShareAllPhotosBatch error:', err);
    }
    setIsSharingBatch(false);
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

  const handleSharePhotoStatus = async (prod: CatalogProduct, caption: string) => {
    if (!prod.imageUrl) {
      handleSendToWhatsApp(caption);
      return;
    }

    setIsSharingPhoto(true);
    try {
      const file = await urlToFile(prod.imageUrl, `${prod.name.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`);
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
                1-click upload for all products with zero text limits
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

        {/* Lock Overlay if Free Trial Expired and not subscribed */}
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

        {/* ============================================================== */}
        {/* ⚡ 1-CLICK ALL-PRODUCTS DISPATCH TO WHATSAPP STATUS             */}
        {/* ============================================================== */}
        <div className="p-4 rounded-3xl bg-gradient-to-br from-emerald-950/90 via-slate-900 to-navy-950 border-2 border-emerald-500/60 text-white space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400">
                <Flame className="w-4 h-4" />
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-300">
                Send All Products at Once (No Line Limits)
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
              {selectedProducts.length} Items Selected
            </span>
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed">
            WhatsApp text status has a 10-line limit. Use these 1-click tools to send your complete inventory at once without getting blocked:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {/* METHOD 1: ALL-IN-ONE GRAPHIC CATALOG FLYER */}
            <div className="p-3 rounded-2xl bg-white/5 border border-emerald-500/30 space-y-2 flex flex-col justify-between">
              <div>
                <div className="text-xs font-extrabold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>1-Click Catalog Price Flyer</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Auto-generates a single visual price poster of all selected goods.
                </p>
              </div>

              <div className="flex gap-1.5 pt-1">
                <button
                  type="button"
                  disabled={isGeneratingFlyer || selectedProducts.length === 0}
                  onClick={handleShareFlyerStatus}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>{isGeneratingFlyer ? 'Creating...' : 'Upload Flyer to Status'}</span>
                </button>
                <button
                  type="button"
                  disabled={isGeneratingFlyer || selectedProducts.length === 0}
                  onClick={handleDownloadFlyer}
                  className="px-2.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all"
                  title="Download Image"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* METHOD 2: MULTI-PHOTO BATCH SHARE */}
            <div className="p-3 rounded-2xl bg-white/5 border border-purple-500/30 space-y-2 flex flex-col justify-between">
              <div>
                <div className="text-xs font-extrabold text-white flex items-center gap-1.5">
                  <Images className="w-3.5 h-3.5 text-purple-400" />
                  <span>Queue All Photos in Status</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Pushes all product photos to WhatsApp Status simultaneously.
                </p>
              </div>

              <button
                type="button"
                disabled={isSharingBatch || selectedProducts.length === 0}
                onClick={handleShareAllPhotosBatch}
                className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{isSharingBatch ? 'Preparing...' : 'Queue All Photos in WhatsApp'}</span>
              </button>
            </div>
          </div>
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

        {/* 🎬 SLIDE-BY-SLIDE INDIVIDUAL POSTER */}
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
      </div>
    </div>
  );
}

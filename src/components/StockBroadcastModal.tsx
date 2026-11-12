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
  Film,
  Video,
  Trash2,
  Save,
  PlusCircle,
} from 'lucide-react';
import { CatalogProduct, TraderProfile } from '@/types';
import { storage } from '@/lib/storage';
import { formatNaira } from '@/lib/formatters';
import { createSmsLink } from '@/lib/whatsapp';

export type FlyerTheme = 'emerald' | 'royal_blue' | 'crimson_gold' | 'modern_gold' | 'clean_white';

export interface GalleryMediaItem {
  id: string;
  file: File;
  previewUrl: string;
  type: 'image' | 'video';
  name: string;
  price: string;
  category: string;
  selected: boolean;
  savedToCatalog?: boolean;
}

export interface FlyerThemeConfig {
  name: string;
  badge: string;
  bgGrad: [string, string, string];
  accent: string;
  accentText: string;
  priceColor: string;
  cardBg: string;
  cardBorder: string;
  titleColor: string;
  subtextColor: string;
  bannerBg: string;
  bannerText: string;
  footerBg: string;
  footerText: string;
  footerSubText: string;
}

export const FLYER_THEMES: Record<FlyerTheme, FlyerThemeConfig> = {
  emerald: {
    name: 'Emerald Luxury (Default)',
    badge: '🌿 Green & Gold',
    bgGrad: ['#061325', '#0a1d37', '#020b18'],
    accent: '#10b981',
    accentText: '#10b981',
    priceColor: '#34d399',
    cardBg: 'rgba(255, 255, 255, 0.05)',
    cardBorder: 'rgba(16, 185, 129, 0.3)',
    titleColor: '#ffffff',
    subtextColor: '#94a3b8',
    bannerBg: '#10b981',
    bannerText: '#ffffff',
    footerBg: '#10b981',
    footerText: '#061325',
    footerSubText: '#022c22',
  },
  royal_blue: {
    name: 'Corporate Royal Blue',
    badge: '🔵 Royal Marine',
    bgGrad: ['#051126', '#0b1e42', '#030a17'],
    accent: '#3b82f6',
    accentText: '#60a5fa',
    priceColor: '#60a5fa',
    cardBg: 'rgba(255, 255, 255, 0.06)',
    cardBorder: 'rgba(59, 130, 246, 0.35)',
    titleColor: '#ffffff',
    subtextColor: '#93c5fd',
    bannerBg: '#2563eb',
    bannerText: '#ffffff',
    footerBg: '#2563eb',
    footerText: '#ffffff',
    footerSubText: '#dbeafe',
  },
  crimson_gold: {
    name: 'Flash Sale Crimson & Gold',
    badge: '🔴 Flash Sale',
    bgGrad: ['#1f040b', '#3b0816', '#140207'],
    accent: '#f59e0b',
    accentText: '#fbbf24',
    priceColor: '#facc15',
    cardBg: 'rgba(255, 255, 255, 0.06)',
    cardBorder: 'rgba(245, 158, 11, 0.35)',
    titleColor: '#ffffff',
    subtextColor: '#fca5a5',
    bannerBg: '#e11d48',
    bannerText: '#ffffff',
    footerBg: '#f59e0b',
    footerText: '#1c1917',
    footerSubText: '#451a03',
  },
  modern_gold: {
    name: 'Onyx & Champagne Gold',
    badge: '🟡 Onyx Gold',
    bgGrad: ['#0f0f0f', '#1c1917', '#0a0a0a'],
    accent: '#d97706',
    accentText: '#fbbf24',
    priceColor: '#fef08a',
    cardBg: 'rgba(255, 255, 255, 0.05)',
    cardBorder: 'rgba(217, 119, 6, 0.4)',
    titleColor: '#ffffff',
    subtextColor: '#a8a29e',
    bannerBg: '#b45309',
    bannerText: '#ffffff',
    footerBg: '#d97706',
    footerText: '#000000',
    footerSubText: '#451a03',
  },
  clean_white: {
    name: 'Clean White High-Contrast',
    badge: '⚪ Crisp White',
    bgGrad: ['#f8fafc', '#f1f5f9', '#e2e8f0'],
    accent: '#059669',
    accentText: '#059669',
    priceColor: '#047857',
    cardBg: '#ffffff',
    cardBorder: 'rgba(15, 23, 42, 0.15)',
    titleColor: '#0f172a',
    subtextColor: '#64748b',
    bannerBg: '#059669',
    bannerText: '#ffffff',
    footerBg: '#0f172a',
    footerText: '#ffffff',
    footerSubText: '#94a3b8',
  },
};

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

  // 🎨 Flyer Design Customization States
  const [flyerTheme, setFlyerTheme] = useState<FlyerTheme>('emerald');
  const [flyerHeadline, setFlyerHeadline] = useState("TODAY'S WHOLESALE ARRIVALS & PRICES");
  const [flyerSubHeader, setFlyerSubHeader] = useState('CHINUX VERIFIED WHOLESALE CATALOG');
  const [isCustomizingFlyer, setIsCustomizingFlyer] = useState(false);
  const [flyerPreviewUrl, setFlyerPreviewUrl] = useState<string | null>(null);

  // 📱 Device Gallery Organizer States (Photos & Videos)
  const [sourceTab, setSourceTab] = useState<'catalog' | 'gallery'>('catalog');
  const [galleryItems, setGalleryItems] = useState<GalleryMediaItem[]>([]);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  // 🌐 Multi-Channel Social Media Broadcast Mode
  const [socialChannel, setSocialChannel] = useState<'whatsapp' | 'facebook' | 'instagram' | 'tiktok' | 'sms'>('whatsapp');

  const handlePickGalleryFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: GalleryMediaItem[] = [];
    Array.from(files).forEach((file, idx) => {
      const isVideo = file.type.startsWith('video/');
      const previewUrl = URL.createObjectURL(file);
      const cleanName = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());

      newItems.push({
        id: 'gal_' + Date.now() + '_' + idx,
        file,
        previewUrl,
        type: isVideo ? 'video' : 'image',
        name: cleanName,
        price: '',
        category: 'Wholesale Stock',
        selected: true,
        savedToCatalog: false,
      });
    });

    setGalleryItems((prev) => [...prev, ...newItems]);
    setSourceTab('gallery');
    e.target.value = '';
  };

  const handleToggleGalleryItem = (id: string) => {
    setGalleryItems((prev) =>
      prev.map((g) => (g.id === id ? { ...g, selected: !g.selected } : g))
    );
  };

  const handleSelectAllGallery = () => {
    setGalleryItems((prev) => prev.map((g) => ({ ...g, selected: true })));
  };

  const handleDeselectAllGallery = () => {
    setGalleryItems((prev) => prev.map((g) => ({ ...g, selected: false })));
  };

  const handleRemoveGalleryItem = (id: string) => {
    setGalleryItems((prev) => prev.filter((g) => g.id !== id));
  };

  const handleUpdateGalleryField = (id: string, field: 'name' | 'price' | 'category', value: string) => {
    setGalleryItems((prev) =>
      prev.map((g) => (g.id === id ? { ...g, [field]: value } : g))
    );
  };

  const handleSaveGalleryItemToCatalog = (item: GalleryMediaItem) => {
    const isVideo = item.type === 'video';
    const parsedPrice = item.price ? parseInt(item.price.replace(/\D/g, '') || '0', 10) : 0;
    const actor = profile.activeRole === 'oga' ? 'Oga Chinua' : 'Apprentice Chinedu';

    const newProd: CatalogProduct = {
      id: 'prod-' + Date.now(),
      name: item.name.trim() || 'Wholesale Stock Item',
      category: item.category || 'Wholesale Stock',
      wholesalePrice: parsedPrice,
      retailPrice: parsedPrice ? Math.round(parsedPrice * 1.15) : 0,
      stockCount: 1,
      isAvailable: true,
      imageUrl: isVideo ? undefined : item.previewUrl,
      videoUrl: isVideo ? item.previewUrl : undefined,
      mediaType: item.type,
      restockSubscribers: [],
      uploadedBy: actor,
      updatedAt: new Date().toISOString(),
    };

    storage.addProductToCatalog(newProd, actor);
    setCatalog(storage.getCatalog());
    setGalleryItems((prev) =>
      prev.map((g) => (g.id === item.id ? { ...g, savedToCatalog: true } : g))
    );
  };

  const handleShareGalleryBatchWhatsApp = async () => {
    const selected = galleryItems.filter((g) => g.selected);
    if (selected.length === 0) {
      alert('Please select at least one photo or video from your gallery.');
      return;
    }

    setIsSharingBatch(true);
    try {
      const files = selected.map((g) => g.file);
      const itemsList = selected
        .slice(0, 7)
        .map((g, idx) => {
          const parsed = g.price ? parseInt(g.price.replace(/\D/g, '') || '0', 10) : 0;
          return `${idx + 1}. *${g.name}*${parsed > 0 ? ` - ${formatNaira(parsed)}` : ''} ${g.type === 'video' ? '🎥' : '📸'}`;
        })
        .join('\n');

      const caption = `🛒 *${profile.businessName || 'Wholesale Store'}* Today's Arrivals
${itemsList}

👉 *View & Order Online:* ${storefrontUrl}
📞 ${profile.phone}`;

      if (typeof navigator !== 'undefined' && (navigator as any).canShare && (navigator as any).canShare({ files })) {
        await navigator.share({
          files,
          title: `${profile.businessName} Wholesale Stock`,
          text: caption,
        });
      } else {
        selected.forEach((g) => {
          const a = document.createElement('a');
          a.href = g.previewUrl;
          a.download = g.file.name;
          a.click();
        });
        handleSendToWhatsApp(caption);
      }
    } catch (err) {
      console.log('handleShareGalleryBatchWhatsApp error:', err);
    }
    setIsSharingBatch(false);
  };

  const handleShareSingleGalleryItem = async (item: GalleryMediaItem) => {
    const parsedPrice = item.price ? parseInt(item.price.replace(/\D/g, '') || '0', 10) : 0;
    const priceText = parsedPrice > 0 ? `\n💰 *${formatNaira(parsedPrice)}* / carton` : '';
    const caption = `📦 *${item.name}* (${item.type === 'video' ? '🎥 Video' : '📸 Photo'})${priceText}
🏢 *${profile.businessName || 'Wholesale Store'}*
👉 *Order Online:* ${storefrontUrl}
📞 WhatsApp/Call: ${profile.phone}`;

    try {
      if (typeof navigator !== 'undefined' && (navigator as any).canShare && (navigator as any).canShare({ files: [item.file] })) {
        await navigator.share({
          files: [item.file],
          title: item.name,
          text: caption,
        });
        return;
      }
    } catch (err) {
      console.log('Single gallery share fallback:', err);
    }

    handleSendToWhatsApp(caption);
  };

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
  const baseStorefrontUrl = `${origin}/store`;
  const storeParams = new URLSearchParams();
  if (profile.businessName) storeParams.set('shop', profile.businessName);
  if (profile.phone) storeParams.set('phone', profile.phone);
  const storefrontUrl = `${baseStorefrontUrl}?${storeParams.toString()}`;

  // Total slides = Selected products + 1 final slide (solely for the storefront link)
  const totalSlides = selectedProducts.length + 1;
  const isFinalSlide = activeSlideIndex === selectedProducts.length;
  const currentProduct = !isFinalSlide ? selectedProducts[activeSlideIndex] : null;

  // Generate concise text for each slide (STRICTLY complying with WhatsApp 10-line / 700-char limit)
  const getProductSlideText = (prod: CatalogProduct) => {
    const params = new URLSearchParams();
    params.set('product', prod.id);
    params.set('title', prod.name);
    params.set('cat', prod.category);
    if (includePrice) {
      params.set('price', formatNaira(prod.wholesalePrice));
    }
    if (prod.imageUrl && prod.imageUrl.startsWith('http')) {
      params.set('img', prod.imageUrl);
    }
    if (profile.businessName) {
      params.set('shop', profile.businessName);
    }
    if (profile.phone) {
      params.set('phone', profile.phone);
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
    const flyerItems = selectedProducts.length > 0
      ? selectedProducts.map((p) => ({
          name: p.name,
          category: p.category,
          price: p.wholesalePrice,
          imageUrl: p.imageUrl,
          isAvailable: p.isAvailable && p.stockCount > 0,
          stockCount: p.stockCount,
        }))
      : galleryItems
          .filter((g) => g.selected)
          .map((g) => ({
            name: g.name,
            category: g.category,
            price: g.price ? parseInt(g.price.replace(/\D/g, '') || '0', 10) : 0,
            imageUrl: g.type === 'image' ? g.previewUrl : undefined,
            isAvailable: true,
            stockCount: 1,
          }));

    if (flyerItems.length === 0) return null;

    const canvas = document.createElement('canvas');
    const width = 1080;
    // Calculate height dynamically based on product count
    const cols = 2;
    const rows = Math.ceil(flyerItems.length / cols);
    const itemHeight = 320;
    const headerHeight = 360;
    const footerHeight = 260;
    const height = Math.max(1920, headerHeight + rows * itemHeight + footerHeight);

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const t = FLYER_THEMES[flyerTheme] || FLYER_THEMES.emerald;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, t.bgGrad[0]);
    grad.addColorStop(0.5, t.bgGrad[1]);
    grad.addColorStop(1, t.bgGrad[2]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Decorative glow top right
    const glow = ctx.createRadialGradient(900, 150, 20, 900, 150, 400);
    glow.addColorStop(0, t.accent + '40');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, 500);

    // HEADER SECTION
    ctx.fillStyle = t.accentText;
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(`⚡ ${(flyerSubHeader || 'CHINUX VERIFIED WHOLESALE CATALOG').toUpperCase()}`, 60, 90);

    ctx.fillStyle = t.titleColor;
    ctx.font = '900 64px sans-serif';
    const bizName = (profile.businessName || 'WHOLESALE DISTRIBUTOR').toUpperCase();
    ctx.fillText(bizName, 60, 170);

    ctx.fillStyle = t.subtextColor;
    ctx.font = '500 28px sans-serif';
    ctx.fillText(`📍 ${profile.marketLocation || 'Onitsha & Lagos Wholesale Hubs'}`, 60, 220);

    // Sub-banner
    ctx.fillStyle = t.bannerBg;
    ctx.beginPath();
    ctx.roundRect(60, 255, 960, 60, 16);
    ctx.fill();

    ctx.fillStyle = t.bannerText;
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    const headline = flyerHeadline.trim() || "TODAY'S WHOLESALE ARRIVALS & PRICES";
    ctx.fillText(`📢 ${headline.toUpperCase()} (${flyerItems.length} ITEMS)`, width / 2, 296);
    ctx.textAlign = 'left';

    // PRODUCTS GRID
    const startY = headerHeight;
    const colWidth = 460;
    const gapX = 40;
    const startX = 60;

    for (let i = 0; i < flyerItems.length; i++) {
      const p = flyerItems[i];
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (colWidth + gapX);
      const y = startY + row * itemHeight;

      // Card Box
      ctx.fillStyle = t.cardBg;
      ctx.strokeStyle = t.cardBorder;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(x, y, colWidth, itemHeight - 30, 24);
      ctx.fill();
      ctx.stroke();

      // Thumbnail
      const imgSize = 130;
      const imgX = x + 20;
      const imgY = y + 20;

      ctx.fillStyle = flyerTheme === 'clean_white' ? '#f1f5f9' : '#1e293b';
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
      ctx.fillStyle = t.titleColor;
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
      ctx.fillStyle = t.subtextColor;
      ctx.font = '22px sans-serif';
      ctx.fillText(p.category, x + imgSize + 40, y + 95);

      // Price
      if (includePrice) {
        ctx.fillStyle = t.priceColor;
        ctx.font = '900 36px sans-serif';
        ctx.fillText(formatNaira(p.price), x + imgSize + 40, y + 145);
      } else {
        ctx.fillStyle = t.accent;
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
    ctx.fillStyle = t.footerBg;
    ctx.beginPath();
    ctx.roundRect(60, footY, 960, 110, 24);
    ctx.fill();

    ctx.fillStyle = t.footerText;
    ctx.font = '900 34px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('👉 ORDER & TRACK ONLINE: ' + storefrontUrl.replace(/^https?:\/\//, ''), width / 2, footY + 50);

    ctx.fillStyle = t.footerSubText;
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(`📞 CALL/WHATSAPP: ${profile.phone} • NATIONWIDE MOTOR PARK WAYBILL`, width / 2, footY + 90);
    ctx.textAlign = 'left';

    return new Promise((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.92);
    });
  };

  // Live Flyer Preview Generator
  const handlePreviewFlyer = async () => {
    setIsGeneratingFlyer(true);
    try {
      const blob = await generateCatalogFlyerBlob();
      if (blob) {
        if (flyerPreviewUrl) URL.revokeObjectURL(flyerPreviewUrl);
        const url = URL.createObjectURL(blob);
        setFlyerPreviewUrl(url);
      }
    } catch (err) {
      console.log('handlePreviewFlyer error:', err);
    }
    setIsGeneratingFlyer(false);
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

  // ==============================================================
  // 🌐 MULTI-CHANNEL SOCIAL MEDIA SHARING HANDLERS
  // ==============================================================
  const handleShareToFacebook = (prod?: CatalogProduct | null) => {
    const targetUrl = prod
      ? `${origin}/store?product=${prod.id}&title=${encodeURIComponent(prod.name)}&shop=${encodeURIComponent(profile.businessName || '')}&phone=${encodeURIComponent(profile.phone || '')}`
      : storefrontUrl;
    const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(targetUrl)}`;
    window.open(fbShareUrl, '_blank', 'width=620,height=520');
  };

  const handleShareToInstagram = (prod?: CatalogProduct | null) => {
    const caption = prod
      ? `📦 NEW WHOLESALE STOCK ARRIVAL: ${prod.name}
💰 Wholesale Rate: ${includePrice ? `${formatNaira(prod.wholesalePrice)} / carton` : 'DM for Wholesale Price'}
🏢 Shop: ${profile.businessName || 'Wholesale Importer'}
📍 Market Location: ${profile.marketLocation || 'Onitsha & Lagos Wholesale Hubs'}
🚚 Nationwide Motor Park Waybill Dispatch with Anti-Theft 4-Digit Pickup PIN!
👉 Tap the Link in Bio or DM to order on WhatsApp: ${storefrontUrl}

#WholesaleNigeria #AlabaMarket #OnitshaMainMarket #TradeFairLagos #NigerianTraders #Chinux`
      : `🛒 ${profile.businessName || 'Wholesale Importer'} - Daily Wholesale Arrivals & Container Rates!
🚚 Nationwide Motor Park Waybill Dispatch!
👉 Browse & Order Online: ${storefrontUrl}
📞 WhatsApp/Call: ${profile.phone}

#WholesaleNigeria #ImportGoods #AlabaMarket #OnitshaMainMarket #TradeBill`;

    navigator.clipboard.writeText(caption);
    setCopiedIndex(777);
    setTimeout(() => setCopiedIndex(null), 3000);
    window.open('https://www.instagram.com/', '_blank');
  };

  const handleShareToTikTok = (prod?: CatalogProduct | null) => {
    const script = prod
      ? `🔥 NEW WHOLESALE CONTAINER ARRIVAL!
Product: ${prod.name}
Wholesale Price: ${includePrice ? `${formatNaira(prod.wholesalePrice)} / carton` : 'Check Bio for wholesale price'}
Nationwide Motor park waybill dispatch with 4-digit pickup PIN!
Tap link in bio to order directly on WhatsApp!
Shop: ${profile.businessName}

#WholesaleNigeria #MotorParkHaulage #ChinuxTrade #LagosWholesale #OnitshaMainMarket`
      : `🔥 Wholesale Goods Just Landed at Our Shop!
Browse our live digital catalog and order via waybill.
Link in bio!
Shop: ${profile.businessName}

#WholesaleNigeria #ChinuxTrade #TradeFairLagos #OnitshaMainMarket`;

    navigator.clipboard.writeText(script);
    setCopiedIndex(888);
    setTimeout(() => setCopiedIndex(null), 3000);
    window.open('https://www.tiktok.com/', '_blank');
  };

  const handleShareToSMS = (text: string) => {
    const cleanText = text.replace(/[*_]/g, '');
    const smsUrl = `sms:?body=${encodeURIComponent(cleanText)}`;
    window.open(smsUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2.5 sm:p-4 animate-fadeIn">
      <div className="bg-white dark:bg-navy-900 w-full max-w-xl rounded-3xl p-3.5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-3.5 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-gradient-to-tr from-emerald-500 to-purple-600 text-white shadow-sm">
              <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-xs sm:text-base font-black text-slate-900 dark:text-white leading-tight">
                Social Media & Status Broadcast Studio
              </h2>
              <span className="text-[10px] text-slate-500 block">
                Organize & send products to WhatsApp, Facebook, Instagram & TikTok
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

        {/* 📱 SOCIAL CHANNEL SELECTOR TABS (Accommodates Mobile & Tablet) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 pb-1">
          <button
            type="button"
            onClick={() => setSocialChannel('whatsapp')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
              socialChannel === 'whatsapp'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-navy-950 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>WhatsApp Status</span>
          </button>

          <button
            type="button"
            onClick={() => setSocialChannel('facebook')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
              socialChannel === 'facebook'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-navy-950 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span>Facebook</span>
          </button>

          <button
            type="button"
            onClick={() => setSocialChannel('instagram')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
              socialChannel === 'instagram'
                ? 'bg-pink-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-navy-950 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-pink-400" />
            <span>Instagram</span>
          </button>

          <button
            type="button"
            onClick={() => setSocialChannel('tiktok')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
              socialChannel === 'tiktok'
                ? 'bg-slate-900 dark:bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'bg-slate-100 dark:bg-navy-950 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>TikTok</span>
          </button>

          <button
            type="button"
            onClick={() => setSocialChannel('sms')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
              socialChannel === 'sms'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-navy-950 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>SMS / Direct</span>
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="overflow-y-auto space-y-3.5 pr-0.5 flex-1">
          {/* Lock Overlay if Free Trial Expired and not subscribed */}
          {!isUnlocked && (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 space-y-2">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs">
                <Lock className="w-4 h-4 text-amber-600" />
                <span>{policy.freeTrialDays || 30}-Day Free Trial Expired - Feature Locked</span>
              </div>
              <p className="text-[11px] text-amber-700 dark:text-amber-400">
                Automated Social Media & WhatsApp Broadcast Studios are available on the Chinux Pro plan.
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

          {/* CHANNEL SPECIFIC HEADER & TOOLS */}
          {socialChannel === 'facebook' && (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-black text-xs text-blue-900 dark:text-blue-200 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  Post to Facebook Marketplace & Feed
                </span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">1-Tap Sharing</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                Share your wholesale items and storefront directly to Facebook. Buyers click the post to view your live carton prices and order via WhatsApp.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleShareToFacebook(currentProduct)}
                  className="py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Current Product</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleShareToFacebook(null)}
                  className="py-2.5 px-3 bg-white dark:bg-navy-900 border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 hover:bg-blue-50"
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Share Full Storefront</span>
                </button>
              </div>
            </div>
          )}

          {socialChannel === 'instagram' && (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-amber-500/10 border border-pink-300/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-black text-xs text-pink-700 dark:text-pink-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-pink-500" />
                  Instagram Stories & Feed Post
                </span>
                <span className="text-[10px] text-pink-600 font-bold">Bio Link + Hashtags</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                Copies optimized wholesale captions with Alaba/Onitsha hashtags and opens Instagram so you can post stories or reels with your link in bio.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleShareToInstagram(currentProduct)}
                  className="py-2.5 px-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedIndex === 777 ? 'Caption Copied! Opening...' : 'Copy Caption & Open IG'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleShareToInstagram(null)}
                  className="py-2.5 px-3 bg-white dark:bg-navy-900 border border-pink-300 dark:border-pink-800 text-pink-700 dark:text-pink-300 font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 hover:bg-pink-50"
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Storefront Bio Link Caption</span>
                </button>
              </div>
            </div>
          )}

          {socialChannel === 'tiktok' && (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900 text-white border border-slate-700 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-black text-xs text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  TikTok Viral Wholesale Scripts
                </span>
                <span className="text-[10px] text-slate-400 font-bold">Unboxing & Container Arrivals</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Pre-written hook scripts and sound captions designed for Nigerian wholesale traders filming container arrivals and carton stacks.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleShareToTikTok(currentProduct)}
                  className="py-2.5 px-3 bg-gradient-to-r from-cyan-600 to-slate-800 hover:from-cyan-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5 active:scale-95 border border-cyan-500/30"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                  <span>{copiedIndex === 888 ? 'Script Copied! Opening TikTok...' : 'Copy Script & Open TikTok'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleShareToTikTok(null)}
                  className="py-2.5 px-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Full Shop Pitch Hook</span>
                </button>
              </div>
            </div>
          )}

          {socialChannel === 'sms' && (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-black text-xs text-amber-800 dark:text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                  Direct SMS Broadcast (No Data Needed)
                </span>
                <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold">Offline Buyers</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                Send plain text price dispatch via phone SMS to buyers across remote motor parks with spotty data.
              </p>
              <button
                type="button"
                onClick={() => handleShareToSMS(activeText)}
                className="w-full py-2.5 px-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Open SMS App with Current Products</span>
              </button>
            </div>
          )}

          {/* ============================================================== */}
          {/* ⚡ 1-CLICK ALL-PRODUCTS DISPATCH TO WHATSAPP STATUS             */}
          {/* ============================================================== */}
          {socialChannel === 'whatsapp' && (
            <div className="p-3.5 sm:p-4 rounded-3xl bg-gradient-to-br from-emerald-950/90 via-slate-900 to-navy-950 border-2 border-emerald-500/60 text-white space-y-3 shadow-xl">
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
                <div className="p-3 rounded-2xl bg-white/5 border border-emerald-500/30 space-y-2.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-extrabold text-white flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        <span>1-Click Catalog Price Flyer</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsCustomizingFlyer(!isCustomizingFlyer)}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors flex items-center gap-1 border border-emerald-500/30"
                      >
                        <span>🎨 Design</span>
                        <span>{isCustomizingFlyer ? '▲' : '▼'}</span>
                      </button>
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
                      onClick={handlePreviewFlyer}
                      className="px-2.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all"
                      title="Live Preview Flyer"
                    >
                      <span>👁️</span>
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

              {/* 🎨 CUSTOMIZE FLYER DESIGN ACCORDION */}
              {isCustomizingFlyer && (
                <div className="p-3.5 rounded-2xl bg-black/40 border border-emerald-500/30 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                      <span>🎨</span>
                      <span>Flyer Design & Branding Settings</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsCustomizingFlyer(false)}
                      className="text-[10px] text-slate-400 hover:text-white"
                    >
                      Close ✕
                    </button>
                  </div>

                  {/* 1. Theme Selection Chips */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-300 block">
                      Color Palette & Style:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      {(Object.keys(FLYER_THEMES) as FlyerTheme[]).map((themeKey) => {
                        const t = FLYER_THEMES[themeKey];
                        const isSelected = flyerTheme === themeKey;
                        return (
                          <button
                            key={themeKey}
                            type="button"
                            onClick={() => {
                              setFlyerTheme(themeKey);
                              if (flyerPreviewUrl) handlePreviewFlyer();
                            }}
                            className={`p-2 rounded-xl text-left border transition-all ${
                              isSelected
                                ? 'bg-emerald-600/30 border-emerald-400 text-white ring-1 ring-emerald-400/50'
                                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                            }`}
                          >
                            <div className="text-[11px] font-bold truncate">{t.badge}</div>
                            <div className="text-[9px] text-slate-400 truncate">{t.name.split(' ')[0]}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Headline Preset & Custom Input */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-300 block">
                      Flyer Banner Headline:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {[
                        "TODAY'S WHOLESALE ARRIVALS",
                        "NEW CONTAINER DISPATCH",
                        "FLASH CLEARANCE SALE",
                        "WEEKLY PRICE GUIDE",
                      ].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setFlyerHeadline(preset)}
                          className={`px-2 py-0.5 rounded-lg text-[9px] font-bold transition-all ${
                            flyerHeadline === preset
                              ? 'bg-emerald-500 text-white'
                              : 'bg-white/10 text-slate-300 hover:bg-white/20'
                          }`}
                        >
                          {preset.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={flyerHeadline}
                      onChange={(e) => setFlyerHeadline(e.target.value)}
                      placeholder="e.g. TODAY'S WHOLESALE ARRIVALS & PRICES"
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* 3. Top Subheader / Market Tag */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-300 block">
                      Top Badge Tag:
                    </span>
                    <input
                      type="text"
                      value={flyerSubHeader}
                      onChange={(e) => setFlyerSubHeader(e.target.value)}
                      placeholder="e.g. CHINUX VERIFIED WHOLESALE CATALOG"
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              {/* 👁️ LIVE FLYER PREVIEW CARD */}
              {flyerPreviewUrl && (
                <div className="p-3.5 rounded-2xl bg-black/60 border border-emerald-500/40 space-y-2.5 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                      <span>👁️ Live Flyer Preview</span>
                      <span className="text-[10px] text-slate-400">({FLYER_THEMES[flyerTheme].name})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFlyerPreviewUrl(null)}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Close Preview ✕
                    </button>
                  </div>

                  <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 p-1 flex justify-center">
                    <img
                      src={flyerPreviewUrl}
                      alt="WhatsApp Status Catalog Flyer Preview"
                      className="w-full max-w-sm rounded-lg object-contain shadow-2xl"
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleShareFlyerStatus}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Post This Flyer to WhatsApp Status</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadFlyer}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

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

        {/* 📦 MEDIA SOURCE TABS: Catalog vs Device Gallery (Photos & Videos) */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setSourceTab('catalog')}
            className={`pb-2 text-xs font-black flex items-center gap-1.5 border-b-2 transition-all ${
              sourceTab === 'catalog'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>From Catalog ({catalog.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSourceTab('gallery')}
            className={`pb-2 text-xs font-black flex items-center gap-1.5 border-b-2 transition-all ${
              sourceTab === 'gallery'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Images className="w-3.5 h-3.5" />
            <span>Direct Gallery (Photos & Videos) ({galleryItems.length})</span>
            {galleryItems.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            )}
          </button>
        </div>

        {/* 📱 TAB 1: DEVICE GALLERY ORGANIZER (PHOTOS & VIDEOS) */}
        {sourceTab === 'gallery' && (
          <div className="space-y-3 border-2 border-purple-500/40 rounded-2xl p-3.5 bg-purple-50/30 dark:bg-navy-950/60 animate-fadeIn">
            {/* Hidden Gallery Input */}
            <input
              type="file"
              ref={galleryInputRef}
              accept="image/*,video/*"
              multiple
              onChange={handlePickGalleryFiles}
              className="hidden"
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Film className="w-4 h-4 text-purple-600" />
                  <span>Phone & Computer Gallery Media</span>
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                  Organize unboxing videos, showroom clips & product photos
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Pick Photos & Videos</span>
                </button>
              </div>
            </div>

            {/* Empty State / Dropzone */}
            {galleryItems.length === 0 ? (
              <div
                onClick={() => galleryInputRef.current?.click()}
                className="p-6 border-2 border-dashed border-purple-300 dark:border-purple-800/80 rounded-2xl text-center cursor-pointer hover:bg-purple-100/30 dark:hover:bg-purple-950/30 transition-all space-y-2"
              >
                <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto">
                  <Camera className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">
                  Tap to Choose Photos & Short Videos from Gallery
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Select container arrivals, shop videos, or carton photos. You can name them, add wholesale prices, and broadcast directly to WhatsApp Status!
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {/* Batch Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-purple-100/60 dark:bg-purple-950/50 text-[11px]">
                  <span className="font-bold text-purple-900 dark:text-purple-200">
                    {galleryItems.filter((g) => g.selected).length} of {galleryItems.length} items ready to post
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAllGallery}
                      className="font-bold text-purple-700 dark:text-purple-300 hover:underline"
                    >
                      Select All
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={handleDeselectAllGallery}
                      className="text-slate-500 hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Gallery Items List */}
                <div className="max-h-56 overflow-y-auto space-y-2 pr-1 no-scrollbar">
                  {galleryItems.map((item) => (
                    <div
                      key={item.id}
                      className={`p-2.5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 ${
                        item.selected
                          ? 'bg-white dark:bg-navy-900 border-purple-500 shadow-sm'
                          : 'bg-white/60 dark:bg-navy-950/40 border-slate-200 dark:border-slate-800 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 w-full sm:w-auto min-w-0">
                        <button
                          type="button"
                          onClick={() => handleToggleGalleryItem(item.id)}
                          className="shrink-0"
                        >
                          {item.selected ? (
                            <CheckSquare className="w-4 h-4 text-purple-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </button>

                        {/* Media Preview Box */}
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-purple-300 dark:border-purple-800">
                          {item.type === 'video' ? (
                            <video
                              src={item.previewUrl}
                              className="w-full h-full object-cover"
                              muted
                              playsInline
                            />
                          ) : (
                            <img
                              src={item.previewUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                          <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded text-[8px] font-black uppercase bg-black/70 text-white">
                            {item.type === 'video' ? '🎥 Video' : '📸 Photo'}
                          </span>
                        </div>

                        {/* Editable Name & Price Inputs */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => handleUpdateGalleryField(item.id, 'name', e.target.value)}
                            placeholder="Product Title"
                            className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white text-[11px] font-bold"
                          />
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={item.price}
                              onChange={(e) => handleUpdateGalleryField(item.id, 'price', e.target.value)}
                              placeholder="Price e.g. 45000"
                              className="w-28 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-navy-950 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold"
                            />
                            {item.savedToCatalog && (
                              <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                                <CheckCircle className="w-3 h-3" />
                                <span>In Catalog</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end shrink-0">
                        {!item.savedToCatalog && (
                          <button
                            type="button"
                            onClick={() => handleSaveGalleryItemToCatalog(item)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-navy-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold flex items-center gap-1"
                            title="Save permanently to Chinux Catalog"
                          >
                            <Save className="w-3.5 h-3.5 text-blue-500" />
                            <span className="hidden sm:inline">Save</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleShareSingleGalleryItem(item)}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black shadow flex items-center gap-1 active:scale-95"
                        >
                          <Send className="w-3 h-3" />
                          <span>Post to WhatsApp</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryItem(item.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                          title="Remove from broadcast queue"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 🚀 1-CLICK QUEUE SELECTED GALLERY MEDIA TO WHATSAPP */}
                <button
                  type="button"
                  disabled={isSharingBatch || galleryItems.filter((g) => g.selected).length === 0}
                  onClick={handleShareGalleryBatchWhatsApp}
                  className="w-full py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-600 hover:opacity-95 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  <Camera className="w-4 h-4" />
                  <span>
                    {isSharingBatch
                      ? 'Pushing Gallery Media to WhatsApp...'
                      : `Queue All Selected Photos & Videos (${galleryItems.filter((g) => g.selected).length}) in WhatsApp`}
                  </span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* 📦 TAB 2: BATCH PRODUCT SELECTION (FROM CATALOG) */}
        {sourceTab === 'catalog' && (
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
            <div className="p-4 text-center text-xs text-slate-400 space-y-2">
              <p>No products found in catalog yet.</p>
              <button
                type="button"
                onClick={() => {
                  setSourceTab('gallery');
                  galleryInputRef.current?.click();
                }}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow transition-all inline-flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Pick Photos & Videos from Phone Gallery Now</span>
              </button>
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
        )}

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
  </div>
  );
}

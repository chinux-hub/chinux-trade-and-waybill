'use client';

import React, { useState, useEffect } from 'react';
import { Share2, X, Send, Smartphone, Sparkles, Lock, CheckCircle, ShieldAlert, Image as ImageIcon } from 'lucide-react';
import { CatalogProduct, TraderProfile } from '@/types';
import { storage } from '@/lib/storage';
import { formatNaira } from '@/lib/formatters';

interface StockBroadcastModalProps {
  product: CatalogProduct | null;
  isOpen: boolean;
  onClose: () => void;
}

export function StockBroadcastModal({ product, isOpen, onClose }: StockBroadcastModalProps) {
  const [profile, setProfile] = useState<TraderProfile>(storage.getProfile());
  const [mode, setMode] = useState<'status' | 'direct'>('status');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customNote, setCustomNote] = useState('Fresh container just arrived from Onitsha warehouse! Limited cartons available, contact immediately to reserve.');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setProfile(storage.getProfile());
    }
  }, [isOpen]);

  if (!isOpen || !product) return null;

  const isUnlocked = storage.isStockBroadcastUnlocked();
  const isApprentice = profile.activeRole === 'apprentice';
  const apprenticeAllowed = !isApprentice || (profile.permissions.apprenticeCanBroadcastStock ?? true);
  const preferredPoster = profile.permissions.preferredStatusPoster || 'both';
  const [selectedPoster, setSelectedPoster] = useState<'oga' | 'apprentice' | 'both'>(preferredPoster);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://chinux.ng';
  const storeUrl = `${origin}/store`;

  // Construct message with direct customer storefront link
  const broadcastText = `🚨 *NEW STOCK ARRIVAL NOTICE* 🚨
🏢 *${profile.businessName}* (${profile.marketHub})
📦 *Item:* ${product.name}
🏷️ *Category:* ${product.category}
💰 *Wholesale Price:* ${formatNaira(product.wholesalePrice)} / carton
📊 *Available Quantity:* ${product.stockCount} cartons in store
📍 *Pickup Location:* ${profile.marketLocation}

💬 *Note from Shop:*
"${customNote}"

${product.imageUrl && !product.imageUrl.startsWith('data:') ? `📷 *Photo Preview:* ${product.imageUrl}\n` : ''}
🛒 *View All Available Goods & Place Waybill Order:*
👉 ${storeUrl}

📞 *Call/WhatsApp to Order:* ${profile.phone}
_⚡ Powered by Chinux Wholesale Trade & Logistics_`;

  const handleSend = () => {
    if (!isUnlocked) {
      window.dispatchEvent(new CustomEvent('chinux-open-subscription'));
      return;
    }

    let url = '';
    if (mode === 'direct' && customerPhone.trim()) {
      let clean = customerPhone.replace(/\D/g, '');
      if (clean.startsWith('0')) clean = '234' + clean.slice(1);
      url = `https://api.whatsapp.com/send?phone=${clean}&text=${encodeURIComponent(broadcastText)}`;
    } else {
      url = `https://api.whatsapp.com/send?text=${encodeURIComponent(broadcastText)}`;
    }

    window.open(url, '_blank');
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(broadcastText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white dark:bg-navy-900 w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white">
                WhatsApp Stock Broadcast & Status
              </h2>
              <span className="text-[10px] text-slate-500">
                Instantly notify customers or post new arrival to WhatsApp Status
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
            <span>Oga Chinua has restricted apprentices from broadcasting stock. Ask Oga for permission in Settings.</span>
          </div>
        )}

        {/* Target Tabs */}
        <div className="flex rounded-2xl bg-slate-100 dark:bg-navy-950 p-1">
          <button
            type="button"
            onClick={() => setMode('status')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              mode === 'status'
                ? 'bg-white dark:bg-navy-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Post to WhatsApp Status</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('direct')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              mode === 'direct'
                ? 'bg-white dark:bg-navy-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Direct to Customer</span>
          </button>
        </div>

        {/* Product Summary Preview */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-slate-200 dark:bg-navy-800 flex items-center justify-center text-slate-400 shrink-0">
              <ImageIcon className="w-6 h-6" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">{product.name}</h4>
            <div className="text-[11px] text-emerald-600 font-bold mt-0.5">
              Wholesale: {formatNaira(product.wholesalePrice)} / carton
            </div>
            <div className="text-[10px] text-slate-400">
              Available: {product.stockCount} cartons in store
            </div>
          </div>
        </div>

        {/* Direct Customer Phone Input (If direct mode) */}
        {mode === 'direct' && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Customer WhatsApp Number (Optional - leave blank to pick in WhatsApp)
            </label>
            <input
              type="tel"
              placeholder="e.g. 08031234567"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
            />
          </div>
        )}

        {/* Status Target Selector */}
        {mode === 'status' && (
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Select WhatsApp Status Destination:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedPoster('oga')}
                className={`py-2 px-2 text-[11px] font-bold rounded-xl border text-center transition-all ${
                  selectedPoster === 'oga'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-navy-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                Oga's Status
              </button>
              <button
                type="button"
                onClick={() => setSelectedPoster('apprentice')}
                className={`py-2 px-2 text-[11px] font-bold rounded-xl border text-center transition-all ${
                  selectedPoster === 'apprentice'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-navy-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                Apprentice Status
              </button>
              <button
                type="button"
                onClick={() => setSelectedPoster('both')}
                className={`py-2 px-2 text-[11px] font-bold rounded-xl border text-center transition-all ${
                  selectedPoster === 'both'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-navy-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                Both Statuses
              </button>
            </div>
            <p className="text-[10px] text-slate-400">
              {selectedPoster === 'both'
                ? 'Prepares status copy for both Oga and Apprentice phones.'
                : selectedPoster === 'oga'
                ? "Formatted for Oga Chinua's WhatsApp Status."
                : "Formatted for Apprentice Chinedu's WhatsApp Status."}
            </p>
          </div>
        )}

        {/* Custom Broadcast Note */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Custom Message / Urgency Pitch
          </label>
          <textarea
            rows={2}
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            placeholder="e.g. Fresh batch cleared from port, limited quantity..."
            className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white resize-none"
          />
        </div>

        {/* Generated Text Preview */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              WhatsApp Broadcast Preview
            </span>
            <button
              type="button"
              onClick={handleCopyText}
              className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              {copied ? <CheckCircle className="w-3.5 h-3.5" /> : null}
              <span>{copied ? 'Copied!' : 'Copy Text'}</span>
            </button>
          </div>
          <pre className="p-3 rounded-xl bg-slate-900 text-slate-200 text-[11px] font-mono whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto border border-slate-800">
            {broadcastText}
          </pre>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="button"
            disabled={isApprentice && !apprenticeAllowed}
            onClick={handleSend}
            className={`w-full py-3 rounded-2xl font-black text-xs text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
              isApprentice && !apprenticeAllowed
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>
              {mode === 'status' ? 'Open WhatsApp to Post on Status' : 'Open WhatsApp to Send Message'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

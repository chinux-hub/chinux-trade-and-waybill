'use client';

import React, { useState, useRef } from 'react';
import { Camera, Upload, X, CheckCircle, Sparkles, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { CatalogProduct, TraderProfile } from '@/types';
import { storage } from '@/lib/storage';

interface AddStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded: (newProd: CatalogProduct, triggerBroadcast: boolean) => void;
}

export function AddStockModal({ isOpen, onClose, onProductAdded }: AddStockModalProps) {
  const [profile] = useState<TraderProfile>(storage.getProfile());
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Auto Spare Parts');
  const [wholesalePrice, setWholesalePrice] = useState('');
  const [retailPrice, setRetailPrice] = useState('');
  const [stockCount, setStockCount] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [immediateBroadcast, setImmediateBroadcast] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const isOga = profile.activeRole === 'oga';
  const actor = isOga ? 'Oga Chinua' : 'Apprentice Chinedu';

  const categories = [
    'Auto Spare Parts',
    'Solar & Power',
    'Industrial Haulage',
    'Building Materials',
    'Electronics & Appliances',
    'Clothing & Textiles',
    'Cosmetics & Hair',
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image size exceeds 5MB. Please choose a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setImageUrl(event.target.result);
        setErrorMsg('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !wholesalePrice) {
      setErrorMsg('Please enter product name and wholesale price.');
      return;
    }

    const wPrice = parseFloat(wholesalePrice) || 0;
    const rPrice = parseFloat(retailPrice) || Math.round(wPrice * 1.25);
    const count = parseInt(stockCount) || 1;

    const newProd: CatalogProduct = {
      id: 'prod-' + Date.now(),
      name: name.trim(),
      category,
      wholesalePrice: wPrice,
      retailPrice: rPrice,
      stockCount: count,
      isAvailable: count > 0,
      imageUrl: imageUrl || undefined,
      restockSubscribers: [],
      uploadedBy: actor,
      updatedAt: new Date().toISOString(),
    };

    storage.addProductToCatalog(newProd, actor);
    onProductAdded(newProd, immediateBroadcast);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white dark:bg-navy-900 w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white">
                Upload New Stock Arrival
              </h2>
              <span className="text-[10px] text-slate-500">
                Snap or upload photos of arrived cartons • Logged by <strong className="text-emerald-600">{actor}</strong>
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

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Photo Upload Area */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Product Photo (Camera or Gallery) *
            </label>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />

            {imageUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-950 h-44 group">
                <img src={imageUrl} alt="Uploaded preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-white text-slate-900 font-bold rounded-xl text-xs shadow-md"
                  >
                    Change Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="px-3 py-1.5 bg-red-600 text-white font-bold rounded-xl text-xs shadow-md"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer border-2 border-dashed border-emerald-300 dark:border-emerald-800/80 rounded-2xl p-6 text-center bg-emerald-50/40 dark:bg-emerald-950/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors flex flex-col items-center justify-center gap-2"
              >
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/60 rounded-full text-emerald-600">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                    Tap to Snap or Select Product Photo
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Supports camera capture on phone or gallery image upload (JPEG, PNG, WebP)
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Product Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Item / Product Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Original Toyota Brake Pads (MK5)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Market Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing & Carton Count */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Wholesale Price (₦) *
              </label>
              <input
                type="number"
                required
                placeholder="e.g. 38000"
                value={wholesalePrice}
                onChange={(e) => setWholesalePrice(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Retail / Single Unit Price (₦)
              </label>
              <input
                type="number"
                placeholder="e.g. 45000"
                value={retailPrice}
                onChange={(e) => setRetailPrice(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Cartons in Stock *
              </label>
              <input
                type="number"
                required
                min="1"
                placeholder="e.g. 25"
                value={stockCount}
                onChange={(e) => setStockCount(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
              />
            </div>
          </div>

          {/* Checkbox: Open WhatsApp broadcast after saving */}
          <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                Immediately Broadcast Arrival to WhatsApp
              </span>
            </div>
            <input
              type="checkbox"
              checked={immediateBroadcast}
              onChange={(e) => setImmediateBroadcast(e.target.checked)}
              className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Save Arrival to Stock & Catalog</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

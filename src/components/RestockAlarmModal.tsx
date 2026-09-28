'use client';

import React, { useState } from 'react';
import { Bell, X, CheckCircle2, Package } from 'lucide-react';
import { storage } from '@/lib/storage';
import { CatalogProduct } from '@/types';

interface RestockAlarmModalProps {
  product: CatalogProduct | null;
  isOpen: boolean;
  onClose: () => void;
}

export const RestockAlarmModal: React.FC<RestockAlarmModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const [phone, setPhone] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !product) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;

    storage.subscribeRestock(product.id, phone.trim());
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
      setPhone('');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-sm bg-white dark:bg-navy-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 dark:bg-amber-950/60 rounded-xl text-amber-600 dark:text-amber-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Set Restock Alarm</h3>
              <p className="text-[10px] text-slate-400">Get an instant WhatsApp alert when restocked</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-black dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-6 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto animate-bounce" />
            <div className="font-bold text-slate-900 dark:text-white text-sm">Alarm Set Successfully!</div>
            <p className="text-slate-500 text-[11px]">
              We will send you a WhatsApp message the moment new cartons arrive from the port!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-2.5">
              <Package className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <div className="overflow-hidden">
                <div className="font-bold text-slate-900 dark:text-white truncate">{product.name}</div>
                <div className="text-[10px] text-slate-400">{product.category}</div>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Your Phone (WhatsApp Number)
              </label>
              <input
                type="tel"
                required
                placeholder="e.g. 08031234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition-all"
            >
              Notify Me When Available
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

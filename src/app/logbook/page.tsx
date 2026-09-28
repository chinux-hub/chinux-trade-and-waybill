'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Plus, DollarSign, TrendingUp, Lock, CheckCircle2, ArrowLeft, ShieldAlert } from 'lucide-react';
import { storage } from '@/lib/storage';
import { SalesLog, TraderProfile } from '@/types';
import { formatNaira } from '@/lib/formatters';

export default function LogbookPage() {
  const [profile, setProfile] = useState<TraderProfile>(storage.getProfile());
  const [sales, setSales] = useState<SalesLog[]>([]);

  // Form states
  const [productName, setProductName] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer' | 'ugwo'>('transfer');
  const [customerName, setCustomerName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const refreshData = () => {
    setProfile(storage.getProfile());
    setSales(storage.getSalesLogs());
  };

  useEffect(() => {
    refreshData();
    const handleRole = () => refreshData();
    window.addEventListener('chinux_role_changed', handleRole);
    return () => window.removeEventListener('chinux_role_changed', handleRole);
  }, []);

  const isOga = profile.activeRole === 'oga';
  const canViewCost = isOga || profile.permissions.apprenticeCanViewCost;
  const canViewProfit = isOga || profile.permissions.apprenticeCanViewProfit;
  const canEditPrice = isOga || profile.permissions.apprenticeCanEditPrice;

  const numCost = parseFloat(costPrice) || 0;
  const numSelling = parseFloat(sellingPrice) || 0;
  const numQty = parseInt(quantity) || 1;

  const liveRevenue = numSelling * numQty;
  const liveCost = numCost * numQty;
  const liveProfit = liveRevenue - liveCost;
  const liveMargin = liveRevenue > 0 ? ((liveProfit / liveRevenue) * 100).toFixed(1) : '0';

  const handleAddSale = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Check daily quota / free trial limit
    const check = storage.checkCanPerformDailyAction();
    if (!check.allowed) {
      setErrorMessage(check.reason || 'Daily action limit reached. Please upgrade to Pro for unlimited entries.');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('chinux-open-subscription'));
      }
      return;
    }

    if (!productName.trim()) return;

    const loggedBy = isOga ? 'Oga Chinua' : 'Apprentice Chinedu';

    const newSale: SalesLog = {
      id: 'sale-' + Date.now(),
      date: new Date().toISOString(),
      productName: productName.trim(),
      costPrice: numCost,
      sellingPrice: numSelling,
      quantity: numQty,
      totalRevenue: liveRevenue,
      totalCost: liveCost,
      netProfit: liveProfit,
      profitMarginPercent: parseFloat(liveMargin),
      paymentMethod,
      customerName: customerName.trim() || 'Walk-in Buyer',
      loggedBy,
    };

    storage.addSaleLog(newSale);
    storage.incrementDailyUsage();
    refreshData();

    // Reset fields
    setProductName('');
    setCostPrice('');
    setSellingPrice('');
    setQuantity('');
    setCustomerName('');
  };

  const totalRevAll = sales.reduce((acc, curr) => acc + curr.totalRevenue, 0);
  const totalCostAll = sales.reduce((acc, curr) => acc + curr.totalCost, 0);
  const totalProfitAll = sales.reduce((acc, curr) => acc + curr.netProfit, 0);

  return (
    <div className="space-y-6 animate-fadeIn pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-600" />
            Daily Sales & Profit Logbook
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Record day-to-day market sales with automatic revenue and profit margin calculations.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white self-start sm:self-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Dashboard</span>
        </Link>
      </div>

      {/* Summary Totals */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-slate-500 text-xs font-semibold">Total Recorded Sales</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {formatNaira(totalRevAll)}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            {sales.length} transactions logged
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-slate-500 text-xs font-semibold">Total Goods Cost</span>
          <div className="text-2xl font-black text-slate-700 dark:text-slate-300 mt-1">
            {canViewCost ? formatNaira(totalCostAll) : '🔒 Private'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Wholesale landed cost</div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 shadow-sm">
          <span className="text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            Net Shop Profit
          </span>
          <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
            {canViewProfit ? formatNaira(totalProfitAll) : '🔒 Private (Oga Only)'}
          </div>
          <div className="text-[11px] text-emerald-700/80 font-medium mt-1">
            {canViewProfit
              ? `${((totalProfitAll / (totalRevAll || 1)) * 100).toFixed(1)}% Average Margin`
              : 'Oga privacy active'}
          </div>
        </div>
      </div>

      {/* Quick Entry Form */}
      <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-600" />
            Record Transaction (Instant Profit Calculator)
          </h2>
          {!isOga && (
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-800">
              Logged as Apprentice Chinedu
            </span>
          )}
        </div>

        <form onSubmit={handleAddSale} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Product / Item Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Toyota Hilux Brake Pads"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Quantity Sold
              </label>
              <input
                type="number"
                required
                min="1"
                placeholder="e.g. 1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Customer Name
              </label>
              <input
                type="text"
                placeholder="e.g. Chidi Auto"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Cost Price */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Cost Price (₦) per unit {canViewCost ? '' : '(Locked by Oga)'}
              </label>
              <input
                type={canViewCost ? 'number' : 'password'}
                disabled={!canViewCost}
                placeholder={canViewCost ? 'e.g. 20000' : '••••••'}
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
              />
            </div>

            {/* Selling Price */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Selling Price (₦) per unit
              </label>
              <input
                type="number"
                required
                disabled={!canEditPrice}
                placeholder="e.g. 28000"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium"
              >
                <option value="transfer">Bank Transfer (Instant)</option>
                <option value="cash">Cash in Shop</option>
                <option value="ugwo">Ugwo (Credit - Pay Later)</option>
              </select>
            </div>
          </div>

          {/* Error / Limit Banner */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-shake">
              <p className="text-xs font-semibold text-red-700 dark:text-red-300">
                {errorMessage}
              </p>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('chinux-open-subscription'));
                  }
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-all whitespace-nowrap"
              >
                Upgrade to Pro (₦3,500/mo)
              </button>
            </div>
          )}

          {/* Real-Time Live Calculation Display */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950/80 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-slate-400 block text-[10px]">Calculated Revenue:</span>
              <span className="text-lg font-black text-slate-900 dark:text-white">
                {formatNaira(liveRevenue)}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px]">Total Cost:</span>
              <span className="text-lg font-black text-slate-600 dark:text-slate-400">
                {canViewCost ? formatNaira(liveCost) : '🔒 Private'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px]">Net Profit:</span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                {canViewProfit ? formatNaira(liveProfit) : '🔒 Private'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px]">Profit Margin:</span>
              <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                {canViewProfit ? `${liveMargin}%` : '🔒 Private'}
              </span>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all self-end sm:self-auto"
            >
              Save Sale to Logbook
            </button>
          </div>
        </form>
      </div>

      {/* Sales Table */}
      <div className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Recent Logged Sales</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-navy-950 text-slate-500 uppercase text-[10px] font-bold">
              <tr>
                <th className="p-3.5">Date & Item</th>
                <th className="p-3.5">Qty</th>
                <th className="p-3.5">Selling Price</th>
                <th className="p-3.5">Total Revenue</th>
                <th className="p-3.5">Net Profit</th>
                <th className="p-3.5">Payment</th>
                <th className="p-3.5">Logged By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {sales.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-navy-950/50 transition-colors">
                  <td className="p-3.5">
                    <div className="font-bold text-slate-900 dark:text-white">{s.productName}</div>
                    <div className="text-[10px] text-slate-400">
                      {new Date(s.date).toLocaleDateString()} • {s.customerName}
                    </div>
                  </td>
                  <td className="p-3.5 font-bold">{s.quantity}</td>
                  <td className="p-3.5 font-semibold">{formatNaira(s.sellingPrice)}</td>
                  <td className="p-3.5 font-black text-slate-900 dark:text-white">
                    {formatNaira(s.totalRevenue)}
                  </td>
                  <td className="p-3.5">
                    {canViewProfit ? (
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {formatNaira(s.netProfit)} ({s.profitMarginPercent}%)
                      </span>
                    ) : (
                      <span className="text-slate-400 font-mono text-[11px]">🔒 Private</span>
                    )}
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        s.paymentMethod === 'ugwo'
                          ? 'bg-red-100 dark:bg-red-950 text-red-700'
                          : s.paymentMethod === 'transfer'
                          ? 'bg-blue-100 dark:bg-blue-950 text-blue-700'
                          : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700'
                      }`}
                    >
                      {s.paymentMethod}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-400 text-[11px] font-medium">{s.loggedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Sparkles, ShoppingBag, ArrowLeft, MessageSquare, Plus, ArrowUpRight } from 'lucide-react';
import { storage } from '@/lib/storage';
import { Customer, CatalogProduct, TraderProfile } from '@/types';
import { formatNaira, formatDate } from '@/lib/formatters';
import { createWhatsAppLink } from '@/lib/whatsapp';

export default function CustomersPage() {
  const [profile, setProfile] = useState<TraderProfile>(storage.getProfile());
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [catalog, setCatalog] = useState<CatalogProduct[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    setProfile(storage.getProfile());
    const custs = storage.getCustomers();
    setCustomers(custs);
    setCatalog(storage.getCatalog());
    if (custs.length > 0) setSelectedCustomer(custs[0]);
  }, []);

  // Generate automated purchase recommendation
  const getRecommendation = (cust: Customer) => {
    const isAutoBuyer = cust.frequentGoods.some((g) => g.toLowerCase().includes('toyota') || g.toLowerCase().includes('brake'));
    if (isAutoBuyer) {
      return {
        item: 'Toyota Hilux & Corolla Ceramic Brake Pads',
        reason: 'Frequent buyer of suspension & braking parts. New shipment just arrived in Onitsha!',
        suggestedCartons: 10,
        estimatedPrice: 700000,
      };
    }
    return {
      item: '24V 200Ah Lithium LiFePO4 Inverter Battery',
      reason: 'High-ticket solar customer with matching budget.',
      suggestedCartons: 2,
      estimatedPrice: 760000,
    };
  };

  const handleSendPitch = (cust: Customer) => {
    const rec = getRecommendation(cust);
    const text =
      `Good day *${cust.name}*,\n\n` +
      `Greetings from *${profile.businessName}*! We just unloaded a fresh direct container at Main Market, Onitsha:\n\n` +
      `📦 *New Arrival:* ${rec.item}\n` +
      `💡 *Special Wholesaler Rate:* ${formatNaira(rec.estimatedPrice)}\n\n` +
      `Knowing your regular orders for ${cust.frequentGoods.slice(0, 2).join(', ')}, we reserved some cartons for you before they clear out. Let us know how many cartons to waybill for you today!`;

    const url = createWhatsAppLink(cust.phone, text);
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            Customer Intelligence & Purchase Preferences
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Analyze frequent purchase habits, budgets, and trigger tailored restock pitches.
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

      {/* Grid of Customers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {customers.map((cust) => {
          const rec = getRecommendation(cust);
          return (
            <div
              key={cust.id}
              className="bg-white dark:bg-navy-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{cust.name}</h3>
                    <div className="text-xs text-slate-400">{cust.city}, {cust.state} • {cust.phone}</div>
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    {cust.ugwoReliabilityScore}% Score
                  </span>
                </div>

                {/* Financial Habit */}
                <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Lifetime Spend:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatNaira(cust.totalSpend)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Average Order Budget:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{formatNaira(cust.averageBudget)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Active Ugwo:</span>
                    <span className={`font-black ${cust.totalUgwo > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {formatNaira(cust.totalUgwo)}
                    </span>
                  </div>
                </div>

                {/* Frequent Purchases */}
                <div className="space-y-1 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Frequent Goods Purchased:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {cust.frequentGoods.map((g) => (
                      <span
                        key={g}
                        className="text-[11px] px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-medium"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                </div>

                {/* AI Restock Suggestion */}
                <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-extrabold text-[11px]">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Smart Restock Suggestion</span>
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white text-xs">{rec.item}</div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{rec.reason}</p>
                </div>
              </div>

              <button
                onClick={() => handleSendPitch(cust)}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-[0.98]"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Send WhatsApp Pitch</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, Calendar, CheckCircle2, Clock, DollarSign, Filter, Search, ArrowLeft } from 'lucide-react';
import { storage } from '@/lib/storage';
import { Waybill, TraderProfile } from '@/types';
import { formatNaira } from '@/lib/formatters';
import { UgwoItem } from '@/components/UgwoItem';

export default function UgwoHubPage() {
  const [profile, setProfile] = useState<TraderProfile>(storage.getProfile());
  const [waybills, setWaybills] = useState<Waybill[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'overdue' | 'upcoming' | 'cleared'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const refreshData = () => {
    setProfile(storage.getProfile());
    setWaybills(storage.getWaybills());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const totalOutstanding = waybills.reduce((acc, curr) => acc + curr.ugwoBalance, 0);
  const overdueWaybills = waybills.filter(
    (wb) => wb.ugwoBalance > 0 && new Date(wb.dueDate) < new Date()
  );
  const totalOverdueAmount = overdueWaybills.reduce((acc, curr) => acc + curr.ugwoBalance, 0);
  const clearedCount = waybills.filter((wb) => wb.ugwoBalance === 0).length;

  const filtered = waybills.filter((wb) => {
    const isOverdue = wb.ugwoBalance > 0 && new Date(wb.dueDate) < new Date();
    const isCleared = wb.ugwoBalance === 0;
    const isUpcoming = wb.ugwoBalance > 0 && !isOverdue;

    let matchFilter = true;
    if (filterType === 'overdue') matchFilter = isOverdue;
    if (filterType === 'upcoming') matchFilter = isUpcoming;
    if (filterType === 'cleared') matchFilter = isCleared;

    const q = searchQuery.toLowerCase();
    const matchQuery =
      !q ||
      wb.customerName.toLowerCase().includes(q) ||
      wb.customerPhone.includes(q) ||
      wb.waybillNumber.toLowerCase().includes(q) ||
      wb.destinationCity.toLowerCase().includes(q);

    return matchFilter && matchQuery;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-red-500" />
            Ugwo (Credit & Debt) Collection Hub
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Automate WhatsApp reminders and avoid fake bank alerts for customer balances.
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

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-slate-500 text-xs font-semibold">Total Outstanding Ugwo</span>
          <div className="text-2xl font-black text-red-600 dark:text-red-400 mt-1">
            {formatNaira(totalOutstanding)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Across all debtor accounts</div>
        </div>

        <div className="p-4 rounded-2xl bg-red-50/60 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 shadow-sm">
          <span className="text-red-700 dark:text-red-300 text-xs font-bold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Urgent Overdue Debts
          </span>
          <div className="text-2xl font-black text-red-700 dark:text-red-300 mt-1">
            {formatNaira(totalOverdueAmount)}
          </div>
          <div className="text-[11px] text-red-600/80 font-medium mt-1">
            {overdueWaybills.length} customers past due date
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 shadow-sm">
          <span className="text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Cleared (Fully Paid)
          </span>
          <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
            {clearedCount} Shipments
          </div>
          <div className="text-[11px] text-emerald-600/80 font-medium mt-1">
            100% verified into shop account
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search debtor name, phone, or waybill #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex gap-1.5 overflow-x-auto text-xs no-scrollbar">
          {[
            { key: 'all', label: 'All Debts' },
            { key: 'overdue', label: 'Overdue Only' },
            { key: 'upcoming', label: 'Upcoming' },
            { key: 'cleared', label: 'Cleared / Paid' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterType(tab.key as any)}
              className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
                filterType === tab.key
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-emerald-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Debtors List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-navy-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <div className="font-bold text-slate-700 dark:text-slate-300 text-sm">No Pending Debts Found</div>
            <p className="text-xs text-slate-400">All customer balances in this category are fully settled!</p>
          </div>
        ) : (
          filtered.map((wb) => (
            <UgwoItem
              key={wb.id}
              waybill={wb}
              profile={profile}
              onPaymentSettled={() => refreshData()}
            />
          ))
        )}
      </div>
    </div>
  );
}

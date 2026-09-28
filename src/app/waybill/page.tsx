'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PackageCheck, Search, Filter, Plus, ArrowLeft } from 'lucide-react';
import { storage } from '@/lib/storage';
import { Waybill, TraderProfile } from '@/types';
import { WaybillCard } from '@/components/WaybillCard';

export default function WaybillsListPage() {
  const [profile, setProfile] = useState<TraderProfile>(storage.getProfile());
  const [waybills, setWaybills] = useState<Waybill[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const refreshData = () => {
    setProfile(storage.getProfile());
    setWaybills(storage.getWaybills());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const filteredWaybills = waybills.filter((wb) => {
    const matchesStatus = filterStatus === 'all' || wb.status === filterStatus;
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      !q ||
      wb.waybillNumber.toLowerCase().includes(q) ||
      wb.customerName.toLowerCase().includes(q) ||
      wb.destinationCity.toLowerCase().includes(q) ||
      wb.customerPhone.includes(q);
    return matchesStatus && matchesQuery;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <PackageCheck className="w-6 h-6 text-emerald-600" />
            Interstate Waybills Directory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Track cargo dispatched from Onitsha to motor parks across Nigeria.
          </p>
        </div>

        <Link
          href="/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Dispatch</span>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Filter by waybill #, customer, phone, or destination..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs"
          />
        </div>

        {/* Status Pills */}
        <div className="flex gap-1.5 overflow-x-auto text-xs no-scrollbar">
          {['all', 'in_transit', 'loading', 'arrived', 'collected'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap capitalize transition-all ${
                filterStatus === st
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-emerald-500'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Waybills List */}
      {filteredWaybills.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-navy-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <PackageCheck className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
          <div className="font-bold text-slate-700 dark:text-slate-300 text-sm">No Waybills Found</div>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search query or create a new dispatch for your cargo.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredWaybills.map((wb) => (
            <WaybillCard
              key={wb.id}
              waybill={wb}
              profile={profile}
              onStatusChange={() => refreshData()}
            />
          ))}
        </div>
      )}
    </div>
  );
}

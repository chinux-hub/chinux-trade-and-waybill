'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BarChart3, TrendingUp, Users, PackageCheck, ArrowLeft, ShieldAlert } from 'lucide-react';
import { storage } from '@/lib/storage';
import { SalesLog, Waybill, TraderProfile } from '@/types';
import { formatNaira } from '@/lib/formatters';
import { ProfitLineChart } from '@/components/ProfitLineChart';

export default function StatsPage() {
  const [profile, setProfile] = useState<TraderProfile>(storage.getProfile());
  const [sales, setSales] = useState<SalesLog[]>([]);
  const [waybills, setWaybills] = useState<Waybill[]>([]);

  useEffect(() => {
    setProfile(storage.getProfile());
    setSales(storage.getSalesLogs());
    setWaybills(storage.getWaybills());
  }, []);

  const isOga = profile.activeRole === 'oga';
  const canViewProfit = isOga || profile.permissions.apprenticeCanViewProfit;

  // Prepare chart data points
  const chartData = [
    { label: 'Mon', revenue: 240000, profit: 72000 },
    { label: 'Tue', revenue: 380000, profit: 114000 },
    { label: 'Wed', revenue: 190000, profit: 57000 },
    { label: 'Thu', revenue: 520000, profit: 156000 },
    { label: 'Fri', revenue: 410000, profit: 123000 },
    { label: 'Sat', revenue: 680000, profit: 210000 },
    { label: 'Today', revenue: 350000, profit: 100000 },
  ];

  const totalWaybills = waybills.length;
  const deliveredWaybills = waybills.filter((wb) => wb.status === 'collected').length;
  const deliverySuccessRate = totalWaybills > 0 ? ((deliveredWaybills / totalWaybills) * 100).toFixed(0) : '100';

  const totalRevenue = sales.reduce((acc, curr) => acc + curr.totalRevenue, 0);
  const totalProfit = sales.reduce((acc, curr) => acc + curr.netProfit, 0);

  return (
    <div className="space-y-6 animate-fadeIn pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-600" />
            Trade Analytics & Performance Graphs
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor revenue trends, net profit margins over time, and dispatch completion rates.
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

      {/* Main Interactive Line Chart */}
      <ProfitLineChart data={chartData} canViewProfit={canViewProfit} />

      {/* Secondary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-slate-500">Waybill Completion Rate</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {deliverySuccessRate}%
          </div>
          <div className="text-[11px] text-emerald-600 font-medium">
            {deliveredWaybills} of {totalWaybills} successfully confirmed with PIN
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-slate-500">Average Profit Margin</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {canViewProfit ? '29.4%' : '🔒 Private'}
          </div>
          <div className="text-[11px] text-slate-400">
            {canViewProfit ? 'Strong healthy wholesale spread' : 'Oga setting active'}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-slate-500">Ugwo Recovery Speed</span>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
            8.2 Days
          </div>
          <div className="text-[11px] text-slate-400">
            Average days to settle credit balances
          </div>
        </div>
      </div>
    </div>
  );
}

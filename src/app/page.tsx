'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PackageCheck,
  AlertCircle,
  TrendingUp,
  PlusCircle,
  Truck,
  BookOpen,
  Users,
  Layers,
  ShieldCheck,
  ShieldAlert,
  ArrowUpRight,
  Sparkles,
  BarChart3,
  Settings,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import { storage } from '@/lib/storage';
import { Waybill, TraderProfile, SalesLog } from '@/types';
import { formatNaira } from '@/lib/formatters';
import { WaybillCard } from '@/components/WaybillCard';
import { UgwoItem } from '@/components/UgwoItem';

export default function DashboardPage() {
  const [profile, setProfile] = useState<TraderProfile>(storage.getProfile());
  const [waybills, setWaybills] = useState<Waybill[]>([]);
  const [sales, setSales] = useState<SalesLog[]>([]);

  const refreshData = () => {
    setProfile(storage.getProfile());
    setWaybills(storage.getWaybills());
    setSales(storage.getSalesLogs());
  };

  useEffect(() => {
    refreshData();

    const handleRoleChange = () => refreshData();
    window.addEventListener('chinux_role_changed', handleRoleChange);
    return () => window.removeEventListener('chinux_role_changed', handleRoleChange);
  }, []);

  const totalUgwo = waybills.reduce((acc, curr) => acc + curr.ugwoBalance, 0);
  const activeWaybills = waybills.filter((wb) => wb.status !== 'collected');
  const overdueWaybills = waybills.filter(
    (wb) => wb.ugwoBalance > 0 && new Date(wb.dueDate) < new Date()
  );

  const todaySales = sales.filter(
    (s) => new Date(s.date).toDateString() === new Date().toDateString()
  );
  const todayRevenue = todaySales.reduce((acc, curr) => acc + curr.totalRevenue, 0);
  const todayProfit = todaySales.reduce((acc, curr) => acc + curr.netProfit, 0);

  const isOga = profile.activeRole === 'oga';
  const canViewProfit = isOga || profile.permissions.apprenticeCanViewProfit;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner / Market Identity */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-emerald-700 via-teal-800 to-navy-900 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-emerald-100 flex items-center gap-1.5 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {profile.marketLocation}
            </span>

            {/* Role Status Tag */}
            <div className="flex items-center gap-1.5 text-xs bg-black/30 px-3 py-1 rounded-xl backdrop-blur-md">
              {isOga ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-bold text-emerald-300">Oga View (Full Access)</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-bold text-amber-300">Nwaboyi View (Restricted)</span>
                </>
              )}
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-black tracking-tight">{profile.businessName}</h1>
          <p className="text-xs text-emerald-100/90 max-w-xl">{profile.tagline}</p>

          <div className="pt-2 flex flex-wrap gap-2 text-xs">
            <Link
              href="/new"
              className="px-4 py-2 bg-white text-emerald-900 font-extrabold rounded-xl hover:bg-emerald-50 active:scale-95 transition-all shadow-md flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4 text-emerald-700" />
              <span>Create Waybill</span>
            </Link>
            <Link
              href="/logbook"
              className="px-4 py-2 bg-emerald-900/60 hover:bg-emerald-900/80 text-white font-bold rounded-xl border border-emerald-500/30 transition-all flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4" />
              <span>Record Sale</span>
            </Link>
            <Link
              href="/stats"
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all flex items-center gap-1"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Stats Graph</span>
            </Link>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Financial Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Active Dispatches */}
        <Link
          href="/waybill"
          className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500/50 transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>In Transit</span>
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {activeWaybills.length}
          </div>
          <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-1 flex items-center gap-1">
            <span>Active Cargo</span>
            <ArrowUpRight className="w-3 h-3" />
          </div>
        </Link>

        {/* Total Ugwo (Debt) */}
        <Link
          href="/ugwo"
          className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-red-500/50 transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Unpaid Ugwo</span>
            <div className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-red-600 dark:text-red-400 mt-2">
            {formatNaira(totalUgwo)}
          </div>
          <div className="text-[11px] text-slate-400 font-medium mt-1 flex items-center gap-1">
            <span>{overdueWaybills.length} Overdue</span>
            <ArrowUpRight className="w-3 h-3 text-red-500" />
          </div>
        </Link>

        {/* Today's Revenue */}
        <Link
          href="/logbook"
          className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500/50 transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Today's Sales</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {formatNaira(todayRevenue)}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
            {todaySales.length} Transactions Logged
          </div>
        </Link>

        {/* Today's Net Profit (Oga Privileged) */}
        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Net Profit</span>
            <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {canViewProfit ? formatNaira(todayProfit) : '🔒 Private'}
          </div>
          <div className="text-[11px] text-slate-400 font-medium mt-1">
            {canViewProfit ? (todayRevenue > 0 ? `${((todayProfit / todayRevenue) * 100).toFixed(1)}% Net Margin` : 'Zero sales recorded') : 'Oga view only'}
          </div>
        </div>
      </div>

      {/* Quick Access Feature Hub */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
        <Link
          href="/catalog"
          className="p-3 bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition-all flex flex-col items-center gap-1.5"
        >
          <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600">
            <Layers className="w-5 h-5" />
          </div>
          <span className="font-bold text-slate-800 dark:text-slate-200">Catalog</span>
        </Link>

        <Link
          href="/logistics"
          className="p-3 bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition-all flex flex-col items-center gap-1.5"
        >
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600">
            <Truck className="w-5 h-5" />
          </div>
          <span className="font-bold text-slate-800 dark:text-slate-200">Transit</span>
        </Link>

        <Link
          href="/customers"
          className="p-3 bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition-all flex flex-col items-center gap-1.5"
        >
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600">
            <Users className="w-5 h-5" />
          </div>
          <span className="font-bold text-slate-800 dark:text-slate-200">Buyers CRM</span>
        </Link>

        <Link
          href="/stats"
          className="p-3 bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition-all flex flex-col items-center gap-1.5"
        >
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
            <BarChart3 className="w-5 h-5" />
          </div>
          <span className="font-bold text-slate-800 dark:text-slate-200">Line Graphs</span>
        </Link>

        <Link
          href="/audit"
          className="p-3 bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition-all flex flex-col items-center gap-1.5"
        >
          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="font-bold text-slate-800 dark:text-slate-200">Audit Log</span>
        </Link>

        <Link
          href="/settings"
          className="p-3 bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition-all flex flex-col items-center gap-1.5"
        >
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-navy-950 text-slate-700 dark:text-slate-300">
            <Settings className="w-5 h-5" />
          </div>
          <span className="font-bold text-slate-800 dark:text-slate-200">Shop Settings</span>
        </Link>
      </div>

      {/* Main Split Section: Waybills & Overdue Ugwo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Interstate Waybills */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Recent Interstate Dispatches
              </h2>
            </div>
            <Link
              href="/waybill"
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              View All ({waybills.length}) →
            </Link>
          </div>

          <div className="space-y-3">
            {waybills.length === 0 ? (
              <div className="p-8 text-center rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <PackageCheck className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
                <div className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">No Interstate Dispatches Yet</div>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Your waybill ledger is clean and ready. Tap below to create your first cargo dispatch with a secret 4-digit pickup PIN!
                </p>
                <Link
                  href="/new"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all hover:scale-105"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Create First Waybill</span>
                </Link>
              </div>
            ) : (
              waybills.slice(0, 3).map((wb) => (
                <WaybillCard
                  key={wb.id}
                  waybill={wb}
                  profile={profile}
                  onStatusChange={() => refreshData()}
                />
              ))
            )}
          </div>
        </div>

        {/* Right 1 Col: Urgent Ugwo / Overdue Debts */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Follow-Up Debtors
              </h2>
            </div>
            <Link
              href="/ugwo"
              className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline"
            >
              Ugwo Hub →
            </Link>
          </div>

          <div className="space-y-3">
            {waybills.filter((wb) => wb.ugwoBalance > 0).length === 0 ? (
              <div className="p-6 text-center rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <div className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">🎉 Zero Outstanding Ugwo!</div>
                <p className="text-[11px] text-slate-500">All customer balances are clear. No pending debts to collect.</p>
              </div>
            ) : (
              waybills
                .filter((wb) => wb.ugwoBalance > 0)
                .slice(0, 3)
                .map((wb) => (
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
      </div>
    </div>
  );
}

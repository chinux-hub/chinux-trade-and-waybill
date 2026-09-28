'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, History, ArrowLeft, Filter, Clock, UserCheck, ShieldAlert } from 'lucide-react';
import { storage } from '@/lib/storage';
import { AuditLog } from '@/types';
import { formatDateTime } from '@/lib/formatters';

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filterActor, setFilterActor] = useState<string>('all');

  useEffect(() => {
    setLogs(storage.getAuditLogs());
  }, []);

  const filtered = logs.filter((log) => {
    if (filterActor === 'all') return true;
    return log.actorRole === filterActor;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            Activity Audit Log (Oga Oversight)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Immutable tracking of all sales, waybills, and price edits made by shop apprentices and staff.
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

      {/* Filter Tabs */}
      <div className="flex gap-2 text-xs">
        <button
          onClick={() => setFilterActor('all')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
            filterActor === 'all'
              ? 'bg-emerald-600 text-white'
              : 'bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
          }`}
        >
          All Activity ({logs.length})
        </button>
        <button
          onClick={() => setFilterActor('apprentice')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
            filterActor === 'apprentice'
              ? 'bg-amber-600 text-white'
              : 'bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
          }`}
        >
          Apprentice Only
        </button>
        <button
          onClick={() => setFilterActor('oga')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
            filterActor === 'oga'
              ? 'bg-emerald-600 text-white'
              : 'bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
          }`}
        >
          Oga Actions
        </button>
      </div>

      {/* Timeline of Logs */}
      <div className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden shadow-sm">
        {filtered.map((log) => (
          <div key={log.id} className="p-4 sm:p-5 flex items-start gap-3.5 hover:bg-slate-50/50 dark:hover:bg-navy-950/50 transition-colors">
            <div
              className={`p-2 rounded-xl mt-0.5 flex-shrink-0 ${
                log.actorRole === 'oga'
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                  : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
              }`}
            >
              {log.actorRole === 'oga' ? (
                <ShieldCheck className="w-4 h-4" />
              ) : (
                <ShieldAlert className="w-4 h-4" />
              )}
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                    {log.actorName}
                  </span>
                  <span
                    className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      log.actorRole === 'oga'
                        ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        : 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {log.actorRole}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3" />
                  <span>{formatDateTime(log.timestamp)}</span>
                </div>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {log.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

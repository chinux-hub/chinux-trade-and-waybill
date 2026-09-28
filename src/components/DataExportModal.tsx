'use client';

import React, { useState } from 'react';
import { X, Download, FileSpreadsheet, ShieldCheck, Database, RefreshCw, Trash2, CheckCircle2 } from 'lucide-react';
import { storage } from '@/lib/storage';

interface DataExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataExportModal: React.FC<DataExportModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [clearedMsg, setClearedMsg] = useState(false);

  if (!isOpen) return null;

  const handleDownloadBackup = () => {
    const data = storage.exportBackupJson();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chinux_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCsv = () => {
    const csv = storage.exportSalesCsv();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chinux_sales_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearSlate = () => {
    if (confirm('Are you sure you want to reset to a completely clean slate with zero data?')) {
      storage.clearAllData();
      setClearedMsg(true);
      setTimeout(() => {
        setClearedMsg(false);
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white dark:bg-navy-900 rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 text-xs space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Data Security & Export Center
              </h3>
              <p className="text-[10px] text-slate-400">Backup your records or export to Excel</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-black dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {clearedMsg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 rounded-2xl flex items-center gap-2 font-bold animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Reset to completely clean Day-1 slate!</span>
          </div>
        )}

        <div className="space-y-3 pt-1">
          {/* Export JSON */}
          <button
            onClick={handleDownloadBackup}
            className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 flex items-center justify-between text-left transition-all group"
          >
            <div>
              <span className="font-bold text-slate-900 dark:text-white block text-xs">
                Download Complete System Backup (.json)
              </span>
              <span className="text-[11px] text-slate-400">
                Exports all waybills, audit trail, debts, and inventory.
              </span>
            </div>
            <Download className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
          </button>

          {/* Export CSV */}
          <button
            onClick={handleDownloadCsv}
            className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 flex items-center justify-between text-left transition-all group"
          >
            <div>
              <span className="font-bold text-slate-900 dark:text-white block text-xs">
                Export Sales Ledger to Excel (.csv)
              </span>
              <span className="text-[11px] text-slate-400">
                Spreadsheet ready for tax auditing or accountant review.
              </span>
            </div>
            <FileSpreadsheet className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
          </button>

          {/* Clean Slate Button */}
          <button
            onClick={handleClearSlate}
            className="w-full p-3.5 rounded-2xl bg-red-50/60 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 flex items-center justify-between text-left transition-all"
          >
            <div>
              <span className="font-bold text-red-600 dark:text-red-400 block text-xs">
                Reset to Clean Slate (Day-1 State)
              </span>
              <span className="text-[10px] text-slate-400">
                Clears any test data so you start completely fresh.
              </span>
            </div>
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>

        <div className="pt-2 text-center">
          <span className="text-[10px] text-slate-400">
            🔒 Fully encrypted in local storage with zero cloud leaks.
          </span>
        </div>
      </div>
    </div>
  );
};

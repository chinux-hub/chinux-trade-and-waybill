'use client';

import React, { useState } from 'react';
import { X, Building2, CheckCircle2, RefreshCw, Zap, ShieldCheck, ArrowDownLeft } from 'lucide-react';
import { storage } from '@/lib/storage';
import { ConnectedBank } from '@/types';
import { formatNaira } from '@/lib/formatters';

interface BankConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BankConnectModal: React.FC<BankConnectModalProps> = ({ isOpen, onClose }) => {
  const [bank, setBank] = useState<ConnectedBank | null>(storage.getConnectedBank());
  const [selectedBank, setSelectedBank] = useState('Moniepoint MFB');
  const [accountNumber, setAccountNumber] = useState('8123456789');
  const [accountName, setAccountName] = useState('CHINUX GLOBAL VENTURES LTD');
  const [isSyncing, setIsSyncing] = useState(false);
  const [simulatedAmount, setSimulatedAmount] = useState('150000');
  const [simulatedCustomer, setSimulatedCustomer] = useState('Chief Emeka (Abuja)');
  const [simulatedMessage, setSimulatedMessage] = useState('');

  if (!isOpen) return null;

  const nigerianBanks = [
    'Moniepoint MFB',
    'OPay Digital Bank',
    'Zenith Bank',
    'Guaranty Trust Bank (GTBank)',
    'Access Bank',
    'First Bank of Nigeria',
    'Kuda Microfinance Bank',
    'United Bank for Africa (UBA)',
  ];

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSyncing(true);
    setTimeout(() => {
      const connected = storage.connectBank(selectedBank, accountNumber, accountName);
      setBank(connected);
      setIsSyncing(false);
    }, 1000);
  };

  const handleDisconnect = () => {
    storage.disconnectBank();
    setBank(null);
  };

  const handleSimulateTransfer = () => {
    const amt = parseFloat(simulatedAmount);
    if (isNaN(amt) || amt <= 0) return;

    // Simulate transfer matching WB-8924 or WB-7319 or general sale
    const waybills = storage.getWaybills();
    const targetWb = waybills.find((w) => w.ugwoBalance > 0);

    const tx = storage.simulateIncomingBankTransfer(
      amt,
      simulatedCustomer,
      'Wholesale Cargo Settlement',
      targetWb?.waybillNumber
    );

    setSimulatedMessage(
      `✅ Bank Transfer of ${formatNaira(amt)} received from ${simulatedCustomer}! Automatically reconciled into Logbook and Ugwo cleared.`
    );

    setTimeout(() => {
      setSimulatedMessage('');
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-white dark:bg-navy-900 rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 text-xs space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Bank Auto-Sync & Open Banking
              </h3>
              <p className="text-[10px] text-slate-400">
                Connect your business bank account for automated transaction recording
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-black dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {simulatedMessage && (
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-xs font-bold animate-fadeIn">
            {simulatedMessage}
          </div>
        )}

        {bank ? (
          <div className="space-y-4">
            {/* Active Connected Bank Card */}
            <div className="p-4 bg-gradient-to-br from-blue-900/40 to-slate-900 rounded-2xl border border-blue-500/30 text-white space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-black text-sm">{bank.bankName}</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-white flex items-center gap-1 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                  Connected & Active
                </span>
              </div>
              <div className="text-slate-300 font-mono text-sm">{bank.accountNumber}</div>
              <div className="text-slate-400 uppercase text-[10px]">{bank.accountName}</div>
              <div className="text-[10px] text-emerald-400 pt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Auto-recording sales and settling ugwo upon transfer credit.</span>
              </div>
            </div>

            {/* Test Simulation Trigger */}
            <div className="p-4 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Test Live Bank Transfer Webhook</span>
              </div>
              <p className="text-slate-400 text-[10px]">
                Simulate a real customer transferring money to your shop account:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Amount (₦)</label>
                  <input
                    type="number"
                    value={simulatedAmount}
                    onChange={(e) => setSimulatedAmount(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-navy-900 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Customer Name</label>
                  <input
                    type="text"
                    value={simulatedCustomer}
                    onChange={(e) => setSimulatedCustomer(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-navy-900 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <button
                onClick={handleSimulateTransfer}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow"
              >
                <ArrowDownLeft className="w-4 h-4" />
                <span>Simulate Incoming Transfer & Auto-Record</span>
              </button>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={handleDisconnect}
                className="text-red-500 hover:text-red-600 font-bold text-xs"
              >
                Disconnect Bank
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 dark:bg-navy-950 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleConnect} className="space-y-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Select Nigerian Bank
              </label>
              <select
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium"
              >
                {nigerianBanks.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Business Account Number
              </label>
              <input
                type="text"
                required
                maxLength={10}
                placeholder="e.g. 8123456789"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Account Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. CHINUX GLOBAL VENTURES"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white uppercase font-bold"
              />
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-950/60 rounded-xl border border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-300 text-[11px] leading-relaxed">
              🔒 <strong>Bank-Grade Security:</strong> Read-only statement connection via Nigerian Open Banking standards. Automatically records incoming client payments into your Daily Logbook.
            </div>

            <button
              type="submit"
              disabled={isSyncing}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Connecting to {selectedBank}...</span>
                </>
              ) : (
                <>
                  <Building2 className="w-4 h-4" />
                  <span>Connect & Enable Automated Sync</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

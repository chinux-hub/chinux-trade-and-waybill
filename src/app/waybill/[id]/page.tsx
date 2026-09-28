'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  PackageCheck,
  Truck,
  MapPin,
  KeyRound,
  CheckCircle2,
  Printer,
  Share2,
  ArrowLeft,
  Clock,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { storage } from '@/lib/storage';
import { Waybill, TraderProfile } from '@/types';
import { formatNaira, formatDateTime, formatDate } from '@/lib/formatters';
import {
  createWhatsAppLink,
  generateWaybillBuyerMessage,
  generateWaybillDriverMessage,
} from '@/lib/whatsapp';
import { ThermalReceipt } from '@/components/ThermalReceipt';

export default function WaybillDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [waybill, setWaybill] = useState<Waybill | null>(null);
  const [profile, setProfile] = useState<TraderProfile>(storage.getProfile());
  const [inputPin, setInputPin] = useState('');
  const [pinStatus, setPinStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showThermal, setShowThermal] = useState(false);

  const loadData = () => {
    setProfile(storage.getProfile());
    if (id) {
      const wb = storage.getWaybillById(id);
      if (wb) setWaybill(wb);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  if (!waybill) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <PackageCheck className="w-12 h-12 text-slate-300 mx-auto" />
        <div className="font-bold text-slate-800 dark:text-slate-200">Waybill Not Found</div>
        <p className="text-xs text-slate-500">The requested waybill code or ID does not exist.</p>
        <Link
          href="/waybill"
          className="inline-block px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
        >
          View All Waybills
        </Link>
      </div>
    );
  }

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPin.trim() === waybill.pickupPin) {
      setPinStatus('success');
      storage.updateWaybillStatus(waybill.id, 'collected', 'Pickup PIN Verification');
      loadData();
    } else {
      setPinStatus('error');
    }
  };

  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://chinux.ng';
  const buyerWhatsapp = createWhatsAppLink(
    waybill.customerPhone,
    generateWaybillBuyerMessage(waybill, profile, originUrl)
  );
  const driverWhatsapp = createWhatsAppLink(
    waybill.driverPhone,
    generateWaybillDriverMessage(waybill, profile)
  );

  const milestones = [
    { label: 'Dispatched (Onitsha)', status: 'loading', date: formatDateTime(waybill.createdAt) },
    { label: 'On Highway (In Transit)', status: 'in_transit', date: formatDateTime(waybill.dispatchedAt) },
    { label: `Arrived (${waybill.destinationCity})`, status: 'arrived', date: 'Expected on arrival' },
    { label: 'Collected (PIN Confirmed)', status: 'collected', date: formatDateTime(waybill.collectedAt) },
  ];

  const currentStep =
    waybill.status === 'collected' ? 3 : waybill.status === 'arrived' ? 2 : waybill.status === 'in_transit' ? 1 : 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/waybill"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Waybills</span>
        </Link>

        <button
          onClick={() => setShowThermal(true)}
          className="px-3 py-1.5 bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 hover:border-emerald-500 shadow-sm"
        >
          <Printer className="w-3.5 h-3.5 text-amber-500" />
          <span>Print POS Receipt</span>
        </button>
      </div>

      {/* Main Certificate Card */}
      <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        {/* Certificate Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30">
              <PackageCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 dark:text-white">
                  {waybill.waybillNumber}
                </h1>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                  Verified Dispatch
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Issued by {profile.businessName} • {profile.marketLocation}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-400">Total Value</div>
            <div className="text-xl font-black text-slate-900 dark:text-white">
              {formatNaira(waybill.totalValue)}
            </div>
          </div>
        </div>

        {/* Route Progress Visual Pipeline */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            Cargo Transit Route
          </span>
          <div className="p-4 bg-slate-50 dark:bg-navy-950/60 rounded-2xl border border-slate-100 dark:border-slate-800/80">
            <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
              {milestones.map((m, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold mb-1 transition-all ${
                      idx <= currentStep
                        ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-300 dark:ring-emerald-900'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                    }`}
                  >
                    {idx < currentStep ? '✓' : idx + 1}
                  </div>
                  <span
                    className={`font-semibold ${
                      idx <= currentStep
                        ? 'text-slate-900 dark:text-white font-bold'
                        : 'text-slate-400'
                    }`}
                  >
                    {m.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cargo & Logistics Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-slate-800 space-y-2">
            <span className="font-bold text-emerald-600 uppercase text-[10px] tracking-wider block">
              Receiver Information
            </span>
            <div className="text-sm font-extrabold text-slate-900 dark:text-white">
              {waybill.customerName}
            </div>
            <div className="text-slate-600 dark:text-slate-300">
              Tel: <strong>{waybill.customerPhone}</strong>
            </div>
            <div className="text-slate-600 dark:text-slate-300 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-500" />
              <span>Destination: <strong>{waybill.destinationCity}, {waybill.destinationState}</strong></span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-slate-800 space-y-2">
            <span className="font-bold text-blue-600 uppercase text-[10px] tracking-wider block">
              Haulage & Driver Logistics
            </span>
            <div className="text-sm font-extrabold text-slate-900 dark:text-white">
              {waybill.parkName}
            </div>
            <div className="text-slate-600 dark:text-slate-300">
              Driver: <strong>{waybill.driverName} ({waybill.driverPhone})</strong>
            </div>
            <div className="text-slate-600 dark:text-slate-300">
              Vehicle: <strong>{waybill.vehicleNumber || 'Standard Haulage'}</strong>
            </div>
          </div>
        </div>

        {/* Cargo Summary Table */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
          <div className="flex justify-between font-bold pb-2 border-b border-slate-200 dark:border-slate-800">
            <span>Cargo Description</span>
            <span>Quantity</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="font-semibold text-slate-800 dark:text-slate-200">{waybill.itemsDescription}</span>
            <span className="font-bold text-slate-900 dark:text-white">{waybill.cartonCount} Cartons</span>
          </div>
          <div className="flex justify-between py-1 pt-2 border-t border-slate-200 dark:border-slate-800">
            <span className="text-slate-500">Initial Deposit Paid:</span>
            <span className="font-semibold text-emerald-600">{formatNaira(waybill.depositPaid)}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-500">Ugwo (Balance Due):</span>
            <span className={`font-black ${waybill.ugwoBalance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              {formatNaira(waybill.ugwoBalance)}
            </span>
          </div>
        </div>

        {/* Secret Pickup PIN & Release Confirmation Section */}
        <div className="p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-amber-600" />
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Cargo Release Verification
              </h3>
            </div>
            <span className="text-xs font-mono font-black text-amber-900 dark:text-amber-300 bg-amber-200/60 dark:bg-amber-900/60 px-2.5 py-1 rounded-lg">
              PIN: {waybill.pickupPin}
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300">
            The motor park driver will only hand over this cargo when the customer provides the correct 4-digit PIN.
          </p>

          {waybill.status === 'collected' ? (
            <div className="p-3 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 rounded-xl flex items-center gap-2 text-xs font-bold">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
              <span>Goods Confirmed Collected & Released with PIN!</span>
            </div>
          ) : (
            <form onSubmit={handleVerifyPin} className="flex gap-2 text-xs">
              <input
                type="text"
                maxLength={4}
                placeholder="Enter 4-digit PIN to release..."
                value={inputPin}
                onChange={(e) => setInputPin(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-navy-950 border border-amber-300 dark:border-amber-800 font-mono text-center font-bold tracking-widest text-slate-900 dark:text-white"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition-all"
              >
                Confirm Pickup
              </button>
            </form>
          )}

          {pinStatus === 'error' && (
            <div className="text-[11px] text-red-600 font-bold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Incorrect PIN entered! Please verify with the buyer.</span>
            </div>
          )}
        </div>

        {/* Share Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <a
            href={buyerWhatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md"
          >
            <Share2 className="w-4 h-4" />
            <span>Send Waybill & PIN to Buyer</span>
          </a>

          <a
            href={driverWhatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md"
          >
            <Truck className="w-4 h-4" />
            <span>Send Manifest to Driver</span>
          </a>
        </div>
      </div>

      <ThermalReceipt
        waybill={waybill}
        profile={profile}
        isOpen={showThermal}
        onClose={() => setShowThermal(false)}
      />
    </div>
  );
}

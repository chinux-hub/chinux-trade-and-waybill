'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  PackageCheck,
  Truck,
  MapPin,
  KeyRound,
  Printer,
  Share2,
  CheckCircle2,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { Waybill, TraderProfile } from '@/types';
import { formatNaira, formatDate } from '@/lib/formatters';
import {
  createWhatsAppLink,
  generateWaybillBuyerMessage,
  generateWaybillDriverMessage,
} from '@/lib/whatsapp';
import { ThermalReceipt } from './ThermalReceipt';
import { storage } from '@/lib/storage';

interface WaybillCardProps {
  waybill: Waybill;
  profile: TraderProfile;
  onStatusChange?: (id: string, newStatus: Waybill['status']) => void;
}

export const WaybillCard: React.FC<WaybillCardProps> = ({
  waybill,
  profile,
  onStatusChange,
}) => {
  const [showThermal, setShowThermal] = useState(false);
  const [pinCopied, setPinCopied] = useState(false);

  const getStatusBadge = (status: Waybill['status']) => {
    switch (status) {
      case 'loading':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Loading Bay
          </span>
        );
      case 'in_transit':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-300 dark:border-blue-800 flex items-center gap-1">
            <Truck className="w-3 h-3 animate-pulse" />
            In Transit
          </span>
        );
      case 'arrived':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 border border-purple-300 dark:border-purple-800 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            At Dest. Park
          </span>
        );
      case 'collected':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Collected
          </span>
        );
    }
  };

  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://chinux.ng';
  const buyerWhatsappUrl = createWhatsAppLink(
    waybill.customerPhone,
    generateWaybillBuyerMessage(waybill, profile, originUrl)
  );
  const driverWhatsappUrl = createWhatsAppLink(
    waybill.driverPhone,
    generateWaybillDriverMessage(waybill, profile)
  );

  const copyPin = () => {
    navigator.clipboard.writeText(waybill.pickupPin);
    setPinCopied(true);
    setTimeout(() => setPinCopied(false), 2000);
  };

  return (
    <>
      <div className="bg-white dark:bg-navy-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all space-y-3.5">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Link
                href={`/waybill/${waybill.id}`}
                className="font-extrabold text-base text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                {waybill.waybillNumber}
              </Link>
              {getStatusBadge(waybill.status)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-500" />
              <span>Onitsha</span>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <strong className="text-slate-700 dark:text-slate-200">{waybill.destinationCity}</strong>
            </div>
          </div>

          {/* Secret 4-digit Pickup PIN */}
          <button
            onClick={copyPin}
            className="flex flex-col items-center px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 hover:scale-105 active:scale-95 transition-all text-center"
            title="Click to copy secret Pickup PIN"
          >
            <div className="flex items-center gap-1 text-[9px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
              <KeyRound className="w-2.5 h-2.5" />
              <span>{pinCopied ? 'Copied!' : 'Pickup PIN'}</span>
            </div>
            <span className="font-mono text-base font-black text-amber-900 dark:text-amber-300 tracking-wider">
              {waybill.pickupPin}
            </span>
          </button>
        </div>

        {/* Cargo Details */}
        <div className="p-3 bg-slate-50 dark:bg-navy-950/60 rounded-xl border border-slate-100 dark:border-slate-800/80 space-y-1.5 text-xs">
          <div className="flex justify-between items-center text-slate-700 dark:text-slate-200">
            <span className="font-semibold text-slate-500 dark:text-slate-400">Cargo:</span>
            <span className="font-bold text-right">{waybill.itemsDescription}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Cartons / Quantity:</span>
            <span className="font-bold text-slate-900 dark:text-white">{waybill.cartonCount} cartons</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Receiver / Buyer:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {waybill.customerName} ({waybill.customerPhone})
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Haulage / Park:</span>
            <span className="text-slate-600 dark:text-slate-400">
              {waybill.parkName} • {waybill.driverName}
            </span>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-slate-400 block text-[10px]">Total Value:</span>
            <span className="font-bold text-slate-900 dark:text-white">{formatNaira(waybill.totalValue)}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Deposit Paid:</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {formatNaira(waybill.depositPaid)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 block text-[10px]">Ugwo Balance:</span>
            <span
              className={`font-black ${
                waybill.ugwoBalance > 0
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {formatNaira(waybill.ugwoBalance)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
          {/* Send to Buyer WhatsApp */}
          <a
            href={buyerWhatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-2 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-bold rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-center gap-1.5 transition-all text-[11px]"
            title="Send WhatsApp receipt with Pickup PIN to Buyer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Buyer WA</span>
          </a>

          {/* Send to Driver WhatsApp */}
          <a
            href={driverWhatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-2 bg-slate-50 dark:bg-navy-950 hover:bg-slate-100 text-slate-700 dark:text-slate-300 font-bold rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-1.5 transition-all text-[11px]"
            title="Send Dispatch Manifest to Driver"
          >
            <Truck className="w-3.5 h-3.5 text-blue-500" />
            <span>Driver WA</span>
          </a>

          {/* Print Thermal POS Slip */}
          <button
            onClick={() => setShowThermal(true)}
            className="px-2.5 py-2 bg-slate-50 dark:bg-navy-950 hover:bg-slate-100 text-slate-700 dark:text-slate-300 font-bold rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-1.5 transition-all text-[11px]"
            title="Print 58mm/80mm Thermal Receipt Slip"
          >
            <Printer className="w-3.5 h-3.5 text-amber-500" />
            <span>POS Slip</span>
          </button>
        </div>
      </div>

      {/* Thermal Receipt Modal */}
      <ThermalReceipt
        waybill={waybill}
        profile={profile}
        isOpen={showThermal}
        onClose={() => setShowThermal(false)}
      />
    </>
  );
};

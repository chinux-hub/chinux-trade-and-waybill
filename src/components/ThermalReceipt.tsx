'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Printer, X, Download } from 'lucide-react';
import { Waybill, TraderProfile } from '@/types';
import { formatNaira, formatDateTime } from '@/lib/formatters';

interface ThermalReceiptProps {
  waybill: Waybill;
  profile: TraderProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const ThermalReceipt: React.FC<ThermalReceiptProps> = ({
  waybill,
  profile,
  isOpen,
  onClose,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      const trackingUrl = typeof window !== 'undefined' ? `${window.location.origin}/waybill/${waybill.id}` : '';
      QRCode.toDataURL(trackingUrl, { width: 140, margin: 1 })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('QR Error:', err));
    }
  }, [isOpen, waybill]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm print:p-0 print:bg-white animate-fadeIn">
      <div className="w-full max-w-sm bg-white text-black p-6 rounded-2xl shadow-2xl border border-slate-300 print:shadow-none print:border-none print:w-full print:max-w-none print:p-2">
        {/* Actions bar (hidden in print) */}
        <div className="flex items-center justify-between mb-4 print:hidden border-b pb-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            58mm / 80mm POS Receipt Slip
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Slip</span>
            </button>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-black">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Receipt Content - Styled for POS receipt roll */}
        <div className="text-center font-mono text-[11px] leading-tight space-y-1.5 border-dashed border-b pb-3 mb-3">
          <div className="font-extrabold text-base tracking-wider uppercase">{profile.businessName}</div>
          <div className="text-[10px] text-slate-600">{profile.marketLocation}</div>
          <div className="text-[10px] text-slate-600">Tel: {profile.phone}</div>
          <div className="text-[10px] font-bold mt-1 text-emerald-800">INTERSTATE WAYBILL MANIFEST</div>
        </div>

        <div className="font-mono text-[11px] space-y-2 border-dashed border-b pb-3 mb-3">
          <div className="flex justify-between font-bold">
            <span>WAYBILL NO:</span>
            <span>{waybill.waybillNumber}</span>
          </div>
          <div className="flex justify-between">
            <span>DATE/TIME:</span>
            <span>{formatDateTime(waybill.createdAt)}</span>
          </div>
          <div className="flex justify-between">
            <span>DESTINATION:</span>
            <span className="font-bold uppercase">{waybill.destinationCity}</span>
          </div>
          <div className="flex justify-between">
            <span>RECEIVER:</span>
            <span className="font-bold">{waybill.customerName}</span>
          </div>
          <div className="flex justify-between">
            <span>TEL:</span>
            <span>{waybill.customerPhone}</span>
          </div>
        </div>

        <div className="font-mono text-[11px] space-y-1.5 border-dashed border-b pb-3 mb-3">
          <div className="font-bold text-[10px] uppercase text-slate-500">CARGO DETAILS:</div>
          <div className="font-bold text-xs">{waybill.itemsDescription}</div>
          <div className="flex justify-between">
            <span>CARTONS / BAGS:</span>
            <span className="font-bold">{waybill.cartonCount}</span>
          </div>
          <div className="flex justify-between">
            <span>TOTAL VALUE:</span>
            <span>{formatNaira(waybill.totalValue)}</span>
          </div>
          <div className="flex justify-between">
            <span>DEPOSIT PAID:</span>
            <span>{formatNaira(waybill.depositPaid)}</span>
          </div>
          <div className="flex justify-between font-bold text-red-600">
            <span>UGWO (BALANCE):</span>
            <span>{formatNaira(waybill.ugwoBalance)}</span>
          </div>
        </div>

        <div className="font-mono text-[11px] space-y-1.5 border-dashed border-b pb-3 mb-3">
          <div className="font-bold text-[10px] uppercase text-slate-500">TRANSPORT LOGISTICS:</div>
          <div>PARK: {waybill.parkName}</div>
          <div>DRIVER: {waybill.driverName} ({waybill.driverPhone})</div>
          <div>BUS/VEHICLE: {waybill.vehicleNumber || 'N/A'}</div>
        </div>

        {/* Anti-Theft Pickup PIN Notice */}
        <div className="p-2 border-2 border-black rounded-lg text-center font-mono my-3 bg-slate-50">
          <div className="text-[9px] uppercase font-bold tracking-wider">SECRET PICKUP PIN</div>
          <div className="text-xl font-black tracking-widest my-0.5">{waybill.pickupPin}</div>
          <div className="text-[8px] leading-none text-slate-600">
            Driver must inspect this PIN before releasing cargo at destination!
          </div>
        </div>

        {/* QR Code */}
        {qrDataUrl && (
          <div className="flex flex-col items-center justify-center my-3">
            <img src={qrDataUrl} alt="Tracking QR Code" className="w-24 h-24" />
            <span className="text-[9px] font-mono text-slate-500 mt-1">Scan to Verify Live Online</span>
          </div>
        )}

        <div className="text-center font-mono text-[9px] text-slate-500 pt-1">
          POWERED BY CHINUX TRADE TECH • ONITSHA
        </div>
      </div>
    </div>
  );
};

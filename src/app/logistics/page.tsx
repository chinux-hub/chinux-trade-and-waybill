'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Truck, MapPin, Phone, MessageSquare, ArrowLeft, Navigation, Clock, CheckCircle2 } from 'lucide-react';
import { storage } from '@/lib/storage';
import { Waybill, TraderProfile } from '@/types';
import { formatNaira, formatDateTime } from '@/lib/formatters';
import { createWhatsAppLink } from '@/lib/whatsapp';

export default function LogisticsPage() {
  const [profile, setProfile] = useState<TraderProfile>(storage.getProfile());
  const [waybills, setWaybills] = useState<Waybill[]>([]);
  const [activeCorridor, setActiveCorridor] = useState<string>('all');

  useEffect(() => {
    setProfile(storage.getProfile());
    setWaybills(storage.getWaybills());
  }, []);

  const corridors = [
    { id: 'all', name: 'All Interstate Routes' },
    { id: 'north', name: 'Northern Route (Abuja / Kano / Jos)', cities: ['Kano', 'Abuja', 'Jos', 'Kaduna'] },
    { id: 'west', name: 'Western Route (Lagos / Ibadan / Benin)', cities: ['Lagos', 'Ibadan', 'Benin'] },
    { id: 'east', name: 'Eastern Route (Aba / PH / Owerri)', cities: ['Aba', 'Port Harcourt', 'Owerri'] },
  ];

  const filteredWaybills = waybills.filter((wb) => {
    if (activeCorridor === 'all') return true;
    const corr = corridors.find((c) => c.id === activeCorridor);
    return corr?.cities?.some((city) => wb.destinationCity.toLowerCase().includes(city.toLowerCase()));
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Truck className="w-6 h-6 text-blue-600" />
            Interstate Logistics & Cargo Transit Pipeline
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor trucks, luxurious buses, and haulage drivers moving cargo from Onitsha to buyers nationwide.
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

      {/* Corridor Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto text-xs no-scrollbar">
        {corridors.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCorridor(c.id)}
            className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
              activeCorridor === c.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-blue-400'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Dispatches in Transit */}
      <div className="space-y-4">
        {filteredWaybills.map((wb) => {
          const driverWa = createWhatsAppLink(
            wb.driverPhone,
            `Hello Driver *${wb.driverName}*, please give an update on cargo for Waybill *${wb.waybillNumber}* to *${wb.destinationCity}*. What is your current highway location?`
          );

          return (
            <div
              key={wb.id}
              className="p-5 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-base text-slate-900 dark:text-white">
                      {wb.waybillNumber}
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                        wb.status === 'collected'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : wb.status === 'in_transit'
                          ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 animate-pulse'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      {wb.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {wb.itemsDescription} ({wb.cartonCount} cartons)
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${wb.driverPhone}`}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-navy-950 hover:bg-slate-200 text-slate-700 dark:text-slate-300 flex items-center gap-1 text-xs font-bold"
                    title="Call Driver"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Call Driver</span>
                  </a>
                  <a
                    href={driverWa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 flex items-center gap-1 text-xs font-bold border border-emerald-200 dark:border-emerald-800"
                    title="WhatsApp Driver"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Driver WA</span>
                  </a>
                </div>
              </div>

              {/* Highway Route Timeline */}
              <div className="p-3.5 bg-slate-50 dark:bg-navy-950/60 rounded-2xl border border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <div>
                    <span className="font-bold block text-slate-800 dark:text-slate-200">Origin: Onitsha</span>
                    <span className="text-[10px] text-slate-400">{profile.marketLocation}</span>
                  </div>
                </div>

                <div className="flex-1 px-4 text-center">
                  <div className="w-full border-t-2 border-dashed border-slate-300 dark:border-slate-700 relative">
                    <Truck className="w-4 h-4 text-blue-500 absolute -top-2 left-1/2 -translate-x-1/2 bg-slate-50 dark:bg-navy-950" />
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                    {wb.parkName}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-right">
                  <div>
                    <span className="font-bold block text-slate-800 dark:text-slate-200">
                      Destination: {wb.destinationCity}
                    </span>
                    <span className="text-[10px] text-slate-400">{wb.destinationState}</span>
                  </div>
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                </div>
              </div>

              {/* Driver & Receiver Meta */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-500">
                <div>
                  <span className="block text-[10px] text-slate-400">Driver / Rep:</span>
                  <strong className="text-slate-800 dark:text-slate-200">{wb.driverName}</strong>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400">Vehicle Plate:</span>
                  <strong className="text-slate-800 dark:text-slate-200">{wb.vehicleNumber || 'Standard Haulage'}</strong>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400">Buyer:</span>
                  <strong className="text-slate-800 dark:text-slate-200">{wb.customerName}</strong>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400">Required PIN:</span>
                  <strong className="font-mono text-amber-600 dark:text-amber-400">{wb.pickupPin}</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

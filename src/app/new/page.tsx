'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  PackageCheck,
  Truck,
  ArrowLeft,
  KeyRound,
  DollarSign,
  Calendar,
  Sparkles,
  CheckCircle,
} from 'lucide-react';
import { storage } from '@/lib/storage';
import { generatePin, generateWaybillNumber, formatNaira } from '@/lib/formatters';
import { Waybill } from '@/types';

export default function NewWaybillPage() {
  const router = useRouter();

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [destinationCity, setDestinationCity] = useState('');
  const [destinationState, setDestinationState] = useState('');

  const [itemsDescription, setItemsDescription] = useState('');
  const [cartonCount, setCartonCount] = useState('');
  const [totalValue, setTotalValue] = useState('');
  const [depositPaid, setDepositPaid] = useState('');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );

  const [parkName, setParkName] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [pickupPin] = useState(generatePin());
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const numTotal = parseFloat(totalValue) || 0;
  const numDeposit = parseFloat(depositPaid) || 0;
  const calculatedUgwo = Math.max(0, numTotal - numDeposit);

  const popularCities = [
    { city: 'Kano', state: 'Kano State' },
    { city: 'Abuja (Utako)', state: 'FCT' },
    { city: 'Lagos (Trade Fair)', state: 'Lagos State' },
    { city: 'Aba (Ariaria)', state: 'Abia State' },
    { city: 'Jos', state: 'Plateau State' },
    { city: 'Port Harcourt', state: 'Rivers State' },
    { city: 'Ibadan', state: 'Oyo State' },
    { city: 'Kaduna', state: 'Kaduna State' },
  ];

  const popularParks = [
    'GUO Transport (Upper Iweka)',
    'Young Shall Grow Motors (Onitsha)',
    'Ekeson Haulage (Head Bridge)',
    'God is Good Motors (GIGM Awka Rd)',
    'Peace Mass Transit (Upper Iweka)',
    'Local Onitsha Park / Private Haulage',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Check daily usage quota / trial validity
    const check = storage.checkCanPerformDailyAction();
    if (!check.allowed) {
      setErrorMessage(check.reason || 'Daily action limit reached. Please upgrade to Pro for unlimited waybills.');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('chinux-open-subscription'));
      }
      return;
    }

    if (!customerName || !customerPhone || !itemsDescription) return;

    const profile = storage.getProfile();
    const actor = profile.activeRole === 'oga' ? 'Oga Chinua' : 'Apprentice Chinedu';

    const newWaybill: Waybill = {
      id: 'wb-' + Date.now(),
      waybillNumber: generateWaybillNumber(),
      pickupPin,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      destinationCity,
      destinationState,
      parkName,
      driverName: driverName.trim() || 'Assigned Park Rep',
      driverPhone: driverPhone.trim() || '08000000000',
      vehicleNumber: vehicleNumber.trim() || 'Bus/Truck',
      itemsDescription: itemsDescription.trim(),
      cartonCount: parseInt(cartonCount) || 1,
      totalValue: numTotal,
      depositPaid: numDeposit,
      ugwoBalance: calculatedUgwo,
      dueDate,
      status: 'in_transit',
      paymentStatus: calculatedUgwo === 0 ? 'paid' : numDeposit > 0 ? 'partial' : 'unpaid',
      createdAt: new Date().toISOString(),
      dispatchedAt: new Date().toISOString(),
      notes,
    };

    storage.addWaybill(newWaybill, actor);
    storage.incrementDailyUsage();

    // Redirect to the new waybill view
    router.push(`/waybill/${newWaybill.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
        <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
          New Dispatch
        </span>
      </div>

      <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white">
            Create Digital Waybill & Credit Entry
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Fill in cargo and transport details. A secure 4-digit PIN and shareable WhatsApp slip will be generated instantly.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          {/* Section 1: Customer & Destination */}
          <div className="space-y-3 pt-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              1. Receiver (Customer) Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Customer / Business Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alhaji Musa Garba"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Customer WhatsApp Phone *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="08022334455"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Destination City
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-2">
                {popularCities.slice(0, 4).map((c) => (
                  <button
                    key={c.city}
                    type="button"
                    onClick={() => {
                      setDestinationCity(c.city);
                      setDestinationState(c.state);
                    }}
                    className={`py-1.5 px-2 rounded-lg border text-center font-bold transition-all ${
                      destinationCity === c.city
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 dark:bg-navy-950 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-emerald-500'
                    }`}
                  >
                    {c.city}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Or enter custom city (e.g. Sokoto, Minna, Maiduguri)"
                value={destinationCity}
                onChange={(e) => setDestinationCity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Section 2: Cargo & Financials */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              2. Cargo Description & Payment (Ugwo) Terms
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Items / Cargo Description *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5 Cartons Toyota Brake Pads + 2 Cartons Spark Plugs"
                  value={itemsDescription}
                  onChange={(e) => setItemsDescription(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Total Cartons / Bags
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 5"
                  value={cartonCount}
                  onChange={(e) => setCartonCount(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Total Value (₦) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 150000"
                  value={totalValue}
                  onChange={(e) => setTotalValue(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Deposit Paid Today (₦)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 50000"
                  value={depositPaid}
                  onChange={(e) => setDepositPaid(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Balance (Ugwo) Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Calculated Ugwo Alert Banner */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-500 block text-[11px]">Calculated Ugwo (Debt Balance):</span>
                <span className="text-base font-black text-red-600 dark:text-red-400">
                  {formatNaira(calculatedUgwo)}
                </span>
              </div>
              <div className="text-right text-[11px] text-slate-500">
                {calculatedUgwo === 0 ? (
                  <span className="text-emerald-600 font-bold">🎉 Fully Paid Upfront</span>
                ) : (
                  <span>Automated WhatsApp reminder will be scheduled</span>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Transport Park & Driver Logistics */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              3. Transport Company & Driver Details
            </h2>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Motor Park / Transport Company
              </label>
              <select
                value={parkName}
                onChange={(e) => setParkName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium"
              >
                {popularParks.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Driver Name / Park Rep
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mallam Ibrahim"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Driver Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="08055667788"
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Bus / Vehicle Plate No.
                </label>
                <input
                  type="text"
                  placeholder="e.g. KN-482-XA"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Security PIN Display */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 dark:bg-amber-900/60 rounded-xl text-amber-700 dark:text-amber-300">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <span className="font-extrabold text-slate-900 dark:text-white block">
                  Generated Pickup PIN: <strong className="font-mono text-base text-amber-900 dark:text-amber-300">{pickupPin}</strong>
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Driver will require this PIN before releasing cargo in {destinationCity}.
                </span>
              </div>
            </div>
          </div>

          {/* Error / Limit Banner */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-shake">
              <p className="text-xs font-semibold text-red-700 dark:text-red-300">
                {errorMessage}
              </p>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('chinux-open-subscription'));
                  }
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-all whitespace-nowrap"
              >
                Upgrade to Pro (₦3,500/mo)
              </button>
            </div>
          )}

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-600/30 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Generate Digital Waybill & WhatsApp Slip</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

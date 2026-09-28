'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Search, X, PackageCheck, AlertCircle, Users, ArrowRight } from 'lucide-react';
import { storage } from '@/lib/storage';
import { formatNaira } from '@/lib/formatters';
import { Waybill, Customer, CatalogProduct } from '@/types';

interface SearchBarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [waybills, setWaybills] = useState<Waybill[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [catalog, setCatalog] = useState<CatalogProduct[]>([]);

  useEffect(() => {
    if (isOpen) {
      setWaybills(storage.getWaybills());
      setCustomers(storage.getCustomers());
      setCatalog(storage.getCatalog());
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open
          const btn = document.querySelector('[title="Search"]') as HTMLButtonElement;
          btn?.click();
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { waybills: [], customers: [], products: [] };

    return {
      waybills: waybills.filter(
        (wb) =>
          wb.waybillNumber.toLowerCase().includes(q) ||
          wb.customerName.toLowerCase().includes(q) ||
          wb.customerPhone.includes(q) ||
          wb.destinationCity.toLowerCase().includes(q) ||
          wb.itemsDescription.toLowerCase().includes(q) ||
          wb.parkName.toLowerCase().includes(q)
      ),
      customers: customers.filter(
        (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.city.toLowerCase().includes(q)
      ),
      products: catalog.filter(
        (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
      ),
    };
  }, [query, waybills, customers, catalog]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-white dark:bg-navy-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mr-3 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search waybill #, buyer name, phone, city (Kano, Abuja, Lagos)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none text-base"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <X className="w-4 h-4" />
            </button>
          )}
          <button onClick={onClose} className="ml-2 text-xs font-semibold px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-slate-500">
            ESC
          </button>
        </div>

        {/* Search Results */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {!query && (
            <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-sm">
              Type anything to instantly search across all dispatches, debts, buyers, and inventory.
            </div>
          )}

          {query &&
            filtered.waybills.length === 0 &&
            filtered.customers.length === 0 &&
            filtered.products.length === 0 && (
              <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-sm">
                No matching records found for <span className="font-semibold text-slate-700 dark:text-slate-300">"{query}"</span>.
              </div>
            )}

          {/* Waybill Matches */}
          {filtered.waybills.length > 0 && (
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <PackageCheck className="w-3.5 h-3.5 text-emerald-500" />
                Waybills ({filtered.waybills.length})
              </div>
              <div className="space-y-2">
                {filtered.waybills.map((wb) => (
                  <Link
                    key={wb.id}
                    href={`/waybill/${wb.id}`}
                    onClick={onClose}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-navy-950/50 hover:border-emerald-500/50 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">{wb.waybillNumber}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">
                          PIN: {wb.pickupPin}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {wb.customerName} • {wb.destinationCity} ({wb.cartonCount} cartons)
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-900 dark:text-white">{formatNaira(wb.totalValue)}</div>
                      <div className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                        Ugwo: {formatNaira(wb.ugwoBalance)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Customer Matches */}
          {filtered.customers.length > 0 && (
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-500" />
                Customers ({filtered.customers.length})
              </div>
              <div className="space-y-2">
                {filtered.customers.map((c) => (
                  <Link
                    key={c.id}
                    href={`/customers`}
                    onClick={onClose}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-navy-950/50 hover:border-indigo-500/50 transition-all"
                  >
                    <div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white">{c.name}</div>
                      <div className="text-xs text-slate-500">{c.phone} • {c.city}, {c.state}</div>
                    </div>
                    <div className="text-right text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200">Spend: {formatNaira(c.totalSpend)}</span>
                      {c.totalUgwo > 0 && (
                        <div className="text-amber-600 dark:text-amber-400 font-semibold">Owes: {formatNaira(c.totalUgwo)}</div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

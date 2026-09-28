'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PackageCheck, BookOpen, AlertCircle, Menu, PlusCircle } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Waybills', href: '/waybill', icon: PackageCheck },
    { label: 'Dispatch', href: '/new', icon: PlusCircle, highlight: true },
    { label: 'Logbook', href: '/logbook', icon: BookOpen },
    { label: 'Ugwo', href: '/ugwo', icon: AlertCircle },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-navy-950/95 border-t border-slate-200 dark:border-slate-800 backdrop-blur-md md:hidden">
      <div className="flex items-center justify-around h-13 py-1 px-1 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          if (item.highlight) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-3"
                title={item.label}
              >
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white shadow-md shadow-emerald-600/40 flex items-center justify-center active:scale-95 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-14 py-0.5 transition-colors ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[9px] mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

'use client';

import React, { useState, useEffect } from 'react';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { AdminNavbar } from '@/components/AdminNavbar';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { InstallPwaBanner } from '@/components/InstallPwaBanner';
import { SearchBar } from '@/components/SearchBar';
import { ChatbotWidget } from '@/components/ChatbotWidget';
import { FeedbackModal } from '@/components/FeedbackModal';
import { OnboardingTutorial } from '@/components/OnboardingTutorial';
import { AuthModal } from '@/components/AuthModal';
import { BankConnectModal } from '@/components/BankConnectModal';
import { DataExportModal } from '@/components/DataExportModal';
import { SubscriptionModal } from '@/components/SubscriptionModal';
import { UpdatePromptBanner } from '@/components/UpdatePromptBanner';
import { AuthGuard } from '@/components/AuthGuard';
import { usePathname } from 'next/navigation';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState('dark');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isBankOpen, setIsBankOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const pathname = usePathname();

  const isAdminPage = pathname?.startsWith('/admin');
  const isStorePage = pathname === '/store' || pathname?.startsWith('/store');
  const isPublicLanding =
    pathname === '/' ||
    pathname === '/welcome' ||
    pathname === '/join' ||
    isStorePage ||
    pathname?.startsWith('/waybill/');

  const [isOffline, setIsOffline] = useState(false);
  const [dismissOffline, setDismissOffline] = useState(false);

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('chinux_theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.className = savedTheme;

    // Connectivity status
    setIsOffline(!navigator.onLine);
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Capture PWA install prompt globally
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      (window as any).deferredPrompt = e;
      window.dispatchEvent(new Event('chinux_pwa_ready'));
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Register Service Worker for PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('Chinux PWA Service Worker Registered:', reg.scope))
        .catch((err) => console.log('Service Worker registration failed:', err));
    }

    // Auto-trigger gamified onboarding tutorial for first-time traders
    const hasCompletedTutorial = localStorage.getItem('chinux_onboarding_completed');
    if (!hasCompletedTutorial && !isAdminPage && !isPublicLanding) {
      const timer = setTimeout(() => {
        setIsTutorialOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, [isAdminPage, isPublicLanding]);

  const handleToggleTheme = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem('chinux_theme', newTheme);
    document.documentElement.className = newTheme;
  };

  return (
    <html lang="en" className={isAdminPage ? 'dark' : theme}>
      <head>
        <title>
          {isAdminPage
            ? 'Chinux TradeBill | Admin – Cash Flow Mission Control'
            : 'Chinux TradeBill | Digital Waybills, Stock Broadcast & Wholesale for Nigerian Traders'}
        </title>
        <meta
          name="description"
          content="Chinux TradeBill – Digital waybills, 4-digit pickup PIN, wholesale stock broadcast, Ugwo debt collection, cargo tracking, and daily sales logbook for Nigerian traders."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content={isAdminPage ? '#881337' : '#059669'} />
        <link rel="icon" href="/chinux-logo.png" />
      </head>
      <body className={`min-h-screen flex flex-col selection:bg-emerald-500 selection:text-white ${isAdminPage ? 'bg-slate-950 text-slate-100' : isStorePage ? 'bg-slate-50 dark:bg-slate-950' : isPublicLanding ? 'bg-slate-950' : 'pb-16 md:pb-8'}`}>
        
        {/* App Update Available Floating Banner */}
        <UpdatePromptBanner />

        {/* Offline Mode Indicator Banner */}
        {isOffline && !dismissOffline && (
          <div className="bg-amber-600 text-white text-xs font-bold py-1.5 px-4 text-center flex items-center justify-between gap-2 shadow-md sticky top-0 z-50 animate-fadeIn">
            <div className="flex items-center gap-2 mx-auto">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse flex-shrink-0" />
              <span>
                ⚡ Offline Mode: Working offline. All waybills, debt records & sales are safely saved on this device.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setDismissOffline(true)}
              className="p-1 hover:bg-amber-700 rounded-lg text-white shrink-0 text-xs font-bold"
              title="Dismiss banner"
            >
              ✕
            </button>
          </div>
        )}

        {/* If Admin Page, show dedicated Admin Header; otherwise show Trader Header (unless public landing) */}
        {isAdminPage ? (
          <AdminNavbar />
        ) : isPublicLanding ? null : (
          <>
            <InstallPwaBanner />
            <Navbar
              onOpenSearch={() => setIsSearchOpen(true)}
              onOpenFeedback={() => setIsFeedbackOpen(true)}
              onOpenTutorial={() => setIsTutorialOpen(true)}
              onOpenAuth={() => setIsAuthOpen(true)}
              onOpenBank={() => setIsBankOpen(true)}
              onOpenExport={() => setIsExportOpen(true)}
              onOpenSubscription={() => setIsSubscriptionOpen(true)}
              theme={theme}
              onToggleTheme={handleToggleTheme}
            />
          </>
        )}

        {/* Main Content Area */}
        <main className={`flex-1 w-full mx-auto ${isPublicLanding ? 'px-0 py-0 max-w-full' : 'px-4 sm:px-6 lg:px-8 py-6 max-w-7xl'}`}>
          <AuthGuard>{children}</AuthGuard>
        </main>

        {/* Trader App Features Only (Hidden on Admin and Landing) */}
        {!isAdminPage && !isPublicLanding && (
          <>
            <MobileBottomNav />
            <ChatbotWidget />
            <SearchBar isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
            <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
            <OnboardingTutorial isOpen={isTutorialOpen} onClose={() => setIsTutorialOpen(false)} />
            <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
            <BankConnectModal isOpen={isBankOpen} onClose={() => setIsBankOpen(false)} />
            <DataExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
            <SubscriptionModal isOpen={isSubscriptionOpen} onClose={() => setIsSubscriptionOpen(false)} />
          </>
        )}
      </body>
    </html>
  );
}

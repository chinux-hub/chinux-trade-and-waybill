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
    <html lang="en" className={isAdminPage ? 'dark' : theme} suppressHydrationWarning>
      <head>
        <title>
          {isAdminPage
            ? 'Chinux Admin | Cash Flow Mission Control'
            : 'Chinux | Wholesale Operating System & Digital Waybills for Nigerian Traders'}
        </title>
        <meta
          name="description"
          content="Chinux is the wholesale operating system for Nigerian traders in Alaba, Trade Fair, and Onitsha. Digital waybills, anti-theft 4-digit pickup PINs, WhatsApp status broadcast studio, and Ugwo debt collection."
        />
        <meta
          name="keywords"
          content="Chinux, Chinux Trade, Chinux TradeBill, Chinux Nigeria, Nigerian waybill app, Alaba international market, Onitsha main market, Trade fair Lagos, wholesale operating system, motor park haulage, pickup pin, ugwo debt collection"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="canonical" href="https://chinux-tradebill.vercel.app" />
        <meta name="theme-color" content={isAdminPage ? '#881337' : '#059669'} />
        <link rel="icon" href="/chinux-logo.png" />
        <link rel="apple-touch-icon" href="/chinux-logo.png" />

        {/* Google Open Graph SEO Tags */}
        <meta property="og:site_name" content="Chinux" />
        <meta property="og:title" content="Chinux | Wholesale Operating System & Digital Waybills" />
        <meta
          property="og:description"
          content="Chinux is the purpose-built trade OS for Nigerian wholesale merchants. Digital waybills, 4-digit pickup PINs, WhatsApp status broadcast, and Ugwo debt recovery."
        />
        <meta property="og:url" content="https://chinux-tradebill.vercel.app" />
        <meta property="og:image" content="https://chinux-tradebill.vercel.app/chinux-logo.png" />
        <meta property="og:type" content="website" />

        {/* Twitter Card SEO */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Chinux | Wholesale Operating System for Nigerian Traders" />
        <meta
          name="twitter:description"
          content="Digital waybills, 4-digit pickup PINs, WhatsApp status broadcast studio, and Ugwo debt recovery for Nigerian traders."
        />
        <meta name="twitter:image" content="https://chinux-tradebill.vercel.app/chinux-logo.png" />

        {/* Google Site Verification (Placeholder for Google Search Console) */}
        <meta name="google-site-verification" content="google-site-verification-chinux" />
      </head>
      <body
        suppressHydrationWarning
        className={`min-h-screen flex flex-col selection:bg-emerald-500 selection:text-white ${isAdminPage ? 'bg-slate-950 text-slate-100' : isStorePage ? 'bg-slate-50 dark:bg-slate-950' : isPublicLanding ? 'bg-slate-950' : 'pb-16 md:pb-8'}`}
      >
        {/* Google Search Engine JSON-LD Schema Markup */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'Chinux',
              alternateName: ['Chinux TradeBill', 'Chinux Trade', 'Chinux Nigeria', 'Chinux Wholesale OS'],
              url: 'https://chinux-tradebill.vercel.app',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'All (Web, Android, iOS)',
              description:
                'Chinux is the digital wholesale operating system for Nigerian traders. Features include digital waybills, 4-digit pickup PINs, WhatsApp status broadcast studio, Ugwo debt recovery, and daily sales logbook.',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'NGN',
              },
              publisher: {
                '@type': 'Organization',
                name: 'Chinux Technologies',
                url: 'https://chinux-tradebill.vercel.app',
                logo: 'https://chinux-tradebill.vercel.app/chinux-logo.png',
              },
            }),
          }}
        />
        
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

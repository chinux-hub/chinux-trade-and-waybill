'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, ArrowUpRight } from 'lucide-react';

export const InstallPwaBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) return;

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Show banner anyway on mobile if not standalone after 3 seconds
    const timer = setTimeout(() => {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile && !isStandalone) {
        setShowBanner(true);
      }
    }, 3000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearTimeout(timer);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else {
      // Fallback instructions for iOS Safari or Chrome
      setShowInstructions(true);
    }
  };

  if (!showBanner) return null;

  return (
    <>
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-4 py-2.5 shadow-md flex items-center justify-between text-xs transition-all animate-fadeIn">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
            <Smartphone className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-extrabold tracking-wide">Add Chinux to your Home Screen</span>
            <p className="text-[11px] text-emerald-100 hidden sm:block">
              Fast 1-tap access at the market, even on low data!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleInstall}
            className="px-3 py-1.5 bg-white text-emerald-800 font-extrabold rounded-lg hover:bg-emerald-50 active:scale-95 transition-all shadow-sm"
          >
            Install App
          </button>
          <button
            onClick={() => setShowBanner(false)}
            className="p-1 text-white/80 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Manual Instructions Modal */}
      {showInstructions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-white dark:bg-navy-900 rounded-3xl p-6 space-y-4 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 text-xs">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-sm">How to Install Chinux</h3>
              <button onClick={() => setShowInstructions(false)} className="p-1 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-emerald-600 block mb-1">On Android (Chrome):</span>
                Tap the 3 dots menu (⋮) at the top right of your browser, then tap <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong>.
              </div>

              <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-emerald-600 block mb-1">On iPhone (Safari):</span>
                Tap the Share button (square with arrow pointing up) at the bottom of Safari, scroll down and tap <strong>"Add to Home Screen"</strong>.
              </div>
            </div>

            <button
              onClick={() => setShowInstructions(false)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-center"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
};

'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, Sparkles, X } from 'lucide-react';
import { storage } from '@/lib/storage';

export const UpdatePromptBanner: React.FC = () => {
  const [hasUpdate, setHasUpdate] = useState(false);
  const [latestVersion, setLatestVersion] = useState('1.2.0');

  useEffect(() => {
    const checkVersion = () => {
      const policy = storage.getPolicy();
      const storedVer = localStorage.getItem('chinux_client_version') || '1.2.0';
      const serverVer = policy.appVersion || '1.2.0';
      if (serverVer !== storedVer) {
        setLatestVersion(serverVer);
        setHasUpdate(true);
      }
    };

    checkVersion();
    const interval = setInterval(checkVersion, 10000);
    window.addEventListener('chinux_data_updated', checkVersion);

    return () => {
      clearInterval(interval);
      window.removeEventListener('chinux_data_updated', checkVersion);
    };
  }, []);

  const handleApplyUpdate = () => {
    localStorage.setItem('chinux_client_version', latestVersion);
    // Clear cache & reload
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((r) => r.update());
      });
    }
    window.location.reload();
  };

  if (!hasUpdate) return null;

  return (
    <aside aria-label="App update available" className="fixed top-16 inset-x-0 z-50 p-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-lg animate-fadeIn">
      <div className="max-w-4xl mx-auto px-4 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse flex-shrink-0" />
          <span className="font-bold">
            🚀 New Chinux update is ready (v{latestVersion})! Tap below to update your app.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleApplyUpdate}
            className="px-3 py-1 bg-white text-emerald-900 font-extrabold rounded-lg shadow hover:bg-emerald-50 active:scale-95 transition-all text-xs flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Update Now</span>
          </button>
          <button
            onClick={() => setHasUpdate(false)}
            className="p-1 text-emerald-200 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

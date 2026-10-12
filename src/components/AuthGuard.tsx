'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  // Routes accessible without being signed in:
  const isPublicRoute =
    pathname === '/' ||
    pathname === '/welcome' ||
    pathname === '/join' ||
    pathname === '/store' ||
    pathname?.startsWith('/waybill/') || // Public receiver waybill verification
    pathname?.startsWith('/admin'); // Admin has its own passkey authentication

  useEffect(() => {
    const checkAuth = () => {
      if (isPublicRoute) {
        setIsAuthorized(true);
        setChecking(false);
        return;
      }

      const currentUser = storage.getCurrentUser();
      if (!currentUser) {
        setIsAuthorized(false);
        setChecking(false);
        router.replace('/');
      } else {
        setIsAuthorized(true);
        setChecking(false);
      }
    };

    checkAuth();

    // Listen for logout or login events
    const handleUpdate = () => checkAuth();
    window.addEventListener('chinux_data_updated', handleUpdate);
    return () => window.removeEventListener('chinux_data_updated', handleUpdate);
  }, [pathname, isPublicRoute, router]);

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center animate-pulse">
          <span className="font-black text-emerald-400 text-lg">CX</span>
        </div>
        <span className="text-xs text-slate-400 font-medium mt-3">Verifying Trader Session...</span>
      </div>
    );
  }

  if (!isAuthorized && !isPublicRoute) {
    return null;
  }

  return <>{children}</>;
};

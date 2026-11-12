'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-center space-y-4">
          <h2 className="text-xl font-black text-white">Chinux System Recovery</h2>
          <p className="text-xs text-slate-400">
            {error?.message || 'A client-side exception occurred. Click reload to restore your session.'}
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all"
          >
            Reload Chinux App
          </button>
        </div>
      </body>
    </html>
  );
}

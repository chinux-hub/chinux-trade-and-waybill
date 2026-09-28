'use client';

import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, PackageCheck, KeyRound, MessageSquare, Check, Sparkles } from 'lucide-react';

interface OnboardingTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const slides = [
    {
      title: 'Welcome to Chinux Trade!',
      subtitle: 'Built for wholesale trade, interstate waybills & ugwo tracking in Anambra & Nigeria.',
      icon: Sparkles,
      color: 'emerald',
      content: (
        <div className="space-y-3 text-left text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          <p>
            Whether your shop is in <strong>Onitsha Main Market</strong>, <strong>Head Bridge</strong>, or <strong>Nnewi</strong>, Chinux replaces lost paper slips and awkward debt recovery calls with automated digital tools.
          </p>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-medium">
            💡 Tap "Add to Home Screen" on your phone browser to use Chinux like a native mobile app even offline!
          </div>
        </div>
      ),
    },
    {
      title: '1. Fast 30-Second Waybill Dispatch',
      subtitle: 'Create digital waybills right at the motor park or shop.',
      icon: PackageCheck,
      color: 'blue',
      content: (
        <div className="space-y-3 text-left text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          <p>
            Tap <strong>"New Dispatch"</strong>, type the buyer's phone number, destination (e.g. Kano, Abuja, Lagos), cartons count, and transport company (GUO, Young Shall Grow, etc.).
          </p>
          <p>
            Chinux immediately creates a trackable Digital Waybill and generates pre-filled WhatsApp messages for both the buyer and driver in 1 click!
          </p>
        </div>
      ),
    },
    {
      title: '2. The 4-Digit Pickup PIN',
      subtitle: 'Eliminate cargo theft and driver disputes.',
      icon: KeyRound,
      color: 'amber',
      content: (
        <div className="space-y-3 text-left text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          <p>
            Every waybill generates a unique secret <strong>4-digit PIN</strong> sent only to the buyer.
          </p>
          <p>
            The motor park driver is instructed <strong>never to release the goods</strong> at destination until the buyer provides this PIN. This ensures your customer inspects their cartons and stops impersonators.
          </p>
        </div>
      ),
    },
    {
      title: '3. Ugwo Reminders & Profit Logbook',
      subtitle: 'Recover your money without awkward arguments.',
      icon: MessageSquare,
      color: 'teal',
      content: (
        <div className="space-y-3 text-left text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          <p>
            When customers buy on credit, the <strong>Ugwo Tracker</strong> alerts you when payment is due.
          </p>
          <p>
            Send polite or Pidgin reminder messages directly into their WhatsApp with your verified bank details in 1 tap.
          </p>
          <p>
            Plus, the <strong>Daily Logbook</strong> automatically calculates your exact net profit on every single product sold!
          </p>
        </div>
      ),
    },
  ];

  const current = slides[step];
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white dark:bg-navy-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
              Tutorial Step {step + 1} of {slides.length}
            </span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shadow-inner">
            <Icon className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>

          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{current.title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{current.subtitle}</p>
          </div>

          <div className="pt-2">{current.content}</div>
        </div>

        {/* Footer Navigation */}
        <div className="p-4 bg-slate-50 dark:bg-navy-950 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex gap-1">
            {slides.map((_, i) => (
              <span
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i === step ? 'w-6 bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
              >
                Back
              </button>
            )}
            {step < slides.length - 1 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Get Started</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

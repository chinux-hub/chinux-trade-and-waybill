'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  PackageCheck,
  KeyRound,
  MessageSquare,
  Check,
  Sparkles,
  Trophy,
  Crown,
  Share2,
  Store,
  ShieldCheck,
  PlusCircle,
  Truck,
  DollarSign,
  ArrowRight,
  Zap,
  Award,
} from 'lucide-react';

interface OnboardingTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({ isOpen, onClose }) => {
  const [currentMission, setCurrentMission] = useState(0);
  const [xp, setXp] = useState(0);
  const [completedMissions, setCompletedMissions] = useState<number[]>([]);
  const [demoPinRevealed, setDemoPinRevealed] = useState(false);
  const [demoReminderLang, setDemoReminderLang] = useState<'english' | 'pidgin'>('english');
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Check if previously started
      const savedXp = parseInt(localStorage.getItem('chinux_trader_xp') || '0', 10);
      setXp(savedXp);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const missions = [
    {
      id: 0,
      badge: 'Mission 1 of 5',
      title: 'Create Digital Waybills in 30 Seconds',
      buttonTarget: '+ Create Waybill',
      icon: PlusCircle,
      color: 'emerald',
      xpReward: 20,
      description: 'Replace lost paper waybill slips with trackable digital receipts for every motor park haulage cargo.',
      guide: [
        'Tap "+ Create Waybill" on your dashboard or navigation bar.',
        'Enter buyer phone, destination city (e.g. Kano, Abuja, Lagos), carton count, and transport company (GUO, Young Shall Grow, etc.).',
        'Chinux automatically formats official waybill manifests and buyer pickup slips ready to share on WhatsApp or SMS in 1 tap.',
      ],
      interactiveType: 'waybill_demo',
    },
    {
      id: 1,
      badge: 'Mission 2 of 5',
      title: 'Anti-Theft 4-Digit Pickup PIN',
      buttonTarget: 'Secret Pickup PIN',
      icon: KeyRound,
      color: 'amber',
      xpReward: 20,
      description: 'Stop motor park cargo theft, wrong release, and impersonators.',
      guide: [
        'Every waybill generated gives your buyer a secret 4-Digit PIN.',
        'The motor park driver is instructed NEVER to release cartons until the buyer shows this secret code.',
        'Buyers can also track their cargo status at your store link (chinux.ng/store) by entering this PIN with zero login needed!',
      ],
      interactiveType: 'pin_demo',
    },
    {
      id: 2,
      badge: 'Mission 3 of 5',
      title: 'Ugwo Debt Recovery (1-Tap WhatsApp Reminders)',
      buttonTarget: 'Ugwo Hub',
      icon: MessageSquare,
      color: 'rose',
      xpReward: 20,
      description: 'Collect your credit money with zero awkward phone calls or arguments.',
      guide: [
        'Track all customer credit balances and due dates automatically.',
        'Tap the WhatsApp reminder button on any debtor to send polite English or respectful Pidgin messages.',
        'Your verified shop bank details (Bank Name & Account Number) are automatically embedded so buyers pay directly into your account!',
      ],
      interactiveType: 'ugwo_demo',
    },
    {
      id: 3,
      badge: 'Mission 4 of 5',
      title: 'WhatsApp Status Broadcast Studio (No Line Limits)',
      buttonTarget: 'Broadcast Stock to Status',
      icon: Share2,
      color: 'purple',
      xpReward: 20,
      description: 'Upload your entire product inventory to WhatsApp Status without getting blocked by WhatsApp limits.',
      guide: [
        'WhatsApp has a strict 10-line text limit on status posts.',
        'Use "Upload Flyer to Status" to automatically compile all your goods into one high-resolution visual price poster.',
        'Or use "Queue All Photos" to push all selected product images into WhatsApp Status story sequence together with direct order links!',
      ],
      interactiveType: 'status_demo',
    },
    {
      id: 4,
      badge: 'Mission 5 of 5',
      title: 'Your 24/7 Digital Wholesale Storefront',
      buttonTarget: 'chinux.ng/store',
      icon: Store,
      color: 'blue',
      xpReward: 20,
      description: 'A dedicated online catalog for your shop where buyers view products and place waybill orders.',
      guide: [
        'Share your unique store link on WhatsApp Status, Facebook, and Instagram.',
        'Buyers can browse in 3 different views: Grid, Wholesale List Scan, or Showcase Cards.',
        'Each product has a 1-tap "Order via WhatsApp" button that pre-fills the exact item and carton quantity straight to your phone!',
      ],
      interactiveType: 'store_demo',
    },
  ];

  const current = missions[currentMission];
  const Icon = current.icon;

  const handleNextMission = () => {
    // Add XP if not already completed
    if (!completedMissions.includes(currentMission)) {
      const nextXp = Math.min(100, xp + current.xpReward);
      setXp(nextXp);
      setCompletedMissions([...completedMissions, currentMission]);
      localStorage.setItem('chinux_trader_xp', nextXp.toString());
    }

    if (currentMission < missions.length - 1) {
      setCurrentMission((prev) => prev + 1);
    } else {
      setShowCelebration(true);
    }
  };

  const handleFinishOnboarding = () => {
    localStorage.setItem('chinux_onboarding_completed', 'true');
    localStorage.setItem('chinux_trader_xp', '100');
    onClose();
  };

  const traderRank =
    xp >= 100
      ? '👑 Certified Oga Chief (Level 5)'
      : xp >= 80
      ? '🔥 Status Master (Level 4)'
      : xp >= 60
      ? '💼 Recovery Boss (Level 3)'
      : xp >= 40
      ? '📦 Cargo Dispatcher (Level 2)'
      : '🌱 Market Newbie (Level 1)';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-white dark:bg-navy-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Gamification Bar: Level & XP Progress */}
        <div className="p-4 bg-gradient-to-r from-slate-900 via-navy-950 to-slate-900 text-white border-b border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Trophy className="w-4 h-4" />
              </span>
              <div>
                <span className="text-[10px] uppercase font-black tracking-wider text-amber-400 block -mb-0.5">
                  Master Trader Quest
                </span>
                <span className="text-xs font-black text-white">{traderRank}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-black text-emerald-400">{xp}/100 XP</span>
              <button
                onClick={handleFinishOnboarding}
                className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
                title="Skip Quest"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 rounded-full"
              style={{ width: `${Math.max(5, xp)}%` }}
            />
          </div>
        </div>

        {/* Quest Body or Celebration Screen */}
        {!showCelebration ? (
          <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
            {/* Mission Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                  {current.badge} • +{current.xpReward} XP
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                  {current.title}
                </h3>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 shrink-0 shadow-inner">
                <Icon className="w-6 h-6" />
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              {current.description}
            </p>

            {/* Target Button Pill */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500" />
                <span>Feature Button Guided by this Mission:</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-navy-900 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs shadow-sm">
                <Icon className="w-3.5 h-3.5 text-emerald-600" />
                <span>{current.buttonTarget}</span>
              </div>
            </div>

            {/* Interactive Feature Demo */}
            {current.interactiveType === 'pin_demo' && (
              <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-2 text-center">
                <span className="text-[10px] uppercase font-bold text-amber-800 dark:text-amber-300 block">
                  Interactive Demo: Test Buyer 4-Digit Pickup PIN
                </span>
                <div className="font-mono text-2xl font-black text-amber-700 dark:text-amber-400 tracking-widest py-1 bg-white dark:bg-navy-900 rounded-xl border border-amber-300 dark:border-amber-700">
                  {demoPinRevealed ? 'PIN: 8492' : '••••'}
                </div>
                <button
                  type="button"
                  onClick={() => setDemoPinRevealed(!demoPinRevealed)}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-all"
                >
                  {demoPinRevealed ? 'Hide PIN' : 'Tap to Reveal Secret PIN'}
                </button>
              </div>
            )}

            {current.interactiveType === 'ugwo_demo' && (
              <div className="p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold text-rose-800 dark:text-rose-300">
                  <span>Interactive Demo: Debt Recovery Message</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setDemoReminderLang('english')}
                      className={`px-2 py-0.5 rounded ${
                        demoReminderLang === 'english'
                          ? 'bg-rose-600 text-white'
                          : 'bg-white dark:bg-navy-900 text-slate-600'
                      }`}
                    >
                      English
                    </button>
                    <button
                      type="button"
                      onClick={() => setDemoReminderLang('pidgin')}
                      className={`px-2 py-0.5 rounded ${
                        demoReminderLang === 'pidgin'
                          ? 'bg-rose-600 text-white'
                          : 'bg-white dark:bg-navy-900 text-slate-600'
                      }`}
                    >
                      Pidgin
                    </button>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-navy-900 text-slate-700 dark:text-slate-200 text-[11px] font-mono leading-relaxed border border-rose-200 dark:border-rose-900">
                  {demoReminderLang === 'english'
                    ? 'Dear Customer, reminder of your pending balance of ₦45,000 for Waybill #WB-209. Please settle to Zenith Bank: 1012345678 (Drocis Limited).'
                    : 'Chief, we hail o! Abeg balance of ₦45,000 for your goods don reach due date. Pay sharp-sharp into Zenith: 1012345678 make we load next container!'}
                </div>
              </div>
            )}

            {/* Step-by-Step Guide Bullet Points */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-black uppercase text-slate-400 block tracking-wider">
                How It Works in Your Shop:
              </span>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                {current.guide.map((stepText, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{stepText}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          /* 🏆 QUEST COMPLETED CELEBRATION SCREEN */
          <div className="p-6 sm:p-8 text-center space-y-4 animate-fadeIn flex-1 flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 text-white flex items-center justify-center shadow-2xl shadow-amber-500/40 animate-bounce">
              <Award className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-black tracking-widest text-emerald-600 dark:text-emerald-400 block">
                Quest Completed • 100/100 XP
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                You Are Now a Certified Master Trader!
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                You have mastered digital waybills, 4-digit anti-theft PINs, Ugwo debt recovery, and WhatsApp Status broadcast flyers.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold w-full max-w-sm flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Full features unlocked: You are ready to start trading!</span>
            </div>

            <button
              type="button"
              onClick={handleFinishOnboarding}
              className="w-full max-w-sm py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <span>Start Trading Like an Oga Chief</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Footer Navigation */}
        {!showCelebration && (
          <div className="p-4 bg-slate-50 dark:bg-navy-950 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex gap-1.5">
              {missions.map((m, i) => (
                <span
                  key={i}
                  className={`h-2 rounded-full transition-all ${
                    i === currentMission
                      ? 'w-6 bg-emerald-600'
                      : completedMissions.includes(i)
                      ? 'w-2.5 bg-emerald-400'
                      : 'w-2 bg-slate-300 dark:bg-slate-700'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {currentMission > 0 && (
                <button
                  type="button"
                  onClick={() => setCurrentMission((prev) => prev - 1)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 transition-all"
                >
                  Back
                </button>
              )}

              <button
                type="button"
                onClick={handleNextMission}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/25 transition-all active:scale-95"
              >
                <span>{currentMission === missions.length - 1 ? 'Claim Trader Trophy' : 'Complete & Next (+20 XP)'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

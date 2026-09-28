'use client';

import React, { useState } from 'react';
import { AlertCircle, Calendar, MessageSquare, CheckCircle, ArrowRight, DollarSign } from 'lucide-react';
import { Waybill, TraderProfile } from '@/types';
import { formatNaira, formatDate } from '@/lib/formatters';
import {
  createWhatsAppLink,
  generateUgwoReminderPolite,
  generateUgwoReminderPidgin,
  generatePaymentReceiptMessage,
} from '@/lib/whatsapp';
import { storage } from '@/lib/storage';

interface UgwoItemProps {
  waybill: Waybill;
  profile: TraderProfile;
  onPaymentSettled?: () => void;
}

export const UgwoItem: React.FC<UgwoItemProps> = ({ waybill, profile, onPaymentSettled }) => {
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [settleAmount, setSettleAmount] = useState(waybill.ugwoBalance.toString());
  const [templateType, setTemplateType] = useState<'polite' | 'pidgin'>('polite');

  const isOverdue = new Date(waybill.dueDate) < new Date();

  const reminderMessage =
    templateType === 'polite'
      ? generateUgwoReminderPolite(waybill, profile)
      : generateUgwoReminderPidgin(waybill, profile);

  const whatsappUrl = createWhatsAppLink(waybill.customerPhone, reminderMessage);

  const handleSettle = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(settleAmount);
    if (isNaN(amount) || amount <= 0) return;

    const { waybill: updatedWb, newBalance } = storage.settleUgwo(waybill.id, amount, profile.activeRole === 'oga' ? 'Oga Chinua' : 'Apprentice Chinedu');

    // Optionally generate receipt link
    if (updatedWb) {
      const receiptMsg = generatePaymentReceiptMessage(updatedWb, profile, amount);
      const receiptUrl = createWhatsAppLink(waybill.customerPhone, receiptMsg);
      window.open(receiptUrl, '_blank');
    }

    setShowSettleModal(false);
    onPaymentSettled?.();
  };

  return (
    <>
      <div
        className={`p-4 rounded-2xl border transition-all space-y-3 ${
          isOverdue
            ? 'bg-red-50/40 dark:bg-red-950/20 border-red-200 dark:border-red-900/60'
            : 'bg-white dark:bg-navy-900 border-slate-200 dark:border-slate-800'
        }`}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                {waybill.customerName}
              </span>
              {isOverdue && (
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-800 animate-pulse">
                  Overdue
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Waybill: <strong>{waybill.waybillNumber}</strong> • {waybill.destinationCity}
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-semibold">Ugwo Balance</span>
            <span className="text-base font-black text-red-600 dark:text-red-400">
              {formatNaira(waybill.ugwoBalance)}
            </span>
          </div>
        </div>

        <div className="p-2.5 bg-slate-50 dark:bg-navy-950/60 rounded-xl border border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Due Date: <strong>{formatDate(waybill.dueDate)}</strong></span>
          </div>
          <div>
            <span>Tel: <strong>{waybill.customerPhone}</strong></span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1 text-xs">
          {/* WhatsApp Reminder dropdown/toggle */}
          <div className="flex-1 flex rounded-xl border border-emerald-300 dark:border-emerald-800 overflow-hidden">
            <button
              type="button"
              onClick={() => setTemplateType(templateType === 'polite' ? 'pidgin' : 'polite')}
              className="px-2 py-1.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold border-r border-emerald-300 dark:border-emerald-800 hover:bg-emerald-200 transition-colors"
              title="Toggle between Polite English & Pidgin template"
            >
              {templateType === 'polite' ? '🇬🇧 Polite' : '🇳🇬 Pidgin'}
            </button>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-1.5 transition-colors text-[11px]"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Send Reminder</span>
            </a>
          </div>

          {/* Settle Debt Button */}
          <button
            onClick={() => setShowSettleModal(true)}
            className="px-3.5 py-1.5 bg-slate-100 dark:bg-navy-950 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-1 text-[11px]"
          >
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* Settle Payment Modal */}
      {showSettleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-white dark:bg-navy-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              Record Payment for {waybill.customerName}
            </h3>
            <p className="text-slate-500">
              Waybill: <strong>{waybill.waybillNumber}</strong> • Balance:{' '}
              <strong className="text-red-600">{formatNaira(waybill.ugwoBalance)}</strong>
            </p>

            <form onSubmit={handleSettle} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Amount Received (₦)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={waybill.ugwoBalance}
                  value={settleAmount}
                  onChange={(e) => setSettleAmount(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-base font-bold"
                />
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300">
                ✅ Recording payment will update your shop ledger, log an audit record, and open WhatsApp to send a verified receipt to the customer!
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSettleModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm"
                >
                  Confirm & Send Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

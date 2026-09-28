'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Sparkles, AlertCircle, Package, ArrowUpRight } from 'lucide-react';
import { storage } from '@/lib/storage';
import { formatNaira } from '@/lib/formatters';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  time: string;
}

export const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      text: 'Nnoo! I am Chinux AI, your Onitsha market trade assistant. Ask me anything like: "How much ugwo is unpaid?", "Show Kano shipments", or "Draft WhatsApp payment reminder".',
      time: 'Just now',
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');

    // Generate intelligent contextual response
    setTimeout(() => {
      const lower = query.toLowerCase();
      let reply = '';

      const waybills = storage.getWaybills();
      const sales = storage.getSalesLogs();
      const totalUgwo = waybills.reduce((acc, curr) => acc + curr.ugwoBalance, 0);

      if (lower.includes('ugwo') || lower.includes('debt') || lower.includes('balance') || lower.includes('owe')) {
        const overdueWbs = waybills.filter(
          (wb) => wb.ugwoBalance > 0 && new Date(wb.dueDate) < new Date()
        );
        reply = `📊 *Ugwo (Debt) Summary:*\n` +
          `• Total unpaid debt across all customers: *${formatNaira(totalUgwo)}*.\n` +
          `• Overdue debts requiring urgent follow-up: *${overdueWbs.length} customers*.\n\n` +
          `Tip: Go to the Ugwo tab to send 1-click WhatsApp payment reminders with your bank details!`;
      } else if (lower.includes('kano') || lower.includes('abuja') || lower.includes('lagos')) {
        const city = lower.includes('kano') ? 'Kano' : lower.includes('abuja') ? 'Abuja' : 'Lagos';
        const matches = waybills.filter((wb) => wb.destinationCity.toLowerCase().includes(city.toLowerCase()));
        reply = `🚚 Found ${matches.length} waybills dispatched to *${city}*:\n` +
          matches.map((w) => `• ${w.waybillNumber}: ${w.customerName} (${w.status.toUpperCase()}, PIN: ${w.pickupPin})`).join('\n');
      } else if (lower.includes('profit') || lower.includes('revenue') || lower.includes('gain')) {
        const totalRev = sales.reduce((acc, curr) => acc + curr.totalRevenue, 0);
        const totalProfit = sales.reduce((acc, curr) => acc + curr.netProfit, 0);
        reply = `📈 *Financial Overview:*\n` +
          `• Total Recorded Revenue: *${formatNaira(totalRev)}*\n` +
          `• Total Net Profit: *${formatNaira(totalProfit)}*\n` +
          `• Overall Profit Margin: *${((totalProfit / (totalRev || 1)) * 100).toFixed(1)}%*.\n` +
          `Check the Stats tab to view the interactive 30-day line graph!`;
      } else if (lower.includes('pin') || lower.includes('pickup') || lower.includes('security')) {
        reply = `🔒 *How the 4-Digit Pickup PIN Protects You:*\n` +
          `When you dispatch goods at Upper Iweka or Head Bridge, Chinux generates a secret 4-digit PIN for the buyer. The driver is instructed NOT to release the goods unless the buyer provides this PIN. This completely eliminates driver impersonation and stolen cartons!`;
      } else if (lower.includes('whatsapp') || lower.includes('reminder') || lower.includes('template')) {
        reply = `💬 *Draft WhatsApp Payment Message:*\n\n` +
          `"Good day Chief, this is a respectful reminder from Chinux Global regarding your balance of ₦440,000 for Waybill #WB-8924. Kindly transfer into Zenith Bank / Moniepoint (Acc: 8123456789). Thank you for your partnership!"\n\n` +
          `You can tap the WhatsApp button on any waybill to send this directly in 1 click.`;
      } else {
        reply = `I can help you monitor waybills, calculate shop profits, draft WhatsApp reminders, or look up customer records. Try tapping one of the quick suggestions below!`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 400);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-20 md:bottom-6 right-4 z-40 p-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-600/40 hover:scale-110 active:scale-95 transition-all flex items-center justify-center ${
          isOpen ? 'hidden' : 'flex'
        }`}
        title="Open Chinux AI Assistant"
      >
        <Bot className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 border-2 border-white dark:border-navy-950 rounded-full animate-pulse" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 md:bottom-6 right-4 z-50 w-[92vw] sm:w-96 max-h-[520px] h-[500px] bg-white dark:bg-navy-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-slideUp">
          {/* Header */}
          <div className="p-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/10 rounded-lg">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-sm">Chinux AI Assistant</div>
                <div className="text-[10px] text-emerald-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-pulse" />
                  Online • Onitsha Market Intel
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-slate-50/50 dark:bg-navy-950/40 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`p-3 rounded-2xl max-w-[85%] whitespace-pre-wrap leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-none'
                      : 'bg-white dark:bg-navy-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/60 rounded-bl-none shadow-sm'
                  }`}
                >
                  {m.text}
                </div>
                <span className="text-[9px] text-slate-400 mt-1 px-1">{m.time}</span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Preset Quick Chips */}
          <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-navy-900 flex gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
            <button
              onClick={() => handleSend('How much ugwo is unpaid?')}
              className="whitespace-nowrap px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100"
            >
              💰 Unpaid Ugwo
            </button>
            <button
              onClick={() => handleSend('Show Kano shipments')}
              className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
            >
              🚚 Kano Dispatches
            </button>
            <button
              onClick={() => handleSend('How does the pickup PIN work?')}
              className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
            >
              🔒 Pickup PIN
            </button>
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2.5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask Chinux AI..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-navy-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 border border-transparent dark:border-slate-800"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

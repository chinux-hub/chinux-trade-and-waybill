import { Waybill, TraderProfile } from '@/types';
import { formatNaira, formatDate } from './formatters';

export function createWhatsAppLink(phoneNumber: string, message: string): string {
  // Clean phone number: remove spaces, dashes, leading zero, ensure 234 prefix
  let cleanPhone = phoneNumber.replace(/\D/g, '');
  if (cleanPhone.startsWith('0') && cleanPhone.length === 11) {
    cleanPhone = '234' + cleanPhone.slice(1);
  } else if (!cleanPhone.startsWith('234') && cleanPhone.length === 10) {
    cleanPhone = '234' + cleanPhone;
  }
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function generateWaybillBuyerMessage(waybill: Waybill, profile: TraderProfile, originUrl: string): string {
  const waybillUrl = `${originUrl}/waybill/${waybill.id}`;
  return `📦 *WAYBILL DISPATCH CONFIRMATION*\n` +
    `Hello *${waybill.customerName}*,\n\n` +
    `Your goods have been packaged and dispatched from *${profile.businessName}* (${profile.marketLocation}).\n\n` +
    `📋 *Waybill No:* ${waybill.waybillNumber}\n` +
    `📦 *Cartons:* ${waybill.cartonCount} cartons (${waybill.itemsDescription})\n` +
    `🚚 *Transport Park:* ${waybill.parkName}\n` +
    `👤 *Driver/Park Rep:* ${waybill.driverName} (${waybill.driverPhone})\n` +
    `📍 *Destination:* ${waybill.destinationCity}, ${waybill.destinationState}\n\n` +
    `🔒 *YOUR SECRET PICKUP PIN:* *${waybill.pickupPin}*\n` +
    `_(Only give this 4-digit PIN to the driver when you are inspecting and collecting your goods!)_\n\n` +
    `🔗 *Track Waybill Live Online:* \n${waybillUrl}\n\n` +
    `Thank you for doing business with us!`;
}

export function generateWaybillDriverMessage(waybill: Waybill, profile: TraderProfile): string {
  return `🚚 *CHINUX DISPATCH MANIFEST*\n` +
    `Driver: *${waybill.driverName}* (${waybill.vehicleNumber || 'Vehicle'})\n` +
    `Park: *${waybill.parkName}*\n\n` +
    `Sender: *${profile.businessName}* (${profile.phone})\n` +
    `Receiver: *${waybill.customerName}* (${waybill.customerPhone})\n` +
    `Destination: *${waybill.destinationCity}*\n` +
    `Cartons: *${waybill.cartonCount} cartons*\n` +
    `Waybill No: *${waybill.waybillNumber}*\n\n` +
    `⚠️ *IMPORTANT:* Do not release this cargo to anyone unless they confirm the correct 4-digit Pickup PIN!`;
}

export function generateUgwoReminderPolite(waybill: Waybill, profile: TraderProfile): string {
  return `Greetings *${waybill.customerName}*,\n\n` +
    `This is a friendly reminder from *${profile.businessName}* regarding your outstanding balance for Waybill *${waybill.waybillNumber}*.\n\n` +
    `💰 *Balance Owed:* *${formatNaira(waybill.ugwoBalance)}*\n` +
    `📅 *Due Date:* ${formatDate(waybill.dueDate)}\n\n` +
    `Kindly transfer into our shop account:\n` +
    `🏦 *Bank:* ${profile.bankName}\n` +
    `🔢 *Account No:* ${profile.accountNumber}\n` +
    `👤 *Account Name:* ${profile.accountName}\n\n` +
    `Once transferred, please reply with your payment proof so we can update your ledger balance. Thank you!`;
}

export function generateUgwoReminderPidgin(waybill: Waybill, profile: TraderProfile): string {
  return `Nna/Madam *${waybill.customerName}*, good day!\n\n` +
    `How business dey go? Quick reminder from *${profile.businessName}* on your balance of *${formatNaira(waybill.ugwoBalance)}* for Waybill *${waybill.waybillNumber}*.\n\n` +
    `Abeg make you help us sort am into our account:\n` +
    `🏦 *Bank:* ${profile.bankName}\n` +
    `🔢 *Acc No:* ${profile.accountNumber}\n` +
    `👤 *Name:* ${profile.accountName}\n\n` +
    `God bless your business as you pay!`;
}

export function generatePaymentReceiptMessage(waybill: Waybill, profile: TraderProfile, amountPaid: number): string {
  return `✅ *PAYMENT CONFIRMED & CLEARED*\n` +
    `Customer: *${waybill.customerName}*\n` +
    `Merchant: *${profile.businessName}*\n` +
    `Waybill No: *${waybill.waybillNumber}*\n\n` +
    `💵 *Amount Received:* ${formatNaira(amountPaid)}\n` +
    `📊 *Remaining Balance:* ${formatNaira(waybill.ugwoBalance)}\n` +
    `Status: ${waybill.ugwoBalance <= 0 ? '🎉 FULLY PAID (CLEARED)' : 'PARTIALLY PAID'}\n\n` +
    `Thank you for your prompt payment!`;
}

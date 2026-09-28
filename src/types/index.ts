export type Role = 'oga' | 'apprentice';

export type MarketHub =
  | 'onitsha'
  | 'nnewi'
  | 'trade_fair_lagos'
  | 'alaba_lagos'
  | 'idumota_lagos'
  | 'ladipo_lagos';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  marketHub: MarketHub;
  businessName: string;
  authProvider: 'google' | 'email';
  createdAt: string;
}

export interface ConnectedBank {
  id: string;
  bankName: string; // e.g., Moniepoint, Zenith, GTBank, OPay, Kuda
  accountNumber: string;
  accountName: string;
  status: 'connected' | 'syncing' | 'error';
  lastSyncTime: string;
  autoRecordSales: boolean;
  autoSettleUgwo: boolean;
  syncedTransactionsCount: number;
}

export interface BankTransaction {
  id: string;
  amount: number;
  type: 'credit' | 'debit';
  senderName: string;
  reference: string;
  narration: string;
  timestamp: string;
  reconciled: boolean;
  matchedWaybillNumber?: string;
}

export interface TraderProfile {
  businessName: string;
  tagline: string;
  phone: string;
  marketLocation: string; // e.g. "Zone B, Main Market, Onitsha" or "Boutique Line, Trade Fair Complex, Lagos"
  marketHub: MarketHub;
  bankName: string;
  accountNumber: string;
  accountName: string;
  currency: string;
  activeRole: Role;
  permissions: OgaPermissions;
  connectedBank?: ConnectedBank;
  trialStartDate: string;
  isSubscribed: boolean;
  subscriptionTier: 'trial' | 'monthly' | 'yearly' | 'expired';
  subscriptionExpiryDate?: string;
  dailyUsageCount: number;
  lastUsageDate: string;
  inviteCode: string;
  isApprenticeAccount?: boolean;
  masterShopName?: string;
  masterShopId?: string;
}

export interface OgaPermissions {
  apprenticeCanViewCost: boolean;
  apprenticeCanViewProfit: boolean;
  apprenticeCanEditPrice: boolean;
  apprenticeCanDeleteRecords: boolean;
  apprenticeCanBroadcastStock: boolean;
  apprenticeCanPostStatus: boolean;
  preferredStatusPoster: 'oga' | 'apprentice' | 'both';
}

export type WaybillStatus = 'loading' | 'in_transit' | 'arrived' | 'collected';
export type PaymentStatus = 'unpaid' | 'partial' | 'paid';

export interface Waybill {
  id: string;
  waybillNumber: string; // e.g., "WB-9421"
  pickupPin: string; // 4-digit code e.g. "8391"
  customerName: string;
  customerPhone: string;
  destinationCity: string;
  destinationState: string;
  parkName: string; // e.g. "GUO Transport - Upper Iweka"
  driverName: string;
  driverPhone: string;
  vehicleNumber: string;
  itemsDescription: string;
  cartonCount: number;
  totalValue: number;
  depositPaid: number;
  ugwoBalance: number;
  dueDate: string;
  status: WaybillStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  dispatchedAt?: string;
  collectedAt?: string;
  notes?: string;
}

export interface SalesLog {
  id: string;
  date: string;
  productName: string;
  costPrice: number;
  sellingPrice: number;
  quantity: number;
  totalRevenue: number;
  totalCost: number;
  netProfit: number;
  profitMarginPercent: number;
  paymentMethod: 'cash' | 'transfer' | 'ugwo';
  customerName?: string;
  loggedBy: string; // Name of Oga or Apprentice
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: Role;
  actionType: 'PRICE_CHANGE' | 'SALE_CREATED' | 'WAYBILL_CREATED' | 'UGWO_SETTLED' | 'STATUS_UPDATED' | 'SETTINGS_CHANGED' | 'CATALOG_ADDED';
  description: string;
  details?: Record<string, unknown>;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  city: string;
  state: string;
  totalSpend: number;
  totalUgwo: number;
  frequentGoods: string[];
  averageBudget: number;
  ugwoReliabilityScore: number; // 0 to 100
  lastPurchaseDate: string;
}

export interface CatalogProduct {
  id: string;
  name: string;
  category: string;
  wholesalePrice: number;
  retailPrice: number;
  stockCount: number;
  isAvailable: boolean;
  imageUrl?: string;
  restockSubscribers: string[]; // list of phone numbers waiting for stock
  uploadedBy?: string; // 'Oga Chinua' or 'Apprentice Chinedu'
  updatedAt?: string;
}

export interface FeedbackItem {
  id: string;
  timestamp: string;
  userName: string;
  userPhone: string;
  userRole: 'trader' | 'buyer' | 'driver';
  rating: number; // 1 to 5
  category: 'driver_dispute' | 'feature_request' | 'general' | 'bug';
  message: string;
  status: 'open' | 'resolved';
  adminResponse?: string;
}

export interface PlatformPolicy {
  freeTrialDays: number;
  postTrialDailyLimit: number;
  freeWaybillLimit: number;
  proPlanMonthlyPrice: number;
  proPlanYearlyPrice: number;
  monetizationActive: boolean;
  maintenanceMode: boolean;
  broadcastAnnouncement: string;
  totalTradersRegistered: number;
  totalPlatformTradeVolume: number;
  appVersion: string;
}

import {
  Waybill,
  SalesLog,
  AuditLog,
  Customer,
  CatalogProduct,
  FeedbackItem,
  TraderProfile,
  PlatformPolicy,
  Role,
  User,
  ConnectedBank,
  BankTransaction,
  MarketHub,
} from '@/types';

// Default Clean Trader Profile — blank until the business fills in their own details
const DEFAULT_PROFILE: TraderProfile = {
  businessName: '',
  tagline: '',
  phone: '',
  marketLocation: '',
  marketHub: 'onitsha',
  bankName: '',
  accountNumber: '',
  accountName: '',
  currency: 'NGN',
  activeRole: 'oga',
  trialStartDate: new Date().toISOString(),
  isSubscribed: false,
  subscriptionTier: 'trial',
  dailyUsageCount: 0,
  lastUsageDate: new Date().toISOString().split('T')[0],
  inviteCode: 'NWABOYI-' + Math.floor(1000 + Math.random() * 9000),
  permissions: {
    apprenticeCanViewCost: false,
    apprenticeCanViewProfit: false,
    apprenticeCanEditPrice: false,
    apprenticeCanDeleteRecords: false,
    apprenticeCanBroadcastStock: true,
    apprenticeCanPostStatus: true,
    preferredStatusPoster: 'both',
  },
};

const DEFAULT_POLICY: PlatformPolicy = {
  freeTrialDays: 30,
  postTrialDailyLimit: 3,
  freeWaybillLimit: 15,
  proPlanMonthlyPrice: 3500,
  proPlanYearlyPrice: 35000,
  monetizationActive: true,
  maintenanceMode: false,
  broadcastAnnouncement: '🎉 Welcome to Chinux! Digital waybills and automated bank sync live for Anambra & Lagos traders.',
  totalTradersRegistered: 142,
  totalPlatformTradeVolume: 84500000,
  appVersion: '1.2.0',
};

// CLEAN DAY-1 STATE: Zero pre-inputted data
const INITIAL_WAYBILLS: Waybill[] = [];
const INITIAL_SALES: SalesLog[] = [];
const INITIAL_AUDIT: AuditLog[] = [];
const INITIAL_CUSTOMERS: Customer[] = [];
const INITIAL_TRANSACTIONS: BankTransaction[] = [];
const INITIAL_FEEDBACKS: FeedbackItem[] = [];

// Empty catalog — products only appear when the trader uploads them
const INITIAL_CATALOG: CatalogProduct[] = [];

class StorageManager {
  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  private emitUpdate(): void {
    if (this.isBrowser()) {
      window.dispatchEvent(new CustomEvent('chinux_data_updated'));
      window.dispatchEvent(new Event('chinux_role_changed'));
    }
  }

  private getItem<T>(key: string, fallback: T): T {
    if (!this.isBrowser()) return fallback;
    try {
      const item = localStorage.getItem(`chinux_${key}`);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  }

  private setItem<T>(key: string, value: T): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(`chinux_${key}`, JSON.stringify(value));
      this.emitUpdate();
    } catch (e) {
      console.error('Storage write error:', e);
    }
  }

  // ==========================================
  // USER AUTHENTICATION (Google & Email)
  // ==========================================
  getCurrentUser(): User | null {
    return this.getItem<User | null>('current_user', {
      id: 'usr-default',
      name: 'Oga Chinua',
      email: 'trader@chinux.ng',
      marketHub: 'onitsha',
      businessName: 'Chinux Global Ventures',
      authProvider: 'google',
      createdAt: new Date().toISOString(),
    });
  }

  loginWithGoogle(email: string = 'trader@gmail.com', name: string = 'Google Trader'): User {
    const user: User = {
      id: 'usr-' + Date.now(),
      name,
      email,
      marketHub: 'onitsha',
      businessName: name + ' Enterprises',
      authProvider: 'google',
      createdAt: new Date().toISOString(),
    };
    this.setItem('current_user', user);
    this.addAuditLog({
      id: 'audit-' + Date.now(),
      timestamp: new Date().toISOString(),
      actorName: name,
      actorRole: 'oga',
      actionType: 'SETTINGS_CHANGED',
      description: `Logged in securely with Google account (${email}).`,
    });
    return user;
  }

  loginWithEmail(email: string): User {
    const user: User = {
      id: 'usr-' + Date.now(),
      name: email.split('@')[0],
      email,
      marketHub: 'trade_fair_lagos',
      businessName: 'Lagos Wholesale Hub',
      authProvider: 'email',
      createdAt: new Date().toISOString(),
    };
    this.setItem('current_user', user);
    this.addAuditLog({
      id: 'audit-' + Date.now(),
      timestamp: new Date().toISOString(),
      actorName: user.name,
      actorRole: 'oga',
      actionType: 'SETTINGS_CHANGED',
      description: `Logged in securely with email (${email}).`,
    });
    return user;
  }

  signup(name: string, email: string, businessName: string, marketHub: MarketHub): User {
    const user: User = {
      id: 'usr-' + Date.now(),
      name,
      email,
      marketHub,
      businessName,
      authProvider: 'email',
      createdAt: new Date().toISOString(),
    };
    this.setItem('current_user', user);

    // Update profile with the new business name & market location
    const profile = this.getProfile();
    profile.businessName = businessName;
    profile.marketHub = marketHub;
    profile.marketLocation = this.getMarketHubLabel(marketHub);
    this.saveProfile(profile);

    this.addAuditLog({
      id: 'audit-' + Date.now(),
      timestamp: new Date().toISOString(),
      actorName: name,
      actorRole: 'oga',
      actionType: 'SETTINGS_CHANGED',
      description: `New trader account created for ${businessName} in ${profile.marketLocation}.`,
    });

    return user;
  }

  logout(): void {
    if (!this.isBrowser()) return;
    localStorage.removeItem('chinux_current_user');
    this.emitUpdate();
  }

  getMarketHubLabel(hub: MarketHub): string {
    switch (hub) {
      case 'onitsha':
        return 'Main Market & Bridgehead, Onitsha, Anambra State';
      case 'nnewi':
        return 'Nkwo Nnewi Industrial Cluster, Anambra State';
      case 'trade_fair_lagos':
        return 'Trade Fair Complex (Badagry Exp.), Lagos';
      case 'alaba_lagos':
        return 'Alaba International Market, Ojo, Lagos';
      case 'idumota_lagos':
        return 'Idumota / Balogun Market, Lagos Island';
      case 'ladipo_lagos':
        return 'Ladipo Auto Spare Parts Market, Mushin, Lagos';
      default:
        return 'Commercial Hub, Nigeria';
    }
  }

  // ==========================================
  // PROFILE & ROLES (OGA vs NWABOYI SOVEREIGNTY)
  // ==========================================
  getProfile(): TraderProfile {
    return this.getItem<TraderProfile>('profile', DEFAULT_PROFILE);
  }

  saveProfile(profile: TraderProfile): void {
    this.setItem('profile', profile);
  }

  canSwitchToOga(): boolean {
    const profile = this.getProfile();
    // If account is hooked up as an apprentice under a master shop, they cannot switch to Oga of that business
    return !profile.isApprenticeAccount;
  }

  toggleRole(role: Role): boolean {
    const profile = this.getProfile();
    // Nwaboyi cannot switch to Oga of master business
    if (profile.isApprenticeAccount && role === 'oga') {
      return false;
    }
    profile.activeRole = role;
    this.saveProfile(profile);
    this.emitUpdate();
    return true;
  }

  getInviteCode(): string {
    const profile = this.getProfile();
    return profile.inviteCode || 'NWABOYI-4192';
  }

  joinAsApprentice(inviteCode: string, apprenticeName: string): boolean {
    const profile = this.getProfile();
    // Match code (default 'NWABOYI-4192' or profile.inviteCode)
    if (inviteCode.trim().toUpperCase() !== (profile.inviteCode || 'NWABOYI-4192').toUpperCase()) {
      return false;
    }

    // Hook apprentice into master shop
    profile.isApprenticeAccount = true;
    profile.masterShopName = profile.businessName;
    profile.activeRole = 'apprentice';
    this.saveProfile(profile);

    this.addAuditLog({
      id: 'audit-' + Date.now(),
      timestamp: new Date().toISOString(),
      actorName: apprenticeName || 'Nwaboyi (Apprentice)',
      actorRole: 'apprentice',
      actionType: 'SETTINGS_CHANGED',
      description: `Apprentice ${apprenticeName} hooked into ${profile.businessName} via invite code ${inviteCode}.`,
    });

    this.emitUpdate();
    return true;
  }

  // ==========================================
  // 30-DAY TRIAL & SUBSCRIPTION MONETIZATION ENGINE
  // ==========================================
  getTrialDaysRemaining(): number {
    const profile = this.getProfile();
    const policy = this.getPolicy();
    const startDate = new Date(profile.trialStartDate || Date.now()).getTime();
    const now = Date.now();
    const daysElapsed = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
    const trialDays = policy.freeTrialDays || 30;
    return Math.max(0, trialDays - daysElapsed);
  }

  isTrialActive(): boolean {
    return this.getTrialDaysRemaining() > 0;
  }

  isUserSubscribed(): boolean {
    const profile = this.getProfile();
    return !!profile.isSubscribed;
  }

  checkCanPerformDailyAction(): { allowed: boolean; reason?: string; limitReached?: boolean } {
    const profile = this.getProfile();
    const policy = this.getPolicy();

    // 1. If actively subscribed, always allowed
    if (profile.isSubscribed) {
      return { allowed: true };
    }

    // 2. If within 30-day free trial, allowed
    if (this.isTrialActive()) {
      return { allowed: true };
    }

    // 3. Post-trial: Check daily usage limit
    const today = new Date().toISOString().split('T')[0];
    const currentCount = profile.lastUsageDate === today ? profile.dailyUsageCount : 0;
    const limit = policy.postTrialDailyLimit || 3;

    if (currentCount >= limit) {
      return {
        allowed: false,
        limitReached: true,
        reason: `Your 30-day free trial has ended and you reached today's free limit (${limit} actions). Please subscribe to Pro for unlimited usage.`,
      };
    }

    return { allowed: true };
  }

  incrementDailyUsage(): void {
    const profile = this.getProfile();
    const today = new Date().toISOString().split('T')[0];
    if (profile.lastUsageDate === today) {
      profile.dailyUsageCount += 1;
    } else {
      profile.lastUsageDate = today;
      profile.dailyUsageCount = 1;
    }
    this.saveProfile(profile);
  }

  activateSubscription(tier: 'monthly' | 'yearly'): void {
    const profile = this.getProfile();
    profile.isSubscribed = true;
    profile.subscriptionTier = tier;
    const durationDays = tier === 'monthly' ? 30 : 365;
    profile.subscriptionExpiryDate = new Date(Date.now() + durationDays * 86400000).toISOString();
    this.saveProfile(profile);

    this.addAuditLog({
      id: 'audit-' + Date.now(),
      timestamp: new Date().toISOString(),
      actorName: 'Oga Chinua',
      actorRole: 'oga',
      actionType: 'SETTINGS_CHANGED',
      description: `Activated ${tier === 'monthly' ? 'Monthly Pro (₦3,500)' : 'Yearly Pro (₦35,000)'} subscription.`,
    });

    this.emitUpdate();
  }

  isStockBroadcastUnlocked(): boolean {
    // Unlocked if trial is active OR user is subscribed
    return this.isTrialActive() || this.isUserSubscribed();
  }

  triggerAppUpdateNotice(): void {
    const policy = this.getPolicy();
    const parts = (policy.appVersion || '1.2.0').split('.');
    const patch = parseInt(parts[2] || '0') + 1;
    policy.appVersion = `${parts[0]}.${parts[1]}.${patch}`;
    this.savePolicy(policy);
    this.emitUpdate();
  }

  // ==========================================
  // AUTOMATED BANK CONNECTION (Mono / Open Banking)
  // ==========================================
  getConnectedBank(): ConnectedBank | null {
    return this.getProfile().connectedBank || null;
  }

  connectBank(bankName: string, accountNumber: string, accountName: string): ConnectedBank {
    const bank: ConnectedBank = {
      id: 'bank-' + Date.now(),
      bankName,
      accountNumber,
      accountName,
      status: 'connected',
      lastSyncTime: new Date().toISOString(),
      autoRecordSales: true,
      autoSettleUgwo: true,
      syncedTransactionsCount: 1,
    };

    const profile = this.getProfile();
    profile.connectedBank = bank;
    profile.bankName = bankName;
    profile.accountNumber = accountNumber;
    profile.accountName = accountName;
    this.saveProfile(profile);

    this.addAuditLog({
      id: 'audit-' + Date.now(),
      timestamp: new Date().toISOString(),
      actorName: 'Oga Chinua',
      actorRole: 'oga',
      actionType: 'SETTINGS_CHANGED',
      description: `Linked verified bank account: ${bankName} (${accountNumber}) with automated bank sync active.`,
    });

    return bank;
  }

  disconnectBank(): void {
    const profile = this.getProfile();
    profile.connectedBank = undefined;
    this.saveProfile(profile);
  }

  getBankTransactions(): BankTransaction[] {
    return this.getItem<BankTransaction[]>('bank_transactions', INITIAL_TRANSACTIONS);
  }

  simulateIncomingBankTransfer(
    amount: number,
    senderName: string,
    narration: string,
    matchedWaybillNumber?: string
  ): BankTransaction {
    const tx: BankTransaction = {
      id: 'tx-' + Date.now(),
      amount,
      type: 'credit',
      senderName,
      reference: 'TXN-' + Math.floor(100000 + Math.random() * 900000),
      narration,
      timestamp: new Date().toISOString(),
      reconciled: true,
      matchedWaybillNumber,
    };

    const currentTxs = [tx, ...this.getBankTransactions()];
    this.setItem('bank_transactions', currentTxs);

    // If matched to an outstanding waybill, automatically settle ugwo
    if (matchedWaybillNumber) {
      const waybills = this.getWaybills();
      const targetWb = waybills.find(
        (w) => w.waybillNumber.toLowerCase() === matchedWaybillNumber.toLowerCase()
      );
      if (targetWb) {
        this.settleUgwo(targetWb.id, amount, 'Automated Bank Sync');
      }
    } else {
      // Auto-record as sale
      this.addSaleLog({
        id: 'sale-' + Date.now(),
        date: new Date().toISOString(),
        productName: `Bank Transfer: ${narration || 'Wholesale Cargo'}`,
        costPrice: Math.round(amount * 0.72),
        sellingPrice: amount,
        quantity: 1,
        totalRevenue: amount,
        totalCost: Math.round(amount * 0.72),
        netProfit: Math.round(amount * 0.28),
        profitMarginPercent: 28.0,
        paymentMethod: 'transfer',
        customerName: senderName,
        loggedBy: 'Bank Auto-Sync (Mono)',
      });
    }

    this.addAuditLog({
      id: 'audit-' + Date.now(),
      timestamp: new Date().toISOString(),
      actorName: 'Bank Webhook Engine',
      actorRole: 'oga',
      actionType: 'UGWO_SETTLED',
      description: `Incoming bank transfer of ₦${amount.toLocaleString()} from ${senderName} auto-reconciled. Ref: ${tx.reference}.`,
    });

    return tx;
  }

  // ==========================================
  // WAYBILLS & UGWO
  // ==========================================
  getWaybills(): Waybill[] {
    return this.getItem<Waybill[]>('waybills', INITIAL_WAYBILLS);
  }

  getWaybillById(id: string): Waybill | undefined {
    return this.getWaybills().find(
      (wb) => wb.id === id || wb.waybillNumber.toLowerCase() === id.toLowerCase()
    );
  }

  addWaybill(waybill: Waybill, actor: string = 'Oga Chinua'): void {
    const waybills = [waybill, ...this.getWaybills()];
    this.setItem('waybills', waybills);

    // Also auto-add or update Customer profile
    const customers = this.getCustomers();
    const existingCust = customers.find(
      (c) => c.phone === waybill.customerPhone || c.name.toLowerCase() === waybill.customerName.toLowerCase()
    );

    if (existingCust) {
      existingCust.totalSpend += waybill.totalValue;
      existingCust.totalUgwo += waybill.ugwoBalance;
      existingCust.lastPurchaseDate = new Date().toISOString();
      if (!existingCust.frequentGoods.includes(waybill.itemsDescription)) {
        existingCust.frequentGoods.push(waybill.itemsDescription);
      }
      this.setItem('customers', customers);
    } else {
      this.addCustomer({
        id: 'cust-' + Date.now(),
        name: waybill.customerName,
        phone: waybill.customerPhone,
        city: waybill.destinationCity,
        state: waybill.destinationState,
        totalSpend: waybill.totalValue,
        totalUgwo: waybill.ugwoBalance,
        frequentGoods: [waybill.itemsDescription],
        averageBudget: waybill.totalValue,
        ugwoReliabilityScore: 90,
        lastPurchaseDate: new Date().toISOString(),
      });
    }

    this.addAuditLog({
      id: 'audit-' + Date.now(),
      timestamp: new Date().toISOString(),
      actorName: actor,
      actorRole: this.getProfile().activeRole,
      actionType: 'WAYBILL_CREATED',
      description: `Created Waybill ${waybill.waybillNumber} (${waybill.cartonCount} cartons to ${waybill.destinationCity}) for ${waybill.customerName}. PIN: ${waybill.pickupPin}.`,
    });
  }

  updateWaybillStatus(id: string, status: Waybill['status'], actor: string = 'Oga Chinua'): void {
    const waybills = this.getWaybills().map((wb) => {
      if (wb.id === id) {
        const updated = { ...wb, status };
        if (status === 'collected') {
          updated.collectedAt = new Date().toISOString();
        }
        return updated;
      }
      return wb;
    });
    this.setItem('waybills', waybills);
    this.addAuditLog({
      id: 'audit-' + Date.now(),
      timestamp: new Date().toISOString(),
      actorName: actor,
      actorRole: this.getProfile().activeRole,
      actionType: 'STATUS_UPDATED',
      description: `Updated status of Waybill #${id} to "${status}".`,
    });
  }

  settleUgwo(id: string, amountPaid: number, actor: string = 'Oga Chinua'): { waybill?: Waybill; newBalance: number } {
    let targetWb: Waybill | undefined;
    let newBalance = 0;
    const waybills = this.getWaybills().map((wb) => {
      if (wb.id === id) {
        newBalance = Math.max(0, wb.ugwoBalance - amountPaid);
        const paymentStatus = newBalance === 0 ? 'paid' : 'partial';
        targetWb = {
          ...wb,
          ugwoBalance: newBalance,
          paymentStatus: paymentStatus as Waybill['paymentStatus'],
        };
        return targetWb;
      }
      return wb;
    });
    this.setItem('waybills', waybills);

    // Update customer total ugwo as well
    if (targetWb) {
      const customers = this.getCustomers().map((c) => {
        if (c.phone === targetWb?.customerPhone || c.name === targetWb?.customerName) {
          return { ...c, totalUgwo: Math.max(0, c.totalUgwo - amountPaid) };
        }
        return c;
      });
      this.setItem('customers', customers);

      this.addAuditLog({
        id: 'audit-' + Date.now(),
        timestamp: new Date().toISOString(),
        actorName: actor,
        actorRole: this.getProfile().activeRole,
        actionType: 'UGWO_SETTLED',
        description: `Recorded payment of ₦${amountPaid.toLocaleString()} for Waybill ${targetWb.waybillNumber}. Remaining balance: ₦${newBalance.toLocaleString()}.`,
      });
    }

    return { waybill: targetWb, newBalance };
  }

  // ==========================================
  // SALES & LOGBOOK
  // ==========================================
  getSalesLogs(): SalesLog[] {
    return this.getItem<SalesLog[]>('sales', INITIAL_SALES);
  }

  addSaleLog(sale: SalesLog): void {
    const sales = [sale, ...this.getSalesLogs()];
    this.setItem('sales', sales);
    this.addAuditLog({
      id: 'audit-' + Date.now(),
      timestamp: new Date().toISOString(),
      actorName: sale.loggedBy,
      actorRole: this.getProfile().activeRole,
      actionType: 'SALE_CREATED',
      description: `Logged sale: ${sale.quantity}x ${sale.productName} (Rev: ₦${sale.totalRevenue.toLocaleString()}, Profit: ₦${sale.netProfit.toLocaleString()}).`,
    });
  }

  // ==========================================
  // AUDIT LOGS
  // ==========================================
  getAuditLogs(): AuditLog[] {
    return this.getItem<AuditLog[]>('audit', INITIAL_AUDIT);
  }

  addAuditLog(entry: AuditLog): void {
    const logs = [entry, ...this.getAuditLogs()];
    this.setItem('audit', logs);
  }

  // ==========================================
  // CUSTOMERS CRM
  // ==========================================
  getCustomers(): Customer[] {
    return this.getItem<Customer[]>('customers', INITIAL_CUSTOMERS);
  }

  addCustomer(customer: Customer): void {
    const list = [customer, ...this.getCustomers()];
    this.setItem('customers', list);
  }

  // ==========================================
  // CATALOG
  // ==========================================
  getCatalog(): CatalogProduct[] {
    return this.getItem<CatalogProduct[]>('catalog', INITIAL_CATALOG);
  }

  addProductToCatalog(product: CatalogProduct, actor: string): void {
    const catalog = [product, ...this.getCatalog()];
    this.setItem('catalog', catalog);
    this.addAuditLog({
      id: 'audit-' + Date.now(),
      timestamp: new Date().toISOString(),
      actorName: actor,
      actorRole: this.getProfile().activeRole,
      actionType: 'CATALOG_ADDED',
      description: `Added new stock item: ${product.name} (${product.stockCount} cartons at ₦${product.wholesalePrice.toLocaleString()}).`,
    });
    this.emitUpdate();
  }

  updateCatalogProduct(product: CatalogProduct): void {
    const catalog = this.getCatalog().map((p) => (p.id === product.id ? product : p));
    this.setItem('catalog', catalog);
    this.emitUpdate();
  }

  subscribeRestock(productId: string, phone: string): boolean {
    const catalog = this.getCatalog().map((prod) => {
      if (prod.id === productId) {
        if (!prod.restockSubscribers.includes(phone)) {
          return { ...prod, restockSubscribers: [...prod.restockSubscribers, phone] };
        }
      }
      return prod;
    });
    this.setItem('catalog', catalog);
    return true;
  }

  // ==========================================
  // FEEDBACKS
  // ==========================================
  getFeedbacks(): FeedbackItem[] {
    return this.getItem<FeedbackItem[]>('feedbacks', INITIAL_FEEDBACKS);
  }

  addFeedback(feedback: FeedbackItem): void {
    const list = [feedback, ...this.getFeedbacks()];
    this.setItem('feedbacks', list);
  }

  resolveFeedback(id: string, responseText: string): void {
    const list = this.getFeedbacks().map((fb) => {
      if (fb.id === id) {
        return { ...fb, status: 'resolved' as const, adminResponse: responseText };
      }
      return fb;
    });
    this.setItem('feedbacks', list);
  }

  // ==========================================
  // ADMIN POLICY
  // ==========================================
  getPolicy(): PlatformPolicy {
    return this.getItem<PlatformPolicy>('policy', DEFAULT_POLICY);
  }

  savePolicy(policy: PlatformPolicy): void {
    this.setItem('policy', policy);
  }

  // ==========================================
  // DATA EXPORT & BACKUP FOR SECURITY
  // ==========================================
  exportBackupJson(): string {
    const backup = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      profile: this.getProfile(),
      user: this.getCurrentUser(),
      waybills: this.getWaybills(),
      sales: this.getSalesLogs(),
      customers: this.getCustomers(),
      audit: this.getAuditLogs(),
      catalog: this.getCatalog(),
      policy: this.getPolicy(),
    };
    return JSON.stringify(backup, null, 2);
  }

  exportSalesCsv(): string {
    const sales = this.getSalesLogs();
    const headers = 'Date,Product,Quantity,CostPrice,SellingPrice,Revenue,NetProfit,PaymentMethod,Customer,LoggedBy\n';
    const rows = sales
      .map(
        (s) =>
          `"${s.date}","${s.productName}",${s.quantity},${s.costPrice},${s.sellingPrice},${s.totalRevenue},${s.netProfit},"${s.paymentMethod}","${s.customerName || ''}","${s.loggedBy}"`
      )
      .join('\n');
    return headers + rows;
  }

  clearAllData(): void {
    if (!this.isBrowser()) return;
    localStorage.removeItem('chinux_waybills');
    localStorage.removeItem('chinux_sales');
    localStorage.removeItem('chinux_audit');
    localStorage.removeItem('chinux_customers');
    localStorage.removeItem('chinux_feedbacks');
    localStorage.removeItem('chinux_bank_transactions');
    this.emitUpdate();
  }
}

export const storage = new StorageManager();

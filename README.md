# 🚀 Chinux: Digital Waybills, Ugwo Credit Tracking & Trade Platform

**Chinux** is a high-speed, mobile-first Progressive Web Application (PWA) specifically engineered for importers, wholesale distributors, and commercial traders in **Onitsha Main Market**, **Bridgehead**, and **Nnewi** (Anambra State, Nigeria).

Chinux solves two of the largest day-to-day cash flow problems in Nigerian wholesale commerce:
1. **Lost Waybills & Stolen Interstate Cargo:** Replaces paper motor park slips with a trackable Digital Waybill and a secret **4-digit Pickup PIN** required for release at destination parks (Kano, Abuja, Lagos, Aba, Jos, etc.).
2. **Unpaid Ugwo (Credit Debt) & Fake Alerts:** Automates 1-click polite & Pidgin WhatsApp reminders with verified shop bank details, eliminating awkward debt recovery arguments and fake bank transfer screenshots.

---

## 🌟 Core Features

- **Quick Dispatch & Waybill Generation:** Generate a trackable waybill and secret 4-digit Pickup PIN in 30 seconds.
- **58mm / 80mm POS Thermal Receipt Printing:** 1-Click printing for standard Bluetooth POS receipt printers with a scannable tracking QR code.
- **Ugwo Debt Collection Center:** Filter debts by overdue status; send 1-click WhatsApp reminders with embedded account details.
- **Daily Sales & Profit Logbook:** Enter cost and selling price per item; Chinux automatically calculates net profit margins and daily revenues.
- **Oga vs. Nwaboyi (Apprentice) Sovereignty:** Toggle permissions so apprentices can log sales and create waybills while wholesale cost and profit margins remain private to the Oga.
- **Immutable Activity Audit Log (`/audit`):** Every price discount, waybill created, or setting change made by staff is recorded with timestamps for the Oga to review.
- **Trade Analytics & Line Graphs (`/stats`):** Interactive SVG line graphs tracking net profit trends and customer volume over time.
- **Customer Intelligence CRM (`/customers`):** Tracks buying frequency and budgets, generating smart restock recommendations.
- **Digital Catalog & Restock Alarm (`/catalog`):** Showcase new arrivals with a "Notify me when in stock" subscription alert.
- **Interstate Transit Route Tracker (`/logistics`):** Visual highway timeline tracking cargo progression from Onitsha loading bays to destination cities.
- **Separate Super-Admin Console (`/admin`):** Distinct management portal to control monetization policies, manage subscription pricing, resolve customer feedback, and broadcast announcements.
- **PWA ("Add to Home Screen"):** Installable on Android and iPhone with offline-first local storage caching.
- **High-Contrast "Market Sunlight" Theme:** Specially styled high-contrast view for outdoor sunlight readability in crowded open markets.

---

## 🛠️ $0 Free-Tier Tech Stack

- **Framework:** Next.js 14 App Router + TypeScript
- **Styling:** Tailwind CSS + Lucide Icons
- **Offline & Persistence:** Local-First Storage Architecture (compatible with Supabase PostgreSQL)
- **Messaging:** Direct Universal WhatsApp Linking (`wa.me`) + Meta Cloud API ready
- **Hardware Integration:** 58mm/80mm Thermal POS Print Engine + QR Code generator
- **Target OS:** Responsive Mobile Web / PWA for Android & iOS

---

## ⚡ Running Locally

```bash
# Navigate to the project directory
cd "C:\Users\PC\.gemini\antigravity\scratch\chinux"

# Run development server
npm run dev

# Open browser at:
http://localhost:3000
```

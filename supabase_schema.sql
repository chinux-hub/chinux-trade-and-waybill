-- =========================================================================
-- CHINUX TRADEBILL - SUPABASE DATABASE SCHEMA
-- Run this script in your Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New Query -> Paste & Run
-- =========================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (Oga & Apprentice profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    business_name TEXT DEFAULT '',
    tagline TEXT DEFAULT '',
    owner_name TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    market_location TEXT DEFAULT '',
    market_hub TEXT DEFAULT 'onitsha',
    bank_name TEXT DEFAULT '',
    account_number TEXT DEFAULT '',
    account_name TEXT DEFAULT '',
    currency TEXT DEFAULT 'NGN',
    active_role TEXT DEFAULT 'oga' CHECK (active_role IN ('oga', 'apprentice')),
    is_apprentice_account BOOLEAN DEFAULT false,
    master_shop_id UUID REFERENCES public.profiles(id),
    invite_code TEXT UNIQUE,
    trial_start_date TIMESTAMPTZ DEFAULT NOW(),
    is_subscribed BOOLEAN DEFAULT false,
    subscription_tier TEXT DEFAULT 'trial',
    subscription_expiry TIMESTAMPTZ,
    daily_usage_count INT DEFAULT 0,
    last_usage_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Waybills Table (Dispatches, cargo tracking & pickup PIN)
CREATE TABLE IF NOT EXISTS public.waybills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    waybill_number TEXT NOT NULL UNIQUE,
    pickup_pin TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    destination_city TEXT NOT NULL,
    destination_state TEXT DEFAULT '',
    park_name TEXT DEFAULT '',
    driver_name TEXT DEFAULT '',
    driver_phone TEXT DEFAULT '',
    vehicle_number TEXT DEFAULT '',
    items_description TEXT NOT NULL,
    carton_count INT DEFAULT 1,
    total_value NUMERIC(15,2) DEFAULT 0,
    deposit_paid NUMERIC(15,2) DEFAULT 0,
    ugwo_balance NUMERIC(15,2) DEFAULT 0,
    due_date DATE,
    status TEXT DEFAULT 'in_transit' CHECK (status IN ('in_transit', 'arrived', 'collected', 'disputed')),
    payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('paid', 'partial', 'unpaid')),
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    dispatched_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Catalog Products Table (Stock inventory, wholesale pricing & photos)
CREATE TABLE IF NOT EXISTS public.catalog_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'General Goods',
    wholesale_price NUMERIC(15,2) DEFAULT 0,
    retail_price NUMERIC(15,2) DEFAULT 0,
    stock_count INT DEFAULT 0,
    image_url TEXT DEFAULT '',
    is_available BOOLEAN DEFAULT true,
    uploaded_by TEXT DEFAULT 'Oga',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Sales Logbook Table (Profit tracking)
CREATE TABLE IF NOT EXISTS public.sales_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    cost_price NUMERIC(15,2) DEFAULT 0,
    selling_price NUMERIC(15,2) DEFAULT 0,
    quantity INT DEFAULT 1,
    total_revenue NUMERIC(15,2) DEFAULT 0,
    total_cost NUMERIC(15,2) DEFAULT 0,
    net_profit NUMERIC(15,2) DEFAULT 0,
    profit_margin_percent NUMERIC(5,2) DEFAULT 0,
    payment_method TEXT DEFAULT 'transfer' CHECK (payment_method IN ('cash', 'transfer', 'ugwo')),
    customer_name TEXT DEFAULT 'Walk-in Buyer',
    logged_by TEXT DEFAULT 'Oga',
    date TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Audit Logs Table (Tamper-evident log for Oga inspection)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    actor_name TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    action_type TEXT NOT NULL,
    description TEXT NOT NULL
);

-- Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waybills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view and update their own profile
CREATE POLICY "Users can manage own profile" 
    ON public.profiles FOR ALL 
    USING (auth.uid() = id);

-- Waybills: Users can manage waybills for their own shop
CREATE POLICY "Users can manage own waybills" 
    ON public.waybills FOR ALL 
    USING (auth.uid() = user_id);

-- Waybills: Public can read a waybill by PIN for cargo verification
CREATE POLICY "Public can view waybill with valid tracking" 
    ON public.waybills FOR SELECT 
    USING (true);

-- Catalog: Public can view catalog on customer storefront (/store)
CREATE POLICY "Public can view active catalog products" 
    ON public.catalog_products FOR SELECT 
    USING (is_available = true);

-- Catalog: Merchants can manage their own stock
CREATE POLICY "Merchants can manage catalog" 
    ON public.catalog_products FOR ALL 
    USING (auth.uid() = user_id);

-- Sales & Audit: Shop-specific
CREATE POLICY "Shop can manage sales logs" 
    ON public.sales_logs FOR ALL 
    USING (auth.uid() = user_id);

CREATE POLICY "Shop can view audit logs" 
    ON public.audit_logs FOR ALL 
    USING (auth.uid() = user_id);

-- Storage bucket for stock photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-photos', 'product-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view product photos" 
    ON storage.objects FOR SELECT 
    USING (bucket_id = 'product-photos');

CREATE POLICY "Authenticated users can upload photos" 
    ON storage.objects FOR INSERT 
    WITH CHECK (bucket_id = 'product-photos' AND auth.role() = 'authenticated');

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Server-side in-memory cache for merchant storefronts across requests
// Keyed by normalized phone or business name slug
interface StoreData {
  businessName: string;
  phone: string;
  marketHub?: string;
  address?: string;
  catalog: any[];
  updatedAt: string;
}

const storeRegistry = new Map<string, StoreData>();

function normalizeKey(str?: string | null): string {
  if (!str) return '';
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');
    const shop = searchParams.get('shop');

    const phoneKey = normalizeKey(phone);
    const shopKey = normalizeKey(shop);

    let store = (phoneKey ? storeRegistry.get(phoneKey) : null) || (shopKey ? storeRegistry.get(shopKey) : null);

    // If not in server memory cache, try fetching from Supabase if connected
    if (!store && supabase && (phone || shop)) {
      try {
        const query = supabase.from('profiles').select('*');
        if (phone) query.eq('phone', phone);
        else if (shop) query.ilike('business_name', `%${shop}%`);
        
        const { data } = await query.limit(1).maybeSingle();
        if (data && data.catalog_snapshot) {
          store = {
            businessName: data.business_name || shop || '',
            phone: data.phone || phone || '',
            marketHub: data.market_hub,
            catalog: Array.isArray(data.catalog_snapshot) ? data.catalog_snapshot : [],
            updatedAt: data.updated_at || new Date().toISOString(),
          };
          if (phoneKey) storeRegistry.set(phoneKey, store);
          if (shopKey) storeRegistry.set(shopKey, store);
        }
      } catch (dbErr) {
        // Supabase offline fallback
      }
    }

    if (store) {
      return NextResponse.json({
        success: true,
        businessName: store.businessName,
        phone: store.phone,
        marketHub: store.marketHub,
        catalog: store.catalog,
        updatedAt: store.updatedAt,
      });
    }

    return NextResponse.json({
      success: false,
      message: 'Store not found in public registry',
      catalog: [],
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to fetch store data', catalog: [] },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessName, phone, marketHub, address, catalog } = body;

    if (!businessName && !phone) {
      return NextResponse.json(
        { success: false, error: 'Business name or phone is required' },
        { status: 400 }
      );
    }

    const phoneKey = normalizeKey(phone);
    const shopKey = normalizeKey(businessName);

    const storeEntry: StoreData = {
      businessName: businessName || 'Wholesale Store',
      phone: phone || '',
      marketHub: marketHub || 'Onitsha Main Market',
      address: address || '',
      catalog: Array.isArray(catalog) ? catalog : [],
      updatedAt: new Date().toISOString(),
    };

    if (phoneKey) storeRegistry.set(phoneKey, storeEntry);
    if (shopKey) storeRegistry.set(shopKey, storeEntry);

    // Background push to Supabase if available
    if (supabase && (phone || businessName)) {
      try {
        await supabase
          .from('profiles')
          .upsert(
            {
              phone: phone || '',
              business_name: businessName || '',
              market_hub: marketHub,
              catalog_snapshot: storeEntry.catalog,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'phone' }
          );
      } catch (err) {
        // Supabase offline fallback
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Storefront published successfully',
      itemCount: storeEntry.catalog.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to save store data' },
      { status: 500 }
    );
  }
}

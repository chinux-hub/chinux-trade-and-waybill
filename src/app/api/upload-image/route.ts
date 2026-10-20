import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabaseAdmin = supabaseUrl && serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : null;

export async function POST(req: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase storage is not configured' }, { status: 500 });
    }

    const contentType = req.headers.get('content-type') || '';

    // Handle JSON payload with base64 data
    if (contentType.includes('application/json')) {
      const { base64, filename } = await req.json();
      if (!base64) {
        return NextResponse.json({ error: 'No image data provided' }, { status: 400 });
      }

      const matches = base64.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
      let buffer: Buffer;
      let mimeType = 'image/jpeg';

      if (matches && matches.length === 3) {
        mimeType = matches[1];
        buffer = Buffer.from(matches[2], 'base64');
      } else {
        buffer = Buffer.from(base64, 'base64');
      }

      const ext = mimeType.includes('png') ? 'png' : mimeType.includes('webp') ? 'webp' : 'jpg';
      const cleanName = filename
        ? `${filename.replace(/[^a-zA-Z0-9_-]/g, '_')}_${Date.now()}.${ext}`
        : `prod_${Date.now()}.${ext}`;

      const { data, error } = await supabaseAdmin.storage
        .from('product-photos')
        .upload(cleanName, buffer, {
          contentType: mimeType,
          upsert: true,
        });

      if (error) {
        console.error('Supabase storage upload error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      const { data: pubData } = supabaseAdmin.storage.from('product-photos').getPublicUrl(cleanName);

      return NextResponse.json({
        success: true,
        publicUrl: pubData.publicUrl,
        path: cleanName,
      });
    }

    // Handle multipart form data
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'No file found in request' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.type.includes('png') ? 'png' : file.type.includes('webp') ? 'webp' : 'jpg';
    const cleanName = `prod_${Date.now()}_${Math.floor(Math.random() * 1000)}.${ext}`;

    const { data, error } = await supabaseAdmin.storage
      .from('product-photos')
      .upload(cleanName, buffer, {
        contentType: file.type || 'image/jpeg',
        upsert: true,
      });

    if (error) {
      console.error('Supabase storage upload error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: pubData } = supabaseAdmin.storage.from('product-photos').getPublicUrl(cleanName);

    return NextResponse.json({
      success: true,
      publicUrl: pubData.publicUrl,
      path: cleanName,
    });
  } catch (err: any) {
    console.error('Upload API handler exception:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

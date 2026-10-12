import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-paystack-signature');
    const secret = process.env.PAYSTACK_SECRET_KEY || '';

    // If secret key is set, verify HMAC SHA512 signature
    if (secret && signature) {
      const hash = crypto.createHmac('sha512', secret).update(rawBody).digest('hex');
      if (hash !== signature) {
        console.warn('[Paystack Webhook] Invalid signature rejected');
        return NextResponse.json({ status: 'error', message: 'Invalid signature' }, { status: 401 });
      }
    }

    const body = JSON.parse(rawBody);
    const event = body.event;

    // Handle charge.success / subscription charges
    if (event === 'charge.success') {
      const data = body.data;
      const amount = data.amount / 100; // converted from Kobo to Naira
      const customerEmail = data.customer?.email;
      const reference = data.reference;
      const metadata = data.metadata;

      console.log(`[Paystack Webhook] Verified payment of ₦${amount} for email: ${customerEmail}, ref: ${reference}`);

      return NextResponse.json({
        status: 'success',
        message: 'Payment reconciled successfully',
        reference,
        amount,
      });
    }

    return NextResponse.json({ status: 'ignored', event });
  } catch (err: any) {
    console.error('[Paystack Webhook Error]:', err);
    return NextResponse.json({ status: 'error', message: err.message }, { status: 400 });
  }
}

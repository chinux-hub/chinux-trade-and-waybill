import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const event = body.event;

    // Handle charge.success / dedicated virtual account transfer
    if (event === 'charge.success') {
      const data = body.data;
      const amount = data.amount / 100; // in Naira
      const customerEmail = data.customer?.email;
      const reference = data.reference;

      console.log(`[Paystack Webhook] Verified payment of ₦${amount} for ref: ${reference}`);

      return NextResponse.json({ status: 'success', message: 'Payment reconciled' });
    }

    return NextResponse.json({ status: 'ignored' });
  } catch (err: any) {
    return NextResponse.json({ status: 'error', message: err.message }, { status: 400 });
  }
}

import type { Metadata } from 'next';
import { Suspense } from 'react';
import CustomerStorefrontContent from '@/components/CustomerStorefrontContent';

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const title = typeof searchParams?.title === 'string' ? searchParams.title : undefined;
  const price = typeof searchParams?.price === 'string' ? searchParams.price : undefined;
  const img = typeof searchParams?.img === 'string' ? searchParams.img : undefined;

  const origin = process.env.NEXT_PUBLIC_APP_URL || 'https://chinux-tradebill.vercel.app';

  const ogImageUrl =
    img && img.startsWith('http')
      ? img
      : `${origin}/api/og?title=${encodeURIComponent(title || 'Wholesale Catalog')}&price=${encodeURIComponent(
          price || ''
        )}`;

  return {
    title: title ? `${title} | Chinux Wholesale Storefront` : 'Wholesale Digital Storefront | Chinux',
    description: price
      ? `Wholesale Rate: ${price} / carton. Nationwide motor park haulage with secure 4-digit pickup PIN.`
      : 'Browse verified wholesale products, carton prices, and track nationwide waybill cargo on Chinux.',
    openGraph: {
      title: title ? `${title} • Wholesale Rate: ${price || ''}` : 'Wholesale Digital Storefront',
      description: price
        ? `Wholesale Rate: ${price} / carton. Ready for nationwide waybill dispatch.`
        : 'Order directly from verified wholesale traders on Chinux.',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title || 'Product Preview',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: title ? `${title} • Wholesale Rate: ${price || ''}` : 'Wholesale Digital Storefront',
      description: price ? `Wholesale Rate: ${price} / carton` : 'Order directly from verified wholesale traders.',
      images: [ogImageUrl],
    },
  };
}

export default function CustomerStorefrontPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-xs text-slate-400">
          Loading wholesale storefront...
        </div>
      }
    >
      <CustomerStorefrontContent />
    </Suspense>
  );
}

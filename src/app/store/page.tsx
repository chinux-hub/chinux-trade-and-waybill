import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const CustomerStorefrontContent = dynamic(
  () => import('@/components/CustomerStorefrontContent'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-400 text-xs">
        <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center mb-3 animate-pulse">
          <span className="font-black text-emerald-400 text-lg">CX</span>
        </div>
        <span>Loading Wholesale Storefront...</span>
      </div>
    ),
  }
);

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const product = typeof searchParams?.product === 'string' ? searchParams.product : undefined;
  const title = typeof searchParams?.title === 'string' ? searchParams.title : undefined;
  const price = typeof searchParams?.price === 'string' ? searchParams.price : undefined;
  const img = typeof searchParams?.img === 'string' ? searchParams.img : undefined;

  const origin = process.env.NEXT_PUBLIC_APP_URL || 'https://chinux-tradebill.vercel.app';

  // If this is a specific product slide
  const isProductSlide = Boolean(product || title || img);

  // For product slides, show the product's uploaded image. For the last slide (general storefront), show the Chinux logo like before!
  const ogImageUrl = isProductSlide
    ? (img && img.startsWith('http') ? img : `${origin}/api/og?title=${encodeURIComponent(title || 'Wholesale Product')}&price=${encodeURIComponent(price || '')}`)
    : `${origin}/chinux-logo.png`;

  const pageTitle = isProductSlide
    ? (title ? `${title}${price ? ` • ${price}` : ''}` : 'Wholesale Product')
    : 'Chinux TradeBill | Wholesale Digital Storefront';

  const pageDescription = isProductSlide
    ? (price ? `Wholesale Price: ${price} / carton. Nationwide waybill dispatch with secure 4-digit pickup PIN.` : 'Wholesale stock available for instant interstate waybill dispatch.')
    : 'Browse verified wholesale products, carton prices, and track nationwide waybill cargo on Chinux.';

  return {
    title: pageTitle,
    description: pageDescription,
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: isProductSlide ? (title || 'Product Photo') : 'Chinux TradeBill',
        },
      ],
    },
    twitter: {
      card: isProductSlide ? 'summary_large_image' : 'summary',
      title: pageTitle,
      description: pageDescription,
      images: [ogImageUrl],
    },
  };
}

export default function CustomerStorefrontPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-400 text-xs">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center mb-3 animate-pulse">
            <span className="font-black text-emerald-400 text-lg">CX</span>
          </div>
          <span>Loading Wholesale Storefront...</span>
        </div>
      }
    >
      <CustomerStorefrontContent />
    </Suspense>
  );
}

'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import WelcomePage from './welcome/page';

function RootHomePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const hasProduct = searchParams.get('product') || searchParams.get('id') || searchParams.get('item');
    const isStore = searchParams.get('store');

    if (hasProduct || isStore) {
      router.replace(`/store?${searchParams.toString()}`);
    }
  }, [router, searchParams]);

  return <WelcomePage />;
}

export default function RootHomePage() {
  return (
    <Suspense fallback={<WelcomePage />}>
      <RootHomePageContent />
    </Suspense>
  );
}

'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import WelcomePage from './welcome/page';
import { storage } from '@/lib/storage';

function RootHomePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const hasProduct = searchParams.get('product') || searchParams.get('id') || searchParams.get('item');
    const isStore = searchParams.get('store');

    if (hasProduct || isStore) {
      router.replace(`/store?${searchParams.toString()}`);
      return;
    }

    // If trader is already signed in on this device/app, route straight to dashboard
    const user = storage.getCurrentUser();
    if (user) {
      router.replace('/dashboard');
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

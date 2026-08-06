'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { StoreData } from '@/lib/types';
import { getStoreFromSupabase } from '@/lib/supabase';
import { StorePreview } from '@/components/store-preview';

function StoreLoader() {
  const params = useParams();
  const id = params.id as string;
  const [store, setStore] = useState<StoreData | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    getStoreFromSupabase(id).then((data) => {
      if (data) setStore(data as StoreData);
      else setNotFound(true);
    });
  }, [id]);

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
        <div className="text-center space-y-3">
          <p className="text-4xl font-black text-foreground">404</p>
          <p className="text-muted-foreground">لم يتم العثور على هذا المتجر</p>
          <a href="/" className="text-primary text-sm hover:underline">العودة للرئيسية</a>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <StorePreview store={store} />;
}

export default function StoreViewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <StoreLoader />
    </Suspense>
  );
}

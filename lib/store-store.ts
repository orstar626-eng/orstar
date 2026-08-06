'use client';

import { StoreData, defaultStoreTheme } from './types';

const STORAGE_KEY = 'orstar_stores';

export function generateStoreSlug(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = 's';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function createDefaultStore(): StoreData {
  return {
    id: generateStoreSlug(),
    storeName: '',
    storeSubtitle: '',
    storeImage: '',
    sellerLink: '',
    channelLink: '',
    products: [],
    theme: { ...defaultStoreTheme },
    heroBadgeText: '',
    heroTitle: '',
    heroSubtitle: '',
    features: [
      { icon: 'zap', title: 'تسليم فوري', desc: 'استلم منتجك فوراً بعد الدفع' },
      { icon: 'shield', title: 'ضمان المنتج', desc: 'جميع المنتجات مضمونة 100%' },
      { icon: 'headphones', title: 'دعم 24/7', desc: 'فريق دعم متاح على مدار الساعة' },
    ],
    footerText: 'جميع الحقوق محفوظة',
    createdAt: new Date().toISOString(),
    paymentMethods: [],
  };
}

export function saveStore(store: StoreData): { success: boolean; error?: string } {
  if (typeof window === 'undefined') return { success: false, error: 'Not in browser' };
  const stores = getAllStores();
  const idx = stores.findIndex(s => s.id === store.id);
  if (idx >= 0) {
    stores[idx] = store;
  } else {
    stores.push(store);
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stores));
    return { success: true };
  } catch {
    return { success: false, error: 'حدث خطأ أثناء الحفظ' };
  }
}

export function getStore(id: string): StoreData | null {
  if (typeof window === 'undefined') return null;
  return getAllStores().find(s => s.id === id) || null;
}

export function getAllStores(): StoreData[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function deleteStore(id: string): void {
  if (typeof window === 'undefined') return;
  const stores = getAllStores().filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stores));
}

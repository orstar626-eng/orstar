'use client';

import { useState } from 'react';
import { Store, Send, Zap, Shield, Headphones, Check, Sparkles, X } from 'lucide-react';
import { StoreData, StoreProduct } from '@/lib/types';

const CURRENCY_SYMBOLS: Record<string, string> = {
  IQD: 'د.ع',
  USD: '$',
  SAR: 'ر.س',
  EGP: 'ج.م',
};

function formatPrice(price: number, currency?: string) {
  const sym = CURRENCY_SYMBOLS[currency || 'IQD'] || 'د.ع';
  const locale = currency === 'USD' ? 'en-US' : currency === 'EGP' ? 'ar-EG' : currency === 'SAR' ? 'ar-SA' : 'ar-IQ';
  return price.toLocaleString(locale) + ' ' + sym;
}

const iconComponents: Record<string, React.ElementType> = {
  zap: Zap,
  shield: Shield,
  headphones: Headphones,
};

const badgeColorMap: Record<string, string> = {
  شائع: 'bg-amber-500/90 text-amber-950',
  مميز: 'bg-primary text-primary-foreground',
  جديد: 'bg-cyan-500/90 text-cyan-950',
};

export function StorePreview({ store }: { store: StoreData }) {
  const [activeCategory, setActiveCategory] = useState('الكل');

  const { theme } = store;

  const cssVars = {
    '--store-primary': theme.primaryColor,
    '--store-bg': theme.backgroundColor,
    '--store-card': theme.cardColor,
  } as React.CSSProperties;

  const categories = ['الكل', ...Array.from(new Set(store.products.map(p => p.category)))];
  const filtered = activeCategory === 'الكل' ? store.products : store.products.filter(p => p.category === activeCategory);

  const sellerLink = store.sellerLink || '#';

  return (
    <div
      className="min-h-screen flex flex-col font-sans text-right"
      dir="rtl"
      style={{
        ...cssVars,
        backgroundColor: 'var(--store-bg)',
        color: 'oklch(0.95 0 0)',
      }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-40 border-b"
        style={{ background: 'color-mix(in oklch, var(--store-bg) 70%, transparent)', backdropFilter: 'blur(20px)', borderColor: 'color-mix(in oklch, var(--store-bg) 40%, oklch(0.95 0 0) 10%)' }}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            {store.storeImage ? (
              <img src={store.storeImage} alt={store.storeName} className="h-10 w-10 rounded-xl object-cover shadow-md ring-2 ring-white/10" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl shadow-md" style={{ background: 'var(--store-primary)' }}>
                <Store className="h-5 w-5" style={{ color: 'var(--store-bg)' }} />
              </div>
            )}
            <div>
              <h1 className="text-lg font-black" style={{ color: 'oklch(0.95 0 0)' }}>
                {store.storeName || <span className="opacity-40">اسم المتجر</span>}
              </h1>
              {store.storeSubtitle && <p className="text-[11px]" style={{ color: 'oklch(0.6 0 0)' }}>{store.storeSubtitle}</p>}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex flex-col gap-8">
            {/* Hero Banner */}
            <section
              className="relative overflow-hidden rounded-3xl border"
              style={{ background: 'var(--store-card)', borderColor: 'rgba(255,255,255,0.08)' }}
            >
              <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
              <div className="relative px-6 py-14 sm:px-12 sm:py-20 text-center">
                {store.heroBadgeText && (
                  <div
                    className="mb-6 inline-flex animate-pulse items-center gap-2 rounded-full border px-5 py-2 text-sm font-semibold shadow-lg"
                    style={{ borderColor: 'color-mix(in oklch, var(--store-primary) 30%, transparent)', background: 'color-mix(in oklch, var(--store-primary) 10%, transparent)', color: 'var(--store-primary)' }}
                  >
                    <Zap className="h-4 w-4" />{store.heroBadgeText}
                  </div>
                )}
                {store.heroTitle && (
                  <h2 className="text-4xl font-black tracking-tight sm:text-5xl" style={{ color: 'oklch(0.95 0 0)' }}>
                    {store.heroTitle}
                  </h2>
                )}
                {store.heroSubtitle && (
                  <p className="mt-5 text-base leading-relaxed max-w-xl mx-auto" style={{ color: 'oklch(0.6 0 0)' }}>
                    {store.heroSubtitle}
                  </p>
                )}
                {sellerLink && sellerLink !== '#' && (
                  <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <a href={sellerLink} target="_blank" rel="noopener noreferrer"
                      className="inline-flex h-12 items-center gap-2.5 rounded-xl px-7 font-bold transition-all hover:opacity-90 hover:scale-105"
                      style={{ background: 'var(--store-primary)', color: 'var(--store-bg)' }}
                    >
                      <Send className="h-4 w-4" />تواصل مع البائع
                    </a>
                  </div>
                )}

                {/* Features row */}
                {store.features.some(f => f.title && !f.hidden) && (
                  <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {store.features.filter(f => !f.hidden).map((feat, i) => {
                      const Icon = iconComponents[feat.icon] || Zap;
                      const gradients = ['from-amber-500/20 to-amber-500/5', 'from-emerald-500/20 to-emerald-500/5', 'from-blue-500/20 to-blue-500/5'];
                      return (
                        <div key={i} className="flex items-center gap-3.5 rounded-xl border p-4 transition-all" style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.2)' }}>
                          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradients[i % 3]}`}>
                            <Icon className="h-5 w-5" style={{ color: 'var(--store-primary)' }} />
                          </div>
                          <div>
                            <p className="text-sm font-bold" style={{ color: 'oklch(0.95 0 0)' }}>{feat.title}</p>
                            <p className="text-xs" style={{ color: 'oklch(0.6 0 0)' }}>{feat.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            {/* Products section */}
            <section>
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold" style={{ color: 'oklch(0.95 0 0)' }}>المنتجات</h2>
                    <p className="mt-1 text-sm" style={{ color: 'oklch(0.6 0 0)' }}>اختر المنتج المناسب واطلبه مباشرة</p>
                  </div>
                  {categories.length > 1 && (
                    <div className="flex flex-wrap gap-2">
                      {categories.map(cat => (
                        <button
                          key={cat}
                          onClick={() => setActiveCategory(cat)}
                          className="rounded-full border px-4 py-1.5 text-xs font-semibold transition-all"
                          style={{
                            background: activeCategory === cat ? 'var(--store-primary)' : 'var(--store-card)',
                            color: activeCategory === cat ? 'var(--store-bg)' : 'oklch(0.7 0 0)',
                            borderColor: activeCategory === cat ? 'var(--store-primary)' : 'rgba(255,255,255,0.1)',
                          }}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border py-16 text-center" style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'var(--store-card)' }}>
                    {store.products.length === 0 ? (
                      <>
                        <p className="text-lg font-semibold opacity-60">لا توجد منتجات بعد</p>
                        <p className="text-sm opacity-40">أضف منتجات من قسم التعديل</p>
                      </>
                    ) : (
                      <p className="text-lg font-semibold opacity-60">لا توجد منتجات في هذا التصنيف</p>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filtered.map(product => (
                      <ProductCardPreview
                        key={product.id}
                        product={product}
                        sellerLink={sellerLink}
                      />
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>


      {/* Payment Methods */}
      {store.paymentMethods && store.paymentMethods.length > 0 && (
        <section className="border-t" style={{ background: 'var(--store-card)', borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="mx-auto max-w-7xl px-4 py-6">
            <p className="text-center text-xs mb-4 font-semibold" style={{ color: 'oklch(0.55 0 0)' }}>طرق الدفع المتاحة</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {store.paymentMethods.map(method => (
                <img
                  key={method}
                  src={`/${method}.jpg`}
                  alt={method}
                  className="h-8 w-auto max-w-[64px] rounded-lg object-contain opacity-90 hover:opacity-100 transition-opacity"
                  style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.4))' }}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t" style={{ background: 'var(--store-card)', borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-8 sm:flex-row sm:justify-between">
          <p className="text-sm" style={{ color: 'oklch(0.5 0 0)' }}>
            {store.storeName && `${store.storeName} - `}{store.footerText} {new Date().getFullYear()}
          </p>
          {sellerLink && sellerLink !== '#' && (
            <a href={sellerLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm transition hover:opacity-70" style={{ color: 'oklch(0.55 0 0)' }}>
              <Send className="h-4 w-4" />البائع
            </a>
          )}
        </div>
        <div className="text-center pb-4 text-xs opacity-50">
          <a href="http://orstar.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:opacity-100 transition-opacity" style={{ color: 'oklch(0.5 0 0)' }}>
            created by orstar.vercel.app
          </a>
        </div>
      </footer>
    </div>
  );
}

function ProductCardPreview({
  product, sellerLink
}: {
  product: StoreProduct;
  sellerLink: string;
}) {
  const [showModal, setShowModal] = useState(false);
  const buyLink = product.buyLink || sellerLink || '#';
  const hasTwoLinks = !!(product.buyLink && product.buyLink2);
  const badgeCls = product.badge ? (badgeColorMap[product.badge] || 'bg-primary/90 text-primary-foreground') : '';
  const discountedPrice = product.discount && product.discount > 0
    ? product.price * (1 - product.discount / 100)
    : null;

  function handleBuyClick(e: React.MouseEvent) {
    if (hasTwoLinks) {
      e.preventDefault();
      setShowModal(true);
    }
  }

  return (
    <>
      <div
        className="group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-500 hover:-translate-y-1"
        style={{ background: 'var(--store-card)', borderColor: 'rgba(255,255,255,0.08)' }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = 'color-mix(in oklch, var(--store-primary) 50%, transparent)')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
      >
        <div className="relative overflow-hidden bg-black/20" style={{ minHeight: '120px' }}>
          {product.image ? (
            <img src={product.image} alt={product.name} className="w-full h-auto block transition-transform duration-700 group-hover:scale-105" style={{ display: 'block' }} />
          ) : (
            <div className="flex h-full w-full items-center justify-center opacity-20">
              <div className="w-16 h-16 rounded-2xl" style={{ background: 'var(--store-primary)' }} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

          {product.badge && (
            <div className="absolute top-3 left-3 z-10">
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold shadow-lg ${badgeCls}`}>
                <Sparkles className="h-3 w-3" />{product.badge}
              </span>
            </div>
          )}

          {product.discount && product.discount > 0 ? (
            <div className="absolute top-3 right-3 z-10">
              <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold shadow-lg" style={{ background: '#ef4444', color: '#fff' }}>
                -{product.discount}%
              </span>
            </div>
          ) : null}

          <div className="absolute bottom-3 right-3 z-10">
            <div className="rounded-xl px-3 py-1.5 flex flex-col items-end" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
              {discountedPrice !== null ? (
                <>
                  <span className="text-xs line-through opacity-60" style={{ color: 'var(--store-primary)' }}>{formatPrice(product.price, product.currency)}</span>
                  <span className="text-lg font-black" style={{ color: 'var(--store-primary)' }}>{formatPrice(discountedPrice, product.currency)}</span>
                </>
              ) : (
                <span className="text-lg font-black" style={{ color: 'var(--store-primary)' }}>{formatPrice(product.price, product.currency)}</span>
              )}
            </div>
          </div>

          {product.category && (
            <div className="absolute bottom-3 left-3 z-10">
              <span className="inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold" style={{ borderColor: 'color-mix(in oklch, var(--store-primary) 20%, transparent)', background: 'color-mix(in oklch, var(--store-primary) 15%, transparent)', color: 'var(--store-primary)', backdropFilter: 'blur(8px)' }}>
                {product.category}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-3 p-5">
          <h3 className="text-base font-bold leading-snug" style={{ color: 'oklch(0.95 0 0)' }}>{product.name || 'اسم المنتج'}</h3>
          {product.description && (
            <p className="text-sm leading-relaxed line-clamp-2" style={{ color: 'oklch(0.6 0 0)' }}>{product.description}</p>
          )}
          {product.features.filter(Boolean).length > 0 && (
            <div className="flex flex-col gap-1.5">
              {product.features.filter(Boolean).map((feat, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full" style={{ background: 'color-mix(in oklch, var(--store-primary) 15%, transparent)' }}>
                    <Check className="h-2.5 w-2.5" style={{ color: 'var(--store-primary)' }} />
                  </div>
                  <span className="text-xs" style={{ color: 'oklch(0.75 0 0)' }}>{feat}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2 border-t p-4" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <a
            href={hasTwoLinks ? undefined : buyLink}
            onClick={handleBuyClick}
            target={hasTwoLinks ? undefined : '_blank'}
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all hover:opacity-90 cursor-pointer"
            style={{ background: 'var(--store-primary)', color: 'var(--store-bg)' }}
          >
            اشتري الآن
          </a>
        </div>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-2xl p-6 shadow-2xl"
            style={{ background: 'var(--store-card)', border: '1px solid rgba(255,255,255,0.12)' }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 left-3 rounded-full p-1.5 transition hover:opacity-70"
              style={{ background: 'rgba(255,255,255,0.1)' }}
            >
              <X className="h-4 w-4" style={{ color: 'oklch(0.8 0 0)' }} />
            </button>
            <h3 className="mb-1 text-center text-base font-bold" style={{ color: 'oklch(0.95 0 0)' }}>{product.name}</h3>
            <p className="mb-5 text-center text-xs" style={{ color: 'oklch(0.6 0 0)' }}>اختر طريقة الشراء</p>
            <div className="flex flex-col gap-3">
              <a
                href={product.buyLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowModal(false)}
                className="flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all hover:opacity-90"
                style={{ background: 'var(--store-primary)', color: 'var(--store-bg)' }}
              >
                {product.buyLink1Label || 'شراء (الخيار الأول)'}
              </a>
              {product.buyLink2 && (
                <a
                  href={product.buyLink2}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowModal(false)}
                  className="flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all hover:opacity-80"
                  style={{ background: 'rgba(255,255,255,0.07)', color: 'var(--store-primary)', border: '1px solid color-mix(in oklch, var(--store-primary) 40%, transparent)' }}
                >
                  {product.buyLink2Label || 'شراء (الخيار الثاني)'}
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

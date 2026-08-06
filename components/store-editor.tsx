'use client';

import { useState, useCallback } from 'react';
import { Plus, Trash2, Store, Palette, Package, Settings, Link, Zap, Shield, Headphones, ChevronUp, ChevronDown, Image as ImageIcon, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StoreData, StoreProduct, StoreTheme, storeThemePresets } from '@/lib/types';
import { ImageUpload } from './image-upload';

function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

const CURRENCIES = [
  { value: 'IQD', label: 'دينار عراقي', symbol: 'د.ع' },
  { value: 'USD', label: 'دولار أمريكي', symbol: '$' },
  { value: 'SAR', label: 'ريال سعودي', symbol: 'ر.س' },
  { value: 'EGP', label: 'جنيه مصري', symbol: 'ج.م' },
];

function createDefaultProduct(): StoreProduct {
  return {
    id: generateId(),
    name: '',
    description: '',
    price: 0,
    currency: 'IQD',
    discount: 0,
    image: '',
    features: [''],
    category: 'عام',
    badge: '',
    buyLink: '',
    buyLink1Label: '',
    buyLink2: '',
    buyLink2Label: '',
  };
}

const PRESET_LABELS: Record<string, string> = {
  gold: '🟡 ذهبي',
  blue: '🔵 أزرق',
  green: '🟢 أخضر',
  purple: '🟣 بنفسجي',
  red: '🔴 أحمر',
  pink: '🩷 وردي',
  orange: '🟠 برتقالي',
  teal: '🩵 فيروزي',
  light: '⚪ فاتح',
};

interface StoreEditorProps {
  store: StoreData;
  onChange: (store: StoreData) => void;
}

export function StoreEditor({ store, onChange }: StoreEditorProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);

  const update = useCallback((updates: Partial<StoreData>) => {
    onChange({ ...store, ...updates });
  }, [store, onChange]);

  const updateTheme = useCallback((updates: Partial<StoreTheme>) => {
    onChange({ ...store, theme: { ...store.theme, ...updates } });
  }, [store, onChange]);

  const applyPreset = (preset: string) => {
    const p = storeThemePresets[preset];
    if (p) onChange({ ...store, theme: p });
  };

  // Products
  const addProduct = () => {
    const p = createDefaultProduct();
    update({ products: [...store.products, p] });
    setExpandedProduct(p.id);
  };

  const updateProduct = (id: string, updates: Partial<StoreProduct>) => {
    update({ products: store.products.map(p => p.id === id ? { ...p, ...updates } : p) });
  };

  const removeProduct = (id: string) => {
    update({ products: store.products.filter(p => p.id !== id) });
  };

  const updateFeature = (productId: string, index: number, value: string) => {
    const product = store.products.find(p => p.id === productId);
    if (!product) return;
    const features = [...product.features];
    features[index] = value;
    updateProduct(productId, { features });
  };

  const addFeature = (productId: string) => {
    const product = store.products.find(p => p.id === productId);
    if (!product) return;
    updateProduct(productId, { features: [...product.features, ''] });
  };

  const removeFeature = (productId: string, index: number) => {
    const product = store.products.find(p => p.id === productId);
    if (!product) return;
    const features = product.features.filter((_, i) => i !== index);
    updateProduct(productId, { features });
  };

  // Store features (hero section)
  const updateStoreFeature = (index: number, updates: Partial<{ icon: string; title: string; desc: string; hidden: boolean }>) => {
    const features = store.features.map((f, i) => i === index ? { ...f, ...updates } : f);
    update({ features });
  };

  return (
    <div className="h-full overflow-y-auto" dir="rtl">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full sticky top-0 z-10 bg-background border-b border-border rounded-none h-12">
          <TabsTrigger value="basic" className="text-xs gap-1"><Store className="w-3.5 h-3.5" />الأساسية</TabsTrigger>
          <TabsTrigger value="products" className="text-xs gap-1"><Package className="w-3.5 h-3.5" />المنتجات</TabsTrigger>
          <TabsTrigger value="theme" className="text-xs gap-1"><Palette className="w-3.5 h-3.5" />الثيم</TabsTrigger>
          <TabsTrigger value="hero" className="text-xs gap-1"><Settings className="w-3.5 h-3.5" />الرئيسية</TabsTrigger>
        </TabsList>

        {/* ====== BASIC TAB ====== */}
        <TabsContent value="basic" className="p-4 space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">معلومات المتجر</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">اسم المتجر *</Label>
                <Input
                  value={store.storeName}
                  onChange={e => update({ storeName: e.target.value })}
                  placeholder=""
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">الوصف المختصر</Label>
                <Input
                  value={store.storeSubtitle}
                  onChange={e => update({ storeSubtitle: e.target.value })}
                  placeholder=""
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">صورة المتجر</Label>
                <ImageUpload
                  value={store.storeImage}
                  onChange={(url) => update({ storeImage: url })}
                  aspectRatio="avatar"
                  label="رفع صورة المتجر"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">نص الفوتر</Label>
                <Input
                  value={store.footerText}
                  onChange={e => update({ footerText: e.target.value })}
                  placeholder=""
                  className="text-sm"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Link className="w-4 h-4" />روابط التواصل</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">رابط البائع (للشراء المباشر)</Label>
                <Input
                  value={store.sellerLink}
                  onChange={e => update({ sellerLink: e.target.value })}
                  placeholder=""
                  className="text-sm"
                  dir="ltr"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ====== PRODUCTS TAB ====== */}
        <TabsContent value="products" className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">{store.products.length} منتج</span>
            <Button size="sm" onClick={addProduct} className="gap-1.5 text-xs">
              <Plus className="w-3.5 h-3.5" />إضافة منتج
            </Button>
          </div>

          {store.products.length === 0 && (
            <div className="text-center py-10 text-muted-foreground text-sm border-2 border-dashed border-border rounded-xl">
              <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
              لا توجد منتجات بعد، اضغط على إضافة منتج
            </div>
          )}

          {store.products.map((product, idx) => (
            <Card key={product.id} className="overflow-hidden">
              <div
                className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/40 transition-colors"
                onClick={() => setExpandedProduct(expandedProduct === product.id ? null : product.id)}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs text-muted-foreground font-bold w-5 shrink-0">{idx + 1}</span>
                  <span className="text-sm font-medium text-foreground truncate">{product.name || 'منتج جديد'}</span>
                  {product.category && (
                    <span className="text-[10px] bg-primary/15 text-primary px-2 py-0.5 rounded-full shrink-0">{product.category}</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="w-7 h-7 text-destructive hover:text-destructive"
                    onClick={e => { e.stopPropagation(); removeProduct(product.id); }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                  {expandedProduct === product.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </div>
              </div>

              {expandedProduct === product.id && (
                <CardContent className="border-t border-border pt-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <Label className="text-xs text-muted-foreground mb-1.5 block">اسم المنتج *</Label>
                      <Input value={product.name} onChange={e => updateProduct(product.id, { name: e.target.value })} placeholder="" className="text-sm" />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs text-muted-foreground mb-1.5 block">السعر</Label>
                      <div className="flex gap-2">
                        <Input type="number" dir="ltr" value={product.price === 0 ? '' : product.price} onChange={e => updateProduct(product.id, { price: e.target.value === '' ? 0 : Number(e.target.value) })} placeholder="0" className="text-sm flex-1 min-w-0 text-right h-11 text-base" min={0} inputMode="numeric" />
                        <select
                          value={product.currency || 'IQD'}
                          onChange={e => updateProduct(product.id, { currency: e.target.value as any })}
                          className="text-sm border border-input rounded-md px-2 bg-background text-foreground h-11 shrink-0"
                        >
                          {CURRENCIES.map(c => (
                            <option key={c.value} value={c.value}>{c.symbol} {c.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1.5 block">الخصم (%)</Label>
                      <Input type="number" dir="ltr" value={product.discount === 0 || !product.discount ? '' : product.discount} onChange={e => updateProduct(product.id, { discount: e.target.value === '' ? 0 : Math.min(100, Math.max(0, Number(e.target.value))) })} placeholder="0" className="text-sm text-right" min={0} max={100} />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1.5 block">الفئة</Label>
                      <Input value={product.category} onChange={e => updateProduct(product.id, { category: e.target.value })} placeholder="" className="text-sm" />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs text-muted-foreground mb-1.5 block">الوصف</Label>
                      <Textarea value={product.description} onChange={e => updateProduct(product.id, { description: e.target.value })} placeholder="" className="text-sm resize-none" rows={2} />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs text-muted-foreground mb-1.5 block flex items-center gap-1.5"><ImageIcon className="w-3.5 h-3.5" />صورة المنتج</Label>
                      <ImageUpload
                        value={product.image}
                        onChange={(url) => updateProduct(product.id, { image: url })}
                        aspectRatio="video"
                        label="رفع صورة المنتج"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1.5 block">شارة (اختياري)</Label>
                      <Input value={product.badge || ''} onChange={e => updateProduct(product.id, { badge: e.target.value })} placeholder="" className="text-sm" />
                    </div>
                    <div className="col-span-2 space-y-3">
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1.5 block">رابط الشراء الأول *</Label>
                        <div className="flex gap-2">
                          <Input value={product.buyLink1Label || ''} onChange={e => updateProduct(product.id, { buyLink1Label: e.target.value })} placeholder="مثال: واتساب" className="text-sm w-28 shrink-0" />
                          <Input value={product.buyLink} onChange={e => updateProduct(product.id, { buyLink: e.target.value })} placeholder="https://..." className="text-sm flex-1" dir="ltr" />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1.5 block">رابط الشراء الثاني (اختياري)</Label>
                        <div className="flex gap-2">
                          <Input value={product.buyLink2Label || ''} onChange={e => updateProduct(product.id, { buyLink2Label: e.target.value })} placeholder="مثال: تيليجرام" className="text-sm w-28 shrink-0" />
                          <Input value={product.buyLink2 || ''} onChange={e => updateProduct(product.id, { buyLink2: e.target.value })} placeholder="https://..." className="text-sm flex-1" dir="ltr" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-xs text-muted-foreground">مميزات المنتج</Label>
                      <Button size="sm" variant="ghost" className="h-6 text-xs gap-1 px-2" onClick={() => addFeature(product.id)}>
                        <Plus className="w-3 h-3" />إضافة
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {product.features.map((feat, fi) => (
                        <div key={fi} className="flex gap-2">
                          <Input
                            value={feat}
                            onChange={e => updateFeature(product.id, fi, e.target.value)}
                            placeholder={`ميزة ${fi + 1}`}
                            className="text-sm h-8"
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="w-8 h-8 shrink-0 text-destructive hover:text-destructive"
                            onClick={() => removeFeature(product.id, fi)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}

          {store.products.length > 0 && (
            <Button variant="outline" size="sm" className="w-full gap-2 border-dashed" onClick={addProduct}>
              <Plus className="w-4 h-4" />إضافة منتج آخر
            </Button>
          )}
        </TabsContent>

        {/* ====== THEME TAB ====== */}
        <TabsContent value="theme" className="p-4 space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">ثيمات جاهزة</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(PRESET_LABELS).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => applyPreset(key)}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all ${store.theme.preset === key ? 'border-primary bg-primary/15 text-primary' : 'border-border bg-secondary hover:border-primary/40 text-foreground'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">تخصيص اللون الرئيسي</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">اللون الرئيسي (Primary Color)</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={primaryOklchToHex(store.theme.primaryColor)}
                    onChange={e => updateTheme({ primaryColor: e.target.value, preset: 'custom' })}
                    className="w-10 h-10 rounded-lg border border-border cursor-pointer bg-transparent"
                  />
                  <Input
                    value={store.theme.primaryColor}
                    onChange={e => updateTheme({ primaryColor: e.target.value, preset: 'custom' })}
                    placeholder="oklch(0.82 0.18 85)"
                    className="text-xs font-mono"
                    dir="ltr"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">لون الخلفية</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={primaryOklchToHex(store.theme.backgroundColor)}
                    onChange={e => updateTheme({ backgroundColor: e.target.value, preset: 'custom' })}
                    className="w-10 h-10 rounded-lg border border-border cursor-pointer bg-transparent"
                  />
                  <Input
                    value={store.theme.backgroundColor}
                    onChange={e => updateTheme({ backgroundColor: e.target.value, preset: 'custom' })}
                    placeholder="oklch(0.1 0.005 260)"
                    className="text-xs font-mono"
                    dir="ltr"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">لون الكروت</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={primaryOklchToHex(store.theme.cardColor)}
                    onChange={e => updateTheme({ cardColor: e.target.value, preset: 'custom' })}
                    className="w-10 h-10 rounded-lg border border-border cursor-pointer bg-transparent"
                  />
                  <Input
                    value={store.theme.cardColor}
                    onChange={e => updateTheme({ cardColor: e.target.value, preset: 'custom' })}
                    placeholder="oklch(0.16 0.008 260)"
                    className="text-xs font-mono"
                    dir="ltr"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ====== HERO TAB (الرئيسية) ====== */}
        <TabsContent value="hero" className="p-4 space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">قسم الرئيسية</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">نص الشارة</Label>
                <Input value={store.heroBadgeText} onChange={e => update({ heroBadgeText: e.target.value })} placeholder="" className="text-sm" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">العنوان الرئيسي</Label>
                <Input value={store.heroTitle} onChange={e => update({ heroTitle: e.target.value })} placeholder="" className="text-sm" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">النص الفرعي</Label>
                <Textarea value={store.heroSubtitle} onChange={e => update({ heroSubtitle: e.target.value })} className="text-sm resize-none" rows={2} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">مميزات الرئيسية (3 عناصر)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {store.features.map((feat, i) => (
                <div key={i} className={`space-y-2 pb-4 border-b border-border last:border-0 last:pb-0 ${feat.hidden ? 'opacity-50' : ''}`}>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-muted-foreground">العنصر {i + 1}</Label>
                    <button
                      onClick={() => updateStoreFeature(i, { hidden: !feat.hidden })}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-muted"
                    >
                      {feat.hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      {feat.hidden ? 'مخفي' : 'ظاهر'}
                    </button>
                  </div>
                  <Input value={feat.title} onChange={e => updateStoreFeature(i, { title: e.target.value })} placeholder="عنوان الميزة" className="text-sm" />
                  <Input value={feat.desc} onChange={e => updateStoreFeature(i, { desc: e.target.value })} placeholder="وصف الميزة" className="text-sm" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">طرق الدفع المتاحة</CardTitle></CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">اختر طرق الدفع التي تقبلها في متجرك — ستظهر كأيقونات في صفحة المتجر</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'visa', label: 'Visa', img: '/visa.jpg' },
                  { key: 'mastercard', label: 'Mastercard', img: '/mastercard.jpg' },
                  { key: 'PayPal', label: 'PayPal', img: '/PayPal.jpg' },
                  { key: 'usdt', label: 'USDT', img: '/usdt.jpg' },
                  { key: 'Asiacell', label: 'Asiacell', img: '/Asiacell.jpg' },
                  { key: 'zain', label: 'Zain Cash', img: '/zain.jpg' },
                  { key: 'stc', label: 'STC Pay', img: '/stc.jpg' },
                  { key: 'vodafone', label: 'Vodafone', img: '/vodafone.jpg' },
                ].map(method => {
                  const selected = (store.paymentMethods || []).includes(method.key);
                  const borderCls = selected ? 'border-primary bg-primary/10' : 'border-border bg-muted/30 hover:border-muted-foreground/40';
                  return (
                    <button
                      key={method.key}
                      type="button"
                      onClick={() => {
                        const current = store.paymentMethods || [];
                        const updated = selected
                          ? current.filter((m: string) => m !== method.key)
                          : [...current, method.key];
                        update({ paymentMethods: updated });
                      }}
                      className={`relative flex flex-col items-center gap-1.5 rounded-xl border-2 p-2 transition-all ${borderCls}`}
                    >
                      {selected && (
                        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">✓</span>
                      )}
                      <img src={method.img} alt={method.label} className="h-8 w-auto max-w-[56px] rounded-md object-contain" />
                      <span className="text-[10px] font-medium text-muted-foreground leading-none">{method.label}</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper: tries to guess a hex from a color string for color pickers
function primaryOklchToHex(color: string): string {
  if (color.startsWith('#')) return color;
  // rough mapping of common presets
  const map: Record<string, string> = {
    'oklch(0.82 0.18 85)': '#d4a017',
    'oklch(0.65 0.2 250)': '#3b82f6',
    'oklch(0.72 0.18 155)': '#22c55e',
    'oklch(0.72 0.22 305)': '#a855f7',
    'oklch(0.65 0.22 25)': '#ef4444',
    'oklch(0.55 0.18 250)': '#2563eb',
    'oklch(0.1 0.005 260)': '#0c0e1a',
    'oklch(0.16 0.008 260)': '#171a2e',
    'oklch(0.08 0.01 250)': '#080c18',
    'oklch(0.14 0.012 250)': '#111827',
  };
  return map[color] || '#000000';
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Plus, ExternalLink, Trash2, Copy, Check, QrCode,
  Sparkles, Store, ShoppingBag, AlertTriangle, ArrowLeft,
  Zap, Palette, Link2, LogOut, User, LogIn, Mail, Calendar, X
} from 'lucide-react';
import { QRCodeModal } from '@/components/qr-code-modal';
import { AuthModal } from '@/components/auth-modal';
import { useAuth } from '@/lib/auth-context';
import { ProfileData, StoreData } from '@/lib/types';
import {
  getUserProfiles, getUserStores,
  deleteProfileFromSupabase, deleteStoreFromSupabase,
  signOut,
} from '@/lib/supabase';
import NextLink from 'next/link';
import { toast } from 'sonner';
import { generateSlug } from '@/lib/profile-store';
import { generateStoreSlug } from '@/lib/store-store';

type SupabaseProfile = {
  id: string;
  short_id: string;
  data: ProfileData;
  created_at: string;
};

type SupabaseStore = {
  id: string;
  short_id: string;
  data: StoreData;
  created_at: string;
};

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();

  const [profiles, setProfiles] = useState<SupabaseProfile[]>([]);
  const [stores, setStores] = useState<SupabaseStore[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedStoreId, setCopiedStoreId] = useState<string | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [qrProfileName, setQrProfileName] = useState('');

  const [confirmDelete, setConfirmDelete] = useState<{
    type: 'profile' | 'store'; id: string; name: string;
  } | null>(null);

  const [showAuth, setShowAuth] = useState(false);
  const [authAction, setAuthAction] = useState<(() => void) | null>(null);
  const [authTitle, setAuthTitle] = useState('');
  const [showAccountInfo, setShowAccountInfo] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) { setProfiles([]); setStores([]); return; }
    setDataLoading(true);
    const [p, s] = await Promise.all([getUserProfiles(user.id), getUserStores(user.id)]);
    setProfiles(p as SupabaseProfile[]);
    setStores(s as SupabaseStore[]);
    setDataLoading(false);
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  const requireAuth = (action: () => void, title?: string) => {
    if (user) { action(); }
    else { setAuthTitle(title || 'سجّل دخولك للمتابعة'); setAuthAction(() => action); setShowAuth(true); }
  };

  const MAX_STORES = 1;
  const MAX_PROFILES = 2;

  const handleCreateStore = () => {
    requireAuth(() => {
      if (stores.length >= MAX_STORES) { toast.error('الحد الأقصى للمتاجر هو متجر واحد فقط'); return; }
      window.location.href = `/store-create/${generateStoreSlug()}`;
    }, 'سجّل دخولك لإنشاء متجر');
  };

  const handleCreateProfile = () => {
    requireAuth(() => {
      if (profiles.length >= MAX_PROFILES) { toast.error('الحد الأقصى للصفحات هو صفحتان فقط'); return; }
      window.location.href = `/create/${generateSlug()}`;
    }, 'سجّل دخولك لإنشاء صفحة');
  };

  const handleDeleteProfile = async (id: string) => {
    if (!user) return;
    await deleteProfileFromSupabase(user.id, id);
    setConfirmDelete(null);
    toast.success('تم حذف الصفحة بنجاح');
    await loadData();
  };

  const handleDeleteStore = async (id: string) => {
    if (!user) return;
    await deleteStoreFromSupabase(user.id, id);
    setConfirmDelete(null);
    toast.success('تم حذف المتجر بنجاح');
    await loadData();
  };

  const getProfileUrl = (p: SupabaseProfile) => `${window.location.origin}/p/${p.short_id}`;
  const getStoreUrl = (s: SupabaseStore) => `${window.location.origin}/store/${s.short_id}`;

  const handleCopyLink = (p: SupabaseProfile) => {
    navigator.clipboard.writeText(getProfileUrl(p));
    setCopiedId(p.id);
    toast.success('تم نسخ الرابط');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyStoreLink = (s: SupabaseStore) => {
    navigator.clipboard.writeText(getStoreUrl(s));
    setCopiedStoreId(s.id);
    toast.success('تم نسخ رابط المتجر');
    setTimeout(() => setCopiedStoreId(null), 2000);
  };

  const handleSignOut = async () => {
    await signOut();
    setProfiles([]); setStores([]);
    toast.success('تم تسجيل الخروج');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-border border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden" dir="rtl">
      <AuthModal
        isOpen={showAuth}
        onClose={() => { setShowAuth(false); setAuthAction(null); }}
        onSuccess={() => { authAction?.(); setAuthAction(null); loadData(); }}
        title={authTitle}
      />

      {confirmDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
          <div className="relative z-10 bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-ios-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-destructive/15 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="font-bold text-sm text-foreground">تأكيد الحذف</p>
                <p className="text-xs text-muted-foreground mt-0.5">هذا الإجراء لا يمكن التراجع عنه</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
              هل أنت متأكد من حذف {confirmDelete.type === 'store' ? 'المتجر' : 'الصفحة'}{' '}
              <span className="font-bold text-foreground">"{confirmDelete.name}"</span>؟
            </p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 rounded-xl bg-secondary border border-border text-sm font-medium text-foreground hover:bg-muted transition-all">إلغاء</button>
              <button
                onClick={() => confirmDelete.type === 'store' ? handleDeleteStore(confirmDelete.id) : handleDeleteProfile(confirmDelete.id)}
                className="flex-1 py-2.5 rounded-xl bg-destructive text-white text-sm font-bold hover:opacity-90 transition-all"
              >حذف</button>
            </div>
          </div>
        </div>
      )}

      <section className="relative pt-12 pb-8 px-5 overflow-hidden min-h-screen">
        <video autoPlay loop muted playsInline className="pointer-events-none absolute inset-0 w-full h-full object-cover" style={{ minHeight: '100%', minWidth: '100%', width: '100%', height: '100%' }}>
          <source src="/background.mp4" type="video/mp4" />
        </video>
        <div className="pointer-events-none absolute inset-0 bg-background/70 dark:bg-background/80" />

        <div className="relative container mx-auto max-w-3xl">
          <div className="flex justify-end mb-4">
            {user ? (
              <div className="relative flex items-center gap-2">
                <button
                  onClick={() => setShowAccountInfo(!showAccountInfo)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card/80 border border-border backdrop-blur-sm hover:bg-card transition-all"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-xs font-bold text-foreground">@{user.username}</span>
                </button>
                <button onClick={handleSignOut} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card/80 border border-border backdrop-blur-sm text-xs text-muted-foreground hover:text-foreground transition-all">
                  <LogOut className="w-3.5 h-3.5" /><span>خروج</span>
                </button>

                {/* Account Info Popup */}
                {showAccountInfo && (
                  <div className="absolute top-12 left-0 z-50 w-72 bg-card border border-border rounded-2xl shadow-2xl p-4" dir="rtl">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-black text-foreground">معلومات الحساب</p>
                      <button onClick={() => setShowAccountInfo(false)} className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-muted">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-2.5 rounded-xl bg-secondary/50">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground">اسم المستخدم</p>
                          <p className="text-sm font-bold text-foreground">@{user.username}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-2.5 rounded-xl bg-secondary/50">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                          <Mail className="w-4 h-4 text-blue-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] text-muted-foreground">البريد الإلكتروني</p>
                          <p className="text-sm font-bold text-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                      {(user as {createdAt?: string}).createdAt && (
                        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-secondary/50">
                          <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                            <Calendar className="w-4 h-4 text-emerald-500" />
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground">تاريخ إنشاء الحساب</p>
                            <p className="text-sm font-bold text-foreground">
                              {new Date((user as {createdAt?: string}).createdAt!).toLocaleDateString('ar-IQ', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => { setAuthTitle(''); setShowAuth(true); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card/80 border border-border backdrop-blur-sm text-xs font-bold text-foreground hover:bg-card transition-all">
                <LogIn className="w-3.5 h-3.5" /><span>تسجيل الدخول</span>
              </button>
            )}
          </div>

          <div className="text-center">

            <h1 className="animate-ios-list-enter stagger-2 text-4xl sm:text-5xl lg:text-6xl font-black mb-6 leading-[1.15] tracking-tight text-balance">
              <span className="text-foreground">اصنع </span>
              <span className="bg-gradient-to-l from-primary via-blue-500 to-violet-500 bg-clip-text text-transparent dark:from-white dark:via-white/80 dark:to-white/60">هويتك</span>
              <span className="text-foreground"> الرقمية</span>
            </h1>
            <p className="animate-ios-list-enter stagger-3 text-base sm:text-lg text-muted-foreground mb-8 leading-relaxed max-w-lg mx-auto text-pretty">
              صمم صفحة ويب شخصية احترافية وأنشئ متجرك الإلكتروني بكل سهولة وسلاسة، مع تخصيص كامل للألوان والمظهر
            </p>
            <div className="animate-ios-list-enter stagger-4 flex flex-wrap justify-center gap-3 mb-8">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/80 dark:bg-white/10 text-xs font-medium text-foreground"><Palette className="w-3.5 h-3.5" /><span>تخصيص كامل</span></div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/80 dark:bg-white/10 text-xs font-medium text-foreground"><Link2 className="w-3.5 h-3.5" /><span>روابط ذكية</span></div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/80 dark:bg-white/10 text-xs font-medium text-foreground"><ShoppingBag className="w-3.5 h-3.5" /><span>متجر متكامل</span></div>
            </div>
            <div className="animate-ios-list-enter stagger-5 flex justify-center mb-10">
              <button onClick={handleCreateProfile} className="ios-press group flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-foreground text-background font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-foreground/20">
                <span>ابدأ الآن مجاناً</span>
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              </button>
            </div>
            <div className="animate-ios-list-enter stagger-6 flex items-center justify-center gap-4 sm:gap-6 lg:gap-8">
              <div className="w-[140px] sm:w-[180px] lg:w-[200px]" style={{ animation: 'float 3s ease-in-out infinite' }}>
                <img src="/photo1.png" alt="صورة 1" className="w-full h-auto rounded-2xl shadow-2xl" />
              </div>
              <div className="w-[140px] sm:w-[180px] lg:w-[200px]" style={{ animation: 'float 3s ease-in-out infinite', animationDelay: '0.5s' }}>
                <img src="/photo2.png" alt="صورة 2" className="w-full h-auto rounded-2xl shadow-2xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-6 px-5">
        <div className="container mx-auto max-w-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button onClick={handleCreateProfile} className="group ios-press relative overflow-hidden rounded-3xl border border-border/60 bg-card hover:border-primary/40 hover:shadow-lg transition-all duration-300 text-right p-6 flex flex-col gap-3">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/8 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-violet-500/20 flex items-center justify-center shadow-inner"><Sparkles className="w-6 h-6 text-primary" /></div>
                <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="relative z-10">
                <p className="font-black text-base text-foreground mb-1">إنشاء صفحة جديدة</p>
                <p className="text-xs text-muted-foreground leading-relaxed">صمّم صفحة شخصية فريدة مع روابط وصور</p>
              </div>
            </button>

            <button onClick={handleCreateStore} disabled={user ? stores.length >= MAX_STORES : false} className="group ios-press relative overflow-hidden rounded-3xl border border-border/60 bg-card hover:border-amber-500/40 hover:shadow-lg transition-all duration-300 text-right p-6 flex flex-col gap-3 disabled:opacity-50 disabled:cursor-not-allowed">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/8 to-orange-500/5 opacity-0 group-hover:opacity-100 group-hover:disabled:opacity-0 transition-opacity duration-300" />
              <div className="relative z-10 flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-400/20 flex items-center justify-center shadow-inner"><ShoppingBag className="w-6 h-6 text-amber-500" /></div>
                {user && stores.length >= MAX_STORES ? <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">مكتمل</span> : <Plus className="w-5 h-5 text-muted-foreground group-hover:text-amber-500 transition-colors" />}
              </div>
              <div className="relative z-10">
                <p className="font-black text-base text-foreground mb-1">إنشاء متجر جديد</p>
                <p className="text-xs text-muted-foreground leading-relaxed">أنشئ متجرك الإلكتروني بكل سهولة</p>
              </div>
            </button>
          </div>
        </div>
      </section>

      {user && (
        <section className="py-4 px-5">
          <div className="container mx-auto max-w-2xl">
            {dataLoading ? (
              <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-border border-t-foreground rounded-full animate-spin" /></div>
            ) : profiles.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-4 px-1">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">صفحاتي</p>
                  <span className="text-xs text-muted-foreground bg-secondary px-2.5 py-1 rounded-full font-medium">{profiles.length} {profiles.length === 1 ? 'صفحة' : 'صفحات'}</span>
                </div>
                <div className="space-y-3">
                  {profiles.map((p, index) => {
                    const profile = p.data;
                    return (
                      <div key={p.id} className="animate-ios-list-enter rounded-2xl border border-border/60 bg-card overflow-hidden hover:border-border hover:shadow-sm transition-all" style={{ animationDelay: `${index * 0.06}s` }}>
                        <div className="px-4 pb-4 pt-4">
                          <div>
                            <p className="font-bold text-sm text-foreground">{profile.name || 'بدون اسم'}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{profile.socialLinks?.length || 0} رابط{profile.bio ? ` · ${profile.bio.slice(0, 30)}${profile.bio.length > 30 ? '...' : ''}` : ''}</p>
                          </div>
                          <div className="flex items-center gap-2 mt-3">
                            <NextLink href={`/create/${p.id}`} className="flex-1">
                              <button className="ios-press w-full py-2.5 rounded-xl bg-foreground text-background text-xs font-bold hover:opacity-90 transition-all">تعديل</button>
                            </NextLink>
                            {[
                              { icon: copiedId === p.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />, action: () => handleCopyLink(p) },
                              { icon: <QrCode className="w-3.5 h-3.5" />, action: () => { setQrCodeUrl(getProfileUrl(p)); setQrProfileName(profile.name || ''); setShowQRCode(true); } },
                              { icon: <ExternalLink className="w-3.5 h-3.5" />, action: () => window.open(getProfileUrl(p), '_blank') },
                              { icon: <Trash2 className="w-3.5 h-3.5 text-destructive" />, action: () => setConfirmDelete({ type: 'profile', id: p.id, name: profile.name || 'بدون اسم' }) },
                            ].map((btn, i) => (
                              <button key={i} onClick={btn.action} className="ios-press w-9 h-9 rounded-xl bg-secondary border border-border/60 flex items-center justify-center text-muted-foreground hover:bg-muted transition-all shrink-0">{btn.icon}</button>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">لم تنشئ أي صفحة بعد</p>
              </div>
            )}
          </div>
        </section>
      )}

      {user && !dataLoading && stores.length > 0 && (
        <section className="py-4 px-5">
          <div className="container mx-auto max-w-2xl">
            <div className="flex items-center justify-between mb-4 px-1">
              <div className="flex items-center gap-2"><Store className="w-4 h-4 text-primary" /><p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">متاجري</p></div>
              <span className="text-xs text-muted-foreground bg-secondary px-2.5 py-1 rounded-full font-medium">{stores.length} {stores.length === 1 ? 'متجر' : 'متاجر'}</span>
            </div>
            <div className="space-y-3">
              {stores.map((s, index) => {
                const store = s.data;
                return (
                  <div key={s.id} className="animate-ios-list-enter rounded-2xl border border-border/60 bg-card overflow-hidden hover:border-border hover:shadow-sm transition-all" style={{ animationDelay: `${index * 0.06}s` }}>
                    <div className="h-14 w-full relative flex items-center px-4" style={{ background: store.theme?.backgroundColor }}>
                      <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${store.theme?.primaryColor}20, transparent)` }} />
                      <div className="relative z-10 flex items-center gap-3">
                        {store.storeImage ? <img src={store.storeImage} alt={store.storeName} className="w-9 h-9 rounded-xl object-cover shadow-md ring-2 ring-white/10" /> : <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md" style={{ background: store.theme?.primaryColor }}><Store className="w-4 h-4" style={{ color: store.theme?.backgroundColor }} /></div>}
                        <div>
                          <p className="font-bold text-sm text-white">{store.storeName || 'متجر بدون اسم'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 pb-4 pt-3">
                      <div className="flex items-center gap-2 mt-1">
                        <NextLink href={`/store-create/${s.id}`} className="flex-1">
                          <button className="ios-press w-full py-2.5 rounded-xl bg-foreground text-background text-xs font-bold hover:opacity-90 transition-all">تعديل</button>
                        </NextLink>
                        {[
                          { icon: copiedStoreId === s.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />, action: () => handleCopyStoreLink(s) },
                          { icon: <ExternalLink className="w-3.5 h-3.5" />, action: () => window.open(getStoreUrl(s), '_blank') },
                          { icon: <Trash2 className="w-3.5 h-3.5 text-destructive" />, action: () => setConfirmDelete({ type: 'store', id: s.id, name: store.storeName || 'متجر بدون اسم' }) },
                        ].map((btn, i) => (
                          <button key={i} onClick={btn.action} className="ios-press w-9 h-9 rounded-xl bg-secondary border border-border/60 flex items-center justify-center text-muted-foreground hover:bg-muted transition-all shrink-0">{btn.icon}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <footer className="py-8 px-5 text-center border-t border-border/40 mt-6 space-y-2">
        <p className="text-xs text-muted-foreground/60">© {new Date().getFullYear()} <span className="font-bold">Orstar</span> — جميع الحقوق محفوظة</p>
      </footer>

      <QRCodeModal isOpen={showQRCode} onClose={() => setShowQRCode(false)} url={qrCodeUrl} profileName={qrProfileName} />
    </div>
  );
}

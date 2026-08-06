'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowRight, Save, Eye, EyeOff, Sun, Moon } from 'lucide-react';
import NextLink from 'next/link';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { StoreData } from '@/lib/types';
import { createDefaultStore } from '@/lib/store-store';
import { saveStoreToSupabase, getStoreFromSupabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { AuthModal } from '@/components/auth-modal';
import { StoreEditor } from '@/components/store-editor';
import { StorePreview } from '@/components/store-preview';


// ─── Draft helpers ────────────────────────────────────────────────────────────
// Saves unsaved work in localStorage so nothing is lost when the user switches
// tabs, minimises the browser, or navigates away before hitting "حفظ".

function getDraftKey(id: string) {
  return `orstar_store_draft_${id}`;
}

function saveDraft(id: string, store: StoreData) {
  try {
    localStorage.setItem(getDraftKey(id), JSON.stringify({ store, savedAt: Date.now() }));
  } catch {}
}

function loadDraft(id: string): StoreData | null {
  try {
    const raw = localStorage.getItem(getDraftKey(id));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Discard drafts older than 7 days
    if (Date.now() - parsed.savedAt > 7 * 24 * 60 * 60 * 1000) {
      localStorage.removeItem(getDraftKey(id));
      return null;
    }
    return parsed.store as StoreData;
  } catch {
    return null;
  }
}

function clearDraft(id: string) {
  try {
    localStorage.removeItem(getDraftKey(id));
  } catch {}
}
// ─────────────────────────────────────────────────────────────────────────────

export default function StoreCreatePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { user, loading: authLoading } = useAuth();

  const [store, setStore] = useState<StoreData | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  const [shortId, setShortId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [lightMode, setLightMode] = useState(false);

  // Keep a ref so event listeners can always read the latest store
  const storeRef = useRef<StoreData | null>(null);
  storeRef.current = store;

  // ── Init: load from Supabase, fall back to draft ──────────────────────────
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setShowAuth(true);
      setIsLoading(false);
      return;
    }
    const init = async () => {
      const existing = await getStoreFromSupabase(id);
      const draft = loadDraft(id);

      if (existing) {
        setShortId((existing as { short_id?: string }).short_id || null);
        if (draft) {
          // Draft is newer — restore it and flag so the user sees the indicator
          setStore(draft);
          setHasDraft(true);
        } else {
          setStore(existing as StoreData);
        }
      } else if (draft) {
        // No remote copy yet — restore draft silently
        setStore(draft);
        setHasDraft(true);
      } else {
        const newStore = createDefaultStore();
        newStore.id = id;
        setStore(newStore);
      }
      setIsLoading(false);
    };
    init();
  }, [id, user, authLoading]);

  // ── Autosave to localStorage every 3 s ───────────────────────────────────
  useEffect(() => {
    if (!store) return;
    const timer = setInterval(() => {
      if (storeRef.current) saveDraft(id, storeRef.current);
    }, 3000);
    return () => clearInterval(timer);
  }, [id, store]);

  // ── Save draft when tab is hidden or page is about to unload ─────────────
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === 'hidden' && storeRef.current) {
        saveDraft(id, storeRef.current);
      }
    };
    const onUnload = () => {
      if (storeRef.current) saveDraft(id, storeRef.current);
    };
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('beforeunload', onUnload);
    return () => {
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('beforeunload', onUnload);
    };
  }, [id]);

  // ── onChange: update state + immediately persist draft ───────────────────
  const handleStoreChange = useCallback((updated: StoreData) => {
    setStore(updated);
    saveDraft(id, updated);
    setHasDraft(true);
  }, [id]);

  // ── Save to Supabase ──────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!store || !user) return;
    setSaving(true);
    try {
      const result = await saveStoreToSupabase(user.id, store.id, store);
      if (result.error) {
        toast.error('حدث خطأ أثناء حفظ المتجر');
      } else {
        setShortId(result.shortId);
        clearDraft(id);
        setHasDraft(false);
        toast.success('تم حفظ المتجر بنجاح ✓');
        setTimeout(() => router.push('/'), 600);
      }
    } catch {
      toast.error('حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  }, [store, user, router, id]);



  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-border border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
        <AuthModal
          isOpen={showAuth}
          onClose={() => router.push('/')}
          onSuccess={() => { setShowAuth(false); window.location.reload(); }}
          title="سجّل دخولك لإنشاء متجر"
        />
      </div>
    );
  }

  if (!store) return null;

  return (
    <div className={cn('min-h-screen', lightMode ? 'bg-white text-gray-900' : 'bg-background')} dir="rtl">
      {/* Top Bar */}
      <div className={cn('sticky top-0 z-50 border-b backdrop-blur-xl', lightMode ? 'border-gray-200 bg-white/90' : 'border-border/60 bg-background/80')}>
        <div className="flex items-center justify-between px-4 h-14 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <NextLink href="/" className="ios-press w-9 h-9 rounded-xl bg-secondary border border-border/60 flex items-center justify-center text-muted-foreground hover:bg-muted transition-all">
              <ArrowRight className="w-4 h-4" />
            </NextLink>

          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLightMode(!lightMode)}
              title={lightMode ? 'التبديل إلى الوضع الداكن' : 'التبديل إلى الوضع الفاتح'}
              className={cn(
                'ios-press w-9 h-9 rounded-xl border flex items-center justify-center transition-all',
                lightMode
                  ? 'bg-yellow-100 border-yellow-300 text-yellow-600 hover:bg-yellow-200'
                  : 'bg-secondary border-border/60 text-muted-foreground hover:bg-muted'
              )}
            >
              {lightMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
            <button onClick={() => setShowPreview(!showPreview)} className="ios-press w-9 h-9 rounded-xl bg-secondary border border-border/60 flex items-center justify-center text-muted-foreground hover:bg-muted transition-all">
              {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="ios-press flex items-center gap-2 px-4 py-2 rounded-xl bg-foreground text-background text-sm font-bold hover:opacity-90 disabled:opacity-60 transition-all"
            >
              {saving ? <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? 'جاري الحفظ...' : 'حفظ'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-56px)]">
        <div className={cn('flex-1 overflow-y-auto', showPreview ? 'hidden lg:block' : '', lightMode && 'bg-white')}>
          <div className={cn('max-w-2xl mx-auto px-4 py-6', lightMode && '[&_*]:!border-gray-200 [&_.bg-background]:!bg-white [&_.bg-secondary]:!bg-gray-100 [&_.bg-muted]:!bg-gray-50 [&_.text-foreground]:!text-gray-900 [&_.text-muted-foreground]:!text-gray-500 [&_input]:!bg-white [&_input]:!text-gray-900 [&_textarea]:!bg-white [&_textarea]:!text-gray-900 [&_select]:!bg-white [&_select]:!text-gray-900')}>
            <StoreEditor store={store} onChange={handleStoreChange} />
          </div>
        </div>
        {showPreview && (
          <div className="flex-1 border-r border-border/60 overflow-hidden bg-muted/30">
            <div className="h-full overflow-y-auto">
              <StorePreview store={store} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

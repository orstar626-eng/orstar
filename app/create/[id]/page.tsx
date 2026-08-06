'use client';

import { useState, useEffect, use, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Eye, EyeOff, Save } from 'lucide-react';
import { ProfileEditor } from '@/components/profile-editor';
import { ProfilePreview } from '@/components/profile-preview';
import { ProfileData } from '@/lib/types';
import { createDefaultProfile } from '@/lib/profile-store';
import { saveProfileToSupabase, getProfileFromSupabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { AuthModal } from '@/components/auth-modal';
import Link from 'next/link';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ─── Draft helpers ────────────────────────────────────────────────────────────
// Saves unsaved work in localStorage so nothing is lost when the user switches
// tabs, minimises the browser, or navigates away before hitting "حفظ".

function getDraftKey(id: string) {
  return `orstar_profile_draft_${id}`;
}

function saveDraft(id: string, profile: ProfileData) {
  try {
    localStorage.setItem(getDraftKey(id), JSON.stringify({ profile, savedAt: Date.now() }));
  } catch {}
}

function loadDraft(id: string): ProfileData | null {
  try {
    const raw = localStorage.getItem(getDraftKey(id));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Discard drafts older than 7 days
    if (Date.now() - parsed.savedAt > 7 * 24 * 60 * 60 * 1000) {
      localStorage.removeItem(getDraftKey(id));
      return null;
    }
    return parsed.profile as ProfileData;
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

export default function CreatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveAnim, setSaveAnim] = useState(false);
  const [shortId, setShortId] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const router = useRouter();

  // Keep a ref so event listeners can always read the latest profile
  const profileRef = useRef<ProfileData | null>(null);
  profileRef.current = profile;

  // ── Init: load from Supabase, fall back to draft ──────────────────────────
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setShowAuth(true);
      setIsLoading(false);
      return;
    }
    const init = async () => {
      const existing = await getProfileFromSupabase(id);
      const draft = loadDraft(id);

      if (existing) {
        setShortId((existing as { short_id?: string }).short_id || null);
        if (draft) {
          // Draft is newer — restore it and flag so user sees the indicator
          setProfile(draft);
          setHasDraft(true);
        } else {
          setProfile(existing as ProfileData);
        }
      } else if (draft) {
        // No remote copy yet — restore draft silently
        setProfile(draft);
        setHasDraft(true);
      } else {
        const p = createDefaultProfile();
        p.id = id;
        setProfile(p);
      }
      setIsLoading(false);
    };
    init();
  }, [id, user, authLoading]);

  // ── Autosave to localStorage every 3 s ───────────────────────────────────
  useEffect(() => {
    if (!profile) return;
    const timer = setInterval(() => {
      if (profileRef.current) saveDraft(id, profileRef.current);
    }, 3000);
    return () => clearInterval(timer);
  }, [id, profile]);

  // ── Save draft when tab is hidden or page is about to unload ─────────────
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === 'hidden' && profileRef.current) {
        saveDraft(id, profileRef.current);
      }
    };
    const onUnload = () => {
      if (profileRef.current) saveDraft(id, profileRef.current);
    };
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('beforeunload', onUnload);
    return () => {
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('beforeunload', onUnload);
    };
  }, [id]);

  // ── onChange: update state + immediately persist draft ───────────────────
  const handleProfileChange = useCallback((updated: ProfileData) => {
    setProfile(updated);
    saveDraft(id, updated);
    setHasDraft(true);
  }, [id]);

  // ── Save to Supabase ──────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!profile || !user) return;
    setIsSaving(true);
    try {
      const result = await saveProfileToSupabase(user.id, profile.id, profile);
      if (result.error) {
        toast.error('حدث خطأ أثناء الحفظ');
      } else {
        setSaveAnim(true);
        setShortId(result.shortId);
        clearDraft(id);
        setHasDraft(false);
        toast.success('تم حفظ التغييرات بنجاح ✓');
        setTimeout(() => setSaveAnim(false), 1500);
        setTimeout(() => router.push('/'), 600);
      }
    } catch {
      toast.error('حدث خطأ أثناء الحفظ');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenPage = () => {
    if (!shortId) return;
    window.open(`${window.location.origin}/p/${shortId}`, '_blank');
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 animate-ios-fade-in">
          <div className="w-12 h-12 rounded-2xl bg-foreground/5 border border-border flex items-center justify-center">
            <div className="w-5 h-5 rounded-full border-2 border-border border-t-foreground animate-spin" />
          </div>
          <span className="text-muted-foreground text-sm font-medium">جاري التحميل...</span>
        </div>
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
          title="سجّل دخولك لإنشاء صفحة"
        />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 h-14 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Link href="/" className="ios-press w-9 h-9 rounded-xl bg-secondary border border-border/60 flex items-center justify-center text-muted-foreground hover:bg-muted transition-all">
              <ArrowRight className="w-4 h-4" />
            </Link>

          </div>
          <div className="flex items-center gap-2">
            {/* Draft indicator — visible when there are unsaved local changes */}
            {hasDraft && (
              <span className="text-[10px] text-amber-500 font-medium px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 select-none">
                مسودة محفوظة
              </span>
            )}

            <button onClick={() => setShowPreview(!showPreview)} className="ios-press w-9 h-9 rounded-xl bg-secondary border border-border/60 flex items-center justify-center text-muted-foreground hover:bg-muted transition-all">
              {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={cn(
                'ios-press flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all',
                saveAnim
                  ? 'bg-emerald-500 text-white'
                  : 'bg-foreground text-background hover:opacity-90',
                isSaving && 'opacity-60'
              )}
            >
              {isSaving ? (
                <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{isSaving ? 'جاري الحفظ...' : 'حفظ'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex h-[calc(100vh-56px)]">
        <div className={cn('flex-1 overflow-y-auto', showPreview && 'hidden lg:block')}>
          <div className="max-w-2xl mx-auto px-4 py-6">
            <ProfileEditor profile={profile} onChange={handleProfileChange} />
          </div>
        </div>
        {showPreview && (
          <div className="flex-1 border-r border-border/60 overflow-hidden bg-muted/30">
            <div className="h-full overflow-y-auto">
              <ProfilePreview profile={profile} isPreview={true} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

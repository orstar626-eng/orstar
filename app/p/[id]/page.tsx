'use client';

import { ProfilePreview } from '@/components/profile-preview';
import { getProfileFromSupabase } from '@/lib/supabase';
import { ProfileData } from '@/lib/types';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // id here is the short_id stored in Supabase
    getProfileFromSupabase(id).then((data) => {
      if (data) setProfile(data as ProfileData);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-indigo-950">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-indigo-950 text-white px-4">
        <div className="text-6xl sm:text-7xl font-bold mb-6 opacity-20">404</div>
        <h1 className="text-xl sm:text-2xl font-bold mb-2 text-center">الصفحة غير موجودة</h1>
        <p className="text-white/60 mb-8 text-center text-sm sm:text-base max-w-xs">
          الصفحة التي تبحث عنها غير موجودة أو تم حذفها
        </p>
        <Link href="/" className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-sm">
          إنشاء صفحة جديدة
        </Link>
      </div>
    );
  }

  return <ProfilePreview profile={profile} isPreview={false} />;
}

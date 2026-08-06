'use client';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type AuthUser = {
  id: string;
  email: string;
  username: string;
  createdAt?: string;
};

// Generate a short unique ID (6 chars)
export function generateShortId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// =============================================
// AUTH FUNCTIONS
// =============================================

export async function signUp(email: string, password: string, username: string) {
  // Check if username is taken
  const { data: existing } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('username', username)
    .maybeSingle();

  if (existing) {
    return { data: null, error: { message: 'اسم المستخدم مستخدم بالفعل' } };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username },
    },
  });

  if (error) return { data: null, error };

  if (data.user) {
    const { error: profileError } = await supabase.from('user_profiles').insert({
      id: data.user.id,
      username,
      email,
    });

    if (profileError) {
      console.error('Profile insert error:', profileError);
    }
  }

  return { data, error: null };
}

export async function signInWithUsername(usernameOrEmail: string, password: string) {
  // Check if input is email or username
  const isEmail = usernameOrEmail.includes('@');

  if (isEmail) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: usernameOrEmail,
      password,
    });
    return { data, error };
  } else {
    // Lookup email by username
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('email')
      .eq('username', usernameOrEmail)
      .maybeSingle();

    if (!profile?.email) {
      return { data: null, error: { message: 'اسم المستخدم أو كلمة المرور غير صحيحة' } };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password,
    });
    return { data, error };
  }
}

export async function signIn(email: string, password: string) {
  return signInWithUsername(email, password);
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('username, email, created_at')
    .eq('id', user.id)
    .maybeSingle();

  return {
    id: user.id,
    email: user.email!,
    username: profile?.username || user.email!.split('@')[0],
    createdAt: profile?.created_at || user.created_at,
  };
}

// =============================================
// PROFILE FUNCTIONS (Supabase)
// =============================================

export async function saveProfileToSupabase(userId: string, profileId: string, profileData: object) {
  // Check if profile exists by id
  const { data: existing } = await supabase
    .from('profiles')
    .select('id, short_id')
    .eq('id', profileId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('profiles')
      .update({ data: profileData, updated_at: new Date().toISOString() })
      .eq('id', profileId);
    return { error, shortId: existing.short_id };
  } else {
    let shortId = generateShortId();
    let attempt = 0;
    while (attempt < 5) {
      const { data: conflict } = await supabase
        .from('profiles')
        .select('id')
        .eq('short_id', shortId)
        .maybeSingle();
      if (!conflict) break;
      shortId = generateShortId();
      attempt++;
    }

    const { error } = await supabase.from('profiles').insert({
      id: profileId,
      user_id: userId,
      data: profileData,
      short_id: shortId,
    });
    return { error, shortId };
  }
}

export async function getProfileFromSupabase(idOrShortId: string) {
  // Try by short_id first
  const { data: byShortId } = await supabase
    .from('profiles')
    .select('data, short_id, id')
    .eq('short_id', idOrShortId)
    .maybeSingle();

  if (byShortId) {
    return { ...(byShortId.data as object), id: byShortId.id, short_id: byShortId.short_id };
  }

  // Try by id
  const { data: byId } = await supabase
    .from('profiles')
    .select('data, short_id, id')
    .eq('id', idOrShortId)
    .maybeSingle();

  if (byId) {
    return { ...(byId.data as object), id: byId.id, short_id: byId.short_id };
  }

  return null;
}

export async function getUserProfiles(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, short_id, data, created_at, updated_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data || [];
}

export async function deleteProfileFromSupabase(userId: string, profileId: string) {
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', profileId)
    .eq('user_id', userId);
  return { error };
}

// =============================================
// STORE FUNCTIONS (Supabase)
// =============================================

export async function saveStoreToSupabase(userId: string, storeId: string, storeData: object) {
  const { data: existing } = await supabase
    .from('stores')
    .select('id, short_id')
    .eq('id', storeId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('stores')
      .update({ data: storeData, updated_at: new Date().toISOString() })
      .eq('id', storeId);
    return { error, shortId: existing.short_id };
  } else {
    let shortId = 's' + generateShortId();
    let attempt = 0;
    while (attempt < 5) {
      const { data: conflict } = await supabase
        .from('stores')
        .select('id')
        .eq('short_id', shortId)
        .maybeSingle();
      if (!conflict) break;
      shortId = 's' + generateShortId();
      attempt++;
    }

    const { error } = await supabase.from('stores').insert({
      id: storeId,
      user_id: userId,
      data: storeData,
      short_id: shortId,
    });
    return { error, shortId };
  }
}

export async function getStoreFromSupabase(idOrShortId: string) {
  // Try by short_id first
  const { data: byShortId } = await supabase
    .from('stores')
    .select('data, short_id, id')
    .eq('short_id', idOrShortId)
    .maybeSingle();

  if (byShortId) {
    return { ...(byShortId.data as object), id: byShortId.id, short_id: byShortId.short_id };
  }

  // Try by id
  const { data: byId } = await supabase
    .from('stores')
    .select('data, short_id, id')
    .eq('id', idOrShortId)
    .maybeSingle();

  if (byId) {
    return { ...(byId.data as object), id: byId.id, short_id: byId.short_id };
  }

  return null;
}

export async function getUserStores(userId: string) {
  const { data, error } = await supabase
    .from('stores')
    .select('id, short_id, data, created_at, updated_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data || [];
}

export async function deleteStoreFromSupabase(userId: string, storeId: string) {
  const { error } = await supabase
    .from('stores')
    .delete()
    .eq('id', storeId)
    .eq('user_id', userId);
  return { error };
}

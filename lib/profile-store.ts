'use client';

import { ProfileData, defaultTheme } from './types';

const STORAGE_KEY = 'profilelink_profiles';

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function generateSlug(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  // Shorter ID - 5 characters instead of 8
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function createDefaultProfile(): ProfileData {
  return {
    id: generateSlug(),
    name: '',
    nameColor: '#ffffff',
    nameFont: 'font-cairo',
    nameSize: 'medium',
    nameAlignment: 'center',
    nameBackground: false,
    bio: '',
    bioFont: 'font-cairo',
    bioAlignment: 'center',
    bioBackground: false,
    avatar: undefined,
    avatarStyle: 'circle',
    avatarSize: 'medium',
    avatarAlignment: 'center',
    avatarGlow: false,
    textBlocks: [],
    socialLinks: [],
    theme: { ...defaultTheme },
    media: [],
    musicAutoplay: false,
    musicLoop: false,
    createdAt: new Date().toISOString(),
  };
}

export function saveProfile(profile: ProfileData): { success: boolean; error?: string } {
  if (typeof window === 'undefined') return { success: false, error: 'Not in browser' };
  
  const profiles = getAllProfiles();
  const existingIndex = profiles.findIndex(p => p.id === profile.id);
  
  if (existingIndex >= 0) {
    profiles[existingIndex] = profile;
  } else {
    profiles.push(profile);
  }
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
    return { success: true };
  } catch (error) {
    // Handle QuotaExceededError
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      return { 
        success: false, 
        error: 'مساحة التخزين ممتلئة. يرجى حذف بعض الصور أو استخدام روابط بدلاً من رفع الملفات.'
      };
    }
    return { success: false, error: 'حدث خطأ أثناء الحفظ' };
  }
}

export function getProfile(id: string): ProfileData | null {
  if (typeof window === 'undefined') return null;
  
  const profiles = getAllProfiles();
  return profiles.find(p => p.id === id) || null;
}

export function getAllProfiles(): ProfileData[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function deleteProfile(id: string): void {
  if (typeof window === 'undefined') return;
  
  const profiles = getAllProfiles().filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
}

import { ProfileData } from './types';
import { deflate, inflate } from 'pako';

// Optimize profile data for smaller URL
function optimizeProfileData(profile: ProfileData): Record<string, unknown> {
  const optimized: Record<string, unknown> = {
    i: profile.id,
    n: profile.name,
    nc: profile.nameColor,
    nf: profile.nameFont,
  };

  // Only include non-default values
  if (profile.nameSize && profile.nameSize !== 'medium') optimized.ns = profile.nameSize;
  if (profile.nameGlow) optimized.ng = 1;
  if (profile.nameGlowColor) optimized.ngc = profile.nameGlowColor;
  if (profile.nameAlignment && profile.nameAlignment !== 'center') optimized.na = profile.nameAlignment;
  if (profile.nameBackground) optimized.nb = 1;
  if (profile.bio) optimized.b = profile.bio;
  if (profile.bioFont && profile.bioFont !== 'font-cairo') optimized.bf = profile.bioFont;
  if (profile.bioGlow) optimized.bg = 1;
  if (profile.bioGlowColor) optimized.bgc = profile.bioGlowColor;
  if (profile.bioAlignment && profile.bioAlignment !== 'center') optimized.ba = profile.bioAlignment;
  if (profile.bioBackground) optimized.bb = 1;
  if (profile.avatar) optimized.a = profile.avatar;
  if (profile.avatarStyle && profile.avatarStyle !== 'circle') optimized.as = profile.avatarStyle;
  if (profile.avatarSize && profile.avatarSize !== 'medium') optimized.az = profile.avatarSize;
  if (profile.avatarAlignment && profile.avatarAlignment !== 'center') optimized.aa = profile.avatarAlignment;
  if (profile.avatarGlow) optimized.ag = 1;
  if (profile.avatarGlowColor) optimized.agc = profile.avatarGlowColor;
  if (profile.avatarFloat) optimized.af = 1;
  if (profile.hideAvatar) optimized.ha = 1;
  if (profile.hideName) optimized.hn = 1;

  // Text blocks
  if (profile.textBlocks && profile.textBlocks.length > 0) {
    optimized.tb = profile.textBlocks.map(b => ({
      c: b.content,
      a: b.alignment !== 'center' ? b.alignment : undefined,
      f: b.fontSize !== 'medium' ? b.fontSize : undefined,
      ff: b.fontFamily !== 'font-cairo' ? b.fontFamily : undefined,
    }));
  }

  // Optimize social links
  if (profile.socialLinks.length > 0) {
    optimized.sl = profile.socialLinks.map(link => {
      const l: Record<string, unknown> = { p: link.platform, u: link.url };
      if (link.customLabel) l.cl = link.customLabel;
      if (link.displayMode && link.displayMode !== 'button') l.dm = link.displayMode;
      if (link.iconSize && link.iconSize !== 'md') l.is = link.iconSize;
      if (link.iconNoBg) l.nb = 1;
      return l;
    });
  }

  // Optimize theme - only include non-default values
  const theme = profile.theme;
  const t: Record<string, unknown> = {};
  
  t.bt = theme.backgroundType;
  if (theme.backgroundType === 'color') {
    t.bc = theme.backgroundColor;
  } else if (theme.backgroundType === 'gradient') {
    t.gf = theme.gradientFrom;
    t.gt = theme.gradientTo;
  } else if (theme.backgroundType === 'image' && theme.backgroundImage) {
    t.bi = theme.backgroundImage;
  } else if (theme.backgroundType === 'video' && theme.backgroundVideo) {
    t.bv = theme.backgroundVideo;
  } else if (theme.backgroundType === 'animated' && theme.animatedBackground) {
    t.ab = theme.animatedBackground;
    t.bc = theme.backgroundColor;
  }
  
  t.tc = theme.textColor;
  t.ac = theme.accentColor;
  t.ctc = theme.cardTextColor;
  
  if (theme.buttonStyle !== 'pill') t.bs = theme.buttonStyle;
  if (theme.animation !== 'float') t.an = theme.animation;
  if (theme.borderStyle && theme.borderStyle !== 'none') t.brs = theme.borderStyle;
  if (theme.shadowStyle && theme.shadowStyle !== 'soft') t.ss = theme.shadowStyle;
  if (theme.cardOpacity !== undefined && theme.cardOpacity !== 10) t.co = theme.cardOpacity;
  
  optimized.t = t;

  // Optimize media
  if (profile.media.length > 0) {
    optimized.m = profile.media.map(media => {
      const m: Record<string, unknown> = {
        t: media.type,
        u: media.url,
      };
      if (media.caption) m.c = media.caption;
      if (media.width && media.width !== 'half') m.w = media.width;
      if (media.aspectRatio && media.aspectRatio !== 'auto') m.ar = media.aspectRatio;
      return m;
    });
  }

  return optimized;
}

// Restore optimized data to full profile
function restoreProfileData(optimized: Record<string, unknown>): ProfileData {
  const profile: ProfileData = {
    id: String(optimized.i || ''),
    name: String(optimized.n || ''),
    nameColor: String(optimized.nc || '#ffffff'),
    nameFont: String(optimized.nf || 'font-cairo'),
    nameSize: (optimized.ns as ProfileData['nameSize']) || 'medium',
    nameGlow: optimized.ng === 1,
    nameGlowColor: optimized.ngc ? String(optimized.ngc) : undefined,
    nameAlignment: (optimized.na as ProfileData['nameAlignment']) || 'center',
    nameBackground: optimized.nb === 1,
    bio: String(optimized.b || ''),
    bioFont: String(optimized.bf || 'font-cairo'),
    bioGlow: optimized.bg === 1,
    bioGlowColor: optimized.bgc ? String(optimized.bgc) : undefined,
    bioAlignment: (optimized.ba as ProfileData['bioAlignment']) || 'center',
    bioBackground: optimized.bb === 1,
    avatar: optimized.a ? String(optimized.a) : undefined,
    avatarStyle: (optimized.as as ProfileData['avatarStyle']) || 'circle',
    avatarSize: (optimized.az as ProfileData['avatarSize']) || 'medium',
    avatarAlignment: (optimized.aa as ProfileData['avatarAlignment']) || 'center',
    avatarGlow: optimized.ag === 1,
    avatarGlowColor: optimized.agc ? String(optimized.agc) : undefined,
    avatarFloat: optimized.af === 1,
    hideAvatar: optimized.ha === 1,
    hideName: optimized.hn === 1,
    textBlocks: Array.isArray(optimized.tb) ? optimized.tb.map((b: Record<string, unknown>, i: number) => ({
      id: String(i),
      content: String(b.c || ''),
      alignment: (b.a as 'start' | 'center' | 'end') || 'center',
      fontSize: (b.f as 'small' | 'medium' | 'large' | 'xlarge') || 'medium',
      fontFamily: b.ff ? String(b.ff) : 'font-cairo',
    })) : [],
    socialLinks: [],
    theme: {
      backgroundColor: '#0f172a',
      backgroundType: 'gradient',
      gradientFrom: '#0f172a',
      gradientTo: '#1e1b4b',
      textColor: '#f8fafc',
      accentColor: '#818cf8',
      cardBackground: 'rgba(255, 255, 255, 0.1)',
      cardTextColor: '#f8fafc',
      fontFamily: 'font-sans',
      buttonStyle: 'pill',
      animation: 'float',
      borderStyle: 'none',
      shadowStyle: 'soft',
      cardOpacity: 10,
    },
    media: [],
    musicUrl: optimized.mu ? String(optimized.mu) : undefined,
    musicAutoplay: optimized.ma === 1,
    musicLoop: optimized.ml === 1,
    createdAt: new Date().toISOString(),
  };

  // Restore social links
  if (Array.isArray(optimized.sl)) {
    profile.socialLinks = optimized.sl.map((link: Record<string, unknown>, index: number) => ({
      id: String(index),
      platform: String(link.p),
      url: String(link.u),
      icon: String(link.p),
      ...(link.cl ? { customLabel: String(link.cl) } : {}),
      ...(link.dm ? { displayMode: link.dm as 'button' | 'icon' } : {}),
      ...(link.is ? { iconSize: link.is as 'sm' | 'md' | 'lg' } : {}),
      ...(link.nb ? { iconNoBg: true } : {}),
    }));
  }

  // Restore theme
  const t = optimized.t as Record<string, unknown>;
  if (t) {
    profile.theme.backgroundType = t.bt as ProfileData['theme']['backgroundType'];
    if (t.bc) profile.theme.backgroundColor = String(t.bc);
    if (t.gf) profile.theme.gradientFrom = String(t.gf);
    if (t.gt) profile.theme.gradientTo = String(t.gt);
    if (t.bi) profile.theme.backgroundImage = String(t.bi);
    if (t.bv) profile.theme.backgroundVideo = String(t.bv);
    if (t.ab) profile.theme.animatedBackground = t.ab as ProfileData['theme']['animatedBackground'];
    if (t.tc) profile.theme.textColor = String(t.tc);
    if (t.ac) profile.theme.accentColor = String(t.ac);
    if (t.ctc) profile.theme.cardTextColor = String(t.ctc);
    if (t.bs) profile.theme.buttonStyle = t.bs as ProfileData['theme']['buttonStyle'];
    if (t.an) profile.theme.animation = t.an as ProfileData['theme']['animation'];
    if (t.brs) profile.theme.borderStyle = t.brs as ProfileData['theme']['borderStyle'];
    if (t.ss) profile.theme.shadowStyle = t.ss as ProfileData['theme']['shadowStyle'];
    if (t.co !== undefined) profile.theme.cardOpacity = Number(t.co);
  }

  // Restore media
  if (Array.isArray(optimized.m)) {
    profile.media = optimized.m.map((media: Record<string, unknown>, index: number) => ({
      id: String(index),
      type: media.t as 'image' | 'video' | 'youtube',
      url: String(media.u),
      caption: media.c ? String(media.c) : undefined,
      width: (media.w as 'full' | 'half') || 'half',
      aspectRatio: (media.ar as 'auto' | 'square' | 'video' | 'portrait') || 'auto',
    }));
  }

  return profile;
}

// Encode profile data to a URL-safe string (optimized)
export function encodeProfileToUrl(profile: ProfileData): string {
  try {
    const optimized = optimizeProfileData(profile);
    const json = JSON.stringify(optimized);
    const compressed = deflate(json, { level: 9 });
    const base64 = btoa(String.fromCharCode(...compressed));
    // Make URL-safe
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch (error) {
    console.error('Error encoding profile:', error);
    return '';
  }
}

// Decode profile data from URL string
export function decodeProfileFromUrl(encoded: string): ProfileData | null {
  try {
    // Restore base64 characters
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    // Add padding if needed
    while (base64.length % 4) {
      base64 += '=';
    }
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const decompressed = inflate(bytes, { to: 'string' });
    const data = JSON.parse(decompressed);
    
    // Check if it's optimized format or full format
    if ('i' in data) {
      return restoreProfileData(data);
    }
    
    return data as ProfileData;
  } catch (error) {
    console.error('Error decoding profile:', error);
    return null;
  }
}

// Generate shareable URL (shorter)
export function generateShareableUrl(profile: ProfileData, baseUrl: string): string {
  const encoded = encodeProfileToUrl(profile);
  // Use shorter path
  return `${baseUrl}/p/${profile.id}?d=${encoded}`;
}

// ==================== Store URL Encoding ====================

import { StoreData } from './types';

function optimizeStoreData(store: StoreData): Record<string, unknown> {
  return {
    i: store.id,
    sn: store.storeName,
    ss: store.storeSubtitle,
    si: store.storeImage,
    sl: store.sellerLink,
    cl: store.channelLink,
    hb: store.heroBadgeText,
    ht: store.heroTitle,
    hs: store.heroSubtitle,
    ft: store.footerText,
    th: store.theme,
    pr: store.products.map(p => ({
      i: p.id,
      n: p.name,
      d: p.description,
      pr: p.price,
      cu: p.currency,
      di: p.discount,
      im: p.image,
      ft: p.features,
      ct: p.category,
      bg: p.badge,
      bl: p.buyLink,
      bl1l: p.buyLink1Label,
      bl2: p.buyLink2,
      bl2l: p.buyLink2Label,
    })),
    fe: store.features,
    pm: store.paymentMethods,
    ca: store.createdAt,
  };
}

function restoreStoreData(o: Record<string, unknown>): StoreData {
  const products = Array.isArray(o.pr) ? o.pr.map((p: Record<string, unknown>) => ({
    id: String(p.i || ''),
    name: String(p.n || ''),
    description: String(p.d || ''),
    price: Number(p.pr || 0),
    currency: p.cu ? String(p.cu) as 'IQD' | 'USD' | 'SAR' | 'EGP' : 'IQD',
    discount: p.di ? Number(p.di) : 0,
    image: String(p.im || ''),
    features: Array.isArray(p.ft) ? p.ft.map(String) : [],
    category: String(p.ct || 'عام'),
    badge: p.bg ? String(p.bg) : undefined,
    buyLink: String(p.bl || ''),
    buyLink1Label: p.bl1l ? String(p.bl1l) : '',
    buyLink2: p.bl2 ? String(p.bl2) : '',
    buyLink2Label: p.bl2l ? String(p.bl2l) : '',
  })) : [];

  return {
    id: String(o.i || ''),
    storeName: String(o.sn || ''),
    storeSubtitle: String(o.ss || ''),
    storeImage: String(o.si || ''),
    sellerLink: String(o.sl || ''),
    channelLink: String(o.cl || ''),
    heroBadgeText: String(o.hb || ''),
    heroTitle: String(o.ht || ''),
    heroSubtitle: String(o.hs || ''),
    footerText: String(o.ft || ''),
    theme: o.th as StoreData['theme'],
    products,
    features: Array.isArray(o.fe) ? o.fe as StoreData['features'] : [],
    paymentMethods: Array.isArray(o.pm) ? o.pm as string[] : [],
    createdAt: String(o.ca || new Date().toISOString()),
  };
}

export function encodeStoreToUrl(store: StoreData): string {
  try {
    const optimized = optimizeStoreData(store);
    const json = JSON.stringify(optimized);
    const compressed = deflate(json, { level: 9 });
    const base64 = btoa(String.fromCharCode(...compressed));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch (error) {
    console.error('Error encoding store:', error);
    return '';
  }
}

export function decodeStoreFromUrl(encoded: string): StoreData | null {
  try {
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const decompressed = inflate(bytes, { to: 'string' });
    const data = JSON.parse(decompressed);
    return restoreStoreData(data);
  } catch (error) {
    console.error('Error decoding store:', error);
    return null;
  }
}

export function generateStoreShareableUrl(store: StoreData, baseUrl: string): string {
  const encoded = encodeStoreToUrl(store);
  return `${baseUrl}/store/${store.id}?d=${encoded}`;
}

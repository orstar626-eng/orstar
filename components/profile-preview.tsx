'use client';

import { useState } from 'react';
import { ProfileData, nameSizeOptions, mediaAspectOptions, avatarStyleOptions, avatarSizeOptions, fontOptions } from '@/lib/types';
import { getSocialIcon } from './social-icons';
import { cn } from '@/lib/utils';

interface ProfilePreviewProps {
  profile: ProfileData;
  isPreview?: boolean;
}

function PdfBookViewer({ url, caption }: { url: string; caption?: string }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDir, setFlipDir] = useState<'next' | 'prev'>('next');

  const flip = (dir: 'next' | 'prev') => {
    if (isFlipping) return;
    setFlipDir(dir);
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentPage(p => dir === 'next' ? p + 1 : Math.max(1, p - 1));
      setIsFlipping(false);
    }, 400);
  };

  return (
    <div className="w-full">
      <div className="relative rounded-xl overflow-hidden" style={{ aspectRatio: '3/4', background: 'rgba(0,0,0,0.2)' }}>
        <iframe
          src={`${url}#page=${currentPage}`}
          className="w-full h-full"
          style={{
            border: 'none',
            transform: isFlipping
              ? `perspective(800px) rotateY(${flipDir === 'next' ? -15 : 15}deg) scale(0.97)`
              : 'perspective(800px) rotateY(0deg) scale(1)',
            transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            transformOrigin: flipDir === 'next' ? 'left center' : 'right center',
          }}
          title="PDF Viewer"
        />
        <button onClick={() => flip('prev')} disabled={currentPage <= 1}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center text-sm hover:bg-black/60 transition-all disabled:opacity-30">‹</button>
        <button onClick={() => flip('next')}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center text-sm hover:bg-black/60 transition-all">›</button>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/40 backdrop-blur-sm text-white text-xs">صفحة {currentPage}</div>
      </div>
      {caption && <p className="p-2 text-xs text-center opacity-70 mt-1">{caption}</p>}
    </div>
  );
}

export function ProfilePreview({ profile, isPreview = true }: ProfilePreviewProps) {
  const { theme } = profile;

  const getBackgroundStyle = () => {
    if (theme.backgroundType === 'image' && theme.backgroundImage) {
      return { backgroundImage: `url(${theme.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' };
    }
    if (theme.backgroundType === 'video') {
      return { backgroundColor: '#000000' };
    }
    if (theme.backgroundType === 'gradient') {
      return { background: `linear-gradient(to bottom right, ${theme.gradientFrom}, ${theme.gradientTo})` };
    }
    return { backgroundColor: theme.backgroundColor };
  };

  const getButtonClass = () => {
    const base = 'w-full px-4 py-3 font-medium transition-all duration-300 flex items-center justify-center gap-3';
    const styles = { rounded: 'rounded-xl', pill: 'rounded-full', square: 'rounded-md' };
    return cn(base, styles[theme.buttonStyle]);
  };

  const getBorderStyle = () => {
    const styles = { none: '', solid: 'border-2', dashed: 'border-2 border-dashed', glow: 'border-2 shadow-lg' };
    return styles[theme.borderStyle || 'none'];
  };

  const getShadowStyle = () => {
    const styles = { none: '', soft: 'shadow-lg', hard: 'shadow-xl shadow-black/20', neon: '' };
    return styles[theme.shadowStyle || 'soft'];
  };

  const getNeonStyle = () => {
    if (theme.shadowStyle === 'neon') {
      return { boxShadow: `0 0 20px ${theme.accentColor}40, 0 0 40px ${theme.accentColor}20` };
    }
    return {};
  };

  const getNameSizeClass = () => {
    const size = nameSizeOptions.find(s => s.id === (profile.nameSize || 'medium'));
    return size?.class || 'text-2xl sm:text-3xl';
  };

  const getAvatarStyleClass = () => {
    const style = avatarStyleOptions.find(s => s.id === (profile.avatarStyle || 'circle'));
    return style?.class || 'rounded-full';
  };

  const getAvatarSizeClass = () => {
    const size = avatarSizeOptions.find(s => s.id === (profile.avatarSize || 'medium'));
    return size?.class || 'w-28 h-28 sm:w-32 sm:h-32';
  };

  const getAvatarGlowStyle = () => {
    if (profile.avatarGlow) {
      const glowColor = profile.avatarGlowColor || theme.accentColor;
      return { boxShadow: `0 0 30px ${glowColor}80, 0 0 60px ${glowColor}40, 0 0 90px ${glowColor}20` };
    }
    return {};
  };

  const getNameGlowStyle = () => {
    if (profile.nameGlow) {
      const glowColor = profile.nameGlowColor || theme.accentColor;
      return { textShadow: `0 0 20px ${glowColor}90, 0 0 40px ${glowColor}50` };
    }
    return {};
  };

  const getBioGlowStyle = () => {
    if (profile.bioGlow) {
      const glowColor = profile.bioGlowColor || theme.accentColor;
      return { textShadow: `0 0 15px ${glowColor}80, 0 0 30px ${glowColor}40` };
    }
    return {};
  };

  const getFontFamily = (fontId: string) => {
    const font = fontOptions.find(f => f.id === fontId);
    return font?.family || 'inherit';
  };

  const getMediaAspectClass = (aspectRatio?: string) => {
    const aspect = mediaAspectOptions.find(a => a.id === (aspectRatio || 'auto'));
    return aspect?.class || 'aspect-auto';
  };

  const extractYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  const cardOpacity = (theme.cardOpacity ?? 10) / 100;
  const cardStyle = {
    backgroundColor: `rgba(255, 255, 255, ${cardOpacity})`,
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    ...getNeonStyle(),
  };

  const avatarFloatClass = profile.avatarFloat ? 'animate-float' : '';

  const getLinkLabel = (link: typeof profile.socialLinks[0]) => {
    if (link.platform === 'custom' && link.customLabel) return link.customLabel;
    const platform = link.platform;
    return platform.charAt(0).toUpperCase() + platform.slice(1);
  };

  // For RTL layout: 'start' = right side, 'end' = left side, 'center' = center
  const getAlignClass = (alignment?: 'start' | 'center' | 'end') => {
    // Using justify-content on a flex row wrapper around each element
    if (alignment === 'start') return 'justify-end';    // right in RTL
    if (alignment === 'end') return 'justify-start';    // left in RTL
    return 'justify-center';
  };

  const getTextAlignClass = (alignment?: 'start' | 'center' | 'end') => {
    if (alignment === 'start') return 'text-right';
    if (alignment === 'end') return 'text-left';
    return 'text-center';
  };

  const getSelfAlignClass = (alignment?: 'start' | 'center' | 'end') => {
    if (alignment === 'start') return 'self-end mr-0 ml-auto';
    if (alignment === 'end') return 'self-start ml-0 mr-auto';
    return 'self-center mx-auto';
  };

  const getTextBlockSizeClass = (size?: string) => {
    const sizes: Record<string, string> = {
      small: 'text-xs',
      medium: 'text-sm',
      large: 'text-base',
      xlarge: 'text-lg',
    };
    return sizes[size || 'medium'] || 'text-sm';
  };

  return (
    <div
      className="min-h-screen w-full overflow-x-hidden"
      style={{ ...getBackgroundStyle(), color: theme.textColor }}
    >
      {theme.backgroundType === 'animated' && theme.animatedBackground && (
        <video
          key={theme.animatedBackground}
          autoPlay
          loop
          muted
          playsInline
          className="fixed inset-0 w-full h-full object-cover pointer-events-none z-0"
          style={{ opacity: 0.9 }}
        >
          <source src={theme.animatedBackground} type="video/mp4" />
        </video>
      )}

      {theme.backgroundType === 'video' && theme.backgroundVideo && (
        <video
          key={theme.backgroundVideo}
          autoPlay
          loop
          muted
          playsInline
          className="fixed inset-0 w-full h-full object-cover pointer-events-none z-0"
          style={{ opacity: 0.85 }}
        >
          <source src={theme.backgroundVideo} />
        </video>
      )}

      {theme.backgroundType === 'image' && theme.backgroundImage && (
        <div className="fixed inset-0 bg-black/40 pointer-events-none" />
      )}

      <div className="relative z-10 min-h-screen w-full flex flex-col px-4 py-8 sm:py-12 md:py-16">

        {/* Avatar */}
        {!profile.hideAvatar && (
          <div className={cn('mb-4 w-full flex', getAlignClass(profile.avatarAlignment))}>
            <div className={cn(avatarFloatClass)}>
              {profile.avatar ? (
                <div className={cn('overflow-hidden ring-4 ring-white/20', getAvatarStyleClass(), getAvatarSizeClass())} style={getAvatarGlowStyle()}>
                  <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div
                  className={cn('flex items-center justify-center text-3xl sm:text-4xl font-bold ring-4 ring-white/20', getAvatarStyleClass(), getAvatarSizeClass())}
                  style={{ backgroundColor: theme.accentColor, ...getAvatarGlowStyle() }}
                >
                  {profile.name ? profile.name.charAt(0).toUpperCase() : '?'}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Name */}
        {!profile.hideName && (
          <div className={cn('mb-2 w-full flex', getAlignClass(profile.nameAlignment))}>
            <h1
              className={cn('font-bold break-words max-w-full', getNameSizeClass(), getTextAlignClass(profile.nameAlignment))}
              style={{
                color: profile.nameColor,
                fontFamily: getFontFamily(profile.nameFont),
                ...(profile.nameBackground ? {
                  ...cardStyle,
                  padding: '0.5rem 1.25rem',
                  borderRadius: '0.75rem',
                } : {}),
                ...getNameGlowStyle(),
              }}
            >
              {profile.name || 'اسمك هنا'}
            </h1>
          </div>
        )}

        {/* Bio */}
        {profile.bio && (
          <div className={cn('mb-6 w-full flex', getAlignClass(profile.bioAlignment))}>
            <p
              className={cn('opacity-90 leading-relaxed text-sm sm:text-base break-words max-w-xs sm:max-w-sm', getTextAlignClass(profile.bioAlignment))}
              style={{
                color: theme.textColor,
                fontFamily: getFontFamily(profile.bioFont || 'font-cairo'),
                ...(profile.bioBackground ? {
                  ...cardStyle,
                  padding: '0.75rem 1.25rem',
                  borderRadius: '0.75rem',
                } : {}),
                ...getBioGlowStyle(),
              }}
            >
              {profile.bio}
            </p>
          </div>
        )}

        {/* Social Links */}
        {profile.socialLinks.length > 0 && (() => {
          const buttonLinks = profile.socialLinks.filter(l => !l.displayMode || l.displayMode === 'button');
          const iconLinks = profile.socialLinks.filter(l => l.displayMode === 'icon');
          // حجم الأيقونة بناءً على أول رابط أيقونة (أو يمكن تخصيص كل رابط)
          const getIconSizeClass = (size?: string) => {
            if (size === 'sm') return 'w-10 h-10';
            if (size === 'lg') return 'w-16 h-16';
            return 'w-12 h-12'; // md default
          };
          const getIconInnerSize = (size?: string) => {
            if (size === 'sm') return 'w-4 h-4';
            if (size === 'lg') return 'w-7 h-7';
            return 'w-5 h-5'; // md default
          };
          return (
            <div className="w-full max-w-xs sm:max-w-sm space-y-3 mb-8 mx-auto">
              {/* أيقونات — تُعرض أفقياً مجمّعة */}
              {iconLinks.length > 0 && (
                <div className="flex flex-wrap justify-center gap-3">
                  {iconLinks.map((link) => {
                    const Icon = getSocialIcon(link.platform);
                    return (
                      <a
                        key={link.id}
                        href={link.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn('flex items-center justify-center rounded-2xl hover:scale-110 active:scale-95 transition-transform', getIconSizeClass(link.iconSize), !link.iconNoBg && getBorderStyle(), !link.iconNoBg && getShadowStyle())}
                        style={link.iconNoBg ? { color: theme.cardTextColor } : {
                          ...cardStyle,
                          borderColor: theme.borderStyle !== 'none' ? `${theme.accentColor}60` : 'transparent',
                          color: theme.cardTextColor,
                        }}
                        onClick={(e) => { if (isPreview || !link.url) e.preventDefault(); }}
                        title={getLinkLabel(link)}
                      >
                        <Icon className={cn('flex-shrink-0', getIconInnerSize(link.iconSize))} />
                      </a>
                    );
                  })}
                </div>
              )}
              {/* أزرار — تُعرض عمودياً */}
              {buttonLinks.map((link) => {
                const Icon = getSocialIcon(link.platform);
                return (
                  <a
                    key={link.id}
                    href={link.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(getButtonClass(), getBorderStyle(), getShadowStyle(), 'hover:scale-[1.02] active:scale-[0.98]')}
                    style={{
                      ...cardStyle,
                      borderColor: theme.borderStyle !== 'none' ? `${theme.accentColor}60` : 'transparent',
                      color: theme.cardTextColor,
                    }}
                    onClick={(e) => { if (isPreview || !link.url) e.preventDefault(); }}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm sm:text-base">{getLinkLabel(link)}</span>
                  </a>
                );
              })}
            </div>
          );
        })()}

        {/* Text Blocks */}
        {(profile.textBlocks || []).filter(b => b.content).map((block) => (
          <div key={block.id} className={cn('w-full mb-4 flex', getAlignClass(block.alignment))}>
            <div
              className={cn('max-w-xs sm:max-w-sm md:max-w-md rounded-xl leading-relaxed whitespace-pre-wrap break-words', getTextBlockSizeClass(block.fontSize), getTextAlignClass(block.alignment))}
              style={{
                ...cardStyle,
                padding: '1rem 1.25rem',
                fontFamily: getFontFamily(block.fontFamily || 'font-cairo'),
                color: theme.cardTextColor,
                borderColor: theme.borderStyle !== 'none' ? `${theme.accentColor}60` : 'transparent',
                border: theme.borderStyle !== 'none' ? `2px ${theme.borderStyle === 'dashed' ? 'dashed' : 'solid'} ${theme.accentColor}40` : 'none',
              }}
            >
              {block.content}
            </div>
          </div>
        ))}

        {/* Media Gallery */}
        {profile.media.length > 0 && (
          <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mb-8 mx-auto">
            <div className="grid grid-cols-2 gap-3">
              {profile.media.map((media) => (
                <div
                  key={media.id}
                  className={cn('rounded-xl overflow-hidden', getShadowStyle(), media.width === 'full' ? 'col-span-2' : 'col-span-1')}
                  style={cardStyle}
                >
                  {media.type === 'image' && media.url && (
                    <img src={media.url} alt={media.caption || 'Image'} className={cn('w-full object-cover', getMediaAspectClass(media.aspectRatio))} />
                  )}
                  {media.type === 'video' && media.url && (
                    <video src={media.url} className={cn('w-full object-cover', getMediaAspectClass(media.aspectRatio || 'video'))} controls playsInline />
                  )}
                  {media.type === 'youtube' && media.url && extractYouTubeId(media.url) && (
                    <iframe src={`https://www.youtube.com/embed/${extractYouTubeId(media.url)}`} className={cn('w-full', getMediaAspectClass(media.aspectRatio || 'video'))} allowFullScreen />
                  )}
                  {media.type === 'pdf' && media.url && (
                    <PdfBookViewer url={media.url} caption={media.caption} />
                  )}
                  {media.caption && media.type !== 'pdf' && (
                    <p className="p-3 text-sm opacity-80 break-words" style={{ color: theme.cardTextColor }}>{media.caption}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex-1" />
        <footer className="pt-8 pb-4 text-center opacity-60 text-xs">
          <a href="http://orstar.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:opacity-100 transition-opacity" style={{ color: 'inherit' }}>
            created by orstar.vercel.app
          </a>
        </footer>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MusicPlayerProps {
  url?: string;
  youtubeUrl?: string;
  autoplay?: boolean;
  loop?: boolean;
  className?: string;
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  return match ? match[1] : null;
}

export function MusicPlayer({ url, youtubeUrl, autoplay = true, loop = false, className }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const youtubeId = youtubeUrl ? extractYouTubeId(youtubeUrl) : null;

  // Audio file player
  useEffect(() => {
    if (!url || youtubeId || !audioRef.current) return;

    const audio = audioRef.current;
    audio.loop = loop;

    const handleEnded = () => {
      if (!loop) setIsPlaying(false);
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [url, loop, youtubeId]);

  // Autoplay for audio file
  useEffect(() => {
    if (!autoplay || !url || youtubeId || !audioRef.current) return;

    const audio = audioRef.current;
    let played = false;

    const tryPlay = () => {
      if (played) return;
      audio.play().then(() => {
        setIsPlaying(true);
        played = true;
      }).catch(() => {});
    };

    // Try immediately
    tryPlay();

    // Fallback: on first interaction
    const onInteract = () => {
      tryPlay();
      window.removeEventListener('click', onInteract);
      window.removeEventListener('touchstart', onInteract);
      window.removeEventListener('keydown', onInteract);
    };

    window.addEventListener('click', onInteract, { once: true });
    window.addEventListener('touchstart', onInteract, { once: true });
    window.addEventListener('keydown', onInteract, { once: true });

    return () => {
      window.removeEventListener('click', onInteract);
      window.removeEventListener('touchstart', onInteract);
      window.removeEventListener('keydown', onInteract);
    };
  }, [autoplay, url, youtubeId]);

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  if (!url && !youtubeId) return null;

  // YouTube audio via hidden iframe
  if (youtubeId) {
    const autoplayParam = autoplay ? 1 : 0;
    const loopParam = loop ? 1 : 0;
    const src = `https://www.youtube.com/embed/${youtubeId}?autoplay=${autoplayParam}&loop=${loopParam}&playlist=${youtubeId}&controls=0&mute=${isMuted ? 1 : 0}&enablejsapi=1`;

    return (
      <div className={cn('fixed bottom-4 left-4 z-50', className)}>
        {/* Hidden iframe for YouTube audio */}
        <iframe
          ref={iframeRef}
          src={src}
          style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
        {/* Mute button */}
        <button
          onClick={toggleMute}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-black/30 backdrop-blur-md border border-white/20 text-white hover:bg-black/50 transition-all duration-300"
          title={isMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>
    );
  }

  // Regular audio file - only mute button shown
  return (
    <div className={cn('fixed bottom-4 left-4 z-50', className)}>
      <audio ref={audioRef} src={url} loop={loop} preload="auto" />
      <button
        onClick={toggleMute}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-black/30 backdrop-blur-md border border-white/20 text-white hover:bg-black/50 transition-all duration-300"
        title={isMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
      >
        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>
    </div>
  );
}

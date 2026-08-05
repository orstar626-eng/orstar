'use client';

import { useState, useRef } from 'react';
import { X, Image as ImageIcon, Video, Link2, Music, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

function isValidImageUrl(url: string): boolean {
  if (!url) return false;
  try { new URL(url); return true; } catch { return false; }
}

function isValidVideoUrl(url: string): boolean {
  if (!url) return false;
  try {
    new URL(url);
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
    return videoExtensions.some(ext => url.toLowerCase().includes(ext));
  } catch { return false; }
}

async function uploadToTop4Top(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  // Use our server-side API route to avoid CORS issues with top4top.io
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'فشل الرفع إلى top4top.io');
  }

  if (data.url) return data.url;
  throw new Error(data.error || 'لم يتم الحصول على رابط الصورة');
}

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  accept?: string;
  className?: string;
  label?: string;
  previewClassName?: string;
  aspectRatio?: 'square' | 'video' | 'cover' | 'avatar';
  icon?: 'image' | 'video';
}

export function ImageUpload({
  value, onChange, accept = 'image/*', className,
  label = 'رفع صورة', previewClassName, aspectRatio = 'square',
}: ImageUploadProps) {
  const [urlInput, setUrlInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aspectClasses = {
    square: 'aspect-square', video: 'aspect-video',
    cover: 'aspect-[3/1]', avatar: 'aspect-square w-28 h-28 sm:w-32 sm:h-32',
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) { setError('الرجاء إدخال رابط'); return; }
    if (!isValidImageUrl(urlInput)) { setError('الرابط غير صالح'); return; }
    onChange(urlInput.trim()); setUrlInput(''); setError(null);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('يرجى اختيار ملف صورة صالح'); return; }
    if (file.size > 10 * 1024 * 1024) { setError('حجم الصورة يجب أن يكون أقل من 10 ميجابايت'); return; }
    setUploading(true); setError(null);
    try {
      const url = await uploadToTop4Top(file);
      onChange(url);
    } catch (err: any) {
      setError(err?.message || 'فشل رفع الصورة، حاول مرة أخرى');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = () => { onChange(''); setUrlInput(''); setError(null); };

  if (value) {
    return (
      <div className={cn('space-y-2', className)}>
        <div className={cn('relative rounded-xl overflow-hidden bg-muted', aspectClasses[aspectRatio], previewClassName)}>
          {accept.includes('video') ? (
            <video src={value} className="w-full h-full object-cover" controls />
          ) : (
            <img src={value} alt="Preview" className="w-full h-full object-cover" onError={() => setError('فشل تحميل الصورة')} />
          )}
        </div>
        <div className="flex gap-2">
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
            className="flex-1 py-2 rounded-xl border border-border bg-secondary hover:bg-muted text-xs font-medium text-foreground transition-all flex items-center justify-center gap-1.5 disabled:opacity-60">
            {uploading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />جاري الرفع...</> : <><Upload className="w-3.5 h-3.5" />تغيير الصورة</>}
          </button>
          <button type="button" onClick={handleRemove}
            className="px-3 py-2 rounded-xl border border-destructive/30 bg-destructive/5 hover:bg-destructive/10 text-destructive text-xs font-medium transition-all flex items-center justify-center">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
        className="w-full p-4 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed">
        {uploading ? (
          <><Loader2 className="w-5 h-5 text-primary animate-spin" /><span className="text-sm font-medium">جارٍ رفع الصورة...</span></>
        ) : (
          <>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="w-5 h-5 text-primary" />
            </div>
            <div className="text-start">
              <span className="text-sm font-medium block">{label}</span>
              <span className="text-xs text-muted-foreground">اختر صورة من جهازك</span>
            </div>
          </>
        )}
      </button>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            <Link2 className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <span className="text-xs text-muted-foreground">أو أدخل رابطاً مباشراً</span>
        </div>
        <div className="flex gap-2">
          <Input type="text" value={urlInput}
            onChange={(e) => { setUrlInput(e.target.value); setError(null); }}
            placeholder="https://example.com/image.jpg" className="flex-1 h-9 text-sm" dir="ltr"
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleUrlSubmit(); } }} />
          <Button type="button" onClick={handleUrlSubmit} className="h-9" size="sm" variant="outline">إضافة</Button>
        </div>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

interface MediaUploadProps {
  onUpload: (url: string, type: 'image' | 'video') => void;
  onYouTubeAdd?: (url: string) => void;
  hasVideo?: boolean;
  className?: string;
}

export function MediaUpload({ onUpload, onYouTubeAdd, hasVideo = false, className }: MediaUploadProps) {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [showYouTubeInput, setShowYouTubeInput] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [showVideoInput, setShowVideoInput] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  const handleYouTubeSubmit = () => {
    const videoId = extractYouTubeId(youtubeUrl);
    if (videoId && onYouTubeAdd) {
      onYouTubeAdd(youtubeUrl); setYoutubeUrl(''); setShowYouTubeInput(false); setError(null);
    } else { setError('رابط يوتيوب غير صالح'); }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('يرجى اختيار ملف صورة صالح'); return; }
    if (file.size > 10 * 1024 * 1024) { setError('حجم الصورة يجب أن يكون أقل من 10 ميجابايت'); return; }
    setUploading(true); setError(null);
    try {
      const url = await uploadToTop4Top(file);
      onUpload(url, 'image');
    } catch (err: any) {
      setError(err?.message || 'فشل رفع الصورة، حاول مرة أخرى');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleVideoSubmit = () => {
    if (!videoUrl.trim()) { setError('الرجاء إدخال رابط الفيديو'); return; }
    if (!isValidVideoUrl(videoUrl)) { setError('رابط الفيديو غير صالح (يجب أن يكون ملف فيديو مثل .mp4)'); return; }
    onUpload(videoUrl.trim(), 'video'); setVideoUrl(''); setShowVideoInput(false); setError(null);
  };

  return (
    <div className={cn('space-y-3', className)}>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      {showYouTubeInput ? (
        <div className="p-4 rounded-xl border border-border bg-secondary/30 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
              <Video className="w-4 h-4 text-red-500" />
            </div>
            <span className="text-sm font-medium">إضافة فيديو يوتيوب</span>
          </div>
          <div className="space-y-2">
            <Input type="text" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className="h-10" dir="ltr" />
            <div className="flex gap-2">
              <Button onClick={handleYouTubeSubmit} className="flex-1" size="sm">إضافة</Button>
              <Button variant="secondary" onClick={() => { setShowYouTubeInput(false); setYoutubeUrl(''); setError(null); }} size="sm">إلغاء</Button>
            </div>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowYouTubeInput(true)}
          className="w-full p-4 rounded-xl border-2 border-dashed border-border hover:border-red-500/50 hover:bg-red-500/5 transition-all flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
            <Video className="w-5 h-5 text-red-500" />
          </div>
          <span className="text-sm font-medium">إضافة فيديو يوتيوب</span>
        </button>
      )}

      <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
        className="w-full p-4 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed">
        {uploading ? (
          <><Loader2 className="w-5 h-5 text-primary animate-spin" /><span className="text-sm font-medium">جارٍ رفع الصورة...</span></>
        ) : (
          <>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="w-5 h-5 text-primary" />
            </div>
            <div className="text-start">
              <span className="text-sm font-medium block">رفع صورة من الجهاز</span>

            </div>
          </>
        )}
      </button>

      {showVideoInput ? (
        <div className="p-4 rounded-xl border border-border bg-secondary/30 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <Video className="w-4 h-4 text-blue-500" />
            </div>
            <span className="text-sm font-medium">إضافة فيديو</span>
          </div>
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 space-y-2">
            <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
              لتحويل الفيديو إلى رابط، قم بالذهاب إلى هذا الموقع وارفع الفيديو الخاص بك وانسخ رابط الفيديو الذي نهايته mp4 وضعه هنا.
            </p>
            <a
              href="https://top4top.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500 text-white text-xs font-bold hover:bg-blue-600 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              الذهاب إلى top4top.io
            </a>
          </div>
          <div className="space-y-2">
            <Input type="text" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://example.com/video.mp4" className="h-10" dir="ltr" />
            <div className="flex gap-2">
              <Button onClick={handleVideoSubmit} className="flex-1" size="sm">إضافة</Button>
              <Button variant="secondary" onClick={() => { setShowVideoInput(false); setVideoUrl(''); setError(null); }} size="sm">إلغاء</Button>
            </div>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowVideoInput(true)}
          className="w-full p-4 rounded-xl border-2 border-dashed border-border hover:border-blue-500/50 hover:bg-blue-500/5 transition-all flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
            <Video className="w-5 h-5 text-blue-500" />
          </div>
          <span className="text-sm font-medium">إضافة فيديو</span>
        </button>
      )}

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">{error}</div>
      )}
    </div>
  );
}

function isValidAudioUrl(url: string): boolean {
  if (!url) return false;
  try { new URL(url); return true; } catch { return false; }
}

interface MusicUploadProps {
  value?: string;
  onChange: (url: string) => void;
  className?: string;
}

export function MusicUpload({ value, onChange, className }: MusicUploadProps) {
  const [urlInput, setUrlInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!urlInput.trim()) { setError('الرجاء إدخال رابط الصوت'); return; }
    if (!isValidAudioUrl(urlInput)) { setError('الرابط غير صالح'); return; }
    onChange(urlInput.trim()); setUrlInput(''); setError(null);
  };

  const handleRemove = () => { onChange(''); setUrlInput(''); setError(null); };

  if (value) {
    return (
      <div className={cn('relative group', className)}>
        <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50 border border-border">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Music className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-muted-foreground" dir="ltr">{value}</p>
            <audio src={value} controls className="w-full h-8 mt-2" />
          </div>
          <Button type="button" variant="ghost" size="icon" className="flex-shrink-0 text-destructive hover:text-destructive" onClick={handleRemove}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="p-4 rounded-xl border border-border bg-secondary/30 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Music className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-medium">رابط ملف الصوت</span>
        </div>
        <div className="space-y-2">
          <Input type="text" value={urlInput}
            onChange={(e) => { setUrlInput(e.target.value); setError(null); }}
            placeholder="https://example.com/music.mp3" className="h-10" dir="ltr"
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSubmit(); } }} />
          <Button onClick={handleSubmit} className="w-full" size="sm">إضافة الصوت</Button>
          {error && <p className="text-xs text-destructive text-center">{error}</p>}
        </div>
        <p className="text-xs text-muted-foreground text-center">أدخل رابط مباشر لملف صوتي (MP3, WAV, OGG)</p>
      </div>
    </div>
  );
}

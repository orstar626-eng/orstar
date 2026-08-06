'use client';

import { useState, useCallback } from 'react';
import { Plus, Trash2, Image as ImageIcon, Video, Link2, Palette, Type, Sparkles, Settings2, FileText, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  ProfileData, SocialLink, ProfileMedia, ProfileTextBlock, socialPlatforms, arabicFonts,
  englishFonts, gradientPresets, nameSizeOptions, mediaWidthOptions,
  mediaAspectOptions, avatarStyleOptions, avatarSizeOptions,
  animatedBackgrounds, fontOptions,
} from '@/lib/types';
import { generateId } from '@/lib/profile-store';
import { getSocialIcon } from './social-icons';
import { ImageUpload, MediaUpload } from './image-upload';
import { cn } from '@/lib/utils';

interface ProfileEditorProps {
  profile: ProfileData;
  onChange: (profile: ProfileData) => void;
}

const AlignmentButtons = ({ value, onChange }: { value: 'start' | 'center' | 'end'; onChange: (v: 'start' | 'center' | 'end') => void }) => (
  <div className="flex gap-1">
    <Button size="sm" variant={value === 'end' ? 'default' : 'outline'} onClick={() => onChange('end')} className="h-8 w-8 p-0" title="يسار"><AlignLeft className="w-3.5 h-3.5" /></Button>
    <Button size="sm" variant={value === 'center' ? 'default' : 'outline'} onClick={() => onChange('center')} className="h-8 w-8 p-0" title="وسط"><AlignCenter className="w-3.5 h-3.5" /></Button>
    <Button size="sm" variant={value === 'start' ? 'default' : 'outline'} onClick={() => onChange('start')} className="h-8 w-8 p-0" title="يمين"><AlignRight className="w-3.5 h-3.5" /></Button>
  </div>
);

export function ProfileEditor({ profile, onChange }: ProfileEditorProps) {
  const [activeTab, setActiveTab] = useState('basic');

  const updateProfile = useCallback((updates: Partial<ProfileData>) => {
    onChange({ ...profile, ...updates });
  }, [profile, onChange]);

  const updateTheme = useCallback((updates: Partial<ProfileData['theme']>) => {
    onChange({ ...profile, theme: { ...profile.theme, ...updates } });
  }, [profile, onChange]);

  const addSocialLink = () => {
    const newLink: SocialLink = { id: generateId(), platform: 'instagram', url: '', icon: 'instagram' };
    updateProfile({ socialLinks: [...profile.socialLinks, newLink] });
  };

  const updateSocialLink = (id: string, updates: Partial<SocialLink>) => {
    updateProfile({ socialLinks: profile.socialLinks.map(link => link.id === id ? { ...link, ...updates } : link) });
  };

  const removeSocialLink = (id: string) => {
    updateProfile({ socialLinks: profile.socialLinks.filter(link => link.id !== id) });
  };

  const addMediaFromUpload = (url: string, type: 'image' | 'video') => {
    const newMedia: ProfileMedia = {
      id: generateId(), type, url, width: 'half',
      aspectRatio: type === 'video' ? 'video' : 'square', position: 'center',
    };
    updateProfile({ media: [...profile.media, newMedia] });
  };

  const addYouTubeVideo = (url: string) => {
    const newMedia: ProfileMedia = {
      id: generateId(), type: 'youtube', url, width: 'full', aspectRatio: 'video', position: 'center',
    };
    updateProfile({ media: [...profile.media, newMedia] });
  };

  const addPdfMedia = (url: string) => {
    const newMedia: ProfileMedia = {
      id: generateId(), type: 'pdf', url, width: 'full', aspectRatio: 'portrait', position: 'center',
    };
    updateProfile({ media: [...profile.media, newMedia] });
  };

  const updateMedia = (id: string, updates: Partial<ProfileMedia>) => {
    updateProfile({ media: profile.media.map(m => m.id === id ? { ...m, ...updates } : m) });
  };

  const removeMedia = (id: string) => {
    updateProfile({ media: profile.media.filter(m => m.id !== id) });
  };

  const textBlocks = profile.textBlocks || [];

  const addTextBlock = () => {
    const newBlock: ProfileTextBlock = {
      id: generateId(), content: '', alignment: 'center', fontSize: 'medium', fontFamily: 'font-cairo',
    };
    updateProfile({ textBlocks: [...textBlocks, newBlock] });
  };

  const updateTextBlock = (id: string, updates: Partial<ProfileTextBlock>) => {
    updateProfile({ textBlocks: textBlocks.map(b => b.id === id ? { ...b, ...updates } : b) });
  };

  const removeTextBlock = (id: string) => {
    updateProfile({ textBlocks: textBlocks.filter(b => b.id !== id) });
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 w-full mb-4 h-12 p-1 bg-secondary/50">
          <TabsTrigger value="basic" className="flex items-center justify-center gap-1.5 text-xs data-[state=active]:bg-background">
            <Type className="w-4 h-4" /><span className="hidden sm:inline">الأساسي</span>
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center justify-center gap-1.5 text-xs data-[state=active]:bg-background">
            <Link2 className="w-4 h-4" /><span className="hidden sm:inline">الروابط</span>
          </TabsTrigger>
          <TabsTrigger value="media" className="flex items-center justify-center gap-1.5 text-xs data-[state=active]:bg-background">
            <ImageIcon className="w-4 h-4" /><span className="hidden sm:inline">الوسائط</span>
          </TabsTrigger>
          <TabsTrigger value="theme" className="flex items-center justify-center gap-1.5 text-xs data-[state=active]:bg-background">
            <Palette className="w-4 h-4" /><span className="hidden sm:inline">الثيم</span>
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center justify-center gap-1.5 text-xs data-[state=active]:bg-background">
            <Settings2 className="w-4 h-4" /><span className="hidden sm:inline">متقدم</span>
          </TabsTrigger>
        </TabsList>

        {/* ===== BASIC TAB ===== */}
        <TabsContent value="basic" className="space-y-4 mt-0">
          {/* Profile Image */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <ImageUpload
                  value={profile.avatar}
                  onChange={(url) => updateProfile({ avatar: url })}
                  aspectRatio="avatar"
                  label="صورة البروفايل"
                  className="mx-auto sm:mx-0"
                />
                <div className="flex-1 w-full space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">شكل الصورة</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {avatarStyleOptions.map((style) => (
                        <Button key={style.id} variant={(profile.avatarStyle || 'circle') === style.id ? 'default' : 'outline'}
                          onClick={() => updateProfile({ avatarStyle: style.id as ProfileData['avatarStyle'] })}
                          className="w-full text-xs h-9" size="sm">{style.name}</Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">حجم الصورة</Label>
                    <Select value={profile.avatarSize || 'medium'} onValueChange={(value) => updateProfile({ avatarSize: value as ProfileData['avatarSize'] })}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {avatarSizeOptions.map((size) => <SelectItem key={size.id} value={size.id}>{size.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
                    <Label className="text-xs">موضع الصورة</Label>
                    <AlignmentButtons value={profile.avatarAlignment || 'center'} onChange={(v) => updateProfile({ avatarAlignment: v })} />
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
                    <Label htmlFor="avatarGlow" className="text-xs cursor-pointer">توهج خلف الصورة</Label>
                    <Switch id="avatarGlow" checked={profile.avatarGlow || false} onCheckedChange={(checked) => updateProfile({ avatarGlow: checked })} />
                  </div>

                  {profile.avatarGlow && (
                    <div className="space-y-1">
                      <Label className="text-xs">لون التوهج</Label>
                      <div className="flex gap-2">
                        <Input type="color" value={profile.avatarGlowColor || '#818cf8'} onChange={(e) => updateProfile({ avatarGlowColor: e.target.value })} className="w-10 h-9 p-1 cursor-pointer rounded-lg" />
                        <Input value={profile.avatarGlowColor || '#818cf8'} onChange={(e) => updateProfile({ avatarGlowColor: e.target.value })} className="flex-1 h-9 text-xs" dir="ltr" />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
                    <Label htmlFor="avatarFloat" className="text-xs cursor-pointer">طفو الصورة</Label>
                    <Switch id="avatarFloat" checked={profile.avatarFloat || false} onCheckedChange={(checked) => updateProfile({ avatarFloat: checked })} />
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
                    <Label htmlFor="hideAvatar" className="text-xs cursor-pointer">إخفاء الصورة</Label>
                    <Switch id="hideAvatar" checked={profile.hideAvatar || false} onCheckedChange={(checked) => updateProfile({ hideAvatar: checked })} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Name & Bio */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3 px-4 pt-4">
              <CardTitle className="text-sm font-medium">المعلومات الأساسية</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs">الاسم</Label>
                <Input id="name" value={profile.name} onChange={(e) => updateProfile({ name: e.target.value })} placeholder="أدخل اسمك" className="text-right h-10" />
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
                <Label htmlFor="hideName" className="text-xs cursor-pointer">إخفاء الاسم</Label>
                <Switch id="hideName" checked={profile.hideName || false} onCheckedChange={(checked) => updateProfile({ hideName: checked })} />
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
                <Label className="text-xs">موضع الاسم</Label>
                <AlignmentButtons value={profile.nameAlignment || 'center'} onChange={(v) => updateProfile({ nameAlignment: v })} />
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
                <Label className="text-xs cursor-pointer">خلفية شفافة خلف الاسم</Label>
                <Switch checked={profile.nameBackground || false} onCheckedChange={(checked) => updateProfile({ nameBackground: checked })} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">لون الاسم</Label>
                  <div className="flex gap-2">
                    <Input type="color" value={profile.nameColor} onChange={(e) => updateProfile({ nameColor: e.target.value })} className="w-10 h-10 p-1 cursor-pointer rounded-lg" />
                    <Input value={profile.nameColor} onChange={(e) => updateProfile({ nameColor: e.target.value })} className="flex-1 h-10 text-xs" dir="ltr" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">حجم الاسم</Label>
                  <Select value={profile.nameSize || 'medium'} onValueChange={(value) => updateProfile({ nameSize: value as ProfileData['nameSize'] })}>
                    <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {nameSizeOptions.map((size) => <SelectItem key={size.id} value={size.id}>{size.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2 p-3 rounded-xl bg-secondary/30 border border-border/50">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">توهج الاسم</Label>
                  <Switch checked={profile.nameGlow || false} onCheckedChange={(checked) => updateProfile({ nameGlow: checked })} />
                </div>
                {profile.nameGlow && (
                  <div className="flex gap-2 mt-2">
                    <Input type="color" value={profile.nameGlowColor || '#818cf8'} onChange={(e) => updateProfile({ nameGlowColor: e.target.value })} className="w-10 h-9 p-1 cursor-pointer rounded-lg" />
                    <Input value={profile.nameGlowColor || '#818cf8'} onChange={(e) => updateProfile({ nameGlowColor: e.target.value })} className="flex-1 h-9 text-xs" dir="ltr" placeholder="لون التوهج" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-xs">خط الاسم</Label>
                <Select value={profile.nameFont} onValueChange={(value) => updateProfile({ nameFont: value })}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-80">
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">الخطوط العربية</div>
                    {arabicFonts.map((font) => (
                      <SelectItem key={font.id} value={font.id}>
                        <span className={cn('text-base', font.id === 'font-cairo' && 'font-cairo', font.id === 'font-tajawal' && 'font-tajawal', font.id === 'font-almarai' && 'font-almarai', font.id === 'font-changa' && 'font-changa')}>{font.name} - مرحبا</span>
                      </SelectItem>
                    ))}
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">الخطوط الإنجليزية</div>
                    {englishFonts.map((font) => (
                      <SelectItem key={font.id} value={font.id}>
                        <span className={cn('text-base', font.id === 'font-inter' && 'font-inter', font.id === 'font-poppins' && 'font-poppins', font.id === 'font-roboto' && 'font-roboto', font.id === 'font-montserrat' && 'font-montserrat')}>{font.name} - Hello</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-xs">النبذة التعريفية</Label>
                <Textarea id="bio" value={profile.bio} onChange={(e) => updateProfile({ bio: e.target.value })} placeholder="اكتب نبذة عنك" rows={3} className="text-right resize-none" />
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
                <Label className="text-xs">موضع النبذة</Label>
                <AlignmentButtons value={profile.bioAlignment || 'center'} onChange={(v) => updateProfile({ bioAlignment: v })} />
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
                <Label className="text-xs cursor-pointer">خلفية شفافة خلف النبذة</Label>
                <Switch checked={profile.bioBackground || false} onCheckedChange={(checked) => updateProfile({ bioBackground: checked })} />
              </div>

              <div className="space-y-2 p-3 rounded-xl bg-secondary/30 border border-border/50">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">توهج النبذة</Label>
                  <Switch checked={profile.bioGlow || false} onCheckedChange={(checked) => updateProfile({ bioGlow: checked })} />
                </div>
                {profile.bioGlow && (
                  <div className="flex gap-2 mt-2">
                    <Input type="color" value={profile.bioGlowColor || '#818cf8'} onChange={(e) => updateProfile({ bioGlowColor: e.target.value })} className="w-10 h-9 p-1 cursor-pointer rounded-lg" />
                    <Input value={profile.bioGlowColor || '#818cf8'} onChange={(e) => updateProfile({ bioGlowColor: e.target.value })} className="flex-1 h-9 text-xs" dir="ltr" placeholder="لون التوهج" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-xs">خط النبذة</Label>
                <Select value={profile.bioFont || 'font-cairo'} onValueChange={(value) => updateProfile({ bioFont: value })}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-80">
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">الخطوط العربية</div>
                    {arabicFonts.map((font) => (<SelectItem key={font.id} value={font.id}><span className="text-base">{font.name} - مرحبا</span></SelectItem>))}
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">الخطوط الإنجليزية</div>
                    {englishFonts.map((font) => (<SelectItem key={font.id} value={font.id}><span className="text-base">{font.name} - Hello</span></SelectItem>))}
                  </SelectContent>
                </Select>
              </div>

              {/* Text Blocks */}
              <div className="space-y-3 pt-2 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />قوالب النص
                    {textBlocks.length > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-bold">{textBlocks.length}</span>
                    )}
                  </Label>
                  <Button onClick={addTextBlock} size="sm" variant="outline" className="h-7 text-xs">
                    <Plus className="w-3 h-3 ml-1" />إضافة نص
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground">أضف قصصاً أو شروحات بتصميم شفاف أنيق — شفافيتها تتبع شفافية البطاقات</p>

                {textBlocks.map((block) => (
                  <div key={block.id} className="p-3 rounded-xl bg-secondary/30 border border-border/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-medium">محتوى النص</Label>
                      <Button variant="ghost" size="icon" onClick={() => removeTextBlock(block.id)} className="text-destructive hover:text-destructive h-7 w-7">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <Textarea
                      value={block.content}
                      onChange={(e) => updateTextBlock(block.id, { content: e.target.value })}
                      placeholder="اكتب نصك هنا... (قصة، شرح، معلومات، اقتباس)"
                      rows={5}
                      className="text-right resize-none text-xs"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">حجم الخط</Label>
                        <Select value={block.fontSize || 'medium'} onValueChange={(v) => updateTextBlock(block.id, { fontSize: v as ProfileTextBlock['fontSize'] })}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="small">صغير</SelectItem>
                            <SelectItem value="medium">متوسط</SelectItem>
                            <SelectItem value="large">كبير</SelectItem>
                            <SelectItem value="xlarge">كبير جداً</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">الخط</Label>
                        <Select value={block.fontFamily || 'font-cairo'} onValueChange={(v) => updateTextBlock(block.id, { fontFamily: v })}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent className="max-h-60">
                            {arabicFonts.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                            {englishFonts.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-muted-foreground">موضع النص</Label>
                      <AlignmentButtons value={block.alignment || 'center'} onChange={(v) => updateTextBlock(block.id, { alignment: v })} />
                    </div>
                  </div>
                ))}


              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== SOCIAL TAB ===== */}
        <TabsContent value="social" className="space-y-4 mt-0">
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3 px-4 pt-4">
              <CardTitle className="text-sm font-medium">روابط التواصل</CardTitle>
              <Button onClick={addSocialLink} size="sm" variant="default" className="h-8 text-xs">
                <Plus className="w-3.5 h-3.5 ml-1.5" />إضافة
              </Button>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
              {profile.socialLinks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Link2 className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">لا توجد روابط بعد</p>
                  <p className="text-xs mt-1">اضغط على "إضافة" لإضافة حساباتك</p>
                </div>
              ) : (
                profile.socialLinks.map((link) => {
                  const Icon = getSocialIcon(link.platform);
                  const isCustom = link.platform === 'custom';
                  return (
                    <div key={link.id} className="flex flex-col gap-2 p-3 rounded-xl bg-secondary/30 border border-border/50">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <Select value={link.platform} onValueChange={(value) => {
                          const platform = socialPlatforms.find(p => p.id === value);
                          updateSocialLink(link.id, { platform: value, icon: platform?.icon || 'globe' });
                        }}>
                          <SelectTrigger className="flex-1 h-9 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {socialPlatforms.map((platform) => (<SelectItem key={platform.id} value={platform.id}>{platform.name}</SelectItem>))}
                          </SelectContent>
                        </Select>
                        <Button variant="ghost" size="icon" onClick={() => removeSocialLink(link.id)} className="text-destructive hover:text-destructive h-9 w-9 flex-shrink-0">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      {/* نوع العرض */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateSocialLink(link.id, { displayMode: 'button' })}
                          className={`flex-1 h-8 rounded-lg text-xs font-medium border transition-all flex items-center justify-center gap-1.5 ${(!link.displayMode || link.displayMode === 'button') ? 'border-primary bg-primary/15 text-primary' : 'border-border bg-secondary text-muted-foreground'}`}
                        >
                          <span>▬</span> زر
                        </button>
                        <button
                          onClick={() => updateSocialLink(link.id, { displayMode: 'icon' })}
                          className={`flex-1 h-8 rounded-lg text-xs font-medium border transition-all flex items-center justify-center gap-1.5 ${link.displayMode === 'icon' ? 'border-primary bg-primary/15 text-primary' : 'border-border bg-secondary text-muted-foreground'}`}
                        >
                          <span>⬡</span> أيقونة
                        </button>
                      </div>
                      {/* حجم الأيقونة — يظهر فقط عند اختيار أيقونة */}
                      {link.displayMode === 'icon' && (
                        <div className="flex gap-2">
                          {(['sm', 'md', 'lg'] as const).map(size => (
                            <button
                              key={size}
                              onClick={() => updateSocialLink(link.id, { iconSize: size })}
                              className={`flex-1 h-7 rounded-lg text-xs font-medium border transition-all ${(link.iconSize || 'md') === size ? 'border-primary bg-primary/15 text-primary' : 'border-border bg-secondary text-muted-foreground'}`}
                            >
                              {size === 'sm' ? 'صغير' : size === 'md' ? 'وسط' : 'كبير'}
                            </button>
                          ))}
                        </div>
                      )}
                      {/* إخفاء الخلفية — يظهر فقط عند اختيار أيقونة */}
                      {link.displayMode === 'icon' && (
                        <button
                          onClick={() => updateSocialLink(link.id, { iconNoBg: !link.iconNoBg })}
                          className={`w-full h-7 rounded-lg text-xs font-medium border transition-all ${link.iconNoBg ? 'border-primary bg-primary/15 text-primary' : 'border-border bg-secondary text-muted-foreground'}`}
                        >
                          {link.iconNoBg ? '✓ الخلفية مخفية' : 'إخفاء الخلفية'}
                        </button>
                      )}
                      {isCustom && (
                        <Input value={link.customLabel || ''} onChange={(e) => updateSocialLink(link.id, { customLabel: e.target.value })} placeholder="اسم الزر (مثال: موقعي الإلكتروني)" className="h-9 text-xs text-right" />
                      )}
                      <Input value={link.url} onChange={(e) => updateSocialLink(link.id, { url: e.target.value })} placeholder={isCustom ? "أدخل الرابط الخارجي" : "أدخل الرابط"} className="h-9 text-xs" dir="ltr" />
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== MEDIA TAB ===== */}
        <TabsContent value="media" className="space-y-4 mt-0">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3 px-4 pt-4">
              <CardTitle className="text-sm font-medium">الصور والفيديوهات</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-4">
              <MediaUpload onUpload={addMediaFromUpload} onYouTubeAdd={addYouTubeVideo} hasVideo={false} />

              {profile.media.length > 0 && (
                <div className="space-y-3 mt-4">
                  <p className="text-xs text-muted-foreground">الوسائط المضافة ({profile.media.length})</p>
                  {profile.media.map((media) => (
                    <div key={media.id} className="p-3 rounded-xl bg-secondary/30 border border-border/50">
                      <div className="flex items-start gap-3">
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
                          {media.type === 'image' && media.url && (<img src={media.url} alt={media.caption || 'Image'} className="w-full h-full object-cover" />)}
                          {media.type === 'video' && <Video className="w-6 h-6 text-muted-foreground" />}
                          {media.type === 'youtube' && <Video className="w-6 h-6 text-red-500" />}
                          {media.type === 'pdf' && <FileText className="w-6 h-6 text-blue-500" />}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="text-xs text-muted-foreground capitalize">{media.type}</div>
                          <Input value={media.caption || ''} onChange={(e) => updateMedia(media.id, { caption: e.target.value })} placeholder="وصف (اختياري)" className="text-xs h-8" />
                          {media.type !== 'pdf' && (
                            <div className="grid grid-cols-2 gap-2">
                              <Select value={media.width || 'half'} onValueChange={(value) => updateMedia(media.id, { width: value as ProfileMedia['width'] })}>
                                <SelectTrigger className="text-xs h-8"><SelectValue placeholder="العرض" /></SelectTrigger>
                                <SelectContent>
                                  {mediaWidthOptions.map((o) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
                                </SelectContent>
                              </Select>
                              <Select value={media.aspectRatio || 'auto'} onValueChange={(value) => updateMedia(media.id, { aspectRatio: value as ProfileMedia['aspectRatio'] })}>
                                <SelectTrigger className="text-xs h-8"><SelectValue placeholder="الأبعاد" /></SelectTrigger>
                                <SelectContent>
                                  {mediaAspectOptions.map((o) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeMedia(media.id)} className="text-destructive hover:text-destructive h-8 w-8 flex-shrink-0">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== THEME TAB ===== */}
        <TabsContent value="theme" className="space-y-4 mt-0">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3 px-4 pt-4">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4" />تخصيص المظهر
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-5">
              <div className="space-y-2">
                <Label className="text-xs">نوع الخلفية</Label>
                <div className="grid grid-cols-5 gap-2">
                  {(['color', 'gradient', 'image', 'video', 'animated'] as const).map((type) => (
                    <Button key={type} variant={profile.theme.backgroundType === type ? 'default' : 'outline'} onClick={() => updateTheme({ backgroundType: type })} className="w-full text-xs h-9" size="sm">
                      {type === 'color' ? 'لون' : type === 'gradient' ? 'تدرج' : type === 'image' ? 'صورة' : type === 'video' ? 'فيديو' : 'متحركة'}
                    </Button>
                  ))}
                </div>
              </div>

              {profile.theme.backgroundType === 'color' && (
                <div className="space-y-2">
                  <Label className="text-xs">لون الخلفية</Label>
                  <div className="flex gap-2">
                    <Input type="color" value={profile.theme.backgroundColor} onChange={(e) => updateTheme({ backgroundColor: e.target.value })} className="w-10 h-10 p-1 cursor-pointer rounded-lg" />
                    <Input value={profile.theme.backgroundColor} onChange={(e) => updateTheme({ backgroundColor: e.target.value })} className="flex-1 h-10" dir="ltr" />
                  </div>
                </div>
              )}

              {profile.theme.backgroundType === 'gradient' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs">تدرجات جاهزة</Label>
                    <div className="grid grid-cols-6 gap-2">
                      {gradientPresets.map((preset) => (
                        <button key={preset.id} onClick={() => updateTheme({ gradientFrom: preset.from, gradientTo: preset.to })}
                          className={cn('h-10 rounded-lg transition-all duration-200 border-2', profile.theme.gradientFrom === preset.from ? 'border-primary scale-105' : 'border-transparent hover:scale-105')}
                          style={{ background: `linear-gradient(to bottom right, ${preset.from}, ${preset.to})` }} title={preset.name} />
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs">من</Label>
                      <div className="flex gap-2">
                        <Input type="color" value={profile.theme.gradientFrom} onChange={(e) => updateTheme({ gradientFrom: e.target.value })} className="w-10 h-10 p-1 cursor-pointer rounded-lg" />
                        <Input value={profile.theme.gradientFrom} onChange={(e) => updateTheme({ gradientFrom: e.target.value })} className="flex-1 h-10 text-xs" dir="ltr" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">إلى</Label>
                      <div className="flex gap-2">
                        <Input type="color" value={profile.theme.gradientTo} onChange={(e) => updateTheme({ gradientTo: e.target.value })} className="w-10 h-10 p-1 cursor-pointer rounded-lg" />
                        <Input value={profile.theme.gradientTo} onChange={(e) => updateTheme({ gradientTo: e.target.value })} className="flex-1 h-10 text-xs" dir="ltr" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {profile.theme.backgroundType === 'image' && (
                <div className="space-y-2">
                  <Label className="text-xs">صورة الخلفية</Label>
                  <ImageUpload value={profile.theme.backgroundImage} onChange={(url) => updateTheme({ backgroundImage: url })} aspectRatio="video" label="ارفاق صورة الخلفية" />
                </div>
              )}

              {profile.theme.backgroundType === 'video' && (
                <div className="space-y-2">
                  <Label className="text-xs">رابط فيديو الخلفية</Label>
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
                  <Input
                    placeholder="https://example.com/video.mp4"
                    value={profile.theme.backgroundVideo || ''}
                    onChange={(e) => updateTheme({ backgroundVideo: e.target.value })}
                    dir="ltr"
                    className="h-10 text-xs"
                  />
                  <p className="text-[10px] text-muted-foreground">ادخل رابط مباشر للفيديو (MP4/WebM) – سيتكرر تلقائياً بدون صوت</p>
                </div>
              )}

              {profile.theme.backgroundType === 'animated' && (
                <div className="space-y-4">
                  <Label className="text-xs">اختر خلفية فيديو متحركة</Label>
                  <div className="grid grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
                    {animatedBackgrounds.map((bg) => (
                      <button
                        key={bg.id}
                        onClick={() => updateTheme({ animatedBackground: bg.id })}
                        className={cn(
                          'relative rounded-xl overflow-hidden border-2 transition-all',
                          profile.theme.animatedBackground === bg.id
                            ? 'border-primary ring-2 ring-primary/40'
                            : 'border-border/50 hover:border-primary/50'
                        )}
                        style={{ aspectRatio: '9/16' }}
                        title={bg.name}
                      >
                        <video
                          src={bg.id}
                          autoPlay
                          muted
                          loop
                          playsInline
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] text-center py-1">
                          {bg.name}
                        </div>
                        {profile.theme.animatedBackground === bg.id && (
                          <div className="absolute inset-0 bg-primary/25 flex items-center justify-center">
                            <span className="text-white text-2xl drop-shadow">✓</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">لون النص</Label>
                  <div className="flex gap-2">
                    <Input type="color" value={profile.theme.textColor} onChange={(e) => updateTheme({ textColor: e.target.value })} className="w-10 h-10 p-1 cursor-pointer rounded-lg" />
                    <Input value={profile.theme.textColor} onChange={(e) => updateTheme({ textColor: e.target.value })} className="flex-1 h-10 text-xs" dir="ltr" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">اللون المميز</Label>
                  <div className="flex gap-2">
                    <Input type="color" value={profile.theme.accentColor} onChange={(e) => updateTheme({ accentColor: e.target.value })} className="w-10 h-10 p-1 cursor-pointer rounded-lg" />
                    <Input value={profile.theme.accentColor} onChange={(e) => updateTheme({ accentColor: e.target.value })} className="flex-1 h-10 text-xs" dir="ltr" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">شكل الأزرار</Label>
                <div className="grid grid-cols-3 gap-2">
                  {([{ id: 'rounded', label: 'مستدير' }, { id: 'pill', label: 'كبسولة' }, { id: 'square', label: 'مربع' }] as const).map((style) => (
                    <Button key={style.id} variant={profile.theme.buttonStyle === style.id ? 'default' : 'outline'} onClick={() => updateTheme({ buttonStyle: style.id })} className="w-full text-xs h-9" size="sm">{style.label}</Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== ADVANCED TAB ===== */}
        <TabsContent value="advanced" className="space-y-4 mt-0">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3 px-4 pt-4">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Settings2 className="w-4 h-4" />إعدادات متقدمة
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-5">
              <div className="space-y-2">
                <Label className="text-xs">نمط الحدود</Label>
                <div className="grid grid-cols-4 gap-2">
                  {([{ id: 'none', label: 'بدون' }, { id: 'solid', label: 'صلب' }, { id: 'dashed', label: 'متقطع' }, { id: 'glow', label: 'متوهج' }] as const).map((style) => (
                    <Button key={style.id} variant={(profile.theme.borderStyle || 'none') === style.id ? 'default' : 'outline'} onClick={() => updateTheme({ borderStyle: style.id })} className="w-full text-xs h-9" size="sm">{style.label}</Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">نمط الظل</Label>
                <div className="grid grid-cols-4 gap-2">
                  {([{ id: 'none', label: 'بدون' }, { id: 'soft', label: 'ناعم' }, { id: 'hard', label: 'قوي' }, { id: 'neon', label: 'نيون' }] as const).map((style) => (
                    <Button key={style.id} variant={(profile.theme.shadowStyle || 'soft') === style.id ? 'default' : 'outline'} onClick={() => updateTheme({ shadowStyle: style.id })} className="w-full text-xs h-9" size="sm">{style.label}</Button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">شفافية البطاقات</Label>
                  <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">{profile.theme.cardOpacity || 10}%</span>
                </div>
                <Slider value={[profile.theme.cardOpacity || 10]} onValueChange={([value]) => updateTheme({ cardOpacity: value })} min={0} max={100} step={5} className="w-full" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">لون خلفية البطاقات</Label>
                  <div className="flex gap-2">
                    <Input type="color" value={profile.theme.cardBackground?.startsWith('rgba') ? '#ffffff' : profile.theme.cardBackground} onChange={(e) => updateTheme({ cardBackground: e.target.value })} className="w-10 h-10 p-1 cursor-pointer rounded-lg" />
                    <Input value={profile.theme.cardBackground} onChange={(e) => updateTheme({ cardBackground: e.target.value })} className="flex-1 h-10 text-xs" dir="ltr" placeholder="rgba(...)" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">لون نص البطاقات</Label>
                  <div className="flex gap-2">
                    <Input type="color" value={profile.theme.cardTextColor} onChange={(e) => updateTheme({ cardTextColor: e.target.value })} className="w-10 h-10 p-1 cursor-pointer rounded-lg" />
                    <Input value={profile.theme.cardTextColor} onChange={(e) => updateTheme({ cardTextColor: e.target.value })} className="flex-1 h-10 text-xs" dir="ltr" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

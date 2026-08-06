'use client';

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Share2, Link2, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  profileName?: string;
}

export function QRCodeModal({ isOpen, onClose, url, profileName }: QRCodeModalProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && url) {
      QRCode.toDataURL(url, {
        width: 400,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
        errorCorrectionLevel: 'H',
      }).then((dataUrl) => {
        setQrCodeUrl(dataUrl);
      }).catch((err) => {
        console.error('Error generating QR code:', err);
      });
    }
  }, [isOpen, url]);

  const handleDownload = () => {
    if (!qrCodeUrl) return;
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `${profileName || 'profile'}-qrcode.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('تم حفظ الباركود');
  };

  const handleShare = async () => {
    if (!qrCodeUrl) return;
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const file = new File([blob], `${profileName || 'profile'}-qrcode.png`, { type: 'image/png' });
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({ title: `${profileName || 'Profile'} QR Code`, files: [file] });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('تم نسخ الرابط');
      }
    } catch {
      await navigator.clipboard.writeText(url);
      toast.success('تم نسخ الرابط');
    }
  };

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('تم نسخ الرابط 📋');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">باركود الملف الشخصي</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          {qrCodeUrl ? (
            <div className="bg-white p-4 rounded-2xl shadow-lg">
              <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64 object-contain" />
            </div>
          ) : (
            <div className="w-64 h-64 bg-muted rounded-2xl flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          )}

          {/* الرابط الأصلي */}
          <div className="w-full rounded-xl border border-border bg-secondary/40 px-3 py-2.5 flex items-center gap-2">
            <Link2 className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="flex-1 text-sm font-medium text-foreground truncate" dir="ltr">{url}</span>
            <Button size="sm" variant="ghost" className="h-7 px-2 shrink-0" onClick={handleCopyUrl}>
              <Copy className={`w-3.5 h-3.5 ${copied ? 'text-emerald-500' : ''}`} />
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center max-w-xs">
            امسح الباركود بكاميرا هاتفك للوصول للملف الشخصي
          </p>

          <div className="flex gap-3 w-full">
            <Button onClick={handleDownload} className="flex-1" disabled={!qrCodeUrl}>
              <Download className="w-4 h-4 ml-2" />
              حفظ
            </Button>
            <Button onClick={handleShare} variant="outline" className="flex-1" disabled={!qrCodeUrl}>
              <Share2 className="w-4 h-4 ml-2" />
              مشاركة
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

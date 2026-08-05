'use client';

import { useState } from 'react';
import { signIn, signUp } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { X, Eye, EyeOff, Loader2, Sparkles, User, Mail, Lock, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  title?: string;
};

export function AuthModal({ isOpen, onClose, onSuccess, title }: AuthModalProps) {
  const { refresh } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [registered, setRegistered] = useState(false);

  const [identifier, setIdentifier] = useState(''); // email or username for login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (mode === 'login') {
      if (!identifier) errs.identifier = 'البريد الإلكتروني أو اسم المستخدم مطلوب';
      if (!password) errs.password = 'كلمة المرور مطلوبة';
    } else {
      if (!username) errs.username = 'اسم المستخدم مطلوب';
      else if (username.length < 3) errs.username = 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل';
      else if (!/^[a-zA-Z0-9_]+$/.test(username)) errs.username = 'يسمح فقط بالحروف والأرقام والشرطة السفلية';
      if (!email) errs.email = 'البريد الإلكتروني مطلوب';
      else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'البريد الإلكتروني غير صحيح';
      if (!password) errs.password = 'كلمة المرور مطلوبة';
      else if (password.length < 6) errs.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    }
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    try {
      if (mode === 'login') {
        const { data, error } = await signIn(identifier, password);
        if (error) {
          toast.error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
          return;
        }
        if (data) {
          await refresh();
          toast.success('تم تسجيل الدخول بنجاح 👋');
          onSuccess?.();
          onClose();
        }
      } else {
        const { data, error } = await signUp(email, password, username);
        if (error) {
          toast.error((error as {message: string}).message || 'حدث خطأ أثناء إنشاء الحساب');
          return;
        }
        if (data) {
          setRegistered(true);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // شاشة نجاح التسجيل
  if (registered) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" dir="rtl">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative z-10 w-full max-w-sm">
          <div className="bg-card border border-border rounded-3xl shadow-2xl overflow-hidden p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-xl font-black text-foreground mb-2">تم إنشاء الحساب! 🎉</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              تم إرسال رسالة تأكيد إلى بريدك الإلكتروني.<br />
              افتح بريدك واضغط على رابط التأكيد ثم سجّل دخولك.
            </p>
            <button
              onClick={() => { setRegistered(false); setMode('login'); setPassword(''); }}
              className="w-full py-3 rounded-xl bg-foreground text-background text-sm font-bold hover:opacity-90 transition-all"
            >
              تسجيل الدخول
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" dir="rtl">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm">
        <div className="bg-card border border-border rounded-3xl shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="relative px-6 pt-6 pb-4">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-muted transition-all"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/20 to-violet-500/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
            </div>
            <h2 className="text-xl font-black text-foreground text-right">
              {title || (mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب جديد')}
            </h2>
            <p className="text-sm text-muted-foreground mt-1 text-right">
              {mode === 'login'
                ? 'سجّل دخولك بالبريد الإلكتروني أو اسم المستخدم'
                : 'أنشئ حساباً مجانياً للبدء'}
            </p>
          </div>

          {/* Tabs */}
          <div className="px-6 mb-5">
            <div className="flex rounded-xl bg-secondary p-1">
              {(['login', 'register'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setErrors({}); setRegistered(false); }}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                    mode === m
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {m === 'login' ? 'تسجيل الدخول' : 'حساب جديد'}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="px-6 pb-6 space-y-4">

            {mode === 'login' ? (
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">البريد الإلكتروني أو اسم المستخدم</label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="example@email.com أو your_username"
                    dir="ltr"
                    className={`w-full pr-10 pl-4 py-3 rounded-xl bg-secondary border text-sm font-medium placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all ${
                      errors.identifier ? 'border-destructive' : 'border-border'
                    }`}
                  />
                </div>
                {errors.identifier && <p className="text-xs text-destructive mt-1">{errors.identifier}</p>}
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">اسم المستخدم</label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase())}
                      placeholder="your_username"
                      dir="ltr"
                      className={`w-full pr-10 pl-4 py-3 rounded-xl bg-secondary border text-sm font-medium placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all ${
                        errors.username ? 'border-destructive' : 'border-border'
                      }`}
                    />
                  </div>
                  {errors.username && <p className="text-xs text-destructive mt-1">{errors.username}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">البريد الإلكتروني</label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@email.com"
                      dir="ltr"
                      className={`w-full pr-10 pl-4 py-3 rounded-xl bg-secondary border text-sm font-medium placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all ${
                        errors.email ? 'border-destructive' : 'border-border'
                      }`}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  dir="ltr"
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  className={`w-full pr-10 pl-10 py-3 rounded-xl bg-secondary border text-sm font-medium placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all ${
                    errors.password ? 'border-destructive' : 'border-border'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-foreground text-background text-sm font-black hover:opacity-90 disabled:opacity-60 transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري المعالجة...</span>
                </>
              ) : (
                <span>{mode === 'login' ? 'تسجيل الدخول' : 'إنشاء الحساب'}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

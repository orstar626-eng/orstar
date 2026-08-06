# 🚀 إعداد Supabase للمشروع

## الخطوات المطلوبة

### 1. إنشاء مشروع Supabase
1. اذهب إلى [supabase.com](https://supabase.com) وأنشئ حساباً
2. أنشئ مشروعاً جديداً (New Project)
3. احتفظ بكلمة مرور قاعدة البيانات في مكان آمن

### 2. تشغيل SQL Schema
1. افتح **SQL Editor** في لوحة تحكم Supabase
2. أنشئ **New query**
3. انسخ محتوى الملف `scripts/002_supabase_auth_schema.sql` والصقه
4. اضغط **Run** لتنفيذ الأوامر

### 3. إعداد متغيرات البيئة
1. انسخ الملف `.env.local.example` إلى `.env.local`
2. افتح **Settings > API** في لوحة تحكم Supabase
3. انسخ **Project URL** إلى `NEXT_PUBLIC_SUPABASE_URL`
4. انسخ **anon public** key إلى `NEXT_PUBLIC_SUPABASE_ANON_KEY`

```bash
cp .env.local.example .env.local
# ثم عدّل القيم في .env.local
```

### 4. تثبيت التبعيات وتشغيل المشروع
```bash
pnpm install
pnpm dev
```

---

## ما تم تغييره

### ✅ نظام المصادقة
- تسجيل حساب جديد بـ: البريد الإلكتروني + كلمة المرور + اسم المستخدم
- تسجيل الدخول بـ: البريد الإلكتروني + كلمة المرور
- تسجيل الخروج
- حماية إنشاء الصفحات والمتاجر (يتطلب تسجيل دخول)

### ✅ روابط قصيرة تلقائية
- عند حفظ الصفحة: يُنشأ رابط قصير تلقائياً بدون is.gd
- الرابط محفوظ في Supabase ولا يتغير عند التعديل
- مثال: `yoursite.com/p/abc123`
- مثال متجر: `yoursite.com/store/sabc12`

### ✅ حفظ البيانات في Supabase
- جميع بيانات الصفحات والمتاجر محفوظة في قاعدة بيانات Supabase
- كل مستخدم يرى فقط صفحاته ومتاجره
- الصفحات والمتاجر متاحة للعموم عبر روابطها القصيرة

### ✅ إزالة التحذير
- تم إزالة رسالة التحذير "عندما تقوم بعمل تغيرات سيتم إنشاء رابط جديد"
- الرابط الآن ثابت ولا يتغير عند التعديل

---

## هيكل قاعدة البيانات

```
auth.users          ← Supabase built-in auth
user_profiles       ← username + email per user
profiles            ← profile pages (linked to user, with short_id)
stores              ← stores (linked to user, with short_id)
```

## Row Level Security
- كل مستخدم يمكنه **قراءة** الصفحات والمتاجر العامة
- كل مستخدم يمكنه فقط **تعديل وحذف** صفحاته ومتاجره الخاصة

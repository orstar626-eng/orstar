import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 30;

async function uploadToFreeImageHost(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');

  const form = new URLSearchParams();
  form.append('key', '6d207e02198a847aa98d0a2a901485a5');
  form.append('source', base64);
  form.append('format', 'json');

  const response = await fetch('https://freeimage.host/api/1/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  });

  if (!response.ok) throw new Error(`freeimage.host error: ${response.status}`);
  const data = await response.json();
  if (data.status_code === 200 && data.image?.url) return data.image.url;
  throw new Error('freeimage.host: لم يتم الحصول على رابط');
}

async function uploadToImgur(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');

  const form = new FormData();
  form.append('image', base64);
  form.append('type', 'base64');

  const response = await fetch('https://api.imgur.com/3/image', {
    method: 'POST',
    headers: { Authorization: 'Client-ID 546c25a59c58ad7' },
    body: form,
  });

  if (!response.ok) throw new Error(`imgur error: ${response.status}`);
  const data = await response.json();
  if (data.success && data.data?.link) return data.data.link;
  throw new Error('imgur: لم يتم الحصول على رابط');
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) return NextResponse.json({ error: 'لم يتم إرفاق ملف' }, { status: 400 });
    if (!file.type.startsWith('image/')) return NextResponse.json({ error: 'يرجى رفع ملف صورة صالح' }, { status: 400 });
    if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: 'حجم الصورة يجب أن يكون أقل من 10 ميجابايت' }, { status: 400 });

    const errors: string[] = [];

    // 1. freeimage.host - no key needed
    try {
      const url = await uploadToFreeImageHost(file);
      return NextResponse.json({ url });
    } catch (e: any) { errors.push(`freeimage.host: ${e.message}`); }

    // 2. imgur - anonymous upload, no key needed
    try {
      const url = await uploadToImgur(file);
      return NextResponse.json({ url });
    } catch (e: any) { errors.push(`imgur: ${e.message}`); }

    return NextResponse.json(
      { error: 'فشل رفع الصورة، يرجى المحاولة مرة أخرى', details: errors },
      { status: 500 }
    );

  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'حدث خطأ غير متوقع' }, { status: 500 });
  }
}

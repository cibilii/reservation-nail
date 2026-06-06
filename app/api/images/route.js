import path from "path";
import { NextResponse } from "next/server";
import { readdir, unlink, writeFile } from "fs/promises";

const IMAGES_DIR = path.join(process.cwd(), 'public', 'images');

export async function GET() {
  try {
    await ensureDir(IMAGES_DIR);
    const files = await readdir(IMAGES_DIR);
    const imageFiles = files.filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
    const images = imageFiles.map(file => ({
      name: file,
      url: `/images/${file}`
    }));
    return NextResponse.json(images);
  } catch (error) {
    return NextResponse.json({ error: 'خطا در خواندن پوشه تصاویر' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await ensureDir(IMAGES_DIR);
    const data = await req.formData();
    const file = data.get('file');
    if (!file) return NextResponse.json({ error: 'فایلی انتخاب نشده' }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const originalName = file.name;
    const ext = path.extname(originalName).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
      return NextResponse.json({ error: 'فرمت فایل مجاز نیست' }, { status: 400 });
    }

    const filename = Date.now() + '-' + Math.random().toString(36).substring(2, 8) + ext;
    const filePath = path.join(IMAGES_DIR, filename);
    await writeFile(filePath, buffer);
    return NextResponse.json({ success: true, filename });
  } catch (error) {
    return NextResponse.json({ error: 'خطا در ذخیره‌سازی فایل' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const filename = searchParams.get('file');
    if (!filename) return NextResponse.json({ error: 'نام فایل ضروری است' }, { status: 400 });

    const filePath = path.join(IMAGES_DIR, filename);
    await unlink(filePath);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'خطا در حذف فایل' }, { status: 500 });
  }
}

async function ensureDir(dir) {
  const { mkdir } = await import('fs/promises');
  try {
    await mkdir(dir, { recursive: true });
  } catch (error) {
    // اگر پوشه وجود دارد، خطا نادیده گرفته شود
    if (error.code !== 'EEXIST') throw error;
  }
}
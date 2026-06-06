"use client";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// app/admin/images/page.js

export default function AdminImages() {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const fetchImages = async () => {
    try {
      const res = await fetch('/api/images');
      const data = await res.json();
      if (Array.isArray(data)) setImages(data);
      else setImages([]);
    } catch {
      toast.error('خطا در دریافت لیست تصاویر');
    }
  };

  useEffect(() => { fetchImages(); }, []);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // فقط پسوندهای مجاز
    if (!file.name.match(/\.(jpg|jpeg|png|webp)$/i)) {
      toast.error('فقط فایل‌های تصویری (jpg, png, webp) مجاز هستند');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/images', { method: 'POST', body: formData });
      if (res.ok) {
        toast.success('عکس با موفقیت آپلود شد');
        fetchImages();
      } else {
        const data = await res.json();
        toast.error(data.error || 'خطا در آپلود');
      }
    } catch {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (filename) => {
    if (!confirm(`آیا از حذف "${filename}" اطمینان دارید؟`)) return;
    try {
      const res = await fetch(`/api/images?file=${encodeURIComponent(filename)}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('تصویر حذف شد');
        fetchImages();
      } else {
        const data = await res.json();
        toast.error(data.error || 'خطا در حذف');
      }
    } catch {
      toast.error('خطا در ارتباط با سرور');
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-gradient mb-8">🖼️ مدیریت تصاویر گالری</h1>

      {/* بخش آپلود */}
      <div className="glass-card p-6 mb-10">
        <h2 className="text-lg font-bold mb-4">افزودن عکس جدید</h2>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            ref={fileInputRef}
            className="block w-full text-sm text-purple-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-purple-500 file:text-white hover:file:bg-purple-600"
          />
          {uploading && (
            <span className="text-purple-400 flex items-center gap-1">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              در حال آپلود...
            </span>
          )}
        </div>
        <p className="text-xs text-purple-300/60 mt-3">پسوندهای مجاز: jpg, jpeg, png, webp</p>
      </div>

      {/* لیست تصاویر */}
      <h2 className="text-xl font-bold mb-4">تصاویر موجود ({images.length})</h2>
      {images.length === 0 ? (
        <div className="text-center py-16 glass-card">
          <span className="text-5xl block mb-4">📭</span>
          <p className="opacity-50">هنوز هیچ تصویری بارگذاری نشده است.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img, idx) => (
            <div key={idx} className="glass-card overflow-hidden group relative">
              <img
                src={img.url}
                alt={img.name}
                className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                <button
                  onClick={() => handleDelete(img.name)}
                  className="opacity-0 group-hover:opacity-100 bg-red-500 text-white px-3 py-1 rounded-lg text-sm transition-opacity"
                >
                  حذف
                </button>
              </div>
              <div className="p-2 text-xs text-center opacity-60 truncate">{img.name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AdminProducts() {
  const [services, setServices] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', price: '', duration: '', description: '', image: null });
  const router = useRouter();

  useEffect(() => {
    const auth = localStorage.getItem('admin-authenticated');
    if (!auth) {
      router.push('/admin/login');
    } else {
      loadServices();
    }
  }, []);

  async function loadServices() {
    const res = await fetch('/api/services');
    const data = await res.json();
    setServices(data);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function handleFile(e) {
    setForm(prev => ({ ...prev, image: e.target.files[0] }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('price', form.price);
    formData.append('duration', form.duration);
    formData.append('description', form.description);
    if (form.image) formData.append('image', form.image);

    const url = editing ? `/api/services/${editing.id}` : '/api/services';
    const method = editing ? 'PUT' : 'POST';

    const res = await fetch(url, { method, body: formData });
    if (res.ok) {
      toast.success(editing ? 'سرویس ویرایش شد' : 'سرویس جدید اضافه شد');
      setEditing(null);
      setForm({ name: '', price: '', duration: '', description: '', image: null });
      loadServices();
    } else {
      const err = await res.json();
      toast.error(err.error || 'خطا');
    }
  }

  async function handleDelete(id) {
    if (confirm('آیا مطمئن هستید؟')) {
      const res = await fetch(`/api/services/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('حذف شد');
        loadServices();
      } else {
        toast.error('خطا در حذف');
      }
    }
  }

  function startEdit(service) {
    setEditing(service);
    setForm({
      name: service.name,
      price: service.price.toString(),
      duration: service.duration.toString(),
      description: service.description,
      image: null, // for edit we don't pre‑select file
    });
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">مدیریت سرویس‌ها</h1>
        <button onClick={() => router.push('/admin/dashboard')} className="text-blue-600 underline">
          بازگشت به داشبورد
        </button>
      </div>

      {/* فرم افزودن/ویرایش */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow mb-6">
        <h2 className="text-xl font-bold mb-4">{editing ? 'ویرایش سرویس' : 'افزودن سرویس جدید'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="نام سرویس"
            className="border p-2 rounded w-full"
            required
          />
          <input
            name="price"
            value={form.price}
            onChange={handleChange}
            type="number"
            placeholder="قیمت (تومان)"
            className="border p-2 rounded w-full"
            required
          />
          <input
            name="duration"
            value={form.duration}
            onChange={handleChange}
            type="number"
            placeholder="مدت (دقیقه)"
            className="border p-2 rounded w-full"
            required
          />
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="توضیحات"
            className="border p-2 rounded w-full"
            rows="3"
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleFile}className="border p-2 rounded w-full"
          />
        </div>
        <div className="mt-4 flex gap-2">
          <button type="submit" className="btn-primary">
            {editing ? 'ذخیره تغییرات' : 'افزودن'}
          </button>
          {editing && (
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="btn-primary bg-gray-500 hover:bg-gray-600"
            >
              انصراف
            </button>
          )}
        </div>
      </form>

      {/* لیست سرویس‌ها */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-bold mb-4">سرویس‌های موجود</h2>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <div key={s.id} className="border rounded p-3 flex flex-col items-center">
              {s.image && (
                <img src={s.image} alt={s.name} className="w-32 h-32 object-cover rounded mb-2" />
              )}
              <h3 className="font-bold">{s.name}</h3>
              <p className="text-sm text-gray-500">{s.duration} دقیقه - {s.price.toLocaleString()} تومان</p>
              <div className="flex gap-2 mt-2">
                <button onClick={() => startEdit(s)} className="text-blue-600 underline text-sm">ویرایش</button>
                <button onClick={() => handleDelete(s.id)} className="text-red-600 underline text-sm">حذف</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
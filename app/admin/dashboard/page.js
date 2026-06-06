"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { StatsCardSkeleton, TableRowSkeleton } from "@/app/components/Skeleton";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    today: 0,
    thisWeek: 0,
    active: 0,
    cancelled: 0,
  });

  const hasFetched = useRef(false);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/bookings');
      if (!res.ok) throw new Error('خطا در دریافت داده‌ها');
      const data = await res.json();
      setBookings(data);

      const today = new Date().toISOString().split('T')[0];
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());

      const todayBookings = data.filter((b) => b.date === today && b.status === 'confirmed');
      const weekBookings = data.filter(
        (b) => new Date(b.date) >= weekStart && b.status === 'confirmed'
      );
      const activeBookings = data.filter((b) => b.status === 'confirmed');
      const cancelledBookings = data.filter((b) => b.status === 'cancelled');

      setStats({
        today: todayBookings.length,
        thisWeek: weekBookings.length,
        active: activeBookings.length,
        cancelled: cancelledBookings.length,
      });
    } catch {
      toast.error('خطا در دریافت رزروها');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchBookings();
    }
  }, [router, fetchBookings]);

  useEffect(() => {
    const backupInterval = setInterval(async () => {
      try {
        const res = await fetch('/api/backup');
        if (res.ok) console.log('✅ Backup created');
      } catch (err) {
        console.error('❌ Backup failed:', err);
      }
    }, 24 * 60 * 60 * 1000);

    return () => clearInterval(backupInterval);
  }, []);

  const handleCancel = async (id) => {
    if (!confirm('آیا از کنسل کردن این رزرو مطمئن هستید؟')) return;

    try {
      const res = await fetch('/api/bookings/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
        fetchBookings();
      } else {
        toast.error(data.error || 'خطا در کنسل کردن');
      }
    } catch {
      toast.error('خطا در ارتباط با سرور');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminLoginTime');
    toast.info('👋 از پنل خارج شدید');
    router.push('/admin/login');
  };

  const getStatusBadge = (status) => {
    if (status === 'confirmed') return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (status === 'cancelled') return 'bg-red-500/20 text-red-400 border-red-500/30';
    return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
  };

  const getStatusText = (status) => {
    if (status === 'confirmed') return '✅ تأیید شده';
    if (status === 'cancelled') return '❌ کنسل شده';
    return '⏳ در انتظار';
  };

  return (
    <div className="min-h-screen p-4 md:p-8 relative">
      {/* ذرات پس‌زمینه */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-fuchsia-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* ==========================================
            هدر داشبورد
            ========================================== */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 animate-fade-in-up">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 glass-card rounded-xl flex items-center justify-center">
                <span className="text-xl">💎</span>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gradient">
                  داشبورد مدیریت
                </h1>
                <p className="text-xs opacity-40 mt-0.5">
                  {new Date().toLocaleDateString('fa-IR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Link href="/admin/images" className="glass-card px-4 py-2.5 text-sm hover:bg-white/10 transition-all duration-300 flex items-center gap-2">
  🖼️ مدیریت تصاویر
</Link>
            <Link
              href="/"
              className="glass-card px-4 py-2.5 text-sm hover:bg-white/10 transition-all duration-300 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              سایت اصلی
            </Link>
            <button
              onClick={handleLogout}
              className="glass-card bg-red-500/10 border-red-500/20 px-4 py-2.5 text-sm hover:bg-red-500/20 transition-all duration-300 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
              </svg>
              خروج
            </button>
          </div>
        </div>

        {/* ==========================================
            کارت‌های آمار
            ========================================== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger-children">
          {loading ? (
            [1, 2, 3, 4].map(i => <StatsCardSkeleton key={i} />)
          ) : (
            <>
              <StatsCard
                title="رزروهای امروز"
                value={stats.today}
                color="from-blue-500 to-cyan-500"
                icon="📅"
                subtitle="امروز"
              />
              <StatsCard
                title="این هفته"
                value={stats.thisWeek}
                color="from-emerald-500 to-green-500"
                icon="📊"
                subtitle="۷ روز اخیر"
              />
              <StatsCard
                title="فعال"
                value={stats.active}
                color="from-purple-500 to-fuchsia-500"
                icon="✅"
                subtitle="تأیید شده"
              />
              <StatsCard
                title="کنسل شده"
                value={stats.cancelled}
                color="from-red-500 to-rose-500"
                icon="❌"
                subtitle="لغو شده"
              />
            </>
          )}
        </div>

        {/* ==========================================
            جدول رزروها
            ========================================== */}
        <div className="glass-card overflow-hidden animate-fade-in-up animation-delay-200">
          
          {/* هدر جدول */}
          <div className="p-5 border-b border-white/5 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold">📋 لیست رزروها</h2>
              <p className="text-xs opacity-40 mt-0.5">مدیریت تمام رزروهای ثبت شده</p>
            </div>
            {!loading && (
              <span className="text-xs opacity-40 bg-white/5 px-3 py-1 rounded-full">
                {bookings.length} رزرو
              </span>
            )}
          </div>

          {/* جدول */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5">
                  <th className="py-4 px-4 text-right text-xs font-medium opacity-50">#</th>
                  <th className="py-4 px-4 text-right text-xs font-medium opacity-50">نام مشتری</th>
                  <th className="py-4 px-4 text-right text-xs font-medium opacity-50">موبایل</th>
                  <th className="py-4 px-4 text-right text-xs font-medium opacity-50">تاریخ</th>
                  <th className="py-4 px-4 text-right text-xs font-medium opacity-50">ساعت</th>
                  <th className="py-4 px-4 text-center text-xs font-medium opacity-50">وضعیت</th>
                  <th className="py-4 px-4 text-right text-xs font-medium opacity-50">خدمات</th>
                  <th className="py-4 px-4 text-center text-xs font-medium opacity-50">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [1, 2, 3, 4, 5].map(i => <TableRowSkeleton key={i} />)
                ) : bookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center">
                      <div className="text-5xl mb-4 opacity-30">📭</div>
                      <p className="opacity-30 text-lg">هیچ رزروی ثبت نشده است</p>
                      <p className="opacity-20 text-sm mt-1">رزروهای جدید در اینجا نمایش داده می‌شوند</p>
                    </td>
                  </tr>
                ) : (
                  bookings.map((booking, index) => (
                    <tr
                      key={booking.id}
                      className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="py-4 px-4">
                        <span className="opacity-40 text-sm">#{booking.id}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-sm">
                            {booking.name.charAt(0)}
                          </div>
                          <span className="font-medium text-sm">{booking.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-xs opacity-50" dir="ltr">{booking.phone}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-xs opacity-70">
                          {booking.jalaliDate || booking.date}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="glass-card px-2 py-1 text-xs font-mono">
                          {booking.time}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(booking.status)}`}>
                          {getStatusText(booking.status)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-xs opacity-50 max-w-[150px] truncate block">
                          {booking.services?.map(s => s.name).join('، ')}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        {booking.status === 'confirmed' ? (
                          <button
                            onClick={() => handleCancel(booking.id)}
                            className="glass-card bg-red-500/10 border-red-500/20 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/20 transition-all duration-300"
                          >
                            لغو رزرو
                          </button>
                        ) : (
                          <span className="text-xs opacity-30">---</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* فوتر جدول */}
          {!loading && bookings.length > 0 && (
            <div className="p-4 border-t border-white/5 flex justify-between items-center text-xs opacity-40">
              <span>نمایش {bookings.length} رزرو</span>
              <span>آخرین بروزرسانی: {new Date().toLocaleTimeString('fa-IR')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// کامپوننت کارت آمار
// ==========================================
function StatsCard({ title, value, color, icon, subtitle }) {
  return (
    <div className="glass-card p-5 group hover:scale-105 transition-all duration-300 overflow-hidden relative">
      {/* Gradient background on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-3xl`}></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs opacity-40 block mb-1">{title}</span>
            <span className="text-3xl font-bold text-gradient">{value}</span>
          </div>
          <div className="text-3xl group-hover:scale-125 transition-transform duration-300">
            {icon}
          </div>
        </div>
        
        <div className="flex items-center gap-2 pt-3 border-t border-white/5">
          <div className={`h-1.5 w-1.5 rounded-full bg-gradient-to-r ${color}`}></div>
          <span className="text-xs opacity-40">{subtitle}</span>
        </div>
      </div>
    </div>
  );
}
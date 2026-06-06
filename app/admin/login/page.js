"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

export default function AdminLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    await new Promise((resolve) => setTimeout(resolve, 800));

    if (formData.username === ADMIN_USERNAME && formData.password === ADMIN_PASSWORD) {
      const token = btoa(`${ADMIN_USERNAME}:${Date.now()}`);
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminLoginTime', new Date().toISOString());

      toast.success('🎉 ورود موفقیت‌آمیز. به داشبورد خوش آمدید!');
      router.push('/admin/dashboard');
    } else {
      setError('نام کاربری یا رمز عبور اشتباه است.');
      toast.error('نام کاربری یا رمز عبور اشتباه است.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* ذرات پس‌زمینه */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-fuchsia-500/20 rounded-full blur-3xl animate-float animation-delay-300"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* کارت لاگین */}
        <div className="glass-card p-8 md:p-10 animate-fade-in-up">
          
          {/* هدر کارت */}
          <div className="text-center mb-8">
            {/* آیکون با انیمیشن */}
            <div className="relative mx-auto mb-6 w-24 h-24">
              <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl animate-pulse-glow"></div>
              <div className="relative glass-card rounded-full w-full h-full flex items-center justify-center animate-float">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-purple-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gradient mb-2">
              پنل مدیریت
            </h1>
            <p className="text-sm opacity-50">
              به پنل مدیریت سالن زیبایی نیل خوش آمدید
            </p>
          </div>

          {/* فرم */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* نام کاربری */}
            <div className="input-floating">
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder=" "
                autoComplete="username"
                required
              />
              <label>👤 نام کاربری</label>
            </div>

            {/* رمز عبور */}
            <div className="input-floating">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder=" "
                autoComplete="current-password"
                required
              />
              <label>🔒 رمز عبور</label>
            </div>

            {/* پیام خطا */}
            {error && (
              <div className="glass-card bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm text-center animate-fade-in-up">
                ⚠️ {error}
              </div>
            )}

            {/* دکمه ورود */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-lg py-4 group"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  در حال ورود...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  🔐 ورود به پنل
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 group-hover:translate-x-1 transition-transform"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              )}
            </button>
          </form>

          {/* لینک بازگشت */}
          <div className="text-center mt-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-sm opacity-40 hover:opacity-70 transition-opacity"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              بازگشت به سایت
            </Link>
          </div>
        </div>

        {/* فوتر */}
        <p className="text-center text-xs opacity-20 mt-6">
          © {new Date().getFullYear()} سالن زیبایی نیل | نسخه مدیریت
        </p>
      </div>
    </div>
  );
}
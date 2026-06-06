"use client";
import BookingSteps from "./components/BookingSteps";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { CardSkeleton, SlotsSkeleton } from "./components/Skeleton";

/* ========== توابع تاریخ ========== */
function toJalaliDisplay(dateStr) {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr + "T00:00:00");
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric", month: "long", day: "numeric", weekday: "long",
    }).format(date);
  } catch { return dateStr; }
}

/* ========== سرویس‌ها ========== */
const SERVICES = [
  { id: 1, name: "مانیکور کلاسیک", duration: 45, price: 250000, icon: "💅", description: "فرم‌دهی، کوتیکول و لاک کلاسیک", color: "from-purple-400 to-pink-400" },
  { id: 2, name: "پدیکور کلاسیک", duration: 60, price: 300000, icon: "🦶", description: "فرم‌دهی، کوتیکول و لاک پا", color: "from-violet-400 to-purple-400" },
  { id: 3, name: "ژلیش ناخن", duration: 75, price: 400000, icon: "✨", description: "ژلیش ماندگار با برندهای معتبر", color: "from-fuchsia-400 to-pink-400" },
  { id: 4, name: "کاشت ناخن", duration: 120, price: 800000, icon: "💎", description: "کاشت قالبی و طراحی اختصاصی", color: "from-indigo-400 to-purple-400" },
  { id: 5, name: "رنگ و لایت مو", duration: 150, price: 1200000, icon: "🎨", description: "رنگ‌های تخصصی و لایت حرفه‌ای", color: "from-purple-400 to-indigo-400" },
];

export default function HomePage() {
  /* ========== State ========== */
  const [showSuccess, setShowSuccess] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState([]);
  const [formData, setFormData] = useState({ name: "", phone: "", date: "", time: "" });
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [gallery, setGallery] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideInterval = useRef(null);

  /* ========== Effects ========== */
  useEffect(() => {
    const timer = setTimeout(() => setPageLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // دریافت تصاویر از API
  useEffect(() => {
    fetch("/api/images")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setGallery(data);
      })
      .catch(() => {});
  }, []);

  // Auto-scroll اسلایدر
  useEffect(() => {
    if (gallery.length === 0) return;
    slideInterval.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 2 >= gallery.length ? 0 : prev + 2));
    }, 4000);
    return () => clearInterval(slideInterval.current);
  }, [gallery]);

  const totalDuration = selectedServices.reduce((s, srv) => s + srv.duration, 0);
  const totalPrice = selectedServices.reduce((s, srv) => s + srv.price, 0);

  /* ========== Fetch Slots ========== */
  const fetchSlots = useCallback(async (date, duration) => {
    if (!date || !duration) return;
    setSlotsLoading(true);
    setSlots([]);
    setFormData((prev) => ({ ...prev, time: "" }));
    try {
      const res = await fetch(`/api/bookings/slots?date=${date}&duration=${duration}`);
      const data = await res.json();
      if (res.ok && data.slots?.length > 0) setSlots(data.slots);
      else setSlots([]);
    } catch (err) {
      console.error(err);
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  /* ========== Handlers ========== */
  const toggleService = (service) => {
    setSelectedServices((prev) => {
      const exists = prev.find((s) => s.id === service.id);
      return exists ? prev.filter((s) => s.id !== service.id) : [...prev, service];
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "date" && value && totalDuration > 0) fetchSlots(value, totalDuration);
  };

  const nextStep = () => {
    if (step === 1) {
      if (selectedServices.length === 0) return toast.error("حداقل یک سرویس انتخاب کنید");
      setStep(2);
      if (formData.date && totalDuration > 0) fetchSlots(formData.date, totalDuration);
      return;
    }
    if (step === 2) {
      if (!formData.name || !formData.phone || !formData.date || !formData.time)
        return toast.error("لطفاً تمام فیلدها را پر کنید");
      if (!/^09\d{9}$/.test(formData.phone)) return toast.error("شماره موبایل نامعتبر است");
    }
    if (step < 3) setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep((prev) => prev - 1);
  };

  const resetForm = () => {
    setStep(1);
    setSelectedServices([]);
    setFormData({ name: "", phone: "", date: "", time: "" });
    setSlots([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, services: selectedServices }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`✅ رزرو با موفقیت ثبت شد!\n📅 ${toJalaliDisplay(formData.date)}\n⏰ ساعت ${formData.time}`);
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          resetForm();
        }, 4000);
      } else {
        toast.error(data.error || "خطا در ثبت رزرو");
      }
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  /* ========== Render ========== */
  return (
    <div className="min-h-screen">
      {/* ---------- مودال موفقیت ---------- */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="glass-card p-8 text-center animate-fade-in">
            <span className="text-6xl block mb-4">🎉</span>
            <h3 className="text-2xl font-bold text-gradient mb-2">رزرو با موفقیت انجام شد!</h3>
            <p className="opacity-70">{toJalaliDisplay(formData.date)} - ساعت {formData.time}</p>
            <button onClick={() => { setShowSuccess(false); resetForm(); }} className="btn-primary mt-6">متوجه شدم</button>
          </div>
        </div>
      )}

      {/* ---------- هیرو سکشن ---------- */}
      <section className="relative pt-16 pb-20 px-4 overflow-hidden">
        {/* ذرات پس‌زمینه */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute top-20 -right-40 w-80 h-80 bg-fuchsia-500/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 left-1/3 w-72 h-72 bg-violet-500/20 rounded-full blur-3xl animate-float"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 glass-card px-5 py-2.5 rounded-full mb-8 animate-fade-in">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
            </span>
            <span className="text-gradient font-medium text-sm">بهترین سالن زیبایی در غرب تهران</span>
          </div>

          {/* عنوان */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 animate-fade-in leading-tight">
            <span className="text-gradient">سالن زیبایی</span><br />
            <span className="text-gradient">نیل</span>
          </h1>
          <p className="text-lg md:text-2xl mb-10 max-w-2xl mx-auto animate-fade-in opacity-70">
            جایی که <span className="text-purple-400 font-bold">زیبایی</span> با{" "}
            <span className="text-fuchsia-400 font-bold">هنر</span> یکی می‌شود
          </p>

          {/* دکمه‌ها */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in">
            <button
              onClick={() => document.getElementById("booking-section")?.scrollIntoView({ behavior: "smooth" })}
              className="btn-primary text-lg px-10 py-4 group"
            >
              <span className="flex items-center gap-2">
                همین حالا رزرو کن
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </span>
            </button>
            <a href="tel:+989123456789" className="glass-card px-8 py-4 rounded-full hover:bg-white/10 transition-all duration-300 flex items-center gap-2 group">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400 group-hover:scale-110 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              تماس فوری
            </a>
          </div>

          {/* ---------- اسلایدر تصاویر ---------- */}
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-gradient mb-8">نمونه کارهای ما</h3>
            {pageLoading ? (
              <div className="flex gap-4 justify-center">
                <CardSkeleton />
                <CardSkeleton />
              </div>
            ) : gallery.length > 0 ? (
              <div className="relative overflow-hidden">
                <div
                  className="flex transition-transform duration-700 ease-in-out"
                  style={{ transform: `translateX(-${(currentSlide / 2) * 100}%)` }}
                >
                  {gallery.map((img, i) => (
                    <div key={i} className="w-1/2 flex-shrink-0 px-1 sm:w-1/2">
                      <div className="glass-card overflow-hidden group h-64 rounded-xl">
                        <img
                          src={img.url}
                          alt={img.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                {/* دایره‌های راهنما */}
                {gallery.length > 2 && (
                  <div className="flex justify-center mt-4 gap-2">
                    {Array.from({ length: Math.ceil(gallery.length / 2) }).map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx * 2)}
                        className={`w-3 h-3 rounded-full ${Math.floor(currentSlide / 2) === idx ? "bg-purple-500" : "bg-gray-400"}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10 opacity-40">
                <span className="text-4xl block mb-2">🖼️</span>
                هنوز تصویری بارگذاری نشده است.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========== بخش رزرو ========== */}
      <section id="booking-section" className="max-w-4xl mx-auto px-4 pb-24">
        <div className="glass-card p-6 md:p-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gradient mb-2">رزرو آنلاین</h2>
            <p className="opacity-50 text-sm">خدمات مورد نظر خود را انتخاب کنید</p>
          </div>

          <BookingSteps currentStep={step} />

          {/* ---------- مرحله ۱ ---------- */}
          {step === 1 && (
            <div className="animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {SERVICES.map((service) => {
                  const isSelected = selectedServices.find((s) => s.id === service.id);
                  return (
                    <button
                      key={service.id}
                      onClick={() => toggleService(service)}
                      className={`relative group overflow-hidden glass-card p-5 text-right transition-all duration-500 ${
                        isSelected ? "ring-2 ring-purple-400 scale-[1.03] shadow-xl shadow-purple-500/20" : "hover:scale-[1.02]"
                      }`}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-3xl`}></div>
                      {isSelected && (
                        <div className="absolute top-3 left-3 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center animate-fade-in">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      <div className="relative z-10">
                        <span className="text-4xl block mb-3 group-hover:scale-110 transition-transform duration-300 inline-block">{service.icon}</span>
                        <h3 className="font-bold text-lg mb-2">{service.name}</h3>
                        <p className="text-sm opacity-50 mb-4">{service.description}</p>
                        <div className="flex items-center justify-between pt-3 border-t border-white/10">
                          <span className={`font-bold text-lg bg-gradient-to-r ${service.color} bg-clip-text text-transparent`}>
                            {service.price.toLocaleString("fa-IR")} <span className="text-xs opacity-70">تومان</span>
                          </span>
                          <span className="text-xs opacity-40 bg-white/10 px-2 py-1 rounded-full">{service.duration} دقیقه</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedServices.length > 0 && (
                <div className="mt-6 p-5 glass-card bg-purple-500/10 border border-purple-500/20 animate-fade-in">
                  <div className="flex justify-between items-center">
                    <div><p className="text-sm opacity-60">مدت زمان: <span className="font-bold">{totalDuration} دقیقه</span></p></div>
                    <div className="text-right">
                      <p className="text-xs opacity-60">هزینه کل:</p>
                      <p className="text-2xl font-bold text-gradient">{totalPrice.toLocaleString("fa-IR")}<span className="text-sm"> تومان</span></p>
                    </div>
                  </div>
                </div>
              )}

              <button onClick={nextStep} className="btn-primary w-full mt-6 text-lg py-4">ادامه ➜</button>
            </div>
          )}

          {/* ---------- مرحله ۲ ---------- */}
          {step === 2 && (
            <div className="animate-fade-in">
              <h3 className="text-xl font-bold mb-8 text-center">اطلاعات خود را وارد کنید</h3>

              <div className="space-y-5 max-w-lg mx-auto">
                <div className="input-floating">
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder=" " required />
                  <label>👤 نام و نام خانوادگی</label>
                </div>

                <div className="input-floating">
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder=" " maxLength={11} required />
                  {formData.phone && (
                    <p className={`text-xs mt-1 ${/^09\d{9}$/.test(formData.phone) ? "text-green-400" : "text-red-400"}`}>
                      {/^09\d{9}$/.test(formData.phone) ? "✅ شماره موبایل معتبر است" : "⚠️ شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود"}
                    </p>
                  )}
                  <label>📱 شماره موبایل</label>
                </div>

                <div className="input-floating relative">
                  <input type="date" name="date" value={formData.date} onChange={handleInputChange} min={minDate} required className="text-transparent caret-transparent" />
                  <div className="absolute inset-0 flex items-center px-4 pointer-events-none">
                    <span className={formData.date ? "text-purple-400 font-bold" : "opacity-50"}>
                      {formData.date ? `📅 ${toJalaliDisplay(formData.date)}` : "📅 تاریخ رزرو را انتخاب کنید"}
                    </span>
                  </div>
                  <label></label>
                </div>

                {formData.date && (
                  <div className="animate-fade-in">
                    <label className="block mb-3 text-sm font-medium">
                      {slotsLoading ? "⏳ در حال جستجوی زمان‌های خالی..." : slots.length > 0 ? `✅ ${slots.length} زمان خالی پیدا شد` : "⏰ انتخاب زمان"}
                    </label>

                    {slotsLoading ? (
                      <SlotsSkeleton />
                    ) : slots.length > 0 ? (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {slots.map((slot) => (
                          <button
                            key={slot.start}
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, time: slot.start }))}
                            className={`relative py-3 px-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                              formData.time === slot.start
                                ? "bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white scale-105 shadow-lg shadow-purple-500/30"
                                : "bg-white/5 hover:bg-white/10 border border-white/10"
                            }`}
                          >
                            {slot.start}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 glass-card">
                        <span className="text-4xl block mb-3">📭</span>
                        <p className="text-yellow-400 text-sm">زمانی برای این تاریخ موجود نیست</p>
                        <p className="text-xs opacity-40 mt-1">لطفاً تاریخ دیگری انتخاب کنید</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-8">
                <button onClick={prevStep} className="btn-primary flex-1 bg-white/5 hover:bg-white/10">➜ بازگشت</button>
                <button onClick={nextStep} className="btn-primary flex-1">ادامه</button>
              </div>
            </div>
          )}

          {/* ---------- مرحله ۳ ---------- */}
          {step === 3 && (
            <div className="animate-fade-in">
              <h3 className="text-xl font-bold mb-8 text-center">تأیید نهایی رزرو</h3>

              <div className="glass-card bg-purple-500/5 border border-purple-500/20 p-6 space-y-4 max-w-lg mx-auto">
                <div className="flex justify-between items-center pb-3 border-b border-white/5">
                  <span className="opacity-60 text-sm">👤 نام</span>
                  <span className="font-bold">{formData.name}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-white/5">
                  <span className="opacity-60 text-sm">📱 موبایل</span>
                  <span className="font-bold">{formData.phone}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-white/5">
                  <span className="opacity-60 text-sm">📅 تاریخ</span>
                  <div className="text-left">
                    <span className="font-bold text-purple-400">{toJalaliDisplay(formData.date)}</span>
                    <br />
                    <span className="text-xs opacity-40">{formData.date}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-white/5">
                  <span className="opacity-60 text-sm">⏰ ساعت</span>
                  <span className="font-bold">{formData.time}</span>
                </div>
                <div>
                  <span className="opacity-60 text-sm block mb-2">💅 خدمات:</span>
                  {selectedServices.map((s) => (
                    <div key={s.id} className="flex justify-between text-sm py-1.5 px-3 bg-white/5 rounded-lg mb-1">
                      <span>{s.icon} {s.name}</span>
                      <span className="opacity-50">{s.duration} دقیقه</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-white/10">
                  <span className="font-bold text-lg">💰 هزینه قابل پرداخت:</span>
                  <span className="text-2xl font-bold text-gradient">
                    {totalPrice.toLocaleString("fa-IR")}<span className="text-sm"> تومان</span>
                  </span>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button onClick={prevStep} className="btn-primary flex-1 bg-white/5 hover:bg-white/10">➜ ویرایش</button>
                <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1 text-lg">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      در حال ثبت...
                    </span>
                  ) : (
                    "✅ تأیید و ثبت نهایی"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
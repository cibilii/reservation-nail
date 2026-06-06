import { NextResponse } from "next/server";
import { readData, writeData } from "@/lib/db";

// app/api/bookings/route.js
import {
  calculateEndTime,
  isSlotAvailable,
  toJalaliDisplay,
  isWorkingDay,
  isFutureDate,
} from '@/lib/working-hours';

// GET: دریافت همه رزروها
export async function GET() {
  try {
    const data = await readData();

    // اضافه کردن تاریخ شمسی به هر رزرو
    const bookingsWithJalali = data.bookings.map((booking) => ({
      ...booking,
      jalaliDate: toJalaliDisplay(booking.date),
    }));

    // مرتب‌سازی بر اساس تاریخ ایجاد (جدیدترین اول)
    bookingsWithJalali.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return NextResponse.json(bookingsWithJalali);
  } catch (error) {
    console.error('Error reading bookings:', error);
    return NextResponse.json(
      { error: 'خطا در خواندن رزروها.' },
      { status: 500 }
    );
  }
}

// POST: ایجاد رزرو جدید
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, phone, date, time, services } = body;

    // ==========================================
    // ۱. اعتبارسنجی کامل
    // ==========================================

    // چک کردن فیلدهای ضروری
    if (!name || !phone || !date || !time || !services || services.length === 0) {
      return NextResponse.json(
        { error: 'لطفاً تمام فیلدهای ضروری را پر کنید.' },
        { status: 400 }
      );
    }

    // اعتبارسنجی نام
    if (name.trim().length < 2) {
      return NextResponse.json(
        { error: 'نام باید حداقل ۲ کاراکتر باشد.' },
        { status: 400 }
      );
    }

    // اعتبارسنجی شماره موبایل
    if (!/^09\d{9}$/.test(phone)) {
      return NextResponse.json(
        { error: 'شماره موبایل نامعتبر است. مثال: 09123456789' },
        { status: 400 }
      );
    }

    // اعتبارسنجی فرمت تاریخ
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { error: 'فرمت تاریخ باید YYYY-MM-DD باشد.' },
        { status: 400 }
      );
    }

    // اعتبارسنجی فرمت زمان
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(time)) {
      return NextResponse.json(
        { error: 'فرمت زمان باید HH:mm باشد.' },
        { status: 400 }
      );
    }

    // خواندن داده‌ها
    const data = await readData();
    const { settings } = data;

    // چک کردن آینده بودن تاریخ
    if (!isFutureDate(date)) {
      return NextResponse.json(
        { error: 'تاریخ انتخاب شده باید در آینده باشد.' },
        { status: 400 }
      );
    }

    // چک کردن روز کاری
    if (!isWorkingDay(date, settings)) {
      return NextResponse.json(
        { error: 'سالن در تاریخ انتخاب شده تعطیل است.' },
        { status: 400 }
      );
    }

    // ==========================================
    // ۲. محاسبه مجموع مدت و قیمت
    // ==========================================
    const totalDuration = services.reduce((sum, s) => sum + (parseInt(s.duration) || 0), 0);
    const totalPrice = services.reduce((sum, s) => sum + (parseInt(s.price) || 0), 0);

    if (totalDuration <= 0) {
      return NextResponse.json(
        { error: 'مدت زمان سرویس نامعتبر است.' },
        { status: 400 }
      );
    }

    // محاسبه زمان پایان
    const endTime = calculateEndTime(time, totalDuration);

    // چک کردن اینکه زمان پایان از ساعت کاری خارج نزند
    const endMin =
      parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);
    const workEndMin =
      parseInt(settings.workingHours.end.split(':')[0]) * 60 +
      parseInt(settings.workingHours.end.split(':')[1]);

    if (endMin > workEndMin) {
      return NextResponse.json(
        {
          error: `زمان پایان رزرو (${endTime}) خارج از ساعت کاری سالن (${settings.workingHours.end}) است.`,
        },
        { status: 400 }
      );
    }

    // ==========================================
    // ۳. چک تداخل زمانی
    // ==========================================
    const dailyBookings = data.bookings.filter(
      (b) => b.date === date && b.status !== 'cancelled'
    );

    if (!isSlotAvailable(time, totalDuration, dailyBookings)) {
      return NextResponse.json(
        {
          error:
            'متأسفانه این اسلات زمانی در لحظه پر شد. لطفاً اسلات دیگری انتخاب کنید.',
        },
        { status: 409 } // Conflict
      );
    }

    // ==========================================
    // ۴. ایجاد رزرو جدید
    // ==========================================
    const newBooking = {
      id: data.nextId,
      name: name.trim(),
      phone,
      date,
      time,
      endTime,
      services: services.map((s) => ({
        id: s.id,
        name: s.name,
        duration: parseInt(s.duration) || 0,
        price: parseInt(s.price) || 0,
      })),
      totalDuration,
      totalPrice,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    // اضافه کردن به آرایه و افزایش nextId
    data.bookings.push(newBooking);
    data.nextId += 1;

    // ذخیره‌سازی با قفل فایل (مدیریت خودکار هم‌زمانی)
    await writeData(data);

    // برگرداندن پاسخ موفقیت با تاریخ شمسی
    const bookingWithJalali = {
      ...newBooking,
      jalaliDate: toJalaliDisplay(date),
    };

    return NextResponse.json(
      {
        message: `رزرو با موفقیت انجام شد. ${toJalaliDisplay(date)} ساعت ${time} منتظر شما هستیم.`,
        booking: bookingWithJalali,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Booking error:', error);
    return NextResponse.json(
      { error: 'خطا در ثبت رزرو. لطفاً دوباره تلاش کنید.' },
      { status: 500 }
    );
  }
}
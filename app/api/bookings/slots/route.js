import { NextResponse } from "next/server";
import { readData } from "@/lib/db";
import { getAvailableSlots, isFutureDate, isWorkingDay } from "@/lib/working-hours";

// app/api/bookings/slots/route.js

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const durationParam = searchParams.get('duration');
  const duration = parseInt(durationParam, 10);

  // اعتبارسنجی پارامترها
  if (!date || isNaN(duration) || duration <= 0) {
    return NextResponse.json(
      { error: 'پارامترهای date و duration الزامی و معتبر هستند.' },
      { status: 400 }
    );
  }

  // اعتبارسنجی فرمت تاریخ (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return NextResponse.json(
      { error: 'فرمت تاریخ باید YYYY-MM-DD باشد.' },
      { status: 400 }
    );
  }

  try {
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
      const persianDays = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'];
      const dayIndex = new Date(date + 'T00:00:00').getDay();
      const dayName = persianDays[dayIndex];
      
      return NextResponse.json(
        { 
          error: `سالن در تاریخ انتخاب شده (${dayName}) تعطیل است.`,
          slots: [] 
        },
        { status: 200 } // 200 برای نمایش پیام به کاربر
      );
    }

    // محاسبه اسلات‌های آزاد
    const availableSlots = getAvailableSlots(date, data.bookings, settings, duration);

    // برگرداندن نتیجه
    return NextResponse.json({
      date,
      duration,
      slots: availableSlots,
      totalSlots: availableSlots.length,
    });

  } catch (error) {
    console.error('Error fetching slots:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت اسلات‌های زمانی. لطفاً دوباره تلاش کنید.' },
      { status: 500 }
    );
  }
}
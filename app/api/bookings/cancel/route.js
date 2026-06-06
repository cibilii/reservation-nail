import { NextResponse } from "next/server";
import { readData, writeData } from "@/lib/db";
import { toJalaliDisplay } from "@/lib/working-hours";

// app/api/bookings/cancel/route.js

export async function POST(request) {
  try {
    const body = await request.json();
    const { id } = body;

    // اعتبارسنجی id
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'شناسه رزرو نامعتبر است.' },
        { status: 400 }
      );
    }

    const bookingId = parseInt(id, 10);

    // خواندن داده‌ها
    const data = await readData();

    // پیدا کردن رزرو
    const bookingIndex = data.bookings.findIndex((b) => b.id === bookingId);

    if (bookingIndex === -1) {
      return NextResponse.json(
        { error: 'رزروی با این شناسه پیدا نشد.' },
        { status: 404 }
      );
    }

    const booking = data.bookings[bookingIndex];

    // چک کردن وضعیت فعلی
    if (booking.status === 'cancelled') {
      return NextResponse.json(
        { error: 'این رزرو قبلاً کنسل شده است.' },
        { status: 400 }
      );
    }

    // چک کردن اینکه رزرو برای آینده است
    const bookingDate = new Date(booking.date + 'T' + booking.time);
    const now = new Date();

    if (bookingDate < now) {
      return NextResponse.json(
        { error: 'امکان کنسل کردن رزروهای گذشته وجود ندارد.' },
        { status: 400 }
      );
    }

    // تغییر وضعیت به cancelled
    data.bookings[bookingIndex] = {
      ...booking,
      status: 'cancelled',
      cancelledAt: new Date().toISOString(),
    };

    // ذخیره‌سازی با قفل فایل
    await writeData(data);

    // برگرداندن پاسخ موفقیت با تاریخ شمسی
    const cancelledBooking = {
      ...data.bookings[bookingIndex],
      jalaliDate: toJalaliDisplay(booking.date),
    };

    return NextResponse.json({
      message: `رزرو ${toJalaliDisplay(booking.date)} ساعت ${booking.time} با موفقیت کنسل شد.`,
      booking: cancelledBooking,
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    return NextResponse.json(
      { error: 'خطا در کنسل کردن رزرو. لطفاً دوباره تلاش کنید.' },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import { readData, writeData } from "@/lib/db";

import {
  calculateEndTime,
  isSlotAvailable,
  toJalaliDisplay,
  isWorkingDay,
  isFutureDate,
} from "@/lib/working-hours";

// -------------------------------
// Safe default structure
// -------------------------------
function getSafeData(data) {
  return {
    bookings: Array.isArray(data?.bookings) ? data.bookings : [],
    nextId: typeof data?.nextId === "number" ? data.nextId : 1,
    settings: data?.settings || {
      workingHours: { start: "09:00", end: "20:00" },
      workingDays: [0, 1, 2, 3, 4, 6],
      holidays: [],
      slotDuration: 30,
    },
  };
}

// =====================================================
// GET: all bookings
// =====================================================
export async function GET() {
  try {
    const raw = await readData();
    const data = getSafeData(raw);

    const result = data.bookings.map((booking) => ({
      ...booking,
      jalaliDate: toJalaliDisplay(booking.date),
    }));

    result.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET bookings error:", error);

    return NextResponse.json(
      { error: "خطا در خواندن رزروها" },
      { status: 500 }
    );
  }
}

// =====================================================
// POST: create booking
// =====================================================
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, phone, date, time, services } = body;

    // -----------------------------
    // Validation
    // -----------------------------
    if (
      !name ||
      !phone ||
      !date ||
      !time ||
      !Array.isArray(services) ||
      services.length === 0
    ) {
      return NextResponse.json(
        { error: "لطفاً همه فیلدها را پر کنید" },
        { status: 400 }
      );
    }

    if (name.trim().length < 2) {
      return NextResponse.json(
        { error: "نام خیلی کوتاه است" },
        { status: 400 }
      );
    }

    if (!/^09\d{9}$/.test(phone)) {
      return NextResponse.json(
        { error: "شماره موبایل نامعتبر است" },
        { status: 400 }
      );
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: "فرمت تاریخ اشتباه است" },
        { status: 400 }
      );
    }

    if (!/^\d{2}:\d{2}$/.test(time)) {
      return NextResponse.json(
        { error: "فرمت زمان اشتباه است" },
        { status: 400 }
      );
    }

    // -----------------------------
    // Load safe data
    // -----------------------------
    const raw = await readData();
    const data = getSafeData(raw);
    const { settings } = data;

    // -----------------------------
    // Business rules
    // -----------------------------
    if (!isFutureDate(date)) {
      return NextResponse.json(
        { error: "تاریخ باید در آینده باشد" },
        { status: 400 }
      );
    }

    if (!isWorkingDay(date, settings)) {
      return NextResponse.json(
        { error: "این روز تعطیل است" },
        { status: 400 }
      );
    }

    // -----------------------------
    // Calculate price & duration
    // -----------------------------
    const totalDuration = services.reduce(
      (sum, s) => sum + (parseInt(s.duration) || 0),
      0
    );

    const totalPrice = services.reduce(
      (sum, s) => sum + (parseInt(s.price) || 0),
      0
    );

    if (totalDuration <= 0) {
      return NextResponse.json(
        { error: "مدت زمان نامعتبر است" },
        { status: 400 }
      );
    }

    const endTime = calculateEndTime(time, totalDuration);

    const endMin =
      parseInt(endTime.split(":")[0]) * 60 +
      parseInt(endTime.split(":")[1]);

    const workEndMin =
      parseInt(settings.workingHours.end.split(":")[0]) * 60 +
      parseInt(settings.workingHours.end.split(":")[1]);

    if (endMin > workEndMin) {
      return NextResponse.json(
        {
          error: `خارج از ساعت کاری (${settings.workingHours.end})`,
        },
        { status: 400 }
      );
    }

    // -----------------------------
    // Check overlap
    // -----------------------------
    const dailyBookings = data.bookings.filter(
      (b) => b.date === date && b.status !== "cancelled"
    );

    if (!isSlotAvailable(time, totalDuration, dailyBookings)) {
      return NextResponse.json(
        { error: "این تایم پر شده" },
        { status: 409 }
      );
    }

    // -----------------------------
    // Create booking
    // -----------------------------
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
      status: "confirmed",
      createdAt: new Date().toISOString(),
    };

    data.bookings.push(newBooking);
    data.nextId += 1;

    await writeData(data);

    return NextResponse.json(
      {
        message: `رزرو موفق - ${toJalaliDisplay(date)} ساعت ${time}`,
        booking: {
          ...newBooking,
          jalaliDate: toJalaliDisplay(date),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST booking error:", error);

    return NextResponse.json(
      { error: "خطای سرور در ثبت رزرو" },
      { status: 500 }
    );
  }
}
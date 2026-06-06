import { NextResponse } from "next/server";
import { readData, writeData } from "@/lib/db.js";

// app/api/bookings/route.js

export async function GET() {
  try {
    const data = await readData();
    return NextResponse.json(data.bookings || []);
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json({ error: "خطا در دریافت رزروها" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    console.log("Received body:", body); // برای دیباگ
    
    const { firstName, lastName, mobile, date, timeSlot, services } = body;

    // اعتبارسنجی
    if (!firstName || !lastName || !mobile || !date || !timeSlot || !services || services.length === 0) {
      return NextResponse.json(
        { error: "لطفاً تمام فیلدها را پر کنید و حداقل یک سرویس انتخاب کنید" },
        { status: 400 }
      );
    }

    // چک کردن موبایل
    if (!/^09[0-9]{9}$/.test(mobile)) {
      return NextResponse.json(
        { error: "شماره موبایل معتبر نیست" },
        { status: 400 }
      );
    }

    const data = await readData();
    
    // چک کردن رزرو تکراری در همان تاریخ و ساعت
    const existingBooking = data.bookings.find(
      (b) => b.date === date && b.timeSlot === timeSlot && b.status !== "cancelled"
    );
    
    if (existingBooking) {
      return NextResponse.json(
        { error: "این ساعت قبلاً رزرو شده است" },
        { status: 409 }
      );
    }

    const newBooking = {
      id: data.nextId || Date.now(),
      firstName,
      lastName,
      mobile,
      phone: mobile,
      date,
      timeSlot,
      time: timeSlot,
      services,
      status: "active",
      createdAt: new Date().toISOString(),
    };

    data.bookings.push(newBooking);
    data.nextId = (data.nextId || 0) + 1;
    
    await writeData(data);

    console.log("Booking saved:", newBooking); // برای دیباگ

    return NextResponse.json(
      { message: "رزرو با موفقیت ثبت شد 🎉", booking: newBooking },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json(
      { error: "خطای داخلی سرور. لطفاً دوباره تلاش کنید." },
      { status: 500 }
    );
  }
}
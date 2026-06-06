// lib/working-hours.js
export const PERSIAN_DAYS = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'];
export const PERSIAN_MONTHS = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];

export function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function calculateEndTime(startTime, durationMinutes) {
  const start = timeToMinutes(startTime);
  const end = start + parseInt(durationMinutes, 10);
  return minutesToTime(end);
}

export function isSlotAvailable(slotStart, duration, bookings) {
  const slotStartMin = timeToMinutes(slotStart);
  const slotEndMin = slotStartMin + parseInt(duration, 10);

  for (const booking of bookings) {
    if (booking.status === 'cancelled') continue;
    const bookingStartMin = timeToMinutes(booking.time);
    const bookingEndMin = bookingStartMin + parseInt(booking.totalDuration || 60, 10); // Default 60 mins

    // Check for overlap
    if (slotStartMin < bookingEndMin && slotEndMin > bookingStartMin) {
      return false;
    }
  }
  return true;
}

export function getAvailableSlots(date, bookings, settings, serviceDuration) {
  const { start, end } = settings.workingHours;
  const slotDuration = settings.slotDuration; // interval for potential start times

  const startMin = timeToMinutes(start);
  const endMin = timeToMinutes(end);
  const availableSlots = [];

  // Filter bookings for the given date
  const dailyBookings = bookings.filter(b =>
    b.date === date && b.status !== 'cancelled'
  );

  for (let slotTime = startMin; slotTime + serviceDuration <= endMin; slotTime += slotDuration) {
    const slotStartStr = minutesToTime(slotTime);
    const slotEndStr = minutesToTime(slotTime + serviceDuration);
    if (isSlotAvailable(slotStartStr, serviceDuration, dailyBookings)) {
      availableSlots.push({ start: slotStartStr, end: slotEndStr });
    }
  }
  return availableSlots;
}

export function isWorkingDay(dateStr, settings) {
  const date = new Date(dateStr + 'T00:00:00'); // Add time to avoid timezone issues
  const dayOfWeek = date.getDay(); // 0=Sun, 6=Sat
  return settings.workingDays.includes(dayOfWeek) && !settings.holidays.includes(dateStr);
}

export function isFutureDate(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(dateStr + 'T00:00:00');
  return checkDate > today;
}
// lib/working-hours.js - تابع toJalaliDisplay اصلاح شده
export function toJalaliDisplay(dateStr) {
  if (!dateStr) return "---";
  
  try {
    const date = new Date(dateStr + 'T00:00:00');
    
    // چک معتبر بودن تاریخ
    if (isNaN(date.getTime())) return dateStr;
    
    return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    }).format(date);
  } catch (e) {
    console.error('Date conversion error:', e);
    return dateStr;
  }
}
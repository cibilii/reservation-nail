"use client";
import { useEffect, useState } from "react";

// app/components/FloatingCallButton.jsx


export default function FloatingCallButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // نمایش دکمه بعد از اسکرول
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // نمایش اولیه
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <a
      href="tel:+989123456789"
      className={`fixed bottom-24 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 group ${
        isVisible
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 translate-y-10 scale-75 pointer-events-none'
      }`}
      aria-label="تماس تلفنی با سالن زیبایی"
      title="تماس با ما"
    >
      {/* پس‌زمینه پالس */}
      <span className="absolute inset-0 rounded-full bg-green-500 animate-pulse-glow"></span>

      {/* دکمه اصلی */}
      <span className="relative w-full h-full rounded-full bg-green-500/80 backdrop-blur-sm border border-green-400/50 flex items-center justify-center shadow-lg hover:bg-green-500 transition-all duration-300 group-hover:scale-110">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-7 w-7 text-white group-hover:scale-110 transition-transform duration-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.95.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
          />
        </svg>
      </span>

      {/* Tooltip */}
      <span className="absolute left-full ml-3 px-3 py-1 bg-white/20 backdrop-blur-md text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
        تماس با ما
      </span>
    </a>
  );
}
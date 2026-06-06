"use client";

// app/components/Skeleton.jsx

// ✅ آرایه ثابت برای width های مختلف
const RANDOM_WIDTHS = [60, 75, 90, 55, 80, 70, 65];

export function CardSkeleton() {
  return (
    <div className="glass-card p-5 w-full">
      <div className="relative overflow-hidden rounded-2xl h-12 w-12 mb-4 skeleton-shimmer"></div>
      <div className="relative overflow-hidden rounded-lg h-5 w-3/4 mb-3 skeleton-shimmer"></div>
      <div className="relative overflow-hidden rounded-lg h-4 w-1/2 mb-4 skeleton-shimmer"></div>
      <div className="flex justify-between items-center pt-3 border-t border-white/5">
        <div className="relative overflow-hidden rounded-lg h-5 w-20 skeleton-shimmer"></div>
        <div className="relative overflow-hidden rounded-full h-6 w-16 skeleton-shimmer"></div>
      </div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <tr className="border-b border-white/5">
      {RANDOM_WIDTHS.map((width, i) => (
        <td key={i} className="py-4 px-4">
          <div
            className="relative overflow-hidden rounded h-4 skeleton-shimmer mx-auto"
            style={{ width: `${width}px` }}
          ></div>
        </td>
      ))}
    </tr>
  );
}

export function StatsCardSkeleton() {
  return (
    <div className="glass-card p-5">
      <div className="flex justify-between items-center mb-3">
        <div className="relative overflow-hidden rounded-lg h-4 w-16 skeleton-shimmer"></div>
        <div className="relative overflow-hidden rounded-lg h-8 w-8 skeleton-shimmer"></div>
      </div>
      <div className="relative overflow-hidden rounded-lg h-8 w-12 skeleton-shimmer"></div>
    </div>
  );
}

export function SlotsSkeleton() {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="relative overflow-hidden rounded-xl h-12 skeleton-shimmer"
        ></div>
      ))}
    </div>
  );
}
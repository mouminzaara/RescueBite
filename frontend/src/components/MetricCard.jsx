import React from 'react';

/**
 * Reusable metric card used in the Impact dashboard.
 * Keeps the same rounded, soft‑shadow style as other cards.
 */
export default function MetricCard({ title, value, unit = '', children }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-xs border border-[#E6D9C5]">
      <div className="flex-shrink-0 text-[#285C46] text-3xl">{children}</div>
      <div className="flex flex-col">
        <span className="text-sm text-[#5C6A62] font-medium">{title}</span>
        <span className="text-2xl font-extrabold text-[#1C2A23]">
          {value}{unit && <span className="text-base font-medium text-[#5C6A62]">{unit}</span>}
        </span>
      </div>
    </div>
  );
}

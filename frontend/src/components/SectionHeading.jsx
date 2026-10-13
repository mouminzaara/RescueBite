import React from 'react';

/**
 * Editorial SectionHeading component for RescueBite UI
 * 
 * @param {Object} props
 * @param {string} props.title - Main title string or node
 * @param {string} [props.subtitle] - Optional descriptive subtitle text
 * @param {string} [props.badge] - Optional pill badge label (e.g. "Eco Impact", "Surplus Hub")
 * @param {'forest' | 'sage' | 'sand'} [props.badgeColor='forest']
 * @param {React.ReactNode} [props.action] - Optional right-hand action element
 * @param {'left' | 'center'} [props.align='left']
 * @param {string} [props.className]
 */
export default function SectionHeading({
  title,
  subtitle,
  badge,
  badgeColor = 'forest',
  action,
  align = 'left',
  className = '',
}) {
  const badgeStyles = {
    forest: 'bg-[#DDE8D8] text-[#1E4736] border-[#B8D1C3]',
    sage: 'bg-[#F4F7F4] text-[#526D57] border-[#A3BCA8]',
    sand: 'bg-[#F3EADB] text-[#2E3933] border-[#E6D9C5]',
  };

  const isCenter = align === 'center';

  return (
    <div className={`mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 ${isCenter ? 'text-center md:text-center items-center md:items-center' : ''} ${className}`}>
      <div className={`max-w-2xl ${isCenter ? 'mx-auto' : ''}`}>
        {badge && (
          <div className="mb-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${badgeStyles[badgeColor] || badgeStyles.forest}`}>
              {badge}
            </span>
          </div>
        )}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1C2A23] tracking-tight leading-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-2 text-base text-[#5C6A62] leading-relaxed font-normal">
            {subtitle}
          </p>
        )}
      </div>

      {action && (
        <div className={`shrink-0 ${isCenter ? 'mx-auto mt-2' : ''}`}>
          {action}
        </div>
      )}
    </div>
  );
}

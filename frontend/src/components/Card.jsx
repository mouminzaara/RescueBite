import React from 'react';

/**
 * Reusable Card component for RescueBite Food Marketplace UI
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.className]
 * @param {boolean} [props.hoverable=false]
 * @param {'sm' | 'md' | 'lg' | 'none'} [props.padding='md']
 * @param {Function} [props.onClick]
 */
export default function Card({
  children,
  className = '',
  hoverable = false,
  padding = 'md',
  onClick,
  ...rest
}) {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const hoverClass = hoverable
    ? 'hover:shadow-md hover:border-[#D6C4AC] cursor-pointer transition-all duration-200'
    : '';

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-[1.75rem] border border-[#E6D9C5] shadow-xs ${paddingStyles[padding]} ${hoverClass} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`mb-4 pb-3 border-b border-[#F3EADB] flex items-center justify-between ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }) {
  return (
    <h3 className={`text-xl font-bold text-[#1C2A23] tracking-tight ${className}`}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '' }) {
  return (
    <p className={`text-sm text-[#5C6A62] mt-1 ${className}`}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = '' }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '' }) {
  return (
    <div className={`mt-6 pt-4 border-t border-[#F3EADB] flex items-center justify-between ${className}`}>
      {children}
    </div>
  );
}

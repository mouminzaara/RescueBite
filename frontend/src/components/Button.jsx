import React from 'react';

/**
 * Pill-shaped modern Button for RescueBite Food Rescue App
 * 
 * @param {Object} props
 * @param {'primary' | 'secondary' | 'outline' | 'ghost' | 'accent'} [props.variant='primary']
 * @param {'sm' | 'md' | 'lg'} [props.size='md']
 * @param {React.ReactNode} props.children
 * @param {string} [props.className]
 * @param {React.ReactNode} [props.icon]
 * @param {boolean} [props.disabled=false]
 * @param {'button' | 'submit' | 'reset'} [props.type='button']
 * @param {Function} [props.onClick]
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  icon,
  disabled = false,
  type = 'button',
  onClick,
  ...rest
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#285C46]/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100';

  const sizeStyles = {
    sm: 'px-4 py-1.5 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-7 py-3 text-base gap-2.5 font-semibold',
  };

  const variantStyles = {
    primary: 'bg-[#285C46] hover:bg-[#1E4736] text-white shadow-sm hover:shadow-[#285C46]/20',
    secondary: 'bg-[#DDE8D8] hover:bg-[#CDDCB7] text-[#1E4736] font-semibold',
    outline: 'bg-transparent text-[#285C46] border border-[#285C46] hover:bg-[#DDE8D8]/50',
    ghost: 'bg-transparent text-[#2E3933] hover:text-[#1C2A23] hover:bg-[#EAD9C4]/40',
    accent: 'bg-[#E6D9C5] hover:bg-[#DECBAF] text-[#1C2A23] font-semibold',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.primary} ${className}`}
      {...rest}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
}

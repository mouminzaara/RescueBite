import React from 'react';

/**
 * PageContainer component for RescueBite UI with mobile navigation padding
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.className]
 * @param {'normal' | 'narrow' | 'wide' | 'full'} [props.maxWidth='normal']
 */
export default function PageContainer({
  children,
  className = '',
  maxWidth = 'normal',
}) {
  const widthClasses = {
    narrow: 'max-w-4xl',
    normal: 'max-w-7xl',
    wide: 'max-w-[1400px]',
    full: 'max-w-full',
  };

  return (
    <main className={`min-h-[calc(100vh-4rem)] bg-[#F5EBDD] pb-24 lg:pb-16 pt-6 sm:pt-10 ${className}`}>
      <div className={`${widthClasses[maxWidth] || widthClasses.normal} mx-auto px-4 sm:px-6 lg:px-8`}>
        {children}
      </div>
    </main>
  );
}

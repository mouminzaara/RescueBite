import React from 'react';

/**
 * Simple loading spinner that matches the RescueBite aesthetic.
 * Uses a subtle animated circle with the primary green colour.
 */
export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="w-12 h-12 border-4 border-[#DDE8D8] border-t-[#285C46] rounded-full animate-spin" />
    </div>
  );
}

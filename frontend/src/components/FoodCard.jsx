import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Sparkles, AlertTriangle } from 'lucide-react';
import Button from './Button';

/**
 * Premium Food Marketplace Card for RescueBite with Expiry-Aware Priority Badges
 */
export default function FoodCard({ item, onSelect, onReserve }) {
  const {
    name,
    restaurant,
    location,
    image,
    rescuePrice,
    originalPrice,
    discountPercent,
    quantityRemaining,
    expiryTime,
    urgency = 'MEDIUM',
    priorityScore,
  } = item;

  // Helper: parse expiryTime into remaining ms.
  // Handles both ISO date strings and human-readable strings like "Expires in 25 min" / "2 hrs".
  const computeRemaining = (val) => {
    if (!val) return 2 * 60 * 60 * 1000; // default 2h
    // Try ISO date first
    const isoDate = new Date(val);
    if (!isNaN(isoDate.getTime())) {
      return Math.max(isoDate.getTime() - Date.now(), 0);
    }
    // Parse text like "Expires in 25 min", "Expires in 1.5 hrs", "2 hours"
    const s = String(val).toLowerCase();
    const minMatch = s.match(/(\d+(?:\.\d+)?)\s*min/);
    if (minMatch) return Math.round(parseFloat(minMatch[1]) * 60 * 1000);
    const hrMatch = s.match(/(\d+(?:\.\d+)?)\s*h/);
    if (hrMatch) return Math.round(parseFloat(hrMatch[1]) * 60 * 60 * 1000);
    return 90 * 60 * 1000; // default 90 min
  };

  const [remainingMs, setRemainingMs] = useState(() => computeRemaining(expiryTime));

  useEffect(() => {
    if (remainingMs <= 0) return;
    const timer = setInterval(() => {
      setRemainingMs((prev) => Math.max(prev - 1000, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(remainingMs / 60000);
  const seconds = Math.floor((remainingMs % 60000) / 1000);
  const isExpired = remainingMs === 0;
  const displayTime = isExpired ? 'Expired' : `${minutes}m ${seconds}s`;


  const urgencyBadges = {
    LOW: 'bg-[#DDE8D8] text-[#1E4736] border-[#B8D1C3]',
    MEDIUM: 'bg-[#EEDDCC] text-[#7A5228] border-[#E2C7B0]',
    HIGH: 'bg-[#F7E5C8] text-[#8B5E14] border-[#ECD5AE]',
    CRITICAL: 'bg-[#FADBD8] text-[#A93226] border-[#F5B7B1] ring-2 ring-[#A93226]/20 animate-pulse',
  };

  const isCritical = urgency === 'CRITICAL';

  return (
    <div className={`bg-white rounded-[2rem] border shadow-xs hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden group relative ${
      isCritical ? 'border-[#F5B7B1] ring-1 ring-[#A93226]/30' : 'border-[#E6D9C5] hover:border-[#DEC4A9]'
    }`}>
      
      {/* Critical Banner Highlight */}
      {isCritical && (
        <div className="bg-[#A93226] text-white text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 text-center flex items-center justify-center gap-1.5 shrink-0">
          <AlertTriangle className="w-3 h-3" />
          <span>RescueBite Priority: Critical Expiry Deal</span>
        </div>
      )}

      {/* Large Food Image Container */}
      <div 
        className="relative h-52 sm:h-56 w-full bg-[#F5EBDD] overflow-hidden cursor-pointer"
        onClick={() => onSelect && onSelect(item)}
      >
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null; // prevent infinite loop
            e.currentTarget.src = '/images/bakery.jpg';
          }}
        />
        
        {/* Discount Badge */}
        <div className="absolute top-3 left-3 bg-[#285C46] text-white text-xs font-extrabold px-3 py-1.5 rounded-full shadow-xs tracking-wider uppercase">
          {discountPercent}% OFF
        </div>

        {/* Urgency Badge */}
        <div className={`absolute top-3 right-3 text-xs font-bold px-3 py-1 rounded-full border shadow-2xs backdrop-blur-md flex items-center gap-1 ${urgencyBadges[urgency] || urgencyBadges.MEDIUM}`}>
          <Clock className="w-3 h-3" />
          <span>{urgency} ({expiryTime})</span>
        </div>

        {/* Quantity Remaining Overlay Badge */}
        <div className="absolute bottom-3 left-3 bg-[#1C2A23]/80 backdrop-blur-md text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#78977D]"></span>
          <span>{quantityRemaining} remaining</span>
        </div>
      </div>

      {/* Card Details */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Restaurant & Location */}
          <div className="flex items-center justify-between text-xs text-[#5C6A62] mb-1 font-medium">
            <span className="truncate max-w-[170px] font-semibold text-[#285C46]">{restaurant}</span>
            {location && (
              <span className="flex items-center gap-1 shrink-0 text-[#78977D]">
                <MapPin className="w-3 h-3" />
                {location}
              </span>
            )}
          </div>

          {/* Food Title */}
          <h3 
            onClick={() => onSelect && onSelect(item)}
            className="text-lg font-bold text-[#1C2A23] leading-snug group-hover:text-[#285C46] transition-colors cursor-pointer line-clamp-2"
          >
            {name}
          </h3>
        </div>

        {/* Pricing & Action */}
        <div className="mt-5 pt-4 border-t border-[#F3EADB] flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-[#1C2A23]">
              ₹{rescuePrice}
            </span>
            {originalPrice && (
              <span className="text-sm text-[#8C9A91] line-through font-medium">
                ₹{originalPrice}
              </span>
            )}
          </div>

          {/* Countdown display */}
          <div className="text-xs text-[#A93226] font-medium">
            {isExpired ? 'Expired' : `${minutes}m ${seconds}s`}
          </div>
          <Button
            variant={isCritical ? 'primary' : 'primary'}
            size="sm"
            onClick={() => onReserve ? onReserve(item) : (onSelect && onSelect(item))}
            disabled={isExpired}
            className="px-5 font-semibold text-xs py-2 shadow-xs"
          >
            {isExpired ? 'Unavailable' : 'Reserve'}
          </Button>
        </div>
        {/* Additional info: Recommended rescue price and priority score */}
        <div className="mt-3 text-xs text-[#5C6A62] flex flex-col gap-1">
          <span>Recommended Rescue Price: <strong className="text-[#285C46]">₹{item.recommendedRescuePrice || rescuePrice}</strong></span>
          <span>Priority Score: <strong className="text-[#285C46]">{item.priorityScore || '—'}</strong></span>
        </div>

      </div>
    </div>
  );
}

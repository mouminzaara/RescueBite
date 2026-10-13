import React from 'react';
import { X, Clock, MapPin, Store, ShieldCheck, Sparkles } from 'lucide-react';
import Button from './Button';

export default function FoodDetailModal({ item, onClose, onReserveConfirm }) {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#1C2A23]/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-[#F5EBDD] w-full max-w-2xl rounded-[2.5rem] border border-[#E6D9C5] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header bar */}
        <div className="relative h-64 sm:h-72 w-full bg-[#FAF4EB]">
          <img
            src={item.image}
            alt={item.name}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/images/bakery.jpg';
            }}
            className="w-full h-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md text-[#1C2A23] flex items-center justify-center hover:bg-white shadow-md transition-all"
            aria-label="Close detail modal"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="absolute top-4 left-4 bg-[#285C46] text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-xs uppercase tracking-wider">
            {item.discountPercent}% OFF
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#78977D] mb-1">
              <Store className="w-3.5 h-3.5" />
              <span>{item.restaurant}</span>
              {item.location && <span>• {item.location}</span>}
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1C2A23] tracking-tight">
              {item.name}
            </h2>
          </div>

          {/* Pricing & Time Urgency Grid */}
          <div className="bg-white rounded-2xl p-5 border border-[#E6D9C5] flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs text-[#5C6A62] block font-medium">Rescue Price</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-[#285C46]">₹{item.rescuePrice}</span>
                <span className="text-base text-[#8C9A91] line-through font-medium">₹{item.originalPrice}</span>
              </div>
            </div>

            <div className="space-y-1 text-right">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#DDE8D8] text-[#1E4736]">
                <Clock className="w-3.5 h-3.5" />
                {item.expiryTime}
              </div>
              <p className="text-xs text-[#5C6A62]">{item.quantityRemaining} portions remaining</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#5C6A62] mb-1">
              About this Rescue Offer
            </h4>
            <p className="text-sm text-[#1C2A23] leading-relaxed">
              {item.description || 'Delicious freshly prepared surplus food saved directly from waste. High quality and ready for instant pickup.'}
            </p>
          </div>

          {/* Pickup Information */}
          <div className="bg-[#DDE8D8]/50 rounded-2xl p-4 border border-[#B8D1C3] flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#285C46] shrink-0 mt-0.5" />
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-[#1E4736]">
                Pickup Details
              </h5>
              <p className="text-xs text-[#2E3933] mt-0.5">
                Pickup Window: <span className="font-semibold text-[#1C2A23]">{item.pickupWindow || 'Today, 8:00 PM - 9:30 PM'}</span>
              </p>
              <p className="text-[11px] text-[#5C6A62] mt-0.5">
                Show your digital reservation ID at restaurant counter upon pickup.
              </p>
            </div>
          </div>

          {/* Action CTA */}
          <div className="pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={() => onReserveConfirm(item)}
              className="w-full text-center justify-center text-base py-3.5 rounded-full shadow-md font-bold"
            >
              Reserve Now — ₹{item.rescuePrice}
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}

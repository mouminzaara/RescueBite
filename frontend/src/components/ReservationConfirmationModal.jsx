import React from 'react';
import { CheckCircle2, Clock, MapPin, Sparkles, X } from 'lucide-react';
import Button from './Button';
import { Link } from 'react-router-dom';

export default function ReservationConfirmationModal({ reservation, onClose }) {
  if (!reservation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#1C2A23]/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-[#F5EBDD] w-full max-w-md rounded-[2.5rem] border border-[#E6D9C5] shadow-2xl overflow-hidden p-6 sm:p-8 text-center animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Checked Icon */}
        <div className="w-16 h-16 rounded-full bg-[#DDE8D8] text-[#285C46] flex items-center justify-center mx-auto mb-4 border border-[#B8D1C3]">
          <CheckCircle2 className="w-10 h-10 text-[#285C46]" />
        </div>

        <span className="text-xs font-bold uppercase tracking-wider text-[#78977D]">
          Order Success
        </span>

        <h3 className="text-2xl font-extrabold text-[#1C2A23] mt-1 mb-2">
          Reservation Confirmed ✓
        </h3>
        
        <p className="text-xs text-[#5C6A62] mb-6">
          Your surplus meal is saved! Show this confirmation ticket at pickup.
        </p>

        {/* Confirmation Details Card */}
        <div className="bg-white rounded-2xl p-5 border border-[#E6D9C5] text-left space-y-3 mb-6 shadow-2xs">
          <div className="flex items-center justify-between border-b border-[#F3EADB] pb-2">
            <span className="text-xs text-[#5C6A62] font-medium">Reservation ID</span>
            <span className="text-xs font-extrabold text-[#285C46] tracking-wider uppercase bg-[#DDE8D8] px-2.5 py-0.5 rounded-full">
              {reservation.id || 'RES-9921'}
            </span>
          </div>

          <div>
            <h4 className="text-sm font-bold text-[#1C2A23]">
              {reservation.foodName || reservation.name}
            </h4>
            <p className="text-xs text-[#78977D] font-medium">
              {reservation.restaurant}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-[#F3EADB]">
            <div>
              <span className="text-[#8C9A91] block">Quantity</span>
              <span className="font-semibold text-[#1C2A23]">1 portion</span>
            </div>
            <div>
              <span className="text-[#8C9A91] block">Total Amount</span>
              <span className="font-extrabold text-[#285C46] text-sm">₹{reservation.price || reservation.rescuePrice}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-[#F3EADB] flex items-center gap-2 text-xs text-[#2E3933]">
            <Clock className="w-4 h-4 text-[#285C46] shrink-0" />
            <span>Pickup: <strong className="text-[#1C2A23]">{reservation.pickupWindow || 'Today, 8:00 PM - 9:30 PM'}</strong></span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Link to="/reservations" onClick={onClose}>
            <Button variant="primary" className="w-full text-center justify-center font-bold">
              View My Reservations
            </Button>
          </Link>
          <Button variant="ghost" onClick={onClose} className="w-full text-center justify-center text-xs">
            Back to Marketplace
          </Button>
        </div>

      </div>
    </div>
  );
}

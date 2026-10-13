import React from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import PageContainer from '../components/PageContainer';
import Button from '../components/Button';
import { CheckCircle2, Clock, MapPin, Store, ArrowRight, ShieldCheck } from 'lucide-react';

export default function ReservationConfirmation({ reservations = [] }) {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Find reservation from state or search prop list
  const reservation =
    location.state?.reservation ||
    reservations.find((r) => String(r.id) === String(id)) ||
    reservations[0] || {
      id: id || 'RES-9921',
      foodName: 'Artisanal Butter Croissants & Danish Box',
      restaurant: 'La Petite Boulangerie',
      quantity: 1,
      price: 140,
      pickupWindow: 'Today, 8:00 PM - 9:30 PM',
      status: 'CONFIRMED',
    };

  return (
    <PageContainer maxWidth="narrow">
      <div className="bg-white rounded-[2.5rem] border border-[#E6D9C5] p-6 sm:p-10 shadow-lg text-center my-4 space-y-6">
        
        {/* Checkmark Icon */}
        <div className="w-20 h-20 rounded-full bg-[#DDE8D8] text-[#285C46] flex items-center justify-center mx-auto border-2 border-[#B8D1C3]">
          <CheckCircle2 className="w-12 h-12 text-[#285C46]" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#78977D]">
            Order Confirmation Ticket
          </span>
          <h1 className="text-3xl font-extrabold text-[#1C2A23] mt-1">
            Reservation Confirmed ✓
          </h1>
          <p className="text-xs text-[#5C6A62] mt-1 max-w-sm mx-auto">
            Your surplus meal has been reserved. Please show this digital receipt at the restaurant counter upon pickup.
          </p>
        </div>

        {/* Ticket Details Card */}
        <div className="bg-[#FAF4EB] rounded-[2rem] p-6 border border-[#E6D9C5] text-left space-y-4 shadow-2xs">
          
          <div className="flex items-center justify-between border-b border-[#E6D9C5] pb-3">
            <span className="text-xs font-semibold text-[#5C6A62]">Reservation Ticket ID</span>
            <span className="text-xs font-black text-[#1E4736] bg-[#DDE8D8] px-3 py-1 rounded-full uppercase tracking-wider">
              {reservation.id}
            </span>
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#78977D] block mb-0.5">
              Food Item
            </span>
            <h3 className="text-lg font-bold text-[#1C2A23]">
              {reservation.foodName || reservation.name}
            </h3>
            <p className="text-xs text-[#5C6A62] flex items-center gap-1 mt-0.5 font-semibold">
              <Store className="w-3.5 h-3.5 text-[#285C46]" />
              {reservation.restaurant}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#E6D9C5] text-xs">
            <div>
              <span className="text-[#8C9A91] block">Quantity</span>
              <span className="font-extrabold text-[#1C2A23]">{reservation.quantity || 1} portion(s)</span>
            </div>
            <div>
              <span className="text-[#8C9A91] block">Status</span>
              <span className="font-bold text-[#285C46]">{reservation.status || 'CONFIRMED'}</span>
            </div>
            <div>
              <span className="text-[#8C9A91] block">Total Paid</span>
              <span className="font-black text-[#285C46] text-sm">₹{reservation.price || reservation.totalPrice}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E6D9C5] flex items-center gap-2.5 text-xs text-[#2E3933]">
            <Clock className="w-4 h-4 text-[#285C46] shrink-0" />
            <span>Pickup Window: <strong className="text-[#1C2A23]">{reservation.pickupWindow || 'Today, 8:00 PM - 9:30 PM'}</strong></span>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link to="/reservations" className="w-full sm:w-auto">
            <Button variant="primary" size="lg" className="w-full justify-center font-bold">
              View My Reservations
            </Button>
          </Link>
          <Link to="/explore" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full justify-center font-bold">
              Back to Marketplace
            </Button>
          </Link>
        </div>

      </div>
    </PageContainer>
  );
}

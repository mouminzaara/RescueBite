import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PageContainer from '../components/PageContainer';
import Button from '../components/Button';
import { 
  Clock, 
  MapPin, 
  Store, 
  ShieldCheck, 
  ArrowLeft, 
  Minus, 
  Plus, 
  Sparkles, 
  AlertTriangle 
} from 'lucide-react';

export default function FoodDetail({ foodItems = [], onReserveFood }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const item = foodItems.find((f) => String(f.id) === String(id)) || foodItems[0];
  // Parse expiryTime — handles both ISO strings and text like "Expires in 25 min"
  const computeExpiryMs = (val) => {
    if (!val) return 90 * 60 * 1000;
    const isoDate = new Date(val);
    if (!isNaN(isoDate.getTime())) return Math.max(isoDate.getTime() - Date.now(), 0);
    const s = String(val).toLowerCase();
    const minMatch = s.match(/(\d+(?:\.\d+)?)\s*min/);
    if (minMatch) return Math.round(parseFloat(minMatch[1]) * 60 * 1000);
    const hrMatch = s.match(/(\d+(?:\.\d+)?)\s*h/);
    if (hrMatch) return Math.round(parseFloat(hrMatch[1]) * 60 * 60 * 1000);
    return 90 * 60 * 1000;
  };

  const [remainingMs, setRemainingMs] = useState(() => computeExpiryMs(item?.expiryTime));
  const [countdown, setCountdown] = useState({
    minutes: Math.floor(computeExpiryMs(item?.expiryTime) / 60000),
    seconds: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingMs((prev) => {
        const next = Math.max(prev - 1000, 0);
        setCountdown({
          minutes: Math.floor(next / 60000),
          seconds: Math.floor((next % 60000) / 1000),
        });
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const isExpired = remainingMs === 0;

  if (!item) {

    return (
      <PageContainer>
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-[#1C2A23]">Food Offer Not Found</h2>
          <Link to="/explore" className="mt-4 inline-block text-[#285C46] font-bold underline">
            Back to Explore
          </Link>
        </div>
      </PageContainer>
    );
  }

  const urgencyBadges = {
    LOW: 'bg-[#DDE8D8] text-[#1E4736] border-[#B8D1C3]',
    MEDIUM: 'bg-[#EEDDCC] text-[#7A5228] border-[#E2C7B0]',
    HIGH: 'bg-[#F7E5C8] text-[#8B5E14] border-[#ECD5AE]',
    CRITICAL: 'bg-[#FADBD8] text-[#A93226] border-[#F5B7B1] animate-pulse',
  };

  const handleDecreaseQty = () => {
    if (selectedQuantity > 1) {
      setSelectedQuantity((prev) => prev - 1);
    }
  };

  const handleIncreaseQty = () => {
    if (selectedQuantity < (item.quantityRemaining || 5)) {
      setSelectedQuantity((prev) => prev + 1);
    }
  };

  const handleReserveNow = () => {
    const reservationData = {
      ...item,
      quantity: selectedQuantity,
      totalPrice: item.rescuePrice * selectedQuantity,
    };

    const createdReservation = onReserveFood ? onReserveFood(reservationData) : {
      id: `RES-${Math.floor(1000 + Math.random() * 9000)}`,
      foodName: item.name,
      restaurant: item.restaurant,
      quantity: selectedQuantity,
      price: item.rescuePrice * selectedQuantity,
      pickupWindow: item.pickupWindow || 'Today, 8:00 PM - 9:30 PM',
      status: 'CONFIRMED',
      reservationTime: 'Just now',
      image: item.image,
    };

    navigate(`/reservation-confirmation/${createdReservation.id}`, { state: { reservation: createdReservation } });
  };

  const formattedSeconds = String(countdown.seconds).padStart(2, '0');
  const isApproachingExpiry = countdown.minutes < 45 || item.urgency === 'CRITICAL' || item.urgency === 'HIGH';

  return (
    <PageContainer maxWidth="normal">
      
      {/* Top Back Link */}
      <div className="mb-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#5C6A62] hover:text-[#1C2A23] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Listings
        </button>
      </div>

      {/* FEATURE ENHANCEMENT BANNER */}
      <div className="bg-[#DDE8D8] border border-[#B8D1C3] text-[#1E4736] p-4 rounded-2xl mb-6 flex items-center justify-between text-xs font-bold">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#285C46]" />
          <span>RescueBite Enhancement: Expiry-Aware Dynamic Pricing & Priority System</span>
        </div>
        <span className="bg-[#285C46] text-white px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase">
          Urgency Rank: {item.urgency || 'MEDIUM'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Food Photo */}
        <div className="lg:col-span-7">
          <div className="relative h-80 sm:h-[420px] w-full rounded-[2.5rem] overflow-hidden border border-[#E6D9C5] shadow-md bg-[#FAF4EB]">
            <img
              src={item.image}
              alt={item.name}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/images/bakery.jpg';
              }}
              className="w-full h-full object-cover"
            />
            
            <div className="absolute top-4 left-4 bg-[#285C46] text-white text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-xs">
              {item.discountPercent}% OFF
            </div>

            <div className={`absolute top-4 right-4 text-xs font-bold px-3.5 py-1.5 rounded-full border shadow-2xs backdrop-blur-md ${urgencyBadges[item.urgency] || urgencyBadges.MEDIUM}`}>
              Urgency: {item.urgency || 'HIGH'}
            </div>
          </div>
        </div>

        {/* Right Column: Details & Dynamic Pricing Controls */}
        <div className="lg:col-span-5 space-y-6">
          
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#78977D] mb-1">
              <Store className="w-4 h-4 text-[#285C46]" />
              <span>{item.restaurant}</span>
              {item.location && <span>• {item.location}</span>}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C2A23] tracking-tight leading-tight">
              {item.name}
            </h1>
          </div>

          {/* Approaching Expiry Alert Callout */}
          {isApproachingExpiry && (
            <div className="bg-[#FADBD8] border border-[#F5B7B1] text-[#A93226] p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold">
              <AlertTriangle className="w-5 h-5 shrink-0 text-[#A93226]" />
              <div>
                <strong className="block font-extrabold uppercase">Approaching Expiry!</strong>
                <span>This item will expire soon. Reserve now to rescue this meal before time runs out.</span>
              </div>
            </div>
          )}

          {/* Pricing & Live Countdown Box */}
          <div className="bg-white rounded-[2rem] p-6 border border-[#E6D9C5] shadow-xs space-y-4">
            
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs text-[#5C6A62] block font-medium">Rescue Price</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-[#285C46]">₹{item.rescuePrice}</span>
                  {item.originalPrice && (
                    <span className="text-base text-[#8C9A91] line-through font-medium">
                      ₹{item.originalPrice}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-[#5C6A62] block font-medium">Portions Remaining</span>
                <span className="text-base font-extrabold text-[#1C2A23] bg-[#DDE8D8] px-3 py-0.5 rounded-full inline-block mt-0.5">
                  {item.quantityRemaining || 3} left
                </span>
              </div>
            </div>

            {/* Live Countdown Timer Bar */}
            <div className="pt-3 border-t border-[#F3EADB] flex items-center justify-between text-xs font-bold text-[#1C2A23]">
              <span className="flex items-center gap-1.5 text-[#A93226]">
                <Clock className="w-4 h-4 animate-pulse" />
                Time Until Expiry:
              </span>
              <span className="bg-[#FADBD8] text-[#A93226] px-3 py-1 rounded-full font-mono text-xs border border-[#F5B7B1]">
                {countdown.minutes}m {formattedSeconds}s remaining
              </span>
            </div>

          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#5C6A62] mb-1.5">
              Description & Highlights
            </h3>
            <p className="text-sm text-[#2E3933] leading-relaxed">
              {item.description || 'Delicious freshly prepared surplus food saved directly from waste. High quality and ready for instant pickup.'}
            </p>
          </div>

          {/* Pickup Information */}
          <div className="bg-[#DDE8D8]/50 rounded-[1.5rem] p-5 border border-[#B8D1C3] flex items-start gap-3.5">
            <ShieldCheck className="w-5 h-5 text-[#285C46] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1E4736]">
                Pickup Information
              </h4>
              <p className="text-xs text-[#2E3933]">
                Pickup Window: <strong className="text-[#1C2A23]">{item.pickupWindow || 'Today, 8:00 PM - 9:30 PM'}</strong>
              </p>
              <p className="text-[11px] text-[#5C6A62]">
                Show your digital ticket upon pickup at restaurant counter.
              </p>
            </div>
          </div>

          {/* Quantity Selector & Reserve CTA */}
          <div className="pt-2 space-y-4">
            <div className="flex items-center justify-between bg-white rounded-full p-2 border border-[#E6D9C5] shadow-2xs">
              <span className="text-xs font-bold uppercase tracking-wider text-[#5C6A62] pl-4">
                Select Quantity
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleDecreaseQty}
                  disabled={selectedQuantity <= 1}
                  className="w-8 h-8 rounded-full bg-[#FAF4EB] text-[#1C2A23] flex items-center justify-center hover:bg-[#E6D9C5] disabled:opacity-40 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-sm font-extrabold text-[#1C2A23] w-4 text-center">
                  {selectedQuantity}
                </span>
                <button
                  type="button"
                  onClick={handleIncreaseQty}
                  disabled={selectedQuantity >= (item.quantityRemaining || 5)}
                  className="w-8 h-8 rounded-full bg-[#FAF4EB] text-[#1C2A23] flex items-center justify-center hover:bg-[#E6D9C5] disabled:opacity-40 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={handleReserveNow}
              disabled={isExpired}
              className="w-full text-center justify-center font-bold text-base py-4 rounded-full shadow-md"
            >
              {isExpired ? 'Listing Expired' : `Reserve Now — ₹${item.rescuePrice * selectedQuantity}`}
            </Button>
          </div>

        </div>

      </div>

    </PageContainer>
  );
}

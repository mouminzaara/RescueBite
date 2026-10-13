import React, { useState } from 'react';
import PageContainer from '../components/PageContainer';
import SectionHeading from '../components/SectionHeading';
import Button from '../components/Button';
import { Store, MapPin, Star, Clock, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const DEFAULT_FALLBACK_IMG = '/restaurant-fallback.svg';

/**
 * Guaranteed local food photography map by restaurant id or category
 */
const RESTAURANT_IMAGES = {
  1: '/images/bakery.jpg',
  2: '/images/indian.jpg',
  3: '/images/cafe.jpg',
  4: '/images/asian.jpg',
  5: '/images/burger.jpg',
  'rest-1': '/images/bakery.jpg',
  'rest-2': '/images/indian.jpg',
  'rest-3': '/images/cafe.jpg',
  'rest-4': '/images/asian.jpg',
  'rest-5': '/images/burger.jpg',
};

function getRestaurantImage(rest) {
  if (rest.id && RESTAURANT_IMAGES[rest.id]) {
    return RESTAURANT_IMAGES[rest.id];
  }
  const name = (rest.name || '').toLowerCase();
  const cuisine = (rest.cuisine || rest.category || '').toLowerCase();

  if (name.includes('boulangerie') || name.includes('bakery') || cuisine.includes('bakery') || cuisine.includes('pastry')) {
    return '/images/bakery.jpg';
  }
  if (name.includes('spice') || name.includes('indian') || cuisine.includes('indian') || cuisine.includes('tandoor')) {
    return '/images/indian.jpg';
  }
  if (name.includes('earth') || name.includes('green') || cuisine.includes('vegan') || cuisine.includes('organic') || cuisine.includes('cafe')) {
    return '/images/cafe.jpg';
  }
  if (name.includes('wok') || name.includes('roll') || cuisine.includes('asian') || cuisine.includes('chinese')) {
    return '/images/asian.jpg';
  }
  if (name.includes('bites') || name.includes('street') || cuisine.includes('burger') || cuisine.includes('fast food')) {
    return '/images/burger.jpg';
  }

  return rest.image || rest.image_url || DEFAULT_FALLBACK_IMG;
}

/**
 * Clean, compact Restaurant Card matching RescueBite editorial visual direction
 * Strictly adheres to hierarchy: Food Image -> Restaurant Name -> Supporting Info -> CTA
 * No floating cards covering text, no text clipping, zero broken images
 */
function RestaurantCard({ rest }) {
  const resolvedImage = getRestaurantImage(rest);
  const [imgSrc, setImgSrc] = useState(resolvedImage);
  const [hasError, setHasError] = useState(false);

  const handleImageError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(DEFAULT_FALLBACK_IMG);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E6D9C5] shadow-xs hover:shadow-md hover:border-[#D6C4AC] transition-all duration-300 flex flex-col md:flex-row md:h-[260px] overflow-hidden group">
      
      {/* 1. RESTAURANT FOOD IMAGE (40–45% width on desktop, prominent top on mobile) */}
      <div className="relative w-full h-48 sm:h-52 md:h-full md:w-[42%] shrink-0 overflow-hidden bg-[#FAF4EB]">
        <img
          src={imgSrc}
          alt={`${rest.name} food`}
          onError={handleImageError}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* ACTIVE DEALS BADGE - In top corner only, never obscuring text */}
        <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 bg-[#285C46]/95 backdrop-blur-xs text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-xs tracking-wider uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-[#B8D1C3] animate-pulse" />
          <span>{rest.activeSurplus || 2} Active Deals</span>
        </div>
      </div>

      {/* 2. RESTAURANT DETAILS (55–60% width on desktop, completely unobstructed) */}
      <div className="p-4 sm:p-5 md:w-[58%] flex flex-col justify-between bg-white">
        <div>
          {/* Cuisine & Rating row */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#78977D] truncate">
              {rest.cuisine || rest.category || 'Artisanal Kitchen'}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[#1E4736] bg-[#DDE8D8]/80 border border-[#B8D1C3]/60 px-2.5 py-0.5 rounded-full shrink-0">
              <Star className="w-3 h-3 text-[#285C46] fill-[#285C46]" />
              <span>{rest.rating || 4.8}</span>
            </span>
          </div>

          {/* Restaurant Name - Fully visible, never clipped or hidden */}
          <h3 className="text-base sm:text-lg font-bold text-[#1C2A23] leading-snug group-hover:text-[#285C46] transition-colors break-words">
            {rest.name}
          </h3>

          {/* Location · distance */}
          <p className="text-xs text-[#5C6A62] mt-1 flex items-center gap-1.5 font-medium">
            <MapPin className="w-3.5 h-3.5 text-[#78977D] shrink-0" />
            <span>{rest.location || 'Bangalore'}</span>
          </p>

          {/* Pickup Window & Total Meals Saved */}
          <div className="mt-3 pt-2.5 border-t border-[#F3EADB] text-xs text-[#2E3933] space-y-1">
            <div className="flex items-center gap-1.5 text-[#5C6A62]">
              <Clock className="w-3.5 h-3.5 text-[#285C46] shrink-0" />
              <span>
                Pickup Window: <strong className="text-[#1C2A23] font-semibold">{rest.pickupTime || 'Today, 8:00 PM - 9:30 PM'}</strong>
              </span>
            </div>
            <div className="flex items-center justify-between text-[#5C6A62]">
              <span>Total Meals Saved:</span>
              <span className="font-extrabold text-[#285C46] bg-[#DDE8D8]/60 px-2 py-0.5 rounded-md text-[11px]">
                {rest.mealsRescued || 350}+
              </span>
            </div>
          </div>
        </div>

        {/* View Surplus Items Action - Clear, Accessible CTA */}
        <div className="mt-3 pt-1">
          <Link to="/explore" className="block">
            <Button
              variant="secondary"
              size="sm"
              className="w-full justify-center font-bold text-xs py-2 bg-[#DDE8D8] hover:bg-[#285C46] text-[#1E4736] hover:text-white transition-all duration-200 rounded-full group/btn shadow-2xs"
              icon={<ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />}
            >
              View Surplus Items
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function Restaurants({ restaurants = [] }) {
  return (
    <PageContainer maxWidth="wide">
      <SectionHeading
        badge="Verified Partners"
        badgeColor="forest"
        title="Partner Restaurants & Bakeries"
        subtitle="Discover eco-conscious local kitchens committed to zero food waste."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 bg-[#DDE8D8]/80 border border-[#B8D1C3] px-3 py-1.5 rounded-full text-xs font-bold text-[#1E4736] shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-[#285C46]" />
              <span>✓ Freshness Guaranteed</span>
            </div>
            <div className="hidden sm:inline-flex items-center gap-1.5 bg-white border border-[#E6D9C5] px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#1E4736] shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#285C46]" />
              <span>{restaurants.length} Local Kitchens Participating</span>
            </div>
          </div>
        }
      />

      {/* Clean 2-column grid on desktop, 1-column on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
        {restaurants.map((rest) => (
          <RestaurantCard key={rest.id} rest={rest} />
        ))}
      </div>

      {/* Empty State Fallback if no partners found */}
      {restaurants.length === 0 && (
        <div className="bg-white rounded-3xl border border-[#E6D9C5] p-12 text-center max-w-md mx-auto my-8 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-[#FAF4EB] border border-[#E6D9C5] flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8 text-[#285C46]" />
          </div>
          <h3 className="text-lg font-bold text-[#1C2A23]">No Partner Kitchens Found</h3>
          <p className="text-xs text-[#5C6A62] mt-1.5 leading-relaxed">
            We are actively onboarding local restaurants, bakeries, and cafes in your area.
          </p>
          <div className="mt-5">
            <Link to="/explore">
              <Button variant="primary" size="sm" className="px-6 font-semibold text-xs">
                Browse Surplus Listings
              </Button>
            </Link>
          </div>
        </div>
      )}
    </PageContainer>
  );
}

import React, { useState } from 'react';
import PageContainer from '../components/PageContainer';
import SectionHeading from '../components/SectionHeading';
import Button from '../components/Button';
import FoodCard from '../components/FoodCard';
import FoodDetailModal from '../components/FoodDetailModal';
import ReservationConfirmationModal from '../components/ReservationConfirmationModal';
import { 
  Compass, 
  Store, 
  Leaf, 
  ShieldCheck, 
  HeartHandshake, 
  ArrowRight, 
  ShoppingBag, 
  Clock, 
  Utensils, 
  PiggyBank, 
  Recycle, 
  ChevronRight,
  Star,
  MapPin 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home({ foodItems = [], onReserveFood }) {
  const [selectedFood, setSelectedFood] = useState(null);
  const [confirmedReservation, setConfirmedReservation] = useState(null);

  const handleReserveClick = (item) => {
    setSelectedFood(item);
  };

  const handleConfirmReservation = (item) => {
    const reservation = onReserveFood ? onReserveFood(item) : {
      id: `RES-${Math.floor(1000 + Math.random() * 9000)}`,
      foodName: item.name,
      restaurant: item.restaurant,
      price: item.rescuePrice,
      pickupWindow: item.pickupWindow || 'Today, 8:00 PM - 9:30 PM',
      status: 'CONFIRMED',
    };
    setSelectedFood(null);
    setConfirmedReservation(reservation);
  };

  return (
    <PageContainer maxWidth="wide">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-[#FAF4EB] border border-[#E6D9C5] p-6 sm:p-10 lg:p-14 mb-14 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#DDE8D8] text-[#1E4736] border border-[#B8D1C3]">
              <Leaf className="w-4 h-4 text-[#285C46]" />
              Local Food Rescue Marketplace
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#1C2A23] tracking-tight leading-[1.1]">
              Save Food.<br />
              <span className="text-[#285C46]">Save Money.</span><br />
              Eat Good.
            </h1>

            <p className="text-base sm:text-lg text-[#5C6A62] max-w-xl font-normal leading-relaxed">
              RescueBite helps people discover discounted surplus food from local restaurants before it goes to waste.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link to="/explore">
                <Button variant="primary" size="lg" icon={<Compass className="w-5 h-5" />}>
                  Explore Food
                </Button>
              </Link>
              <Link to="/restaurant-dashboard">
                <Button variant="secondary" size="lg" icon={<Store className="w-5 h-5" />}>
                  List Surplus Food
                </Button>
              </Link>
            </div>

            {/* Inline Freshness Guaranteed Badge (Never floating or covering content) */}
            <div className="flex items-center gap-2 pt-1 text-xs text-[#5C6A62] font-medium">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DDE8D8]/90 text-[#1E4736] font-bold border border-[#B8D1C3]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#285C46]" />
                ✓ Freshness Guaranteed
              </span>
              <span className="hidden sm:inline">• 100% Safe, Delicious & Inspected Surplus</span>
            </div>
          </div>

          {/* Right Hero Image Showcase: Clean, Non-overlapping Food Rescue Card */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl border border-[#E6D9C5] shadow-md overflow-hidden max-w-md mx-auto lg:max-w-none group">
              {/* Food Image Container */}
              <div className="relative h-52 sm:h-56 w-full bg-[#FAF4EB] overflow-hidden">
                <img
                  src="/images/bakery.jpg"
                  alt="La Petite Boulangerie - Fresh Butter Croissants"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-[#285C46] text-white text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
                  Featured Rescue Deal
                </div>
              </div>

              {/* Card Body - Completely unobstructed, clear hierarchy */}
              <div className="p-5 sm:p-6 bg-white space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold uppercase tracking-wider text-[#78977D]">
                    French Bakery & Pastry
                  </span>
                  <span className="flex items-center gap-1 text-[#1C2A23] font-bold bg-[#DDE8D8] px-2 py-0.5 rounded-full text-xs">
                    <Star className="w-3 h-3 text-[#285C46] fill-[#285C46]" />
                    4.9
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#1C2A23]">
                    La Petite Boulangerie
                  </h3>
                  <p className="text-xs text-[#5C6A62] mt-0.5 font-medium flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#78977D]" />
                    Indiranagar • 1.2 km
                  </p>
                </div>

                <div className="pt-3 border-t border-[#F3EADB] flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#5C6A62] font-semibold">Artisanal Croissants Box</p>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-xl font-extrabold text-[#1C2A23]">₹140</span>
                      <span className="text-xs text-[#8C9A91] line-through font-medium">₹350</span>
                      <span className="text-[11px] font-extrabold text-[#285C46] bg-[#DDE8D8]/70 px-1.5 py-0.5 rounded">60% OFF</span>
                    </div>
                  </div>

                  <Link to="/explore">
                    <Button variant="primary" size="sm" className="px-4 py-2 font-bold text-xs shadow-xs" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                      Rescue Deal
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. FOOD NEAR EXPIRY SECTION */}
      <section className="mb-16">
        <SectionHeading
          badge="Live Deals"
          badgeColor="forest"
          title="Food Near Expiry"
          subtitle="Grab high-quality surplus meals before time runs out at up to 60% off."
          action={
            <Link to="/explore">
              <Button variant="outline" size="sm" icon={<ArrowRight className="w-4 h-4" />}>
                View All Deals
              </Button>
            </Link>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {foodItems.slice(0, 6).map((item) => (
            <FoodCard
              key={item.id}
              item={item}
              onSelect={handleReserveClick}
              onReserve={handleReserveClick}
            />
          ))}
        </div>
      </section>

      {/* 3. HOW RESCUEBITE WORKS SECTION */}
      <section className="mb-16">
        <SectionHeading
          badge="Simple Process"
          badgeColor="sage"
          title="How RescueBite Works"
          subtitle="Three easy steps to rescue delicious meals and cut down food waste."
          align="center"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          
          {/* Step 1 */}
          <div className="bg-white rounded-[2rem] p-8 border border-[#E6D9C5] shadow-xs hover:shadow-md transition-all text-center relative group">
            <div className="w-14 h-14 rounded-2xl bg-[#DDE8D8] text-[#285C46] flex items-center justify-center mx-auto mb-6 text-xl font-black">
              1
            </div>
            <h3 className="text-xl font-extrabold text-[#1C2A23] mb-2">
              Restaurants list surplus food
            </h3>
            <p className="text-sm text-[#5C6A62] leading-relaxed">
              Local bakeries, cafes, and eateries list high-quality unsold meals and surprise surplus bags at discounted prices.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-[2rem] p-8 border border-[#E6D9C5] shadow-xs hover:shadow-md transition-all text-center relative group">
            <div className="w-14 h-14 rounded-2xl bg-[#EEDDCC] text-[#7A5228] flex items-center justify-center mx-auto mb-6 text-xl font-black">
              2
            </div>
            <h3 className="text-xl font-extrabold text-[#1C2A23] mb-2">
              Customers reserve meals
            </h3>
            <p className="text-sm text-[#5C6A62] leading-relaxed">
              Browse available listings near you, reserve your favorite meals online, and get an instant digital pickup receipt.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-[2rem] p-8 border border-[#E6D9C5] shadow-xs hover:shadow-md transition-all text-center relative group">
            <div className="w-14 h-14 rounded-2xl bg-[#DDE8D8] text-[#285C46] flex items-center justify-center mx-auto mb-6 text-xl font-black">
              3
            </div>
            <h3 className="text-xl font-extrabold text-[#1C2A23] mb-2">
              Food gets rescued instead of wasted
            </h3>
            <p className="text-sm text-[#5C6A62] leading-relaxed">
              Pick up your reserved food at the restaurant during the pickup window and enjoy great food while helping the planet.
            </p>
          </div>

        </div>
      </section>

      {/* 4. WHY RESCUEBITE? SECTION */}
      <section className="mb-16">
        <SectionHeading
          badge="Our Mission"
          badgeColor="forest"
          title="Why RescueBite?"
          subtitle="Creating a win-win community for eaters, local businesses, and the environment."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          
          {/* Feature 1 */}
          <div className="bg-[#FAF4EB] rounded-[2rem] p-8 border border-[#E6D9C5] flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#285C46] text-white flex items-center justify-center mb-6 shadow-xs">
                <Recycle className="w-6 h-6 text-[#DDE8D8]" />
              </div>
              <h3 className="text-xl font-extrabold text-[#1C2A23] mb-2">
                Reduce food waste
              </h3>
              <p className="text-sm text-[#5C6A62] leading-relaxed">
                Prevent perfectly good surplus meals from ending up in landfills, significantly lowering greenhouse gas emissions.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="bg-[#FAF4EB] rounded-[2rem] p-8 border border-[#E6D9C5] flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#285C46] text-white flex items-center justify-center mb-6 shadow-xs">
                <PiggyBank className="w-6 h-6 text-[#DDE8D8]" />
              </div>
              <h3 className="text-xl font-extrabold text-[#1C2A23] mb-2">
                Affordable meals
              </h3>
              <p className="text-sm text-[#5C6A62] leading-relaxed">
                Enjoy delicious restaurant dishes, baked goods, and meals at up to 60% off standard menu prices.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="bg-[#FAF4EB] rounded-[2rem] p-8 border border-[#E6D9C5] flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#285C46] text-white flex items-center justify-center mb-6 shadow-xs">
                <Store className="w-6 h-6 text-[#DDE8D8]" />
              </div>
              <h3 className="text-xl font-extrabold text-[#1C2A23] mb-2">
                Help local restaurants
              </h3>
              <p className="text-sm text-[#5C6A62] leading-relaxed">
                Support local food businesses by recovering food preparation costs and discovering new favorite neighborhood spots.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 5. IMPACT PREVIEW SECTION */}
      <section className="rounded-[2.5rem] bg-[#285C46] text-white p-8 sm:p-12 mb-16 shadow-lg relative overflow-hidden">
        <div className="max-w-4xl relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#DDE8D8] text-[#1E4736] mb-4">
            <HeartHandshake className="w-4 h-4" />
            Impact Preview
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-3">
            Real Community Impact
          </h2>
          <p className="text-[#DDE8D8] text-base leading-relaxed mb-8 max-w-2xl">
            Together with local kitchens and eco-conscious food lovers, RescueBite turns surplus food into sustainable savings every single day.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-[#78977D]/40">
            <div className="bg-[#1E4736]/70 p-6 rounded-2xl border border-[#78977D]/40 text-center sm:text-left">
              <div className="text-3xl sm:text-4xl font-black text-white">1,248</div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#DDE8D8] mt-1">Meals rescued</div>
            </div>
            <div className="bg-[#1E4736]/70 p-6 rounded-2xl border border-[#78977D]/40 text-center sm:text-left">
              <div className="text-3xl sm:text-4xl font-black text-white">386 kg</div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#DDE8D8] mt-1">Food saved</div>
            </div>
            <div className="bg-[#1E4736]/70 p-6 rounded-2xl border border-[#78977D]/40 text-center sm:text-left">
              <div className="text-3xl sm:text-4xl font-black text-white">₹84K</div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#DDE8D8] mt-1">Money saved</div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOD DETAIL MODAL */}
      {selectedFood && (
        <FoodDetailModal
          item={selectedFood}
          onClose={() => setSelectedFood(null)}
          onReserveConfirm={handleConfirmReservation}
        />
      )}

      {/* CONFIRMATION TICKET MODAL */}
      {confirmedReservation && (
        <ReservationConfirmationModal
          reservation={confirmedReservation}
          onClose={() => setConfirmedReservation(null)}
        />
      )}

    </PageContainer>
  );
}

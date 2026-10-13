import React, { useState, useMemo } from 'react';
import PageContainer from '../components/PageContainer';
import SectionHeading from '../components/SectionHeading';
import FoodCard from '../components/FoodCard';
import FoodDetailModal from '../components/FoodDetailModal';
import ReservationConfirmationModal from '../components/ReservationConfirmationModal';
import { Search, Filter, Compass, ArrowUpDown, Sparkles, Clock, AlertTriangle } from 'lucide-react';

export default function Explore({ foodItems = [], onReserveFood }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPriceMax, setSelectedPriceMax] = useState('ALL');
  const [selectedRestaurant, setSelectedRestaurant] = useState('ALL');
  const [sortBy, setSortBy] = useState('URGENCY'); // URGENCY | EXPIRING_SOON | LOWEST_PRICE | HIGHEST_DISCOUNT | NEWEST

  const [selectedFood, setSelectedFood] = useState(null);
  const [confirmedReservation, setConfirmedReservation] = useState(null);

  const categories = ['All', 'Indian', 'Chinese', 'Fast Food', 'Bakery', 'Vegetarian', 'Vegan'];

  const restaurantOptions = useMemo(() => {
    const set = new Set(foodItems.map((item) => item.restaurant));
    return ['ALL', ...Array.from(set)];
  }, [foodItems]);

  const urgencyOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };

  // Filter & Sort Logic
  const filteredAndSortedItems = useMemo(() => {
    let result = foodItems.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.restaurant.toLowerCase().includes(searchQuery.toLowerCase());

      let matchesCategory = true;
      if (selectedCategory !== 'All') {
        matchesCategory =
          item.category === selectedCategory ||
          item.diet === selectedCategory;
      }

      let matchesPrice = true;
      if (selectedPriceMax === '120') matchesPrice = item.rescuePrice <= 120;
      if (selectedPriceMax === '150') matchesPrice = item.rescuePrice <= 150;
      if (selectedPriceMax === '200') matchesPrice = item.rescuePrice <= 200;

      let matchesRestaurant = true;
      if (selectedRestaurant !== 'ALL') {
        matchesRestaurant = item.restaurant === selectedRestaurant;
      }

      return matchesSearch && matchesCategory && matchesPrice && matchesRestaurant;
    });

    return result.sort((a, b) => {
      if (sortBy === 'URGENCY') {
        const uA = urgencyOrder[a.urgency] || 2;
        const uB = urgencyOrder[b.urgency] || 2;
        if (uA !== uB) return uB - uA; // Critical first
        return (a.expiryMinutes || 999) - (b.expiryMinutes || 999);
      }
      if (sortBy === 'EXPIRING_SOON') {
        return (a.expiryMinutes || 999) - (b.expiryMinutes || 999);
      }
      if (sortBy === 'LOWEST_PRICE') {
        return a.rescuePrice - b.rescuePrice;
      }
      if (sortBy === 'HIGHEST_DISCOUNT') {
        return (b.discountPercent || 0) - (a.discountPercent || 0);
      }
      if (sortBy === 'NEWEST') {
        return (b.createdAt || 0) - (a.createdAt || 0);
      }
      return 0;
    });
  }, [foodItems, searchQuery, selectedCategory, selectedPriceMax, selectedRestaurant, sortBy]);

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

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedPriceMax('ALL');
    setSelectedRestaurant('ALL');
    setSortBy('URGENCY');
  };

  // Critical listings subset
  const criticalListings = useMemo(() => {
    return foodItems.filter((item) => item.urgency === 'CRITICAL' || item.urgency === 'HIGH');
  }, [foodItems]);

  return (
    <PageContainer maxWidth="wide">
      <SectionHeading
        badge="RescueBite System Enhancement"
        badgeColor="forest"
        title="Explore Food Rescue Deals"
        subtitle="Powered by RescueBite's Expiry-Aware Dynamic Pricing & Priority System."
      />

      {/* FEATURE ENHANCEMENT BANNER */}
      <div className="bg-gradient-to-r from-[#1C2A23] to-[#285C46] text-white p-5 rounded-[2rem] shadow-md mb-8 border border-[#78977D]/30 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-[#DDE8D8] text-[#285C46] flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-[#285C46]" />
          </div>
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#DDE8D8]">
              RescueBite Enhancement Feature
            </span>
            <h4 className="text-base font-bold text-white">
              Expiry-Aware Food Priority & Dynamic Pricing System
            </h4>
            <p className="text-xs text-[#DDE8D8] mt-0.5">
              Items approaching expiry automatically receive higher urgency scores and recommended discount pricing.
            </p>
          </div>
        </div>
        
        <div className="shrink-0 flex items-center gap-2">
          <button
            onClick={() => setSortBy('URGENCY')}
            className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all border ${
              sortBy === 'URGENCY'
                ? 'bg-[#DDE8D8] text-[#1E4736] border-white shadow-xs'
                : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
            }`}
          >
            🔥 Sort by Urgency Priority
          </button>
        </div>
      </div>

      {/* FILTER & CONTROL PANEL */}
      <div className="bg-white rounded-[2rem] border border-[#E6D9C5] p-5 sm:p-6 mb-8 shadow-2xs space-y-5">
        
        {/* Top Row: Search Input & Sort Selector */}
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#78977D]" />
            <input
              type="text"
              placeholder="Search food, dishes, or restaurant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-full bg-[#FAF4EB] border border-[#E6D9C5] text-sm text-[#1C2A23] focus:outline-none focus:ring-2 focus:ring-[#285C46]/30 font-medium"
            />
          </div>

          {/* Secondary Selectors */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-start md:justify-end">
            
            {/* Price Filter */}
            <select
              value={selectedPriceMax}
              onChange={(e) => setSelectedPriceMax(e.target.value)}
              className="px-4 py-2.5 rounded-full bg-[#FAF4EB] border border-[#E6D9C5] text-xs font-semibold text-[#1C2A23] focus:outline-none focus:ring-2 focus:ring-[#285C46]/30"
            >
              <option value="ALL">All Prices</option>
              <option value="120">Under ₹120</option>
              <option value="150">Under ₹150</option>
              <option value="200">Under ₹200</option>
            </select>

            {/* Restaurant Filter */}
            <select
              value={selectedRestaurant}
              onChange={(e) => setSelectedRestaurant(e.target.value)}
              className="px-4 py-2.5 rounded-full bg-[#FAF4EB] border border-[#E6D9C5] text-xs font-semibold text-[#1C2A23] focus:outline-none focus:ring-2 focus:ring-[#285C46]/30 max-w-[170px] truncate"
            >
              <option value="ALL">All Restaurants</option>
              {restaurantOptions.filter(r => r !== 'ALL').map((rest) => (
                <option key={rest} value={rest}>{rest}</option>
              ))}
            </select>

            {/* Sort Options */}
            <div className="flex items-center gap-1.5 bg-[#DDE8D8] px-3.5 py-2 rounded-full border border-[#B8D1C3]">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#285C46]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs font-bold text-[#1E4736] focus:outline-none cursor-pointer"
              >
                <option value="URGENCY">Sort: Urgency (Priority)</option>
                <option value="EXPIRING_SOON">Sort: Expiring Soon</option>
                <option value="LOWEST_PRICE">Sort: Lowest Price</option>
                <option value="HIGHEST_DISCOUNT">Sort: Highest Discount</option>
                <option value="NEWEST">Sort: Newest</option>
              </select>
            </div>

          </div>
        </div>

        {/* Bottom Row: Category Filter Chips */}
        <div className="pt-2 border-t border-[#F3EADB] flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold uppercase tracking-wider text-[#78977D] shrink-0 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            Categories:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#285C46] text-white shadow-xs'
                  : 'bg-[#FAF4EB] text-[#2E3933] border border-[#E6D9C5] hover:bg-[#DDE8D8]/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* RESULTS FEEDBACK BAR */}
      <div className="flex items-center justify-between mb-6 px-1">
        <span className="text-xs font-bold uppercase tracking-wider text-[#5C6A62]">
          Showing {filteredAndSortedItems.length} Surplus Offers
        </span>
        {(searchQuery || selectedCategory !== 'All' || selectedPriceMax !== 'ALL' || selectedRestaurant !== 'ALL') && (
          <button
            onClick={handleResetFilters}
            className="text-xs font-bold text-[#285C46] hover:underline"
          >
            Clear All Filters
          </button>
        )}
      </div>

      {/* FOOD LISTING GRID */}
      {filteredAndSortedItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredAndSortedItems.map((item) => (
            <FoodCard
              key={item.id}
              item={item}
              onSelect={(food) => setSelectedFood(food)}
              onReserve={(food) => setSelectedFood(food)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] border border-[#E6D9C5] p-12 text-center my-8">
          <div className="w-12 h-12 rounded-full bg-[#DDE8D8] text-[#285C46] flex items-center justify-center mx-auto mb-4">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[#1C2A23]">No Surplus Offers Match Your Filter</h3>
          <p className="text-[#5C6A62] text-sm max-w-sm mx-auto mt-1 mb-6">
            Try adjusting your price range, category selection, or search keywords.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-6 py-2.5 rounded-full bg-[#285C46] text-white text-xs font-bold shadow-xs hover:bg-[#1E4736] transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* MODALS */}
      {selectedFood && (
        <FoodDetailModal
          item={selectedFood}
          onClose={() => setSelectedFood(null)}
          onReserveConfirm={handleConfirmReservation}
        />
      )}

      {confirmedReservation && (
        <ReservationConfirmationModal
          reservation={confirmedReservation}
          onClose={() => setConfirmedReservation(null)}
        />
      )}
    </PageContainer>
  );
}

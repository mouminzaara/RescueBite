import React, { useState } from 'react';
import PageContainer from '../components/PageContainer';
import SectionHeading from '../components/SectionHeading';
import Button from '../components/Button';
import AddSurplusModal from '../components/AddSurplusModal';
import { 
  PlusCircle, 
  ShoppingBag, 
  Leaf, 
  IndianRupee, 
  Clock, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  Bookmark,
  TrendingDown,
  Check
} from 'lucide-react';

export default function RestaurantDashboard({ 
  foodItems = [], 
  reservations = [],
  onAddListing, 
  onUpdateListing,
  onDeleteListing 
}) {
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [confirmingPriceItem, setConfirmingPriceItem] = useState(null);

  // Compute Summary Metrics
  const activeListingsCount = foodItems.filter((i) => i.status !== 'Sold Out').length;
  const itemsReservedCount = reservations.reduce((acc, curr) => acc + (curr.quantity || 1), 12);
  const mealsRescuedCount = 412 + itemsReservedCount;
  const totalRevenue = foodItems.reduce((acc, curr) => acc + (curr.rescuePrice * 2), 3450);

  const urgencyBadges = {
    LOW: 'bg-[#DDE8D8] text-[#1E4736] border-[#B8D1C3]',
    MEDIUM: 'bg-[#EEDDCC] text-[#7A5228] border-[#E2C7B0]',
    HIGH: 'bg-[#F7E5C8] text-[#8B5E14] border-[#ECD5AE]',
    CRITICAL: 'bg-[#FADBD8] text-[#A93226] border-[#F5B7B1] animate-pulse',
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleSaveListing = (savedData) => {
    if (editingItem) {
      if (onUpdateListing) {
        onUpdateListing(savedData);
      } else if (onAddListing) {
        onAddListing(savedData);
      }
    } else {
      if (onAddListing) {
        onAddListing(savedData);
      }
    }
  };

  // Explicit confirmation before adopting recommended price
  const handleApplyRecommendedPrice = (item) => {
    setConfirmingPriceItem(item);
  };

  const handleConfirmPriceChange = () => {
    if (!confirmingPriceItem) return;
    const targetRecommended = confirmingPriceItem.recommendedRescuePrice || Math.round(confirmingPriceItem.originalPrice * 0.4);
    
    const updated = {
      ...confirmingPriceItem,
      rescuePrice: targetRecommended,
      discountPercent: Math.round((((confirmingPriceItem.originalPrice - targetRecommended) / confirmingPriceItem.originalPrice)) * 100)
    };

    if (onUpdateListing) {
      onUpdateListing(updated);
    }
    setConfirmingPriceItem(null);
  };

  return (
    <PageContainer maxWidth="wide">
      <SectionHeading
        badge="La Petite Boulangerie"
        badgeColor="forest"
        title="Restaurant Partner Dashboard"
        subtitle="Manage surplus food inventory, review AI price recommendations, and update offers."
        action={
          <Button
            variant="primary"
            size="md"
            onClick={handleOpenAdd}
            icon={<PlusCircle className="w-5 h-5" />}
            className="font-bold shadow-md"
          >
            Add Surplus Food
          </Button>
        }
      />

      {/* FEATURE ENHANCEMENT BANNER */}
      <div className="bg-[#FAF4EB] border border-[#E6D9C5] p-5 rounded-[2rem] shadow-xs mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#DDE8D8] text-[#285C46] flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-[#285C46]" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#78977D]">
              RescueBite Enhancement Feature
            </span>
            <h4 className="text-base font-bold text-[#1C2A23]">
              Expiry-Aware Food Priority & Dynamic Pricing Engine
            </h4>
            <p className="text-xs text-[#5C6A62]">
              Offers near expiry are automatically assigned dynamic pricing recommendations. Prices are updated only upon explicit restaurant confirmation.
            </p>
          </div>
        </div>
      </div>

      {/* 1. SUMMARY CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
        
        <div className="bg-white rounded-[2rem] p-5 sm:p-6 border border-[#E6D9C5] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#78977D]">Active Listings</span>
            <div className="w-9 h-9 rounded-xl bg-[#DDE8D8] text-[#285C46] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-[#1C2A23]">{activeListingsCount}</span>
            <p className="text-xs text-[#5C6A62] font-medium mt-0.5">Live on marketplace</p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-5 sm:p-6 border border-[#E6D9C5] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#78977D]">Items Reserved</span>
            <div className="w-9 h-9 rounded-xl bg-[#EEDDCC] text-[#7A5228] flex items-center justify-center">
              <Bookmark className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-[#1C2A23]">{itemsReservedCount}</span>
            <p className="text-xs text-[#5C6A62] font-medium mt-0.5">Customer reservations</p>
          </div>
        </div>

        <div className="bg-[#285C46] text-white rounded-[2rem] p-5 sm:p-6 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#DDE8D8]">Meals Rescued</span>
            <div className="w-9 h-9 rounded-xl bg-[#1E4736] text-[#DDE8D8] flex items-center justify-center">
              <Leaf className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-white">{mealsRescuedCount}</span>
            <p className="text-xs text-[#DDE8D8] font-medium mt-0.5">Waste prevented</p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-5 sm:p-6 border border-[#E6D9C5] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#78977D]">Revenue</span>
            <div className="w-9 h-9 rounded-xl bg-[#F3EADB] text-[#1C2A23] flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-[#1C2A23]">₹{totalRevenue}</span>
            <p className="text-xs text-[#5C6A62] font-medium mt-0.5">Recovered income</p>
          </div>
        </div>

      </div>

      {/* 2. CURRENT SURPLUS LISTINGS TABLE & RECOMMENDED PRICING */}
      <div className="bg-white rounded-[2.5rem] border border-[#E6D9C5] p-6 sm:p-8 shadow-xs overflow-hidden">
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-[#1C2A23]">
              Current Surplus Listings & Dynamic Pricing
            </h3>
            <p className="text-xs text-[#5C6A62]">
              Compare current rescue prices with expiry-aware recommended prices.
            </p>
          </div>
          <span className="text-xs text-[#285C46] bg-[#DDE8D8] px-3 py-1 rounded-full font-bold uppercase tracking-wider">
            {foodItems.length} Offers
          </span>
        </div>

        {foodItems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E6D9C5] text-xs font-bold uppercase tracking-wider text-[#78977D]">
                  <th className="pb-3 pl-2">Food</th>
                  <th className="pb-3">Qty</th>
                  <th className="pb-3">Current Price</th>
                  <th className="pb-3 text-[#285C46]">Recommended Price</th>
                  <th className="pb-3">Expiry</th>
                  <th className="pb-3">Priority</th>
                  <th className="pb-3 text-right pr-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3EADB] text-sm font-medium text-[#1C2A23]">
                {foodItems.map((item) => {
                  const recPrice = item.recommendedRescuePrice || Math.round(item.originalPrice * 0.4);
                  const isDiff = item.rescuePrice !== recPrice;

                  return (
                    <tr key={item.id} className="hover:bg-[#FAF4EB]/60 transition-colors">
                      
                      {/* Food Thumbnail & Title */}
                      <td className="py-4 pl-2">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-[#FAF4EB] overflow-hidden shrink-0 border border-[#E6D9C5]">
                            <img
                              src={item.image}
                              alt={item.name}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '/images/bakery.jpg';
                              }}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-bold text-[#1C2A23] leading-snug">
                              {item.name}
                            </div>
                            <span className="text-[11px] font-semibold text-[#78977D] uppercase">
                              {item.category}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Quantity */}
                      <td className="py-4">
                        <span className="font-extrabold text-[#1C2A23]">
                          {item.quantityRemaining}
                        </span>
                        <span className="text-xs text-[#5C6A62] block">portions</span>
                      </td>

                      {/* Current Rescue Price */}
                      <td className="py-4">
                        <div className="font-extrabold text-[#1C2A23]">
                          ₹{item.rescuePrice}
                        </div>
                        {item.originalPrice && (
                          <span className="text-xs text-[#8C9A91] line-through block">
                            ₹{item.originalPrice}
                          </span>
                        )}
                      </td>

                      {/* Recommended Rescue Price */}
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <div>
                            <span className="font-black text-[#285C46] block text-sm">
                              ₹{recPrice}
                            </span>
                            <span className="text-[10px] text-[#78977D] font-bold block uppercase">
                              Suggested
                            </span>
                          </div>

                          {isDiff && (
                            <button
                              type="button"
                              onClick={() => handleApplyRecommendedPrice(item)}
                              className="px-2.5 py-1 rounded-full bg-[#DDE8D8] text-[#1E4736] hover:bg-[#285C46] hover:text-white text-[11px] font-bold transition-all border border-[#B8D1C3] shrink-0"
                              title="Apply Recommended Price on Confirmation"
                            >
                              Apply ₹{recPrice}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Expiry */}
                      <td className="py-4 text-xs font-semibold text-[#2E3933]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#285C46]" />
                          {item.expiryTime}
                        </span>
                      </td>

                      {/* Priority Urgency Badge */}
                      <td className="py-4">
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${urgencyBadges[item.urgency] || urgencyBadges.MEDIUM}`}>
                          {item.urgency || 'HIGH'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 text-right pr-2">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            className="p-2 rounded-full text-[#285C46] hover:bg-[#DDE8D8] transition-colors"
                            title="Edit Listing"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {onDeleteListing && (
                            <button
                              type="button"
                              onClick={() => onDeleteListing(item.id)}
                              className="p-2 rounded-full text-[#A93226] hover:bg-[#FADBD8] transition-colors"
                              title="Remove Listing"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-sm text-[#5C6A62] mb-4">No active surplus food listed yet.</p>
            <Button variant="primary" onClick={handleOpenAdd} icon={<PlusCircle className="w-4 h-4" />}>
              Create Surplus Listing
            </Button>
          </div>
        )}

      </div>

      {/* CONFIRMATION DIALOG FOR RECOMMENDED PRICE CONFIRMATION */}
      {confirmingPriceItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C2A23]/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#F5EBDD] max-w-md w-full rounded-[2.5rem] p-6 sm:p-8 border border-[#E6D9C5] shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#DDE8D8] text-[#285C46] flex items-center justify-center mx-auto">
              <TrendingDown className="w-8 h-8 text-[#285C46]" />
            </div>

            <h3 className="text-xl font-bold text-[#1C2A23]">
              Confirm Dynamic Price Update?
            </h3>

            <p className="text-xs text-[#5C6A62]">
              Change price for <strong className="text-[#1C2A23]">{confirmingPriceItem.name}</strong> from <span className="line-through text-[#8C9A91]">₹{confirmingPriceItem.rescuePrice}</span> to recommended <strong className="text-[#285C46]">₹{confirmingPriceItem.recommendedRescuePrice || Math.round(confirmingPriceItem.originalPrice * 0.4)}</strong>?
            </p>

            <div className="bg-white p-4 rounded-2xl border border-[#E6D9C5] text-left text-xs space-y-1">
              <div className="flex justify-between font-semibold text-[#1C2A23]">
                <span>Original Price:</span>
                <span>₹{confirmingPriceItem.originalPrice}</span>
              </div>
              <div className="flex justify-between font-bold text-[#285C46]">
                <span>New Recommended Discount:</span>
                <span>{Math.round((((confirmingPriceItem.originalPrice - (confirmingPriceItem.recommendedRescuePrice || Math.round(confirmingPriceItem.originalPrice * 0.4))) / confirmingPriceItem.originalPrice)) * 100)}% OFF</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="primary"
                onClick={handleConfirmPriceChange}
                className="w-1/2 justify-center font-bold"
              >
                Confirm Price
              </Button>
              <Button
                variant="outline"
                onClick={() => setConfirmingPriceItem(null)}
                className="w-1/2 justify-center font-bold"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT FORM MODAL */}
      {showModal && (
        <AddSurplusModal
          initialData={editingItem}
          onClose={() => setShowModal(false)}
          onSaveListing={handleSaveListing}
        />
      )}

    </PageContainer>
  );
}

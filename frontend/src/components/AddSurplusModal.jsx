import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import Button from './Button';

export default function AddSurplusModal({ initialData = null, onClose, onSaveListing }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Bakery',
    originalPrice: '',
    rescuePrice: '',
    quantityRemaining: '3',
    expiryTime: 'Expires in 1 hr',
    urgency: 'HIGH',
    pickupWindow: 'Today, 8:00 PM - 9:30 PM',
    image: '/images/bakery.jpg',
    restaurant: 'La Petite Boulangerie',
    status: 'Active',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        category: initialData.category || 'Bakery',
        originalPrice: initialData.originalPrice || '',
        rescuePrice: initialData.rescuePrice || '',
        quantityRemaining: initialData.quantityRemaining || '3',
        expiryTime: initialData.expiryTime || 'Expires in 1 hr',
        urgency: initialData.urgency || 'HIGH',
        pickupWindow: initialData.pickupWindow || 'Today, 8:00 PM - 9:30 PM',
        image: initialData.image || '/images/bakery.jpg',
        restaurant: initialData.restaurant || 'La Petite Boulangerie',
        status: initialData.status || 'Active',
      });
    }
  }, [initialData]);

  const categories = ['Bakery', 'Indian', 'Chinese', 'Fast Food', 'Salads & Bowls', 'Desserts', 'Vegetarian', 'Vegan'];

  const sampleImages = [
    { label: 'Croissants / Bakery', url: '/images/bakery.jpg' },
    { label: 'Curry / Naan / Indian', url: '/images/indian.jpg' },
    { label: 'Salad / Healthy Bowl', url: '/images/cafe.jpg' },
    { label: 'Asian Noodles & Dim Sum', url: '/images/asian.jpg' },
    { label: 'Burger & Fries', url: '/images/burger.jpg' },
    { label: 'Pizza / Italian', url: '/images/pizza.jpg' },
  ];

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Food name is required';

    const resc = parseFloat(formData.rescuePrice);
    if (isNaN(resc) || resc <= 0) errs.rescuePrice = 'Rescue price must be greater than 0';

    const orig = parseFloat(formData.originalPrice);
    if (!isNaN(orig) && orig < resc) {
      errs.originalPrice = 'Original price cannot be less than rescue price';
    }

    const qty = parseInt(formData.quantityRemaining);
    if (isNaN(qty) || qty <= 0) errs.quantityRemaining = 'Quantity must be at least 1';

    if (!formData.expiryTime.trim()) errs.expiryTime = 'Expiry date/time is required';
    if (!formData.image.trim()) errs.image = 'Image URL is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const resc = parseFloat(formData.rescuePrice);
    const orig = parseFloat(formData.originalPrice) || (resc * 2);
    const disc = Math.round(((orig - resc) / orig) * 100);

    const savedItem = {
      ...formData,
      id: initialData?.id || `res-${Date.now()}`,
      originalPrice: orig,
      rescuePrice: resc,
      discountPercent: Math.max(10, disc),
      quantityRemaining: parseInt(formData.quantityRemaining) || 1,
      status: parseInt(formData.quantityRemaining) > 0 ? 'Active' : 'Sold Out',
    };

    onSaveListing(savedItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#1C2A23]/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-[#F5EBDD] w-full max-w-xl rounded-[2.5rem] border border-[#E6D9C5] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#E6D9C5] bg-white flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#78977D]">
              Restaurant Management
            </span>
            <h3 className="text-2xl font-extrabold text-[#1C2A23]">
              {initialData ? 'Edit Surplus Food Listing' : 'Add Surplus Food Listing'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#5C6A62] hover:bg-[#F5EBDD] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          
          {/* General Error Banner */}
          {Object.keys(errors).length > 0 && (
            <div className="bg-[#FADBD8] border border-[#F5B7B1] text-[#A93226] p-3 rounded-2xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Please correct the highlighted errors before publishing.</span>
            </div>
          )}

          {/* Food Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1C2A23] mb-1">
              Food Item Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Artisanal Sourdough Loaf & Pastry Box"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-4 py-3 rounded-2xl bg-white border text-sm text-[#1C2A23] focus:outline-none focus:ring-2 focus:ring-[#285C46]/30 font-medium ${
                errors.name ? 'border-[#A93226]' : 'border-[#E6D9C5]'
              }`}
            />
            {errors.name && <p className="text-[11px] text-[#A93226] mt-1 font-semibold">{errors.name}</p>}
          </div>

          {/* Category & Quantity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1C2A23] mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-white border border-[#E6D9C5] text-sm text-[#1C2A23] focus:outline-none focus:ring-2 focus:ring-[#285C46]/30 font-medium"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1C2A23] mb-1">
                Quantity Available *
              </label>
              <input
                type="number"
                min="1"
                placeholder="3"
                value={formData.quantityRemaining}
                onChange={(e) => setFormData({ ...formData, quantityRemaining: e.target.value })}
                className={`w-full px-4 py-3 rounded-2xl bg-white border text-sm text-[#1C2A23] focus:outline-none focus:ring-2 focus:ring-[#285C46]/30 font-medium ${
                  errors.quantityRemaining ? 'border-[#A93226]' : 'border-[#E6D9C5]'
                }`}
              />
              {errors.quantityRemaining && <p className="text-[11px] text-[#A93226] mt-1 font-semibold">{errors.quantityRemaining}</p>}
            </div>
          </div>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1C2A23] mb-1">
                Original Price (₹)
              </label>
              <input
                type="number"
                placeholder="300"
                value={formData.originalPrice}
                onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                className={`w-full px-4 py-3 rounded-2xl bg-white border text-sm text-[#1C2A23] focus:outline-none focus:ring-2 focus:ring-[#285C46]/30 font-medium ${
                  errors.originalPrice ? 'border-[#A93226]' : 'border-[#E6D9C5]'
                }`}
              />
              {errors.originalPrice && <p className="text-[11px] text-[#A93226] mt-1 font-semibold">{errors.originalPrice}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1C2A23] mb-1">
                Rescue Price (₹) *
              </label>
              <input
                type="number"
                placeholder="120"
                value={formData.rescuePrice}
                onChange={(e) => setFormData({ ...formData, rescuePrice: e.target.value })}
                className={`w-full px-4 py-3 rounded-2xl bg-white border text-sm text-[#285C46] font-extrabold focus:outline-none focus:ring-2 focus:ring-[#285C46]/30 ${
                  errors.rescuePrice ? 'border-[#A93226]' : 'border-[#E6D9C5]'
                }`}
              />
              {errors.rescuePrice && <p className="text-[11px] text-[#A93226] mt-1 font-semibold">{errors.rescuePrice}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1C2A23] mb-1">
              Description / Ingredients
            </label>
            <textarea
              rows="2"
              placeholder="Freshly prepared surplus items, dietary notes, storage guidance..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl bg-white border border-[#E6D9C5] text-sm text-[#1C2A23] focus:outline-none focus:ring-2 focus:ring-[#285C46]/30 font-medium"
            />
          </div>

          {/* Expiry & Pickup Instructions */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1C2A23] mb-1">
                Expiry Date / Time *
              </label>
              <input
                type="text"
                placeholder="Expires in 1 hr"
                value={formData.expiryTime}
                onChange={(e) => setFormData({ ...formData, expiryTime: e.target.value })}
                className={`w-full px-4 py-3 rounded-2xl bg-white border text-sm text-[#1C2A23] focus:outline-none focus:ring-2 focus:ring-[#285C46]/30 font-medium ${
                  errors.expiryTime ? 'border-[#A93226]' : 'border-[#E6D9C5]'
                }`}
              />
              {errors.expiryTime && <p className="text-[11px] text-[#A93226] mt-1 font-semibold">{errors.expiryTime}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1C2A23] mb-1">
                Pickup Instructions
              </label>
              <input
                type="text"
                placeholder="Today, 8:00 PM - 9:30 PM"
                value={formData.pickupWindow}
                onChange={(e) => setFormData({ ...formData, pickupWindow: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-white border border-[#E6D9C5] text-sm text-[#1C2A23] focus:outline-none focus:ring-2 focus:ring-[#285C46]/30 font-medium"
              />
            </div>
          </div>

          {/* Image URL Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1C2A23] mb-1">
              Food Image URL *
            </label>
            <input
              type="text"
              placeholder="https://images.unsplash.com/..."
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className={`w-full px-4 py-3 rounded-2xl bg-white border text-sm text-[#1C2A23] focus:outline-none focus:ring-2 focus:ring-[#285C46]/30 font-medium ${
                errors.image ? 'border-[#A93226]' : 'border-[#E6D9C5]'
              }`}
            />
            {errors.image && <p className="text-[11px] text-[#A93226] mt-1 font-semibold">{errors.image}</p>}
          </div>

          {/* Preset Images Quick Selector */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#78977D] mb-1.5">
              Or Choose Preset Image
            </label>
            <div className="grid grid-cols-3 gap-2">
              {sampleImages.map((img) => (
                <div
                  key={img.url}
                  onClick={() => setFormData({ ...formData, image: img.url })}
                  className={`h-14 rounded-xl overflow-hidden cursor-pointer border-2 transition-all relative ${
                    formData.image === img.url ? 'border-[#285C46] ring-2 ring-[#285C46]/30' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] truncate px-1 py-0.5 text-center">
                    {img.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-3">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full text-center justify-center font-bold text-base py-3.5 rounded-full shadow-md"
            >
              {initialData ? 'Save Changes' : 'Publish Surplus Food'}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}

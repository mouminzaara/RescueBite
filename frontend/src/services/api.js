const API_BASE_URL = '/api';
const BASE_PATH = import.meta.env.BASE_URL || '/';
const prefixBase = (src) => (src && src.startsWith('/') && !src.startsWith('//') ? `${BASE_PATH}${src.slice(1)}` : src);

/**
 * Parses expiry text into estimated remaining minutes for client UI calculations
 */
export function getExpiryMinutesFromText(expiryTimeStr) {
  if (!expiryTimeStr) return 120;
  const s = String(expiryTimeStr).toLowerCase();
  if (s.includes('min')) {
    const match = s.match(/(\d+)/);
    return match ? parseInt(match[1]) : 30;
  }
  if (s.includes('hr') || s.includes('hour')) {
    const match = s.match(/(\d+(?:\.\d+)?)/);
    return match ? Math.round(parseFloat(match[1]) * 60) : 120;
  }
  return 90;
}

/**
 * Helper to normalize backend FoodListing object into frontend props
 */
export function normalizeFoodListing(item) {
  if (!item) return null;
  
  const expiryMins = getExpiryMinutesFromText(item.expiry_time);
  let computedUrgency = 'MEDIUM';
  if (expiryMins < 30) computedUrgency = 'CRITICAL';
  else if (expiryMins <= 60) computedUrgency = 'HIGH';
  else if (expiryMins <= 180) computedUrgency = 'MEDIUM';
  else computedUrgency = 'LOW';

  const urgency = item.urgency_level || computedUrgency;
  const originalPrice = item.original_price || (item.rescue_price * 2);
  const rescuePrice = item.rescue_price;

  // Recommended rescue price formula: 75% off for critical, 60% for high, 45% for medium, 30% for low
  const discountMultipliers = { CRITICAL: 0.25, HIGH: 0.40, MEDIUM: 0.55, LOW: 0.70 };
  const recommendedPrice = item.recommended_rescue_price || Math.max(20, Math.round(originalPrice * (discountMultipliers[urgency] || 0.5)));

  return {
    id: item.id,
    restaurant_id: item.restaurant_id,
    restaurant: item.restaurant_name || 'Local Kitchen',
    name: item.name,
    description: item.description,
    category: item.category,
    originalPrice: originalPrice,
    rescuePrice: rescuePrice,
    discountPercent: item.discount_percent || Math.round((((originalPrice - rescuePrice) / originalPrice)) * 100),
    quantityRemaining: item.quantity,
    expiryTime: item.expiry_time,
    expiryMinutes: expiryMins,
    urgency: urgency,
    priorityScore: item.priority_score || (urgency === 'CRITICAL' ? 95 : urgency === 'HIGH' ? 80 : urgency === 'MEDIUM' ? 55 : 30),
    recommendedRescuePrice: recommendedPrice,
    image: (!item.image_url || item.image_url.includes('picsum.photos'))
      ? (CATEGORY_FOOD_IMAGES[item.category] || prefixBase('/images/bakery.jpg'))
      : prefixBase(item.image_url),
    createdAt: item.created_at,
  };
}

/**
 * Helper to normalize backend Reservation object
 */
export function normalizeReservation(item) {
  if (!item) return null;
  return {
    id: `RES-${item.id}`,
    foodName: item.food_name || 'Surplus Meal',
    restaurant: item.restaurant_name || 'Partner Kitchen',
    quantity: item.quantity,
    price: item.total_price,
    pickupWindow: item.pickup_time || 'Today, 8:00 PM - 9:30 PM',
    status: item.status || 'CONFIRMED',
    image: (!item.image_url || item.image_url.includes('picsum.photos'))
      ? prefixBase('/images/bakery.jpg')
      : prefixBase(item.image_url),
  };
}

/**
 * Curated high-reliability local food photography per restaurant
 */
const RESTAURANT_FALLBACK_IMAGES = {
  1: prefixBase('/images/bakery.jpg'),
  2: prefixBase('/images/indian.jpg'),
  3: prefixBase('/images/cafe.jpg'),
  4: prefixBase('/images/asian.jpg'),
  5: prefixBase('/images/burger.jpg'),
  'rest-1': prefixBase('/images/bakery.jpg'),
  'rest-2': prefixBase('/images/indian.jpg'),
  'rest-3': prefixBase('/images/cafe.jpg'),
  'rest-4': prefixBase('/images/asian.jpg'),
  'rest-5': prefixBase('/images/burger.jpg'),
};

const CATEGORY_FOOD_IMAGES = {
  Bakery: prefixBase('/images/bakery.jpg'),
  Indian: prefixBase('/images/indian.jpg'),
  Vegan: prefixBase('/images/cafe.jpg'),
  Chinese: prefixBase('/images/asian.jpg'),
  'Fast Food': prefixBase('/images/burger.jpg'),
  Vegetarian: prefixBase('/images/pizza.jpg'),
};

/**
 * Helper to normalize backend Restaurant object into frontend props
 */
export function normalizeRestaurant(item) {
  if (!item) return null;
  const rawImg = item.image || item.image_url;
  // Replace broken/flaky picsum seed URLs with guaranteed local food photography
  const reliableImg = (!rawImg || rawImg.includes('picsum.photos'))
    ? (RESTAURANT_FALLBACK_IMAGES[item.id] || prefixBase('/images/bakery.jpg'))
    : (RESTAURANT_FALLBACK_IMAGES[item.id] || prefixBase(rawImg));

  return {
    id: item.id,
    name: item.name,
    cuisine: item.cuisine || item.category || 'Artisanal Kitchen',
    category: item.category || item.cuisine || 'Artisanal Kitchen',
    location: item.location || 'Local Partner Kitchen',
    rating: item.rating ? Number(item.rating).toFixed(1) : '4.8',
    mealsRescued: item.mealsRescued || (item.id === 1 ? 412 : item.id === 2 ? 680 : item.id === 3 ? 295 : item.id === 4 ? 340 : 210),
    activeSurplus: item.activeSurplus !== undefined ? item.activeSurplus : (item.id === 1 ? 3 : item.id === 2 ? 2 : item.id === 3 ? 5 : item.id === 4 ? 3 : 2),
    pickupTime: item.pickupTime || item.pickup_time || (item.id === 3 ? '7:30 PM - 9:00 PM' : item.id === 5 ? '9:00 PM - 10:30 PM' : item.id === 2 ? '8:30 PM - 10:00 PM' : item.id === 4 ? '8:45 PM - 10:15 PM' : '8:00 PM - 9:30 PM'),
    image: reliableImg,
    image_url: reliableImg,
  };
}

// REST API calls
export async function getRestaurantsAPI() {
  const res = await fetch(`${API_BASE_URL}/restaurants`);
  if (!res.ok) throw new Error('Failed to fetch restaurants');
  const data = await res.json();
  return data.map(normalizeRestaurant);
}

export async function getFoodListingsAPI() {
  const res = await fetch(`${API_BASE_URL}/food-listings`);
  if (!res.ok) throw new Error('Failed to fetch food listings');
  const data = await res.json();
  return data.map(normalizeFoodListing);
}

export async function getFoodListingByIdAPI(id) {
  const res = await fetch(`${API_BASE_URL}/food-listings/${id}`);
  if (!res.ok) throw new Error('Failed to fetch food listing');
  const data = await res.json();
  return normalizeFoodListing(data);
}

export async function getListingPriorityPricingAPI(id) {
  const res = await fetch(`${API_BASE_URL}/food-listings/${id}/priority-pricing`);
  if (!res.ok) throw new Error('Failed to fetch priority pricing details');
  return res.json();
}

export async function createFoodListingAPI(payload) {
  const body = {
    restaurant_id: payload.restaurant_id || 1,
    name: payload.name,
    description: payload.description || '',
    category: payload.category || 'Bakery',
    original_price: parseFloat(payload.originalPrice) || (parseFloat(payload.rescuePrice) * 2),
    rescue_price: parseFloat(payload.rescuePrice),
    quantity: parseInt(payload.quantityRemaining || payload.quantity) || 1,
    expiry_time: payload.expiryTime || 'Expires in 1 hr',
    image_url: payload.image || payload.image_url,
    status: 'ACTIVE'
  };

  const res = await fetch(`${API_BASE_URL}/food-listings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error('Failed to create food listing');
  const data = await res.json();
  return normalizeFoodListing(data);
}

export async function updateFoodListingAPI(id, payload) {
  const body = {
    name: payload.name,
    description: payload.description,
    category: payload.category,
    original_price: parseFloat(payload.originalPrice),
    rescue_price: parseFloat(payload.rescuePrice),
    quantity: parseInt(payload.quantityRemaining || payload.quantity),
    expiry_time: payload.expiryTime,
    image_url: payload.image || payload.image_url,
  };

  const res = await fetch(`${API_BASE_URL}/food-listings/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error('Failed to update food listing');
  const data = await res.json();
  return normalizeFoodListing(data);
}

export async function deleteFoodListingAPI(id) {
  const res = await fetch(`${API_BASE_URL}/food-listings/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete food listing');
  return true;
}

export async function getReservationsAPI() {
  const res = await fetch(`${API_BASE_URL}/reservations`);
  if (!res.ok) throw new Error('Failed to fetch reservations');
  const data = await res.json();
  return data.map(normalizeReservation);
}

export async function createReservationAPI(payload) {
  const body = {
    food_listing_id: payload.id || payload.food_listing_id,
    quantity: payload.quantity || 1,
    customer_name: payload.customer_name || 'Guest Customer',
    pickup_time: payload.pickupWindow || payload.pickup_time || 'Today, 8:00 PM - 9:30 PM',
  };

  const res = await fetch(`${API_BASE_URL}/reservations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to create reservation');
  }

  const data = await res.json();
  return normalizeReservation(data);
}

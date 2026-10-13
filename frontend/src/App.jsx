import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Restaurants from './pages/Restaurants';
import Reservations from './pages/Reservations';
import FoodDetail from './pages/FoodDetail';
import ReservationConfirmation from './pages/ReservationConfirmation';
import RestaurantDashboard from './pages/RestaurantDashboard';
import { 
  getFoodListingsAPI, 
  getRestaurantsAPI, 
  getReservationsAPI, 
  createFoodListingAPI, 
  updateFoodListingAPI, 
  deleteFoodListingAPI, 
  createReservationAPI 
} from './services/api';
import { INITIAL_FOOD_ITEMS, INITIAL_RESTAURANTS, INITIAL_RESERVATIONS } from './data/mockFoodData';

function App() {
  const [foodItems, setFoodItems] = useState(INITIAL_FOOD_ITEMS);
  const [restaurants, setRestaurants] = useState(INITIAL_RESTAURANTS);
  const [reservations, setReservations] = useState(INITIAL_RESERVATIONS);
  const [loading, setLoading] = useState(true);
  const [apiConnected, setApiConnected] = useState(false);

  // Fetch initial data from FastAPI backend on mount
  const refreshData = async () => {
    try {
      const [listings, rests, resvs] = await Promise.all([
        getFoodListingsAPI(),
        getRestaurantsAPI(),
        getReservationsAPI(),
      ]);

      if (listings && listings.length > 0) setFoodItems(listings);
      if (rests && rests.length > 0) setRestaurants(rests);
      if (resvs && resvs.length > 0) setReservations(resvs);
      setApiConnected(true);
    } catch (err) {
      console.warn('API connection offline or fallback to mock data:', err.message);
      setApiConnected(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Reserve a food item with FastAPI backend validation
  const handleReserveFood = async (itemData) => {
    try {
      const newRes = await createReservationAPI(itemData);
      await refreshData();
      return newRes;
    } catch (err) {
      console.error('Reservation API error:', err);
      // Fallback local logic if API fails
      const fallbackRes = {
        id: `RES-${Math.floor(10000 + Math.random() * 90000)}`,
        foodName: itemData.name || itemData.foodName,
        restaurant: itemData.restaurant,
        quantity: itemData.quantity || 1,
        price: itemData.totalPrice || itemData.rescuePrice,
        pickupWindow: itemData.pickupWindow || 'Today, 8:00 PM - 9:30 PM',
        status: 'CONFIRMED',
        reservationTime: 'Just now',
        image: itemData.image,
      };
      setReservations((prev) => [fallbackRes, ...prev]);
      return fallbackRes;
    }
  };

  // Add a new surplus food listing via FastAPI
  const handleAddListing = async (newListing) => {
    try {
      await createFoodListingAPI(newListing);
      await refreshData();
    } catch (err) {
      console.error('Create listing error:', err);
      setFoodItems((prev) => [newListing, ...prev]);
    }
  };

  // Update a surplus food listing via FastAPI
  const handleUpdateListing = async (updatedListing) => {
    try {
      await updateFoodListingAPI(updatedListing.id, updatedListing);
      await refreshData();
    } catch (err) {
      console.error('Update listing error:', err);
      setFoodItems((prev) =>
        prev.map((item) => (item.id === updatedListing.id ? updatedListing : item))
      );
    }
  };

  // Delete a surplus food listing via FastAPI
  const handleDeleteListing = async (id) => {
    try {
      await deleteFoodListingAPI(id);
      await refreshData();
    } catch (err) {
      console.error('Delete listing error:', err);
      setFoodItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  return (
    <Router basename={import.meta.env.BASE_URL}>
      <div className="min-h-screen bg-[#F5EBDD] text-[#1C2A23] flex flex-col font-sans selection:bg-[#DDE8D8] selection:text-[#1E4E36]">
        <Navbar />
        
        {/* Backend API Connection Indicator Bar */}
        <div className="bg-[#DDE8D8]/70 border-b border-[#B8D1C3] py-1.5 px-4 text-center text-xs font-semibold text-[#1E4736] flex items-center justify-center gap-2">
          <span className={`w-2 h-2 rounded-full ${apiConnected ? 'bg-[#285C46] animate-pulse' : 'bg-amber-600'}`}></span>
          <span>
            {apiConnected 
              ? 'Connected to FastAPI SQLite Backend' 
              : 'Running with local mock dataset (FastAPI standby)'}
          </span>
        </div>

        <div className="flex-1">
          <Routes>
            <Route
              path="/"
              element={<Home foodItems={foodItems} onReserveFood={handleReserveFood} />}
            />
            <Route
              path="/explore"
              element={<Explore foodItems={foodItems} onReserveFood={handleReserveFood} />}
            />
            <Route
              path="/food/:id"
              element={<FoodDetail foodItems={foodItems} onReserveFood={handleReserveFood} />}
            />
            <Route
              path="/reservation-confirmation/:id"
              element={<ReservationConfirmation reservations={reservations} />}
            />
            <Route
              path="/restaurants"
              element={<Restaurants restaurants={restaurants} />}
            />
            <Route
              path="/reservations"
              element={<Reservations reservations={reservations} />}
            />
            <Route
              path="/restaurant-dashboard"
              element={
                <RestaurantDashboard
                  foodItems={foodItems}
                  reservations={reservations}
                  onAddListing={handleAddListing}
                  onUpdateListing={handleUpdateListing}
                  onDeleteListing={handleDeleteListing}
                />
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;

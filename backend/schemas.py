from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

# --- Restaurant Schemas ---
class RestaurantBase(BaseModel):
    name: str
    location: str
    category: Optional[str] = "General"
    rating: Optional[float] = 4.8
    image_url: Optional[str] = None

class RestaurantCreate(RestaurantBase):
    pass

class RestaurantResponse(RestaurantBase):
    id: int

    class Config:
        from_attributes = True


# --- FoodListing Schemas ---
class FoodListingBase(BaseModel):
    restaurant_id: int
    name: str
    description: Optional[str] = None
    category: str
    original_price: float
    rescue_price: float
    quantity: int = Field(gt=0, description="Quantity must be greater than 0")
    expiry_time: str
    image_url: Optional[str] = None
    status: Optional[str] = "ACTIVE"

class FoodListingCreate(FoodListingBase):
    pass

class FoodListingUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    original_price: Optional[float] = None
    rescue_price: Optional[float] = None
    quantity: Optional[int] = None
    expiry_time: Optional[str] = None
    image_url: Optional[str] = None
    status: Optional[str] = None

class FoodListingResponse(FoodListingBase):
    id: int
    created_at: datetime
    restaurant_name: Optional[str] = None
    discount_percent: Optional[int] = None
    urgency_level: Optional[str] = "MEDIUM"
    priority_score: Optional[int] = 50
    recommended_rescue_price: Optional[float] = None

    class Config:
        from_attributes = True


# --- Reservation Schemas ---
class ReservationCreate(BaseModel):
    food_listing_id: int
    quantity: int = Field(default=1, gt=0)
    customer_name: Optional[str] = "Guest Customer"
    pickup_time: Optional[str] = "Today, 8:00 PM - 9:30 PM"

class ReservationResponse(BaseModel):
    id: int
    food_listing_id: int
    customer_name: str
    quantity: int
    total_price: float
    status: str
    pickup_time: Optional[str] = None
    created_at: datetime
    food_name: Optional[str] = None
    restaurant_name: Optional[str] = None
    image_url: Optional[str] = None

    class Config:
        from_attributes = True

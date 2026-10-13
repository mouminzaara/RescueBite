from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Restaurant(Base):
    __tablename__ = "restaurants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    category = Column(String, nullable=True)
    rating = Column(Float, default=4.8)
    image_url = Column(String, nullable=True)

    food_listings = relationship("FoodListing", back_populates="restaurant", cascade="all, delete-orphan")


class FoodListing(Base):
    __tablename__ = "food_listings"

    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String, nullable=False)
    original_price = Column(Float, nullable=False)
    rescue_price = Column(Float, nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    expiry_time = Column(String, nullable=False)
    image_url = Column(String, nullable=True)
    status = Column(String, nullable=False, default="ACTIVE")
    created_at = Column(DateTime, default=datetime.utcnow)

    restaurant = relationship("Restaurant", back_populates="food_listings")
    reservations = relationship("Reservation", back_populates="food_listing", cascade="all, delete-orphan")


class Reservation(Base):
    __tablename__ = "reservations"

    id = Column(Integer, primary_key=True, index=True)
    food_listing_id = Column(Integer, ForeignKey("food_listings.id"), nullable=False)
    customer_name = Column(String, default="Guest Customer")
    quantity = Column(Integer, nullable=False, default=1)
    total_price = Column(Float, nullable=False)
    status = Column(String, nullable=False, default="CONFIRMED")
    pickup_time = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    food_listing = relationship("FoodListing", back_populates="reservations")

from sqlalchemy.orm import Session
from models import Restaurant, FoodListing, Reservation

def seed_initial_data(db: Session):
    # Check if database is already populated
    if db.query(Restaurant).count() > 0:
        return

    # Create Initial Partner Restaurants
    # Using picsum.photos/seed/{word}/800/600 — stable, browser-friendly, no auth needed
    r1 = Restaurant(
        name="La Petite Boulangerie",
        location="Indiranagar • 1.2 km",
        category="French Bakery & Pastry",
        rating=4.9,
        image_url="https://picsum.photos/seed/bakery/800/600"
    )
    r2 = Restaurant(
        name="Royal Spice Kitchen",
        location="Koramangala • 2.4 km",
        category="North Indian & Tandoor",
        rating=4.8,
        image_url="https://picsum.photos/seed/spice/800/600"
    )
    r3 = Restaurant(
        name="Green Earth Cafe",
        location="HSR Layout • 0.8 km",
        category="Organic & Vegan Bowls",
        rating=4.7,
        image_url="https://picsum.photos/seed/cafe/800/600"
    )
    r4 = Restaurant(
        name="Wok & Roll Asian",
        location="Koramangala • 1.8 km",
        category="Chinese & Pan-Asian",
        rating=4.8,
        image_url="https://picsum.photos/seed/asian/800/600"
    )
    r5 = Restaurant(
        name="Street Bites Express",
        location="BTM Layout • 1.5 km",
        category="Burgers, Wraps & Fast Food",
        rating=4.6,
        image_url="https://picsum.photos/seed/streetfood/800/600"
    )

    db.add_all([r1, r2, r3, r4, r5])
    db.commit()

    # Create Initial Food Listings
    l1 = FoodListing(
        restaurant_id=r1.id,
        name="Artisanal Butter Croissants & Danish Box",
        description="Assorted freshly baked French butter croissants, pain au chocolat, and almond danishes prepared earlier today.",
        category="Bakery",
        original_price=350.0,
        rescue_price=140.0,
        quantity=3,
        expiry_time="Expires in 25 min",
        image_url="https://picsum.photos/seed/croissant/800/600",
        status="ACTIVE"
    )
    l2 = FoodListing(
        restaurant_id=r2.id,
        name="Paneer Butter Masala & Garlic Naan Meal",
        description="Rich cottage cheese gravy prepared with butter and aromatic Indian spices, paired with 2 fresh tandoori garlic naans.",
        category="Indian",
        original_price=280.0,
        rescue_price=120.0,
        quantity=2,
        expiry_time="Expires in 40 min",
        image_url="https://picsum.photos/seed/paneer/800/600",
        status="LOW_STOCK"
    )
    l3 = FoodListing(
        restaurant_id=r3.id,
        name="Organic Mediterranean Grain Harvest Bowl",
        description="Quinoa, roasted chickpeas, avocado slices, cherry tomatoes, kalamata olives, and fresh tahini dressing.",
        category="Vegan",
        original_price=320.0,
        rescue_price=150.0,
        quantity=5,
        expiry_time="Expires in 2 hrs",
        image_url="https://picsum.photos/seed/bowl/800/600",
        status="ACTIVE"
    )
    l4 = FoodListing(
        restaurant_id=r4.id,
        name="Schezwan Fried Rice & Chili Manchurian Box",
        description="Spicy wok-tossed Schezwan fried rice served with crispy vegetable Manchurian balls in rich savory gravy.",
        category="Chinese",
        original_price=310.0,
        rescue_price=130.0,
        quantity=4,
        expiry_time="Expires in 35 min",
        image_url="https://picsum.photos/seed/friedrice/800/600",
        status="ACTIVE"
    )
    l5 = FoodListing(
        restaurant_id=r5.id,
        name="Double Cheeseburger & Seasoned Fries Combo",
        description="Juicy grilled patties with melted cheddar, caramelised onions, signature house sauce, and golden crispy fries.",
        category="Fast Food",
        original_price=360.0,
        rescue_price=145.0,
        quantity=3,
        expiry_time="Expires in 50 min",
        image_url="https://picsum.photos/seed/burger/800/600",
        status="ACTIVE"
    )
    l6 = FoodListing(
        restaurant_id=r2.id,
        name="Hyderabadi Chicken Dum Biryani Box",
        description="Fragrant basmati rice slow-cooked on dum with tender spiced chicken, served with onion raita and mirchi ka salan.",
        category="Indian",
        original_price=340.0,
        rescue_price=160.0,
        quantity=6,
        expiry_time="Expires in 3 hrs",
        image_url="https://picsum.photos/seed/biryani/800/600",
        status="ACTIVE"
    )

    db.add_all([l1, l2, l3, l4, l5, l6])
    db.commit()

    # Initial Reservation
    res1 = Reservation(
        food_listing_id=l1.id,
        customer_name="Aarav Sharma",
        quantity=1,
        total_price=140.0,
        status="CONFIRMED",
        pickup_time="Today, 8:00 PM - 9:30 PM"
    )
    db.add(res1)
    db.commit()

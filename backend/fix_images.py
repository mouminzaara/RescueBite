"""
One-time migration: replace Unsplash image_url values in the live database with Picsum Photos URLs.
Run from the backend directory: python fix_images.py
"""
from database import SessionLocal
from models import Restaurant, FoodListing

RESTAURANT_IMAGES = {
    "La Petite Boulangerie": "https://picsum.photos/seed/bakery/800/600",
    "Royal Spice Kitchen": "https://picsum.photos/seed/spice/800/600",
    "Green Earth Cafe": "https://picsum.photos/seed/cafe/800/600",
    "Wok & Roll Asian": "https://picsum.photos/seed/asian/800/600",
    "Street Bites Express": "https://picsum.photos/seed/streetfood/800/600",
}

LISTING_IMAGES = {
    "Artisanal Butter Croissants & Danish Box": "https://picsum.photos/seed/croissant/800/600",
    "Paneer Butter Masala & Garlic Naan Meal": "https://picsum.photos/seed/paneer/800/600",
    "Organic Mediterranean Grain Harvest Bowl": "https://picsum.photos/seed/bowl/800/600",
    "Schezwan Fried Rice & Chili Manchurian Box": "https://picsum.photos/seed/friedrice/800/600",
    "Double Cheeseburger & Seasoned Fries Combo": "https://picsum.photos/seed/burger/800/600",
    "Hyderabadi Chicken Dum Biryani Box": "https://picsum.photos/seed/biryani/800/600",
}

db = SessionLocal()
try:
    updated = 0
    for restaurant in db.query(Restaurant).all():
        new_url = RESTAURANT_IMAGES.get(restaurant.name)
        if not new_url:
            new_url = f"https://picsum.photos/seed/{restaurant.name.split()[0].lower()}/800/600"
        restaurant.image_url = new_url
        updated += 1
        print(f"  Restaurant: {restaurant.name} -> {new_url}")

    for listing in db.query(FoodListing).all():
        new_url = LISTING_IMAGES.get(listing.name)
        if not new_url:
            new_url = f"https://picsum.photos/seed/{listing.name.split()[0].lower()}/800/600"
        listing.image_url = new_url
        updated += 1
        print(f"  Listing: {listing.name} -> {new_url}")

    db.commit()
    print(f"\nDone! Updated {updated} records.")
finally:
    db.close()

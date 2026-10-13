"""
RescueBite — Seed Real DynamoDB Tables
----------------------------------------
Inserts the initial restaurant, food‑listing, and reservation data
into the REAL AWS DynamoDB tables.

Uses fixed IDs so the script is idempotent — running it multiple times
simply overwrites the same items without creating duplicates.

Usage:
    cd backend
    python -m scripts.seed_dynamodb
"""

import sys
from decimal import Decimal
from datetime import datetime

sys.path.insert(0, ".")

from aws_config import (
    get_dynamodb_resource,
    DYNAMODB_RESTAURANTS_TABLE,
    DYNAMODB_FOOD_LISTINGS_TABLE,
    DYNAMODB_RESERVATIONS_TABLE,
)

# ---------------------------------------------------------------------------
# Seed Data  (IDs are fixed for idempotency)
# ---------------------------------------------------------------------------
RESTAURANTS = [
    {
        "id": 1,
        "name": "La Petite Boulangerie",
        "location": "Indiranagar • 1.2 km",
        "category": "French Bakery & Pastry",
        "rating": Decimal("4.9"),
        "image_url": "https://picsum.photos/seed/bakery/800/600",
    },
    {
        "id": 2,
        "name": "Royal Spice Kitchen",
        "location": "Koramangala • 2.4 km",
        "category": "North Indian & Tandoor",
        "rating": Decimal("4.8"),
        "image_url": "https://picsum.photos/seed/spice/800/600",
    },
    {
        "id": 3,
        "name": "Green Earth Cafe",
        "location": "HSR Layout • 0.8 km",
        "category": "Organic & Vegan Bowls",
        "rating": Decimal("4.7"),
        "image_url": "https://picsum.photos/seed/cafe/800/600",
    },
    {
        "id": 4,
        "name": "Wok & Roll Asian",
        "location": "Koramangala • 1.8 km",
        "category": "Chinese & Pan-Asian",
        "rating": Decimal("4.8"),
        "image_url": "https://picsum.photos/seed/asian/800/600",
    },
    {
        "id": 5,
        "name": "Street Bites Express",
        "location": "BTM Layout • 1.5 km",
        "category": "Burgers, Wraps & Fast Food",
        "rating": Decimal("4.6"),
        "image_url": "https://picsum.photos/seed/streetfood/800/600",
    },
]

FOOD_LISTINGS = [
    {
        "id": 101,
        "restaurant_id": 1,
        "name": "Artisanal Butter Croissants & Danish Box",
        "description": "Assorted freshly baked French butter croissants, pain au chocolat, and almond danishes prepared earlier today.",
        "category": "Bakery",
        "original_price": Decimal("350"),
        "rescue_price": Decimal("140"),
        "quantity": 3,
        "expiry_time": "Expires in 25 min",
        "image_url": "https://picsum.photos/seed/croissant/800/600",
        "status": "ACTIVE",
        "created_at": datetime.utcnow().isoformat(),
    },
    {
        "id": 102,
        "restaurant_id": 2,
        "name": "Paneer Butter Masala & Garlic Naan Meal",
        "description": "Rich cottage cheese gravy prepared with butter and aromatic Indian spices, paired with 2 fresh tandoori garlic naans.",
        "category": "Indian",
        "original_price": Decimal("280"),
        "rescue_price": Decimal("120"),
        "quantity": 2,
        "expiry_time": "Expires in 40 min",
        "image_url": "https://picsum.photos/seed/paneer/800/600",
        "status": "LOW_STOCK",
        "created_at": datetime.utcnow().isoformat(),
    },
    {
        "id": 103,
        "restaurant_id": 3,
        "name": "Organic Mediterranean Grain Harvest Bowl",
        "description": "Quinoa, roasted chickpeas, avocado slices, cherry tomatoes, kalamata olives, and fresh tahini dressing.",
        "category": "Vegan",
        "original_price": Decimal("320"),
        "rescue_price": Decimal("150"),
        "quantity": 5,
        "expiry_time": "Expires in 2 hrs",
        "image_url": "https://picsum.photos/seed/bowl/800/600",
        "status": "ACTIVE",
        "created_at": datetime.utcnow().isoformat(),
    },
    {
        "id": 104,
        "restaurant_id": 4,
        "name": "Schezwan Fried Rice & Chili Manchurian Box",
        "description": "Spicy wok-tossed Schezwan fried rice served with crispy vegetable Manchurian balls in rich savory gravy.",
        "category": "Chinese",
        "original_price": Decimal("310"),
        "rescue_price": Decimal("130"),
        "quantity": 4,
        "expiry_time": "Expires in 35 min",
        "image_url": "https://picsum.photos/seed/friedrice/800/600",
        "status": "ACTIVE",
        "created_at": datetime.utcnow().isoformat(),
    },
    {
        "id": 105,
        "restaurant_id": 5,
        "name": "Double Cheeseburger & Seasoned Fries Combo",
        "description": "Juicy grilled patties with melted cheddar, caramelised onions, signature house sauce, and golden crispy fries.",
        "category": "Fast Food",
        "original_price": Decimal("360"),
        "rescue_price": Decimal("145"),
        "quantity": 3,
        "expiry_time": "Expires in 50 min",
        "image_url": "https://picsum.photos/seed/burger/800/600",
        "status": "ACTIVE",
        "created_at": datetime.utcnow().isoformat(),
    },
    {
        "id": 106,
        "restaurant_id": 2,
        "name": "Hyderabadi Chicken Dum Biryani Box",
        "description": "Fragrant basmati rice slow-cooked on dum with tender spiced chicken, served with onion raita and mirchi ka salan.",
        "category": "Indian",
        "original_price": Decimal("340"),
        "rescue_price": Decimal("160"),
        "quantity": 6,
        "expiry_time": "Expires in 3 hrs",
        "image_url": "https://picsum.photos/seed/biryani/800/600",
        "status": "ACTIVE",
        "created_at": datetime.utcnow().isoformat(),
    },
]

RESERVATIONS = [
    {
        "id": 1001,
        "food_listing_id": 101,
        "customer_name": "Aarav Sharma",
        "quantity": 1,
        "total_price": Decimal("140"),
        "status": "CONFIRMED",
        "pickup_time": "Today, 8:00 PM - 9:30 PM",
        "created_at": datetime.utcnow().isoformat(),
    },
]


def seed():
    dynamodb = get_dynamodb_resource()

    print("\n" + "=" * 60)
    print("  RescueBite — Seeding DynamoDB Tables")
    print("=" * 60)

    # -- Restaurants --
    table = dynamodb.Table(DYNAMODB_RESTAURANTS_TABLE)
    print(f"\n  → Seeding {DYNAMODB_RESTAURANTS_TABLE} …")
    for item in RESTAURANTS:
        table.put_item(Item=item)
        print(f"    ✓ {item['name']}  (id={item['id']})")

    # -- Food Listings --
    table = dynamodb.Table(DYNAMODB_FOOD_LISTINGS_TABLE)
    print(f"\n  → Seeding {DYNAMODB_FOOD_LISTINGS_TABLE} …")
    for item in FOOD_LISTINGS:
        table.put_item(Item=item)
        print(f"    ✓ {item['name']}  (id={item['id']})")

    # -- Reservations --
    table = dynamodb.Table(DYNAMODB_RESERVATIONS_TABLE)
    print(f"\n  → Seeding {DYNAMODB_RESERVATIONS_TABLE} …")
    for item in RESERVATIONS:
        table.put_item(Item=item)
        print(f"    ✓ Reservation {item['id']}  customer={item['customer_name']}")

    print(f"\n{'='*60}")
    print("  Seeding complete.  All items written to real AWS DynamoDB.")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    seed()

"""
RescueBite — FastAPI Application
----------------------------------
REST API endpoints backed by REAL Amazon DynamoDB and AWS Lambda.

Data flow:
    React Frontend  →  FastAPI  →  Amazon DynamoDB
                                →  AWS Lambda (priority/pricing)
"""

import json
from datetime import datetime
from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

import schemas
from dynamodb_repository import (
    DynamoDBRepository,
    RESTAURANTS_TABLE,
    FOOD_LISTINGS_TABLE,
    RESERVATIONS_TABLE,
)
from priority_engine import (
    evaluate_listing_priority_and_pricing,
    parse_expiry_minutes,
    calculate_urgency,
    calculate_priority_score,
    calculate_recommended_price,
)
from aws_config import LAMBDA_PRIORITY_FUNCTION, get_lambda_client

# ---------------------------------------------------------------------------
# Application
# ---------------------------------------------------------------------------
app = FastAPI(
    title="RescueBite API",
    description="Backend REST API powered by Amazon DynamoDB & AWS Lambda",
    version="2.0.0",
)


@app.on_event("startup")
def startup_event():
    """Verify AWS DynamoDB connectivity on startup."""
    try:
        repo = DynamoDBRepository()
        repo.scan_items(RESTAURANTS_TABLE)
        print("✓ Connected to AWS DynamoDB — tables reachable")
    except Exception as exc:
        print(f"⚠ DynamoDB connectivity check failed: {exc}")
        print("  Ensure AWS credentials are configured and tables are provisioned.")
        print("  Run: python -m scripts.provision_dynamodb")
        print("  Run: python -m scripts.seed_dynamodb")


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Dependency Injection
# ---------------------------------------------------------------------------
def get_dynamo_repo() -> DynamoDBRepository:
    """Create a DynamoDBRepository (no SQLAlchemy session needed)."""
    return DynamoDBRepository()


# ---------------------------------------------------------------------------
# Lambda Invocation Helper
# ---------------------------------------------------------------------------
def invoke_priority_lambda(listing_dict: dict) -> dict:
    """
    Invoke the real AWS Lambda for priority/pricing calculation.
    Falls back to local priority_engine if Lambda is unavailable.
    """
    try:
        client = get_lambda_client()
        payload = json.dumps({"listing": listing_dict}, default=str)
        response = client.invoke(
            FunctionName=LAMBDA_PRIORITY_FUNCTION,
            InvocationType="RequestResponse",
            Payload=payload.encode("utf-8"),
        )
        raw = json.loads(response["Payload"].read().decode("utf-8"))
        # Lambda returns {"statusCode": 200, "body": "..."}
        if isinstance(raw, dict) and "body" in raw:
            body = raw["body"]
            return json.loads(body) if isinstance(body, str) else body
        return raw
    except Exception:
        # Fallback: compute locally if Lambda is not deployed yet
        return evaluate_listing_priority_and_pricing(listing_dict)


# ---------------------------------------------------------------------------
# Root & Health
# ---------------------------------------------------------------------------
@app.get("/")
def read_root():
    return {
        "message": "Welcome to RescueBite API",
        "aws_services": "Amazon DynamoDB + AWS Lambda — REAL AWS",
        "enhancement": "RescueBite Expiry-Aware Priority & Dynamic Pricing System Active",
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "RescueBite API",
        "dynamodb": "Real AWS DynamoDB",
        "lambda": f"{LAMBDA_PRIORITY_FUNCTION} (Real AWS Lambda)",
        "pricing_engine": "Expiry-Aware Priority & Dynamic Pricing Active",
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }


# ==========================================
# 1. RESTAURANTS REST API
# ==========================================

@app.get("/api/restaurants", response_model=List[schemas.RestaurantResponse])
def get_restaurants(repo: DynamoDBRepository = Depends(get_dynamo_repo)):
    items = repo.scan_items(RESTAURANTS_TABLE)
    return items


@app.get("/api/restaurants/{restaurant_id}", response_model=schemas.RestaurantResponse)
def get_restaurant(restaurant_id: int, repo: DynamoDBRepository = Depends(get_dynamo_repo)):
    item = repo.get_item(RESTAURANTS_TABLE, {"id": restaurant_id})
    if not item:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return item


@app.post("/api/restaurants", response_model=schemas.RestaurantResponse, status_code=status.HTTP_201_CREATED)
def create_restaurant(restaurant_in: schemas.RestaurantCreate, repo: DynamoDBRepository = Depends(get_dynamo_repo)):
    created_item = repo.put_item(RESTAURANTS_TABLE, restaurant_in.dict())
    return created_item


# ==========================================
# 2. FOOD LISTINGS REST API & ENHANCEMENT ENDPOINTS
# ==========================================

@app.get("/api/food-listings", response_model=List[schemas.FoodListingResponse])
def get_food_listings(
    category: Optional[str] = None,
    restaurant_id: Optional[int] = None,
    search: Optional[str] = None,
    repo: DynamoDBRepository = Depends(get_dynamo_repo),
):
    filter_expr = {}
    if category and category != "All":
        filter_expr["category"] = category
    if restaurant_id:
        filter_expr["restaurant_id"] = restaurant_id
    if search:
        filter_expr["search"] = search

    if restaurant_id:
        items = repo.query_items(FOOD_LISTINGS_TABLE, {"restaurant_id": restaurant_id})
    else:
        items = repo.scan_items(FOOD_LISTINGS_TABLE, filter_expr)

    results = []
    for item in items:
        orig = item.get("original_price") or (item["rescue_price"] * 2)
        disc = int(round(((orig - item["rescue_price"]) / orig) * 100)) if orig > 0 else 50

        item["discount_percent"] = max(10, min(90, disc))
        if "restaurant_name" not in item or not item["restaurant_name"]:
            rest = repo.get_item(RESTAURANTS_TABLE, {"id": item["restaurant_id"]})
            item["restaurant_name"] = rest["name"] if rest else "Local Partner"

        # Apply Expiry-Aware Priority & Pricing calculations
        # Use pre-computed values from DynamoDB (set by Lambda via Streams)
        # or compute on the fly as fallback
        if not item.get("urgency_level") or not item.get("priority_score"):
            pricing_eval = evaluate_listing_priority_and_pricing(item)
            item["urgency_level"] = pricing_eval["urgency_level"]
            item["priority_score"] = pricing_eval["priority_score"]
            item["recommended_rescue_price"] = pricing_eval["recommended_rescue_price"]
        
        item["status"] = item.get("urgency_level", "MEDIUM") if item.get("quantity", 1) > 0 else "SOLD_OUT"

        results.append(item)

    return results


@app.get("/api/food-listings/{listing_id}", response_model=schemas.FoodListingResponse)
def get_food_listing(listing_id: int, repo: DynamoDBRepository = Depends(get_dynamo_repo)):
    item = repo.get_item(FOOD_LISTINGS_TABLE, {"id": listing_id})
    if not item:
        raise HTTPException(status_code=404, detail="Food listing not found")

    orig = item.get("original_price") or (item["rescue_price"] * 2)
    disc = int(round(((orig - item["rescue_price"]) / orig) * 100)) if orig > 0 else 50
    item["discount_percent"] = max(10, min(90, disc))

    if "restaurant_name" not in item or not item["restaurant_name"]:
        rest = repo.get_item(RESTAURANTS_TABLE, {"id": item["restaurant_id"]})
        item["restaurant_name"] = rest["name"] if rest else "Local Partner"

    # Use pre-computed values or compute on the fly
    if not item.get("urgency_level") or not item.get("priority_score"):
        pricing_eval = evaluate_listing_priority_and_pricing(item)
        item["urgency_level"] = pricing_eval["urgency_level"]
        item["priority_score"] = pricing_eval["priority_score"]
        item["recommended_rescue_price"] = pricing_eval["recommended_rescue_price"]

    return item


# RESCUEBITE ENHANCEMENT ENDPOINT: Calculate Priority & Recommended Pricing for a Listing
@app.get("/api/food-listings/{listing_id}/priority-pricing")
def get_listing_priority_pricing(listing_id: int, repo: DynamoDBRepository = Depends(get_dynamo_repo)):
    """
    RescueBite Main Enhancement Endpoint:
    Invokes the real AWS Lambda to calculate remaining time until expiry,
    real-time urgency level, priority score, and recommended rescue price.
    """
    item = repo.get_item(FOOD_LISTINGS_TABLE, {"id": listing_id})
    if not item:
        raise HTTPException(status_code=404, detail="Food listing not found")

    # Invoke REAL AWS Lambda (with local fallback)
    evaluation = invoke_priority_lambda(item)
    return evaluation


@app.post("/api/food-listings/calculate-pricing")
def calculate_dynamic_pricing_preview(payload: dict):
    """
    Calculates recommended dynamic rescue price & urgency given original price & expiry time.
    Invokes the real AWS Lambda (with local fallback).
    """
    original_price = float(payload.get("original_price", 200))
    current_price = float(payload.get("rescue_price", original_price * 0.5))
    expiry_time = payload.get("expiry_time", "Expires in 1 hr")
    quantity = int(payload.get("quantity", 1))

    item_dict = {
        "id": "preview",
        "name": payload.get("name", "Surplus Preview"),
        "original_price": original_price,
        "rescue_price": current_price,
        "expiry_time": expiry_time,
        "quantity": quantity,
    }
    return invoke_priority_lambda(item_dict)


@app.post("/api/food-listings", response_model=schemas.FoodListingResponse, status_code=status.HTTP_201_CREATED)
def create_food_listing(listing_in: schemas.FoodListingCreate, repo: DynamoDBRepository = Depends(get_dynamo_repo)):
    restaurant = repo.get_item(RESTAURANTS_TABLE, {"id": listing_in.restaurant_id})
    if not restaurant:
        all_rests = repo.scan_items(RESTAURANTS_TABLE)
        if all_rests:
            listing_in.restaurant_id = all_rests[0]["id"]
        else:
            new_rest = repo.put_item(RESTAURANTS_TABLE, {
                "name": "La Petite Boulangerie",
                "location": "Indiranagar • 1.2 km",
                "category": "French Bakery",
                "rating": 4.9,
            })
            listing_in.restaurant_id = new_rest["id"]

    initial_status = "ACTIVE"
    if listing_in.quantity <= 0:
        initial_status = "SOLD_OUT"
    elif listing_in.quantity <= 2:
        initial_status = "LOW_STOCK"

    item_payload = listing_in.dict()
    item_payload["status"] = initial_status
    item_payload["created_at"] = datetime.utcnow()

    created_item = repo.put_item(FOOD_LISTINGS_TABLE, item_payload)

    orig = created_item.get("original_price") or (created_item["rescue_price"] * 2)
    disc = int(round(((orig - created_item["rescue_price"]) / orig) * 100)) if orig > 0 else 50
    created_item["discount_percent"] = max(10, min(90, disc))

    rest = repo.get_item(RESTAURANTS_TABLE, {"id": created_item["restaurant_id"]})
    created_item["restaurant_name"] = rest["name"] if rest else "Local Partner"

    pricing_eval = evaluate_listing_priority_and_pricing(created_item)
    created_item["urgency_level"] = pricing_eval["urgency_level"]
    created_item["priority_score"] = pricing_eval["priority_score"]
    created_item["recommended_rescue_price"] = pricing_eval["recommended_rescue_price"]

    return created_item


@app.put("/api/food-listings/{listing_id}", response_model=schemas.FoodListingResponse)
def update_food_listing(
    listing_id: int,
    listing_in: schemas.FoodListingUpdate,
    repo: DynamoDBRepository = Depends(get_dynamo_repo),
):
    existing = repo.get_item(FOOD_LISTINGS_TABLE, {"id": listing_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Food listing not found")

    update_payload = listing_in.dict(exclude_unset=True)
    updated_item = repo.update_item(FOOD_LISTINGS_TABLE, {"id": listing_id}, update_payload)

    orig = updated_item.get("original_price") or (updated_item["rescue_price"] * 2)
    disc = int(round(((orig - updated_item["rescue_price"]) / orig) * 100)) if orig > 0 else 50
    updated_item["discount_percent"] = max(10, min(90, disc))

    rest = repo.get_item(RESTAURANTS_TABLE, {"id": updated_item["restaurant_id"]})
    updated_item["restaurant_name"] = rest["name"] if rest else "Local Partner"

    pricing_eval = evaluate_listing_priority_and_pricing(updated_item)
    updated_item["urgency_level"] = pricing_eval["urgency_level"]
    updated_item["priority_score"] = pricing_eval["priority_score"]
    updated_item["recommended_rescue_price"] = pricing_eval["recommended_rescue_price"]

    return updated_item


@app.delete("/api/food-listings/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_food_listing(listing_id: int, repo: DynamoDBRepository = Depends(get_dynamo_repo)):
    deleted = repo.delete_item(FOOD_LISTINGS_TABLE, {"id": listing_id})
    if not deleted:
        raise HTTPException(status_code=404, detail="Food listing not found")
    return None


# ==========================================
# 3. RESERVATIONS REST API
# ==========================================

@app.get("/api/reservations", response_model=List[schemas.ReservationResponse])
def get_reservations(repo: DynamoDBRepository = Depends(get_dynamo_repo)):
    items = repo.scan_items(RESERVATIONS_TABLE)
    for res in items:
        if "food_name" not in res or not res["food_name"]:
            listing = repo.get_item(FOOD_LISTINGS_TABLE, {"id": res["food_listing_id"]})
            if listing:
                res["food_name"] = listing["name"]
                res["image_url"] = listing.get("image_url")
                rest = repo.get_item(RESTAURANTS_TABLE, {"id": listing["restaurant_id"]})
                res["restaurant_name"] = rest["name"] if rest else "Partner Kitchen"
            else:
                res["food_name"] = "Surplus Food Meal"
                res["restaurant_name"] = "Local Kitchen"
    return items


@app.get("/api/reservations/{reservation_id}", response_model=schemas.ReservationResponse)
def get_reservation(reservation_id: int, repo: DynamoDBRepository = Depends(get_dynamo_repo)):
    res = repo.get_item(RESERVATIONS_TABLE, {"id": reservation_id})
    if not res:
        raise HTTPException(status_code=404, detail="Reservation not found")

    if "food_name" not in res or not res["food_name"]:
        listing = repo.get_item(FOOD_LISTINGS_TABLE, {"id": res["food_listing_id"]})
        if listing:
            res["food_name"] = listing["name"]
            res["image_url"] = listing.get("image_url")
            rest = repo.get_item(RESTAURANTS_TABLE, {"id": listing["restaurant_id"]})
            res["restaurant_name"] = rest["name"] if rest else "Partner Kitchen"

    return res


@app.post("/api/reservations", response_model=schemas.ReservationResponse, status_code=status.HTTP_201_CREATED)
def create_reservation(res_in: schemas.ReservationCreate, repo: DynamoDBRepository = Depends(get_dynamo_repo)):
    listing = repo.get_item(FOOD_LISTINGS_TABLE, {"id": res_in.food_listing_id})
    if not listing:
        raise HTTPException(status_code=404, detail="Food listing not found")

    if listing.get("status") == "SOLD_OUT" or listing["quantity"] <= 0:
        raise HTTPException(status_code=400, detail="Food listing is sold out")

    if listing["quantity"] < res_in.quantity:
        raise HTTPException(
            status_code=400,
            detail=f"Only {listing['quantity']} portion(s) available, requested {res_in.quantity}",
        )

    # Check expiry before allowing reservation
    from priority_engine import parse_expiry_minutes
    remaining = parse_expiry_minutes(listing.get("expiry_time", ""))
    if remaining <= 0:
        raise HTTPException(status_code=400, detail="Food listing has expired")

    total_price = listing["rescue_price"] * res_in.quantity
    new_quantity = listing["quantity"] - res_in.quantity

    new_status = "ACTIVE"
    if new_quantity <= 0:
        new_quantity = 0
        new_status = "SOLD_OUT"
    elif new_quantity <= 2:
        new_status = "LOW_STOCK"

    # Atomic update with DynamoDB ConditionExpression to prevent race conditions
    updated = repo.update_item(
        FOOD_LISTINGS_TABLE,
        {"id": listing["id"]},
        {"quantity": new_quantity, "status": new_status},
        condition_expression="quantity >= :required_qty",
        condition_values={":required_qty": res_in.quantity},
    )
    if updated is None:
        raise HTTPException(
            status_code=409,
            detail="Reservation conflict — listing was updated by another request. Please retry.",
        )

    res_payload = {
        "food_listing_id": listing["id"],
        "customer_name": res_in.customer_name or "Guest Customer",
        "quantity": res_in.quantity,
        "total_price": total_price,
        "status": "CONFIRMED",
        "pickup_time": res_in.pickup_time or "Today, 8:00 PM - 9:30 PM",
        "created_at": datetime.utcnow(),
    }

    created_res = repo.put_item(RESERVATIONS_TABLE, res_payload)
    created_res["food_name"] = listing["name"]
    created_res["image_url"] = listing.get("image_url")

    rest = repo.get_item(RESTAURANTS_TABLE, {"id": listing["restaurant_id"]})
    created_res["restaurant_name"] = rest["name"] if rest else "Partner Kitchen"

    return created_res

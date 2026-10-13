"""
RescueBite Enhancement: Expiry-Aware Food Priority & Dynamic Pricing Engine
-----------------------------------------------------------------------------
This module contains the core business logic for calculating real-time urgency levels,
priority scores, and recommended rescue pricing based on time remaining until expiry.

Configurable Rules:
- > 3 hours (180+ mins)   -> LOW urgency      (25%-35% recommended discount)
- 1 to 3 hours (60-180m)  -> MEDIUM urgency   (40%-50% recommended discount)
- 30 to 60 mins (30-60m)  -> HIGH urgency     (55%-65% recommended discount)
- < 30 mins (< 30m)       -> CRITICAL urgency (70%-80% recommended discount)
"""

import re
from typing import Dict, Any, Tuple

# Configurable discount percentages by urgency level
URGENCY_CONFIG = {
    "CRITICAL": {"min_discount": 0.70, "max_discount": 0.80, "base_priority": 95},
    "HIGH":     {"min_discount": 0.55, "max_discount": 0.65, "base_priority": 80},
    "MEDIUM":   {"min_discount": 0.40, "max_discount": 0.50, "base_priority": 55},
    "LOW":      {"min_discount": 0.25, "max_discount": 0.35, "base_priority": 25},
}


def parse_expiry_minutes(expiry_str: str) -> int:
    """
    Parses expiry text string (e.g. 'Expires in 25 min', 'Expires in 2 hrs', '30 min')
    into remaining time in integer minutes.
    """
    if not expiry_str:
        return 120  # Default 2 hours

    s = expiry_str.lower().strip()
    
    # Check for hours match
    hr_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:hr|hour)', s)
    min_match = re.search(r'(\d+)\s*(?:min|m)', s)

    total_minutes = 0
    if hr_match:
        total_minutes += int(float(hr_match.group(1)) * 60)
    if min_match:
        total_minutes += int(min_match.group(1))

    if total_minutes > 0:
        return total_minutes

    # If simple number
    num_match = re.search(r'(\d+)', s)
    if num_match:
        val = int(num_match.group(1))
        return val if val > 10 else val * 60

    return 60  # Default fallback


def calculate_urgency(remaining_minutes: int) -> str:
    """
    Determines urgency level based on remaining time until expiry:
    - > 180 mins  -> LOW
    - 60-180 mins -> MEDIUM
    - 30-60 mins  -> HIGH
    - < 30 mins   -> CRITICAL
    """
    if remaining_minutes < 30:
        return "CRITICAL"
    elif remaining_minutes <= 60:
        return "HIGH"
    elif remaining_minutes <= 180:
        return "MEDIUM"
    else:
        return "LOW"


def calculate_priority_score(urgency: str, remaining_minutes: int, quantity: int) -> int:
    """
    Calculates a composite priority score (0 to 100) for sorting algorithms.
    Critical/near-expiry items get higher scores.
    """
    if quantity <= 0:
        return 0

    cfg = URGENCY_CONFIG.get(urgency, URGENCY_CONFIG["LOW"])
    base_score = cfg["base_priority"]

    # Add time pressure bonus (shorter time -> higher bonus)
    time_bonus = max(0, 15 - int(remaining_minutes / 15))
    
    score = base_score + time_bonus
    return min(100, max(1, score))


def calculate_recommended_price(original_price: float, remaining_minutes: int, urgency: str) -> Tuple[float, int]:
    """
    Calculates the recommended dynamic rescue price based on original price and remaining time.
    Ensures recommended price is never negative and stays above a safe floor.
    """
    if original_price <= 0:
        original_price = 200.0

    cfg = URGENCY_CONFIG.get(urgency, URGENCY_CONFIG["LOW"])
    recommended_discount_pct = cfg["max_discount"] if remaining_minutes < 20 else cfg["min_discount"]
    
    recommended_price = original_price * (1.0 - recommended_discount_pct)

    # Minimum price floor (never negative, minimum ₹20 or 15% of original price)
    min_price_floor = max(20.0, original_price * 0.15)
    recommended_price = round(max(min_price_floor, recommended_price), 2)
    
    effective_discount_pct = int(round(((original_price - recommended_price) / original_price) * 100))

    return recommended_price, effective_discount_pct


def evaluate_listing_priority_and_pricing(listing_dict: Dict[str, Any]) -> Dict[str, Any]:
    """
    Evaluates a full food listing and returns comprehensive dynamic priority & pricing metrics.
    """
    expiry_str = listing_dict.get("expiry_time") or listing_dict.get("expiryTime") or ""
    remaining_minutes = parse_expiry_minutes(expiry_str)
    
    quantity = int(listing_dict.get("quantity", listing_dict.get("quantityRemaining", 1)))
    original_price = float(listing_dict.get("original_price", listing_dict.get("originalPrice", 0)))
    current_rescue_price = float(listing_dict.get("rescue_price", listing_dict.get("rescuePrice", 0)))

    if original_price <= 0:
        original_price = current_rescue_price * 2.0 if current_rescue_price > 0 else 250.0

    urgency = calculate_urgency(remaining_minutes)
    priority_score = calculate_priority_score(urgency, remaining_minutes, quantity)
    recommended_price, recommended_discount_pct = calculate_recommended_price(original_price, remaining_minutes, urgency)

    # Potential savings for restaurant if adopted
    price_difference = current_rescue_price - recommended_price

    return {
        "listing_id": listing_dict.get("id"),
        "name": listing_dict.get("name"),
        "remaining_minutes": remaining_minutes,
        "urgency_level": urgency,
        "priority_score": priority_score,
        "original_price": original_price,
        "current_rescue_price": current_rescue_price,
        "recommended_rescue_price": recommended_price,
        "recommended_discount_percent": recommended_discount_pct,
        "price_difference": round(price_difference, 2),
        "is_action_recommended": abs(price_difference) > 10.0,
        "enhancement_label": "RescueBite Expiry-Aware Dynamic Pricing & Priority System",
    }

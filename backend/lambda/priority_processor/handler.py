"""
RescueBite — AWS Lambda: Priority & Dynamic Pricing Processor
---------------------------------------------------------------
This handler processes two kinds of events:

1. **Direct invocation** (from FastAPI via boto3 lambda.invoke):
   Event: {"listing": { ... food listing dict ... }}
   Returns: priority/pricing evaluation result.

2. **DynamoDB Stream trigger** (automatic on FoodListings changes):
   Event: {"Records": [ ... DynamoDB Stream records ... ]}
   Calculates urgency/priority/recommended_price and writes them
   back to the food listing item in DynamoDB.

Infinite-loop prevention:
   - If only the priority fields changed (urgency_level, priority_score,
     recommended_rescue_price), the update is skipped.
   - If the calculated values already match what is stored, no write occurs.
"""

import json
import os
from decimal import Decimal

import boto3
from boto3.dynamodb.types import TypeDeserializer

# Import the reusable pricing engine (bundled in the Lambda package)
from priority_engine import evaluate_listing_priority_and_pricing

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
REGION = os.getenv("AWS_REGION", "ap-south-1")
FOOD_LISTINGS_TABLE = os.getenv(
    "DYNAMODB_FOOD_LISTINGS_TABLE", "RescueBite-FoodListings"
)

dynamodb = boto3.resource("dynamodb", region_name=REGION)
food_table = dynamodb.Table(FOOD_LISTINGS_TABLE)
deserializer = TypeDeserializer()

# Fields that THIS Lambda writes — used for loop detection
PRIORITY_FIELDS = {"urgency_level", "priority_score", "recommended_rescue_price"}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
class DecimalEncoder(json.JSONEncoder):
    """Encode Decimal → int/float so json.dumps works."""
    def default(self, o):
        if isinstance(o, Decimal):
            return int(o) if o == int(o) else float(o)
        return super().default(o)


def _deserialize_stream_image(image: dict) -> dict:
    """Convert a DynamoDB Stream NewImage/OldImage to a plain Python dict."""
    return {k: deserializer.deserialize(v) for k, v in image.items()}


def _decimal_safe(value):
    """Convert float → Decimal for DynamoDB writes."""
    if isinstance(value, float):
        return Decimal(str(value))
    return value


# ---------------------------------------------------------------------------
# Direct invocation handler
# ---------------------------------------------------------------------------
def _handle_direct(event: dict) -> dict:
    listing = event["listing"]
    result = evaluate_listing_priority_and_pricing(listing)
    return {
        "statusCode": 200,
        "body": json.dumps(result, cls=DecimalEncoder),
    }


# ---------------------------------------------------------------------------
# DynamoDB Stream handler
# ---------------------------------------------------------------------------
def _handle_stream(event: dict) -> dict:
    processed = 0
    skipped = 0

    for record in event.get("Records", []):
        event_name = record.get("eventName", "")
        if event_name not in ("INSERT", "MODIFY"):
            continue

        new_image = record.get("dynamodb", {}).get("NewImage")
        old_image = record.get("dynamodb", {}).get("OldImage")
        if not new_image:
            continue

        item = _deserialize_stream_image(new_image)
        old_item = _deserialize_stream_image(old_image) if old_image else {}

        # ---- Loop detection ------------------------------------------------
        # If the ONLY fields that changed between old and new are the
        # priority fields, this event was triggered by our own write → skip.
        if old_item:
            changed = {
                k for k in set(list(item.keys()) + list(old_item.keys()))
                if item.get(k) != old_item.get(k)
            }
            if changed and changed.issubset(PRIORITY_FIELDS):
                skipped += 1
                continue

        # ---- Calculate new values ------------------------------------------
        evaluation = evaluate_listing_priority_and_pricing(item)
        new_urgency = evaluation["urgency_level"]
        new_priority = evaluation["priority_score"]
        new_price = evaluation["recommended_rescue_price"]

        # Skip if values already match
        if (
            str(item.get("urgency_level")) == str(new_urgency)
            and item.get("priority_score") == new_priority
            and item.get("recommended_rescue_price") == new_price
        ):
            skipped += 1
            continue

        # ---- Write back to DynamoDB ----------------------------------------
        item_id = item.get("id")
        if item_id is None:
            continue

        try:
            food_table.update_item(
                Key={"id": int(item_id)},
                UpdateExpression=(
                    "SET urgency_level = :u, "
                    "    priority_score = :p, "
                    "    recommended_rescue_price = :r"
                ),
                ExpressionAttributeValues={
                    ":u": new_urgency,
                    ":p": new_priority,
                    ":r": _decimal_safe(new_price),
                },
            )
            processed += 1
            print(
                f"Updated listing {item_id}: "
                f"urgency={new_urgency}, priority={new_priority}, "
                f"recommended_price={new_price}"
            )
        except Exception as exc:
            print(f"Error updating listing {item_id}: {exc}")

    return {
        "statusCode": 200,
        "body": json.dumps({
            "processed": processed,
            "skipped": skipped,
        }),
    }


# ---------------------------------------------------------------------------
# Main Lambda entry point
# ---------------------------------------------------------------------------
def handler(event, context):
    """
    AWS Lambda entry point.
    Dispatches to the correct sub-handler based on event shape.
    """
    print(f"Event received: {json.dumps(event, cls=DecimalEncoder)[:500]}")

    if "listing" in event:
        return _handle_direct(event)

    if "Records" in event:
        return _handle_stream(event)

    return {
        "statusCode": 400,
        "body": json.dumps({"error": "Unknown event format"}),
    }

"""
Amazon DynamoDB Repository Layer for RescueBite Backend
-------------------------------------------------------
REAL AWS DynamoDB implementation using boto3.

All application data operations flow through this repository.
The interface (put_item, get_item, scan_items, query_items,
update_item, delete_item) is preserved from the original design
so that FastAPI route handlers require no signature changes.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
from decimal import Decimal, InvalidOperation
import time
import random

from boto3.dynamodb.conditions import Attr, Key as DKey

from aws_config import (
    get_dynamodb_resource,
    DYNAMODB_RESTAURANTS_TABLE,
    DYNAMODB_FOOD_LISTINGS_TABLE,
    DYNAMODB_RESERVATIONS_TABLE,
)

# ---------------------------------------------------------------------------
# Logical table-name constants  (kept identical so main.py imports unchanged)
# ---------------------------------------------------------------------------
RESTAURANTS_TABLE = "RescueBite-Restaurants"
FOOD_LISTINGS_TABLE = "RescueBite-FoodListings"
RESERVATIONS_TABLE = "RescueBite-Reservations"

# Map logical names → actual DynamoDB table names from env config
_TABLE_NAME_MAP = {
    RESTAURANTS_TABLE: DYNAMODB_RESTAURANTS_TABLE,
    FOOD_LISTINGS_TABLE: DYNAMODB_FOOD_LISTINGS_TABLE,
    RESERVATIONS_TABLE: DYNAMODB_RESERVATIONS_TABLE,
}


# ---------------------------------------------------------------------------
# Type-conversion helpers  (Python ↔ DynamoDB Decimal)
# ---------------------------------------------------------------------------
def _generate_id() -> int:
    """Generate a unique integer ID (timestamp-milliseconds + random jitter)."""
    return int(time.time() * 1000) % 10**9 + random.randint(1, 9999)


def _to_decimal(value):
    """Safely convert a numeric Python value to Decimal for DynamoDB."""
    if isinstance(value, Decimal):
        return value
    if isinstance(value, float):
        return Decimal(str(round(value, 2)))
    if isinstance(value, int):
        return value  # boto3 handles int natively
    return value


def _prepare_item(raw: Dict[str, Any]) -> Dict[str, Any]:
    """Prepare a Python dict for DynamoDB storage (Decimal conversion, None removal)."""
    prepared = {}
    for key, value in raw.items():
        if value is None:
            continue
        if isinstance(value, float):
            prepared[key] = _to_decimal(value)
        elif isinstance(value, datetime):
            prepared[key] = value.isoformat()
        else:
            prepared[key] = value
    return prepared


def _from_dynamodb(item: Dict[str, Any]) -> Dict[str, Any]:
    """Convert a DynamoDB item (containing Decimal types) to Python-native types."""
    result = {}
    for key, value in item.items():
        if isinstance(value, Decimal):
            result[key] = int(value) if value == int(value) else float(value)
        else:
            result[key] = value
    return result


# ---------------------------------------------------------------------------
# Repository
# ---------------------------------------------------------------------------
class DynamoDBRepository:
    """
    Real Amazon DynamoDB repository.

    Constructor no longer requires a SQLAlchemy Session —
    it connects directly to AWS DynamoDB via boto3.
    """

    def __init__(self):
        self._dynamodb = get_dynamodb_resource()
        self._table_cache: Dict[str, Any] = {}

    def _table(self, logical_name: str):
        actual = _TABLE_NAME_MAP.get(logical_name, logical_name)
        if actual not in self._table_cache:
            self._table_cache[actual] = self._dynamodb.Table(actual)
        return self._table_cache[actual]

    # -------------------------------------------------------------------
    # 1. PutItem
    # -------------------------------------------------------------------
    def put_item(self, table_name: str, item: Dict[str, Any]) -> Dict[str, Any]:
        """
        Puts an item into the specified DynamoDB table.
        Auto-generates an ``id`` if not provided.
        """
        if "id" not in item or item["id"] is None:
            item["id"] = _generate_id()

        # Ensure created_at
        if "created_at" not in item:
            item["created_at"] = datetime.utcnow().isoformat()
        elif isinstance(item["created_at"], datetime):
            item["created_at"] = item["created_at"].isoformat()

        prepared = _prepare_item(item)
        self._table(table_name).put_item(Item=prepared)
        return _from_dynamodb(prepared)

    # -------------------------------------------------------------------
    # 2. GetItem
    # -------------------------------------------------------------------
    def get_item(self, table_name: str, key: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Retrieves a single item by primary key.
        """
        primary_id = key.get("id") or key.get("PK")
        if primary_id is None:
            return None

        response = self._table(table_name).get_item(Key={"id": int(primary_id)})
        item = response.get("Item")
        return _from_dynamodb(item) if item else None

    # -------------------------------------------------------------------
    # 3. Scan
    # -------------------------------------------------------------------
    def scan_items(
        self,
        table_name: str,
        filter_expression: Optional[Dict[str, Any]] = None,
    ) -> List[Dict[str, Any]]:
        """
        Scans all items, optionally applying filter expressions.
        Text search (``search`` key) is applied in Python because
        DynamoDB does not support case-insensitive LIKE.
        """
        filter_expression = filter_expression or {}
        conditions = []

        # Build DynamoDB FilterExpression
        if table_name == FOOD_LISTINGS_TABLE:
            if "restaurant_id" in filter_expression:
                conditions.append(
                    Attr("restaurant_id").eq(int(filter_expression["restaurant_id"]))
                )
            if (
                "category" in filter_expression
                and filter_expression["category"] != "All"
            ):
                conditions.append(
                    Attr("category").eq(filter_expression["category"])
                )

        elif table_name == RESTAURANTS_TABLE:
            if "category" in filter_expression:
                conditions.append(
                    Attr("category").eq(filter_expression["category"])
                )

        elif table_name == RESERVATIONS_TABLE:
            if "status" in filter_expression:
                conditions.append(
                    Attr("status").eq(filter_expression["status"])
                )

        scan_kwargs: Dict[str, Any] = {}
        if conditions:
            combined = conditions[0]
            for cond in conditions[1:]:
                combined = combined & cond
            scan_kwargs["FilterExpression"] = combined

        # Paginate through all results
        items: list = []
        while True:
            response = self._table(table_name).scan(**scan_kwargs)
            items.extend(response.get("Items", []))
            if "LastEvaluatedKey" not in response:
                break
            scan_kwargs["ExclusiveStartKey"] = response["LastEvaluatedKey"]

        results = [_from_dynamodb(i) for i in items]

        # Client-side case-insensitive text search
        if "search" in filter_expression and filter_expression["search"]:
            term = filter_expression["search"].lower()
            results = [
                r
                for r in results
                if term in (r.get("name") or "").lower()
                or term in (r.get("description") or "").lower()
            ]

        # Sort by created_at descending (DynamoDB Scan has no ordering)
        results.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        return results

    # -------------------------------------------------------------------
    # 4. Query (uses GSI)
    # -------------------------------------------------------------------
    def query_items(
        self,
        table_name: str,
        key_condition_expression: Dict[str, Any],
    ) -> List[Dict[str, Any]]:
        """
        Queries items using a Global Secondary Index.
        """
        if (
            table_name == FOOD_LISTINGS_TABLE
            and "restaurant_id" in key_condition_expression
        ):
            response = self._table(table_name).query(
                IndexName="restaurant_id-index",
                KeyConditionExpression=DKey("restaurant_id").eq(
                    int(key_condition_expression["restaurant_id"])
                ),
            )
            return [_from_dynamodb(i) for i in response.get("Items", [])]

        if (
            table_name == RESERVATIONS_TABLE
            and "food_listing_id" in key_condition_expression
        ):
            response = self._table(table_name).query(
                IndexName="food_listing_id-index",
                KeyConditionExpression=DKey("food_listing_id").eq(
                    int(key_condition_expression["food_listing_id"])
                ),
            )
            return [_from_dynamodb(i) for i in response.get("Items", [])]

        # Fallback to scan
        return self.scan_items(table_name, key_condition_expression)

    # -------------------------------------------------------------------
    # 5. UpdateItem  (with optional ConditionExpression for safety)
    # -------------------------------------------------------------------
    def update_item(
        self,
        table_name: str,
        key: Dict[str, Any],
        attribute_updates: Dict[str, Any],
        condition_expression: Optional[str] = None,
        condition_values: Optional[Dict[str, Any]] = None,
    ) -> Optional[Dict[str, Any]]:
        """
        Updates an existing item's attributes using DynamoDB UpdateExpression.

        Optional ``condition_expression`` / ``condition_values`` allow
        conditional writes (e.g. preventing quantity going negative).
        """
        primary_id = key.get("id") or key.get("PK")
        if primary_id is None:
            return None

        # Build SET expression
        set_parts = []
        attr_names: Dict[str, str] = {}
        attr_values: Dict[str, Any] = {}

        for idx, (attr, val) in enumerate(attribute_updates.items()):
            if val is None:
                continue
            name_ph = f"#a{idx}"
            val_ph = f":v{idx}"
            set_parts.append(f"{name_ph} = {val_ph}")
            attr_names[name_ph] = attr
            attr_values[val_ph] = _to_decimal(val) if isinstance(val, float) else (
                val.isoformat() if isinstance(val, datetime) else val
            )

        if not set_parts:
            return self.get_item(table_name, key)

        update_kwargs: Dict[str, Any] = {
            "Key": {"id": int(primary_id)},
            "UpdateExpression": "SET " + ", ".join(set_parts),
            "ExpressionAttributeNames": attr_names,
            "ExpressionAttributeValues": attr_values,
            "ReturnValues": "ALL_NEW",
        }

        # Apply conditional expression if provided
        if condition_expression:
            update_kwargs["ConditionExpression"] = condition_expression
            if condition_values:
                for k, v in condition_values.items():
                    update_kwargs["ExpressionAttributeValues"][k] = (
                        _to_decimal(v) if isinstance(v, float) else v
                    )

        # Auto-add quantity safety for food listings
        if (
            table_name == FOOD_LISTINGS_TABLE
            and "quantity" in attribute_updates
            and not condition_expression
        ):
            # Prevent setting negative quantity
            qty_val_ph = None
            for idx, attr in enumerate(attribute_updates):
                if attr == "quantity":
                    qty_val_ph = f":v{idx}"
                    break
            if qty_val_ph:
                update_kwargs["ConditionExpression"] = f"{qty_val_ph} >= :zero"
                update_kwargs["ExpressionAttributeValues"][":zero"] = 0

        try:
            response = self._table(table_name).update_item(**update_kwargs)
            return _from_dynamodb(response.get("Attributes", {}))
        except self._dynamodb.meta.client.exceptions.ConditionalCheckFailedException:
            return None
        except Exception as exc:
            if "ConditionalCheckFailedException" in str(type(exc).__name__):
                return None
            raise

    # -------------------------------------------------------------------
    # 6. DeleteItem
    # -------------------------------------------------------------------
    def delete_item(self, table_name: str, key: Dict[str, Any]) -> bool:
        """
        Deletes a single item by primary key.
        Returns False if the item did not exist.
        """
        primary_id = key.get("id") or key.get("PK")
        if primary_id is None:
            return False

        try:
            self._table(table_name).delete_item(
                Key={"id": int(primary_id)},
                ConditionExpression="attribute_exists(id)",
            )
            return True
        except self._dynamodb.meta.client.exceptions.ConditionalCheckFailedException:
            return False
        except Exception as exc:
            if "ConditionalCheckFailedException" in str(type(exc).__name__):
                return False
            raise

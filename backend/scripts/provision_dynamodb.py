"""
RescueBite — DynamoDB Table Provisioning Script
-------------------------------------------------
Creates the three real Amazon DynamoDB tables (with GSIs and Streams)
if they do not already exist.  Safe to run repeatedly.

Usage:
    cd backend
    python -m scripts.provision_dynamodb
"""

import sys
import time

# Allow running from the backend directory
sys.path.insert(0, ".")

from aws_config import (
    get_dynamodb_client,
    get_dynamodb_resource,
    DYNAMODB_RESTAURANTS_TABLE,
    DYNAMODB_FOOD_LISTINGS_TABLE,
    DYNAMODB_RESERVATIONS_TABLE,
    AWS_REGION,
)

# ---------------------------------------------------------------------------
# Table Definitions
# ---------------------------------------------------------------------------
TABLE_DEFINITIONS = [
    {
        "TableName": DYNAMODB_RESTAURANTS_TABLE,
        "KeySchema": [{"AttributeName": "id", "KeyType": "HASH"}],
        "AttributeDefinitions": [
            {"AttributeName": "id", "AttributeType": "N"},
        ],
        "BillingMode": "PAY_PER_REQUEST",
    },
    {
        "TableName": DYNAMODB_FOOD_LISTINGS_TABLE,
        "KeySchema": [{"AttributeName": "id", "KeyType": "HASH"}],
        "AttributeDefinitions": [
            {"AttributeName": "id", "AttributeType": "N"},
            {"AttributeName": "restaurant_id", "AttributeType": "N"},
        ],
        "BillingMode": "PAY_PER_REQUEST",
        # GSI so query_items can look up listings by restaurant
        "GlobalSecondaryIndexes": [
            {
                "IndexName": "restaurant_id-index",
                "KeySchema": [
                    {"AttributeName": "restaurant_id", "KeyType": "HASH"},
                ],
                "Projection": {"ProjectionType": "ALL"},
            },
        ],
        # Enable DynamoDB Streams for Lambda trigger
        "StreamSpecification": {
            "StreamEnabled": True,
            "StreamViewType": "NEW_AND_OLD_IMAGES",
        },
    },
    {
        "TableName": DYNAMODB_RESERVATIONS_TABLE,
        "KeySchema": [{"AttributeName": "id", "KeyType": "HASH"}],
        "AttributeDefinitions": [
            {"AttributeName": "id", "AttributeType": "N"},
            {"AttributeName": "food_listing_id", "AttributeType": "N"},
        ],
        "BillingMode": "PAY_PER_REQUEST",
        # GSI so query_items can look up reservations by food_listing_id
        "GlobalSecondaryIndexes": [
            {
                "IndexName": "food_listing_id-index",
                "KeySchema": [
                    {"AttributeName": "food_listing_id", "KeyType": "HASH"},
                ],
                "Projection": {"ProjectionType": "ALL"},
            },
        ],
    },
]


def table_exists(client, table_name: str) -> bool:
    """Check whether a DynamoDB table already exists."""
    try:
        resp = client.describe_table(TableName=table_name)
        status = resp["Table"]["TableStatus"]
        print(f"  ✓ Table '{table_name}' already exists  (status: {status})")
        return True
    except client.exceptions.ResourceNotFoundException:
        return False


def wait_for_table(client, table_name: str, timeout: int = 120):
    """Block until the table reaches ACTIVE status."""
    print(f"  ⏳ Waiting for '{table_name}' to become ACTIVE …")
    start = time.time()
    while time.time() - start < timeout:
        resp = client.describe_table(TableName=table_name)
        status = resp["Table"]["TableStatus"]
        if status == "ACTIVE":
            print(f"  ✓ '{table_name}' is ACTIVE")
            return
        time.sleep(2)
    raise TimeoutError(f"Table '{table_name}' did not become ACTIVE within {timeout}s")


def provision_tables():
    """Create all required DynamoDB tables."""
    client = get_dynamodb_client()

    print(f"\n{'='*60}")
    print(f"  RescueBite — DynamoDB Table Provisioning")
    print(f"  Region: {AWS_REGION}")
    print(f"{'='*60}\n")

    for defn in TABLE_DEFINITIONS:
        table_name = defn["TableName"]
        if table_exists(client, table_name):
            continue

        print(f"  → Creating table '{table_name}' …")
        try:
            client.create_table(**defn)
            wait_for_table(client, table_name)
        except Exception as exc:
            print(f"  ✗ Failed to create '{table_name}': {exc}")
            raise

    # Final status report
    print(f"\n{'='*60}")
    print("  Table Status Report")
    print(f"{'='*60}")
    for defn in TABLE_DEFINITIONS:
        table_name = defn["TableName"]
        try:
            resp = client.describe_table(TableName=table_name)
            t = resp["Table"]
            status = t["TableStatus"]
            item_count = t.get("ItemCount", "N/A")
            stream_arn = t.get("LatestStreamArn", "Not enabled")
            print(f"\n  {table_name}")
            print(f"    Status:     {status}")
            print(f"    Items:      {item_count}")
            print(f"    Stream ARN: {stream_arn}")
            if t.get("GlobalSecondaryIndexes"):
                for gsi in t["GlobalSecondaryIndexes"]:
                    print(f"    GSI:        {gsi['IndexName']}  ({gsi['IndexStatus']})")
        except Exception as exc:
            print(f"  ✗ Could not describe '{table_name}': {exc}")

    print(f"\n{'='*60}")
    print("  Provisioning complete.")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    provision_tables()

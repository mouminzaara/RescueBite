"""
RescueBite — AWS Configuration Module
--------------------------------------
Centralised boto3 resource/client factories and environment variable loading.
Uses the standard boto3 credential chain (env vars → ~/.aws/credentials → IAM role).
Never hardcodes secrets.
"""

import os
from functools import lru_cache

from dotenv import load_dotenv

load_dotenv()  # reads backend/.env when running locally

# ---------------------------------------------------------------------------
# Environment
# ---------------------------------------------------------------------------
AWS_REGION = os.getenv("AWS_REGION", "ap-south-1")

DYNAMODB_RESTAURANTS_TABLE = os.getenv(
    "DYNAMODB_RESTAURANTS_TABLE", "RescueBite-Restaurants"
)
DYNAMODB_FOOD_LISTINGS_TABLE = os.getenv(
    "DYNAMODB_FOOD_LISTINGS_TABLE", "RescueBite-FoodListings"
)
DYNAMODB_RESERVATIONS_TABLE = os.getenv(
    "DYNAMODB_RESERVATIONS_TABLE", "RescueBite-Reservations"
)

LAMBDA_PRIORITY_FUNCTION = os.getenv(
    "LAMBDA_PRIORITY_FUNCTION", "RescueBite-PriorityProcessor"
)


# ---------------------------------------------------------------------------
# boto3 Factories (cached so we reuse connections)
# ---------------------------------------------------------------------------
@lru_cache(maxsize=1)
def get_dynamodb_resource():
    """Return a high-level DynamoDB resource (Table-oriented API)."""
    import boto3
    return boto3.resource("dynamodb", region_name=AWS_REGION)


@lru_cache(maxsize=1)
def get_dynamodb_client():
    """Return a low-level DynamoDB client (for table management)."""
    import boto3
    return boto3.client("dynamodb", region_name=AWS_REGION)


@lru_cache(maxsize=1)
def get_lambda_client():
    """Return a Lambda client for invoking functions."""
    import boto3
    return boto3.client("lambda", region_name=AWS_REGION)

"""
RescueBite — Lambda Deployment Script
---------------------------------------
Creates (or updates) the RescueBite-PriorityProcessor Lambda function
and configures its DynamoDB Stream trigger.

Prerequisites:
  1. AWS credentials configured (env vars, ~/.aws/credentials, or IAM role)
  2. An IAM execution role for the Lambda (see README.md for policy)
  3. DynamoDB tables already provisioned (run provision_dynamodb.py first)

Usage:
    cd backend
    python -m lambda.deploy_lambda --role-arn arn:aws:iam::ACCOUNT:role/ROLE_NAME

If updating an existing function, the --role-arn is optional (existing role is kept).
"""

import argparse
import io
import json
import os
import sys
import time
import zipfile

sys.path.insert(0, ".")

import boto3
from aws_config import (
    AWS_REGION,
    LAMBDA_PRIORITY_FUNCTION,
    DYNAMODB_FOOD_LISTINGS_TABLE,
)

LAMBDA_DIR = os.path.join(os.path.dirname(__file__), "priority_processor")
HANDLER = "handler.handler"
RUNTIME = "python3.12"
TIMEOUT = 30
MEMORY = 256


def _build_zip() -> bytes:
    """Package handler.py + priority_engine.py into an in-memory ZIP."""
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        for filename in ("handler.py", "priority_engine.py"):
            filepath = os.path.join(LAMBDA_DIR, filename)
            zf.write(filepath, filename)
    buf.seek(0)
    return buf.read()


def deploy(role_arn: str | None = None):
    lam = boto3.client("lambda", region_name=AWS_REGION)
    ddb = boto3.client("dynamodb", region_name=AWS_REGION)

    zip_bytes = _build_zip()
    print(f"  📦 Lambda package built  ({len(zip_bytes)} bytes)")

    env_vars = {
        "AWS_REGION_OVERRIDE": AWS_REGION,
        "DYNAMODB_FOOD_LISTINGS_TABLE": DYNAMODB_FOOD_LISTINGS_TABLE,
    }

    # --- Create or Update ------------------------------------------------
    try:
        lam.get_function(FunctionName=LAMBDA_PRIORITY_FUNCTION)
        # Function exists → update code
        print(f"  → Updating existing function '{LAMBDA_PRIORITY_FUNCTION}' …")
        lam.update_function_code(
            FunctionName=LAMBDA_PRIORITY_FUNCTION,
            ZipFile=zip_bytes,
        )
        time.sleep(2)
        lam.update_function_configuration(
            FunctionName=LAMBDA_PRIORITY_FUNCTION,
            Runtime=RUNTIME,
            Handler=HANDLER,
            Timeout=TIMEOUT,
            MemorySize=MEMORY,
            Environment={"Variables": env_vars},
        )
        print(f"  ✓ Function updated.")

    except lam.exceptions.ResourceNotFoundException:
        if not role_arn:
            print("  ✗ Function does not exist. You must provide --role-arn to create it.")
            print("    See README.md for the required IAM policy.")
            sys.exit(1)
        print(f"  → Creating function '{LAMBDA_PRIORITY_FUNCTION}' …")
        lam.create_function(
            FunctionName=LAMBDA_PRIORITY_FUNCTION,
            Runtime=RUNTIME,
            Role=role_arn,
            Handler=HANDLER,
            Code={"ZipFile": zip_bytes},
            Timeout=TIMEOUT,
            MemorySize=MEMORY,
            Environment={"Variables": env_vars},
        )
        print(f"  ✓ Function created.")

    # --- DynamoDB Stream Trigger -----------------------------------------
    print(f"\n  → Checking DynamoDB Stream trigger …")
    try:
        table_info = ddb.describe_table(TableName=DYNAMODB_FOOD_LISTINGS_TABLE)
        stream_arn = table_info["Table"].get("LatestStreamArn")
        if not stream_arn:
            print(f"  ⚠ No stream enabled on '{DYNAMODB_FOOD_LISTINGS_TABLE}'.")
            print(f"    Re-run provision_dynamodb.py to enable Streams.")
            return

        # Check for existing event source mappings
        existing = lam.list_event_source_mappings(
            FunctionName=LAMBDA_PRIORITY_FUNCTION,
        )
        already_mapped = any(
            m["EventSourceArn"] == stream_arn
            for m in existing.get("EventSourceMappings", [])
        )

        if already_mapped:
            print(f"  ✓ Stream trigger already configured.")
        else:
            lam.create_event_source_mapping(
                EventSourceArn=stream_arn,
                FunctionName=LAMBDA_PRIORITY_FUNCTION,
                StartingPosition="LATEST",
                BatchSize=10,
                MaximumBatchingWindowInSeconds=5,
                Enabled=True,
            )
            print(f"  ✓ Stream trigger created  (ARN: {stream_arn})")

    except Exception as exc:
        print(f"  ⚠ Could not configure stream trigger: {exc}")
        print(f"    You may need to configure it manually in the AWS Console.")

    print(f"\n  {'='*50}")
    print(f"  Deployment complete: {LAMBDA_PRIORITY_FUNCTION}")
    print(f"  {'='*50}\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Deploy RescueBite Lambda")
    parser.add_argument(
        "--role-arn",
        help="IAM execution role ARN (required for first-time creation)",
        default=None,
    )
    args = parser.parse_args()
    deploy(args.role_arn)

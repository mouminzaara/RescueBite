# RescueBite — AWS Lambda Deployment Guide

## Overview

The **RescueBite-PriorityProcessor** Lambda calculates real-time urgency levels,
priority scores, and recommended rescue prices for food listings.

It is triggered in two ways:

| Trigger | Description |
|---|---|
| **DynamoDB Stream** | Automatically fires when a food listing is created or modified in `RescueBite-FoodListings`. |
| **Direct Invocation** | Called synchronously by FastAPI for on-demand priority/pricing calculations. |

---

## Files

```
backend/lambda/
├── priority_processor/
│   ├── handler.py            # Lambda entry point
│   └── priority_engine.py    # Pricing/priority algorithms (copy from backend/)
├── deploy_lambda.py          # Automated deployment script (boto3)
└── README.md                 # This file
```

---

## Prerequisites

### 1. AWS Credentials

Configure credentials via **one** of these methods:

- Environment variables: `AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY`
- AWS credentials file: `~/.aws/credentials`
- IAM Instance Role (if running on EC2/ECS)

### 2. IAM Execution Role

Create an IAM role with the following **managed policies**:

| Policy | Purpose |
|---|---|
| `AWSLambdaBasicExecutionRole` | CloudWatch Logs |
| `AmazonDynamoDBFullAccess` | Read/write DynamoDB tables |

Or use this **inline policy** for least-privilege:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:UpdateItem",
        "dynamodb:DescribeStream",
        "dynamodb:GetRecords",
        "dynamodb:GetShardIterator",
        "dynamodb:ListStreams"
      ],
      "Resource": [
        "arn:aws:dynamodb:*:*:table/RescueBite-FoodListings",
        "arn:aws:dynamodb:*:*:table/RescueBite-FoodListings/stream/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    }
  ]
}
```

**Trust policy** (so Lambda service can assume the role):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "Service": "lambda.amazonaws.com" },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

Note the **Role ARN** (e.g. `arn:aws:iam::123456789012:role/RescueBite-LambdaRole`).

### 3. DynamoDB Tables

Run the provisioning script first:

```bash
cd backend
python -m scripts.provision_dynamodb
```

---

## Deployment

### Option A — Automated Script (Recommended)

```bash
cd backend

# First time (creates the function):
python -m lambda.deploy_lambda --role-arn arn:aws:iam::ACCOUNT_ID:role/RescueBite-LambdaRole

# Subsequent updates (just updates the code):
python -m lambda.deploy_lambda
```

The script will:
1. Package `handler.py` + `priority_engine.py` into a ZIP
2. Create or update the Lambda function
3. Configure the DynamoDB Stream trigger automatically

### Option B — Manual Deployment via AWS Console

1. **Create the ZIP package:**

   ```powershell
   cd backend\lambda\priority_processor
   Compress-Archive -Path handler.py, priority_engine.py -DestinationPath ..\priority_processor.zip -Force
   ```

2. **In the AWS Lambda Console:**
   - Create function → **Author from scratch**
   - Name: `RescueBite-PriorityProcessor`
   - Runtime: **Python 3.12**
   - Architecture: **x86_64**
   - Execution role: Select your IAM role
   - Upload the `.zip` package
   - Set Handler to: `handler.handler`

3. **Environment variables** (in Lambda Configuration tab):
   - `DYNAMODB_FOOD_LISTINGS_TABLE` = `RescueBite-FoodListings`
   - `AWS_REGION` = your region (e.g. `ap-south-1`)

4. **Add DynamoDB Stream trigger:**
   - Go to **Configuration → Triggers → Add trigger**
   - Source: **DynamoDB**
   - Table: `RescueBite-FoodListings`
   - Batch size: `10`
   - Starting position: **Latest**
   - Batch window: `5` seconds

---

## Testing

### Test Direct Invocation

In the Lambda Console → **Test** tab, use this test event:

```json
{
  "listing": {
    "id": 101,
    "name": "Artisanal Butter Croissants",
    "original_price": 350,
    "rescue_price": 140,
    "expiry_time": "Expires in 25 min",
    "quantity": 3
  }
}
```

Expected response:

```json
{
  "statusCode": 200,
  "body": "{\"listing_id\": 101, \"urgency_level\": \"CRITICAL\", ...}"
}
```

### Test DynamoDB Stream

1. Create or update a food listing via the RescueBite API
2. Check **CloudWatch Logs** → Log group `/aws/lambda/RescueBite-PriorityProcessor`
3. Verify the listing in DynamoDB now has `urgency_level`, `priority_score`, and `recommended_rescue_price`

---

## Infinite-Loop Prevention

The handler detects and skips self-triggered events:

1. **Field-change check**: If the *only* fields that changed between old and new images
   are `urgency_level`, `priority_score`, or `recommended_rescue_price`, the event
   is recognised as Lambda's own write and is skipped.

2. **Value-match check**: If the calculated values already match what is stored,
   no update is performed.

---

## Expiry Processing (Future)

A separate `expiry_processor/handler.py` can be created and triggered by
**Amazon EventBridge Scheduler** on a cron schedule to mark expired listings
as `EXPIRED`. This is not deployed by default.

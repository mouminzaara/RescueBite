# RescueBite 🍲🌱

RescueBite is a surplus-food marketplace where restaurants can list safe-to-consume surplus food at discounted prices, and customers can reserve it before it goes to waste.

## Project Structure

```text
RescueBite/
├── frontend/                     # React + Vite + Tailwind CSS
│   ├── src/                      # React source files (Navbar, FoodCard, Pages)
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── backend/                      # FastAPI + Dynamic Pricing Engine + DynamoDB Layer
│   ├── main.py                   # FastAPI application & REST router endpoints
│   ├── priority_engine.py        # Expiry-Aware Food Priority & Dynamic Pricing Engine
│   ├── dynamodb_repository.py    # AWS DynamoDB API simulation abstraction layer
│   ├── models.py                 # Underlying data models
│   ├── schemas.py                # Pydantic API request/response schemas
│   ├── seed.py                   # Initial mock data bootstrapper
│   ├── database.py               # Local storage session binding
│   └── requirements.txt          # Python dependencies
├── .gitignore
└── README.md
```

## Main Enhancement: Expiry-Aware Food Priority & Dynamic Pricing System ⚡

RescueBite features an intelligent backend pricing & priority engine (`backend/priority_engine.py`). The system continuously calculates real-time urgency levels, priority rank scores, and recommended dynamic rescue prices based on remaining time until expiry.

### Urgency Rules & Price Recommendations

| Remaining Time | Urgency Level | Priority Score | Recommended Discount | Description & Action |
| :--- | :--- | :--- | :--- | :--- |
| **> 3 Hours** | `LOW` | 25 - 45 | 25% – 35% OFF | Fresh surplus listing. Normal marketplace display. |
| **1 – 3 Hours** | `MEDIUM` | 55 - 75 | 40% – 50% OFF | Medium urgency. Standard discount. |
| **30 – 60 Mins** | `HIGH` | 80 - 94 | 55% – 65% OFF | High urgency. Prominently featured on Explore feed. |
| **< 30 Mins** | `CRITICAL` | 95 - 100 | 70% – 80% OFF | Critical urgency. Pulsing alert badge & top feed priority. |

* **Safety Floor**: Recommended prices are strictly bounded (`max(₹20, original_price * 0.15)`) so recommended rescue prices never become negative or zero.
* **Explicit Confirmation**: The system does NOT change restaurant listing prices automatically. Restaurant owners review recommendations on the **Restaurant Dashboard** and apply new prices via explicit confirmation.

---

## AWS DynamoDB Simulation Architecture

RescueBite features an **AWS DynamoDB simulation layer** (`backend/dynamodb_repository.py`). The application logic does not directly execute relational SQL queries. Instead, all data operations flow through a repository abstraction layer exposing operations conceptually equivalent to Amazon DynamoDB API calls.

### Developer-Facing DynamoDB Mapping Reference

| Application Entity / Concept | DynamoDB Concept | Simulated Table Name | Primary Key Structure | Description & Operations |
| :--- | :--- | :--- | :--- | :--- |
| **Restaurant** | DynamoDB Item | `RescueBite-Restaurants` | `id` (Partition Key `PK#RESTAURANT`) | Represents partner kitchens and bakeries. Operations: `put_item`, `get_item`, `scan_items`. |
| **FoodListing** | DynamoDB Item | `RescueBite-FoodListings` | `id` (Partition Key `PK#LISTING`, GSI `restaurant_id`) | Represents surplus meals offered for pickup. Operations: `put_item`, `get_item`, `scan_items`, `query_items`, `update_item`, `delete_item`. |
| **Reservation** | DynamoDB Item | `RescueBite-Reservations` | `id` (Partition Key `PK#RESERVATION`, GSI `food_listing_id`) | Represents customer meal pickup tickets. Operations: `put_item`, `get_item`, `scan_items`, `query_items`. |

### DynamoDB Operation Mappings

1. **PutItem (`put_item`)**:
   - Used when creating new restaurants, publishing surplus food listings (`POST /api/food-listings`), or confirming customer reservations (`POST /api/reservations`).
2. **GetItem (`get_item`)**:
   - Used when looking up a specific restaurant (`GET /api/restaurants/{id}`), food listing (`GET /api/food-listings/{id}`), or reservation by primary key.
3. **Scan / FilterExpression (`scan_items`)**:
   - Used to list all available food listings across restaurants with client filters (`category`, `search` term, `price`).
4. **Query / KeyConditionExpression (`query_items`)**:
   - Used when querying surplus food listings belonging to a specific restaurant (`restaurant_id`) or reservations belonging to a specific meal listing.
5. **UpdateItem / UpdateExpression (`update_item`)**:
   - Used when updating surplus listing price/quantity (`PUT /api/food-listings/{id}`) or automatically decrementing available stock during a reservation.
6. **DeleteItem (`delete_item`)**:
   - Used when a restaurant partner removes a surplus food listing (`DELETE /api/food-listings/{id}`).

---

## Setup & Local Development

### Backend Setup (FastAPI)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Activate virtual environment:
   ```bash
   # On Windows:
   ..\.venv\Scripts\activate
   # On macOS/Linux:
   source ../.venv/bin/activate
   ```
3. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   The API will be running at `http://localhost:8000`.  
   Health check endpoint: `http://localhost:8000/api/health`

### Frontend Setup (React + Vite)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Start dev server:
   ```bash
   npm run dev
   ```
   The frontend will be running at `http://localhost:3000`.

## API Endpoints

- `GET /api/health` - Health check, DynamoDB simulation status & pricing engine status.
- `GET /api/restaurants` - List partner restaurants via `scan_items`.
- `GET /api/food-listings` - List surplus food offers with priority score & urgency level metrics.
- `GET /api/food-listings/{id}/priority-pricing` - **Main Enhancement**: Returns real-time urgency, priority score, and recommended price.
- `POST /api/food-listings/calculate-pricing` - **Main Enhancement**: Calculates recommended price for given original price & expiry time.
- `POST /api/food-listings` - Publish new surplus item via `put_item`.
- `PUT /api/food-listings/{id}` - Update item via `update_item`.
- `DELETE /api/food-listings/{id}` - Remove item via `delete_item`.
- `GET /api/reservations` - List customer reservations via `scan_items`.
- `POST /api/reservations` - Reserve meal via `put_item` + atomic `update_item` stock deduction.

# MAGADH TYRES Backend API Microservice

A production-ready, modular REST API microservice for **MAGADH TYRES B2B Tyre Distribution & Logistics Platform**. Built with TypeScript, Express, Google Gemini AI, and architected for seamless deployment on AWS Amplify, AWS Elastic Beanstalk, ECS, Render, or Railway.

---

## 📁 Architecture & Repository Independence

This `backend/` folder is designed to be **100% self-contained**. It can be moved into its own dedicated GitHub repository without requiring any structural changes or refactoring.

### Directory Structure

```
backend/
├── .env.example             # Environment variable template
├── .gitignore               # Git ignore rules for Node/TypeScript
├── package.json             # Standalone dependencies and scripts
├── tsconfig.json            # Standalone TypeScript compiler settings
├── README.md                # Microservice documentation
└── src/
    ├── app.ts               # Express application initialization & middleware
    ├── server.ts            # Standalone HTTP server bootstrap
    ├── config/
    │   ├── env.ts           # Environment variable validation
    │   ├── gemini.ts        # Google Gemini AI SDK lazy initialization
    │   └── awsAmplify.ts    # AWS Amplify / AppSync GraphQL bridge
    ├── controllers/
    │   ├── aiAdvisorController.ts # Gemini AI Tyre recommendation engine
    │   ├── analyticsController.ts # Dashboard KPIs, inventory alerts
    │   ├── authController.ts      # Authentication & verification handlers
    │   ├── couponController.ts    # B2B coupon validation & calculations
    │   ├── healthController.ts    # Health check & uptime telemetry
    │   ├── orderController.ts     # Order creation, search, status tracking
    │   ├── paymentController.ts   # Payment processing & receipt generation
    │   └── productController.ts   # Product catalog CRUD & inventory management
    ├── data/
    │   ├── seedCoupons.ts   # Seed coupon datasets
    │   ├── seedOrders.ts    # Seed orders dataset
    │   ├── seedPayments.ts  # Seed payment transactions
    │   └── seedProducts.ts  # Commercial radial & non-radial tyres catalogue
    ├── middlewares/
    │   ├── authMiddleware.ts      # RBAC, admin protection & role guards
    │   ├── errorHandler.ts        # Centralized HTTP error handling
    │   └── validateMiddleware.ts  # Request body validation schemas
    ├── routes/
    │   ├── aiRoutes.ts            # POST /api/ai/tyre-advisor
    │   ├── analyticsRoutes.ts     # GET  /api/analytics/dashboard
    │   ├── authRoutes.ts          # POST /api/auth/signin, etc.
    │   ├── couponRoutes.ts        # GET  /api/coupons, POST /api/coupons/validate
    │   ├── healthRoutes.ts        # GET  /api/health
    │   ├── index.ts               # Master API router aggregating all endpoints
    │   ├── orderRoutes.ts         # GET/POST /api/orders, /api/orders/track/:query
    │   ├── paymentRoutes.ts       # GET/POST /api/payments, /api/payments/process
    │   └── productRoutes.ts       # GET/POST /api/products, /api/admin/products
    ├── services/
    │   └── aiAdvisorService.ts    # Gemini prompt engineering & recommendations
    ├── store/
    │   └── memoryStore.ts         # Thread-safe in-memory store with AWS sync
    ├── types/
    │   └── index.ts               # Shared TypeScript domain models & DTOs
    └── utils/
        ├── formatters.ts          # Order numbers, tracking numbers, currency
        └── logger.ts              # Structured API request logger
```

---

## 🚀 Quick Start (Standalone Repository)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```
Fill in the `.env` values (e.g., `PORT=5000`, `GEMINI_API_KEY=your-api-key`).

### 3. Run in Development Mode
```bash
npm run dev
```

### 4. Build & Run for Production
```bash
npm run build
npm start
```

---

## 📡 API Endpoints Summary

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | System health check and uptime status |
| `GET` | `/api/products` | Query products with filters (`category`, `brand`, `rimSize`, `tireType`, `search`) |
| `GET` | `/api/products/:id` | Fetch specific tyre SKU details |
| `POST` | `/api/admin/products` | Create or update product catalog item (Admin only) |
| `DELETE` | `/api/admin/products/:id` | Delete product from catalog (Admin only) |
| `GET` | `/api/orders` | List all orders |
| `GET` | `/api/orders/track/:query` | Track order by order number, phone number, or tracking code |
| `POST` | `/api/orders` | Place a customer order with automatic stock deduction |
| `POST` | `/api/admin/orders/status` | Update dispatch / delivery status with timeline history |
| `GET` | `/api/payments` | List payment transaction logs |
| `POST` | `/api/payments/process` | Record customer payment and generate instant receipt |
| `POST` | `/api/ai/tyre-advisor` | Gemini AI powered tyre recommendations for Indian roads |
| `GET` | `/api/coupons` | List active promotional discount codes |
| `POST` | `/api/coupons/validate` | Check coupon eligibility and compute discount amount |
| `GET` | `/api/analytics/dashboard` | Executive KPIs, revenue stats, and low-stock alerts |

---

## ☁️ GitHub Repository Setup & Push Commands

This backend is linked to repository: **[himanshuverma5053-dot/Backend.Sourcecode](https://github.com/himanshuverma5053-dot/Backend.Sourcecode)**

### Linking & Pushing to `Backend.Sourcecode`:
```bash
# 1. Navigate to the backend directory
cd backend

# 2. Initialize git repository if not already initialized
git init

# 3. Add the remote repository
git remote add origin https://github.com/himanshuverma5053-dot/Backend.Sourcecode.git

# 4. Stage and commit all backend code
git add .
git commit -m "feat: initial commit for MAGADH TYRES backend microservice"

# 5. Set main branch and push
git branch -M main
git push -u origin main --force
```

### Subsequent Updates:
```bash
git add .
git commit -m "feat: update backend api endpoints and logic"
git push
```

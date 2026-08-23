# MAGADH TYRES Production AWS Backend

A complete, production-ready Serverless Backend Microservice for the **MAGADH TYRES B2B Dealer & Logistics Platform**. Built with AWS Amplify, AWS SAM, Amazon Cognito, API Gateway, AWS Lambda, DynamoDB, Amazon S3, and Google Gemini AI.

---

## 🏛️ Cloud Architecture Overview

```
                          [ B2B React Front End ]
                                    │
                                    ▼
                     [ Amazon CloudFront / S3 / Amplify ]
                                    │
               ┌────────────────────┴────────────────────┐
               ▼                                         ▼
   [ AWS Cognito User Pool ]                 [ Amazon API Gateway ]
   - Admin Group (Precedence 0)              - REST API & CORS enabled
   - Customer Group (Precedence 10)          - Cognito Authorizer
   - JWT Auth & Token Verification                       │
                                                         ▼
                                                [ AWS Lambda Proxy ]
                                                         │
               ┌────────────────────┬────────────────────┼────────────────────┐
               ▼                    ▼                    ▼                    ▼
     [ Amazon DynamoDB ]   [ Amazon DynamoDB ]   [ Amazon DynamoDB ]    [ Amazon S3 ]
     - Products Table      - Orders Table        - Payments Table       - Media Bucket
     - Categories/GSI      - Phone & Order GSI   - Presigned Uploads    - Invoice PDFs
```

---

## 🚀 AWS SAM Serverless Deployment

### 1. Prerequisites
- [AWS CLI v2](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html) configured (`aws configure`)
- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html) installed
- Node.js 20.x

### 2. SAM Build & Deploy Commands
```bash
# Navigate to the backend directory
cd backend

# Install dependencies and compile TypeScript
npm install
npm run build

# Build AWS SAM Serverless Artifacts
sam build

# Deploy Guided Stack to AWS
sam deploy --guided
```

### SAM Prompts:
- **Stack Name**: `magadh-tyres-backend-prod`
- **AWS Region**: `ap-south-1` (Mumbai)
- **Parameter Environment**: `prod`
- **Parameter GeminiApiKey**: `[Your Gemini API Key]`
- **Confirm changes before deploy**: `Y`
- **Allow SAM CLI IAM role creation**: `Y`

---

## 🌐 AWS Amplify Hosting & Deployment

The backend includes `amplify.yml` and `schema.graphql` for native AWS Amplify workflows:

1. Connect your source code repository or directory to the **AWS Amplify Console**.
2. Select your deployment branch.
3. Amplify will automatically detect `amplify.yml` and deploy both backend Lambda endpoints and front-end static builds.

---

## 🔐 AWS Cognito Roles & Authentication

| Role | Cognito Group | Access Privileges |
|---|---|---|
| **Admin** | `Admin` | Product catalogue CRUD, stock management, order status transitions, financial reporting |
| **Customer / Dealer** | `Customer` | Catalog browsing, AI Tyre recommendations, B2B order checkout, order tracking, payment processing |

---

## 📡 API Endpoints Reference

| Method | Route | Description | Auth Mode |
|---|---|---|---|
| `GET` | `/api/health` | Service uptime and AWS connection status | Public |
| `GET` | `/api/products` | Filterable tyre catalogue | Public / API Key |
| `POST` | `/api/admin/products` | Create / Update product SKU | Admin Role Required |
| `DELETE` | `/api/admin/products/:id` | Delete product SKU | Admin Role Required |
| `GET` | `/api/orders` | Order management logs | Admin / Customer |
| `POST` | `/api/orders` | Place B2B tyre order | Customer Role |
| `GET` | `/api/orders/track/:query` | Multi-criteria order tracker | Public |
| `POST` | `/api/admin/orders/status` | Update dispatch / delivery milestone | Admin Role |
| `POST` | `/api/ai/tyre-advisor` | Gemini AI personalized tyre advisor | Public |
| `GET` | `/api/analytics/dashboard` | Executive KPIs & low-stock alerts | Admin Role |

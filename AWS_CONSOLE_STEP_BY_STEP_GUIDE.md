# ☁️ AWS Management Console Integration & Deployment Guide

This guide walks you through setting up and deploying the **Frontend** and **Backend** independently using the **AWS Management Console**.

---

## 📁 Repository Structure Overview

```
├── /src                    <-- Frontend React + Vite SPA Source Code
├── /public                 <-- Frontend Static Assets & Logos
├── /package.json           <-- Frontend Dependencies & Build Script (`npm run build`)
├── /vite.config.ts         <-- Vite Bundler Configuration
│
├── /backend                <-- Standalone Backend Node.js / TypeScript Microservice
│   ├── /src                <-- Express API, Controllers, Services & DynamoDB Handlers
│   │   ├── /controllers    <-- Route Handlers (Products, Orders, Payments, AI, Analytics)
│   │   ├── /services       <-- DynamoDB Service, Gemini AI Service
│   │   ├── /serverless     <-- AWS Lambda Serverless Entry Point (`handler.ts`)
│   │   └── server.ts       <-- Standalone Microservice Entry Point (Port 5000)
│   ├── package.json        <-- Backend Dependencies (`@aws-sdk/*`, Express, etc.)
│   ├── tsconfig.json       <-- Backend TypeScript Configuration
│   ├── Dockerfile          <-- Container build for AWS App Runner / ECS / Elastic Beanstalk
│   ├── template.yaml       <-- AWS SAM / CloudFormation Infrastructure-as-Code
│   ├── amplify.yml         <-- AWS Amplify Multi-Tier CI/CD Build Specs
│   └── schema.graphql      <-- AWS AppSync / Amplify GraphQL Schema
│
└── /aws                    <-- AWS Architecture Configurations & Policies
    ├── iam-policy.json             <-- IAM Policy for Lambda/ECS Execution Role
    ├── dynamodb-tables-schema.json <-- DynamoDB Table & GSI Definitions
    ├── s3-cors-policy.json         <-- S3 CORS Policy for Image & File Uploads
    └── frontend-s3-cloudfront.yaml <-- CloudFormation Template for S3 + CloudFront Hosting
```

---

## 🛠️ Step 1: Database Setup (Amazon DynamoDB)

In the **AWS Console** > **DynamoDB** > **Tables** > **Create table**:

### 1. Products Table
- **Table Name**: `magadh_tyres_products`
- **Partition Key**: `id` (String)
- **Table class / Capacity**: On-Demand (Pay per request)
- **Global Secondary Indexes (GSI)**:
  - GSI 1: Partition Key `category` (String) -> Index Name: `CategoryIndex`
  - GSI 2: Partition Key `sku` (String) -> Index Name: `SkuIndex`

### 2. Orders Table
- **Table Name**: `magadh_tyres_orders`
- **Partition Key**: `id` (String)
- **Table class / Capacity**: On-Demand
- **Global Secondary Indexes (GSI)**:
  - GSI 1: Partition Key `customerPhone` (String) -> Index Name: `CustomerPhoneIndex`
  - GSI 2: Partition Key `orderNumber` (String) -> Index Name: `OrderNumberIndex`

### 3. Payments Table
- **Table Name**: `magadh_tyres_payments`
- **Partition Key**: `id` (String)
- **Table class / Capacity**: On-Demand
- **Global Secondary Indexes (GSI)**:
  - GSI 1: Partition Key `orderId` (String) -> Index Name: `OrderIdIndex`

### 4. Coupons Table
- **Table Name**: `magadh_tyres_coupons`
- **Partition Key**: `code` (String)
- **Table class / Capacity**: On-Demand

---

## 🪣 Step 2: Storage Setup (Amazon S3)

In the **AWS Console** > **S3** > **Create bucket**:

### 1. Asset Storage Bucket (`magadh-tyres-assets`)
- **Bucket name**: `magadh-tyres-assets-<YOUR_ACCOUNT_ID>`
- **Region**: Choose your target region (e.g., `ap-south-1` Mumbai)
- **Permissions > CORS (Cross-origin resource sharing)**:
  Paste the contents of `/aws/s3-cors-policy.json`:
  ```json
  [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "HEAD", "DELETE"],
      "AllowedOrigins": ["*"],
      "ExposeHeaders": ["ETag", "x-amz-server-side-encryption"],
      "MaxAgeSeconds": 3000
    }
  ]
  ```

---

## 🔐 Step 3: Authentication (Amazon Cognito)

In the **AWS Console** > **Cognito** > **User pools** > **Create user pool**:
1. **Sign-in options**: Email & Phone Number
2. **Password policy**: Standard (8+ characters)
3. **App Client**:
   - Create App client: `magadh-tyres-client`
   - Client secret: *Don't generate a client secret* (Public client for browser)
4. **User Groups** (in User pool > Groups):
   - Group 1: `Admin` (Precedence `0`)
   - Group 2: `Customer` (Precedence `10`)
5. Note down:
   - **User Pool ID** (e.g. `ap-south-1_xxxxxxxxx`)
   - **App Client ID** (e.g. `3a8b7c6d5e4f...`)

---

## ⚙️ Step 4: Backend Deployment (Choose Option A, B, or C)

### Option A: AWS App Runner (Easiest Container Method)
1. In the **AWS Console** > **App Runner** > **Create service**.
2. **Source**: Source code repository (GitHub) or ECR Container Image.
3. If source code: Select `/backend` folder.
   - **Runtime**: Node.js 20
   - **Build command**: `npm install && npm run build`
   - **Start command**: `node dist/server.js`
   - **Port**: `5000`
4. **Environment Variables**:
   ```env
   NODE_ENV=production
   PORT=5000
   AWS_REGION=ap-south-1
   GEMINI_API_KEY=<your_api_key>
   AWS_DYNAMODB_TABLE_PREFIX=magadh_tyres_
   ```
5. **IAM Instance Role**: Attach the policy from `/aws/iam-policy.json`.

### Option B: AWS Lambda + Amazon API Gateway (Serverless)
1. **Lambda Function**:
   - Runtime: `Node.js 20.x`
   - Architecture: `x86_64` or `arm64`
   - Execution Role: Attach policy from `/aws/iam-policy.json`
   - Handler: `dist/serverless/handler.handler`
2. **Upload Code**:
   - In `/backend`, run `npm run build`.
   - Zip the `dist/`, `node_modules/`, and `package.json` and upload to Lambda.
3. **API Gateway**:
   - Create **HTTP API** or **REST API**.
   - Create route: `ANY /api/{proxy+}` and `GET /api/health`.
   - Integration: Point to the Lambda function.
   - Enable **CORS** in API Gateway settings.

### Option C: AWS SAM CLI (1-Command Automated Deploy)
```bash
cd backend
npm install
npm run build
sam build
sam deploy --guided
```

---

## 🌐 Step 5: Frontend Deployment (Choose Option A or B)

### Option A: AWS Amplify Hosting (Recommended)
1. In the **AWS Console** > **AWS Amplify** > **Host an app**.
2. Connect your Git repository (GitHub / GitLab / CodeCommit).
3. Amplify will auto-detect the Vite React frontend using root configuration.
4. Add **Rewrites and redirects** in Amplify Console:
   - **Source address**: `</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json)$)([^.]+$)/>`
   - **Target address**: `/index.html`
   - **Type**: `200 (Rewrite)`

### Option B: Amazon S3 Static Hosting + Amazon CloudFront
1. Build the frontend locally:
   ```bash
   npm run build
   ```
   (This outputs the static files into `/dist`).
2. Deploy using CloudFormation template:
   - Go to **AWS Console** > **CloudFormation** > **Create Stack**.
   - Upload `/aws/frontend-s3-cloudfront.yaml`.
3. In **S3 Console**, upload the contents of `/dist` to the created S3 bucket.
4. Your frontend is live on the generated CloudFront HTTPS URL!

---

## 📋 Environment Variables Summary

### Frontend (`.env` or CloudFront/Amplify environment)
```env
VITE_API_BASE_URL=https://your-api-gateway-or-app-runner-url.com
VITE_AWS_REGION=ap-south-1
VITE_COGNITO_USER_POOL_ID=ap-south-1_xxxxxxxxx
VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_S3_ASSETS_BUCKET=magadh-tyres-assets
```

### Backend (`backend/.env` or Lambda/App Runner environment)
```env
PORT=5000
NODE_ENV=production
AWS_REGION=ap-south-1
GEMINI_API_KEY=your_gemini_api_key
AWS_DYNAMODB_TABLE_PREFIX=magadh_tyres_
AWS_USER_POOL_ID=ap-south-1_xxxxxxxxx
AWS_USER_POOL_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
```

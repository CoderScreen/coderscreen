# 🚀 CoderScreen Quick Start Guide

> ⚠️ **UNDER CONSTRUCTION** ⚠️
> 
> This quick start guide is currently being built and constantly updated. Please join our [Discord](https://discord.gg/THxVTKtcZy) for live support and updates.

## Prerequisites

- Node.js 24.0.0 and pnpm
- Docker
- Cloudflare account
- PostgreSQL database

## 1. Clone & Setup

```bash
git clone https://github.com/CoderScreen/coderscreen.git
cd coderscreen
pnpm install
```

## 2. Database Setup

Create a `.env` file in the `packages/db` directory with the following variables:

```bash
DATABASE_URL=your-database-url
```

Run the following commands to generate and push the migrations:

```bash
# this will be updated to use actual migrations in the future
pnpm db:push
```

Now, we have scripts to seed our database with the following data:
- plans

### Step 1: Create Stripe Plans

Before running the plans script, you need to create a free plan in your Stripe dashboard:

1. Go to your [Stripe Dashboard](https://dashboard.stripe.com/products)
2. Create a **Free Plan** product with $0/month pricing
3. Copy the price ID (it starts with `price_`) for your free plan

### Step 2: Update the Plans Configuration

Edit `packages/scripts/src/create-plans.ts` and update the `PLANS_TO_CREATE` array with your Stripe price ID:

```typescript
const PLANS_TO_CREATE = [
  {
    id: 'free',
    name: 'Free',
    description: 'Free plan',
    price: 0,
    interval: 'monthly',
    stripePriceId: 'your_free_plan_price_id_here', // Replace with your Stripe price ID
    group: 'free',
    isActive: true,
    limits: {
      live_interview: 10000, // set your own limits
      team_members: 10000, // set your own limits
    },
  },
];
```

### Step 3: Run the Plans Script

```bash
cd packages/scripts
bun run src/create-plans.ts
```

This will seed the database with your plans.

## 3. API Setup & Running

### Step 1: API Environment Configuration

Create a `.dev.vars` file in the `apps/api` directory with the following variables:

```bash
NODE_ENV= "development"
FE_APP_URL = "http://localhost:3000"
FREE_PLAN_ID = "free"

# we use infiscal to sync our secrets across environments
INFISCAL_DATABASE_URL = ""

# stripe secrets
INFISCAL_STRIPE_PUBLISHABLE_KEY = ""
INFISCAL_STRIPE_SECRET_KEY =  ""
INFISCAL_STRIPE_WEBHOOK_SECRET = ""

# third party services
INFISCAL_LOOPS_API_KEY = "" # you can leave as empty string if NODE_ENV = development
INFISCAL_OPENROUTER_API_KEY = ""

# better auth secrets
INFISCAL_BETTER_AUTH_URL = "http://localhost:8000/auth"
INFISCAL_BETTER_AUTH_SECRET = "" # should be a secure, random `better-auth` secret

# ouath secrets
INFISCAL_GOOGLE_CLIENT_ID = ""
INFISCAL_GOOGLE_CLIENT_SECRET = ""
INFISCAL_GITHUB_CLIENT_ID = ""
INFISCAL_GITHUB_CLIENT_SECRET = ""
```

### Step 2: Build Sandbox Container

Enter the `apps/api` directory and run the following commands:

```bash
# Build container
pnpm sandbox:build
pnpm sandbox:push
```

Use the given URL from from the `sandbox:push` command to set the `image` url in the `wrangler.jsonc` file.

### Step 3: Start the API

```bash
pnpm dev
```

The API should now be running on `http://localhost:8000`. Visit the endpoint to verify it's working.

## 4. Web App Setup & Running

### Step 1: Web Environment Configuration

Set up the `web` package environment variables in a `.env` file.

#### Development
```bash
VITE_APP_URL="http://localhost:3000"
VITE_API_URL="http://localhost:8000"
```

### Step 2: Start the Web App

```bash
pnpm dev
```

The web app should now be running on `http://localhost:3000`
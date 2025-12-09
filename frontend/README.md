# LeadScout Frontend

Next.js 15 application for LeadScout - Find Your Next Customer Where They're Hiring.

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Environment Setup

Create an `env` file in this directory (frontend/) with the following variables:

```bash
# Copy from .env.example
cp .env.example env

# Then fill in your actual values
```

Required environment variables:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk authentication (public)
- `CLERK_SECRET_KEY` - Clerk authentication (secret)
- `STRIPE_CLERK_SECRET_KEY` - Stripe integration for payments
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase database URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `NEXT_PUBLIC_APIFY_API_KEY` - Apify scraping API key

### 3. Development

```bash
pnpm dev
```

This will:
1. Copy `env` to `.env.local` (if env file exists)
2. Start Next.js development server with Turbopack

Visit [http://localhost:3000](http://localhost:3000)

### 4. Build for Production

```bash
pnpm build
```

### 5. Start Production Server

```bash
pnpm start
```

## Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth-related pages
│   ├── (landing)/         # Landing pages
│   └── dashboard/         # Protected dashboard pages
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── *.tsx             # Custom components
├── lib/                   # Utilities and API clients
│   ├── api/              # API client functions
│   └── env/              # Environment variable helpers
└── middleware.ts          # Authentication middleware (Node.js runtime)
```

## Deployment (Vercel)

### Important Configuration

When deploying to Vercel, ensure:

1. **Root Directory**: Set to `frontend` in Project Settings
2. **Environment Variables**: Add all variables from `env` file in Vercel dashboard
3. **Build Command**: Uses default `next build` (no env file copying)

### Why Node.js Runtime?

The middleware uses Node.js runtime instead of Edge runtime because:
- Clerk authentication requires Node.js crypto APIs
- Edge runtime doesn't support all Node.js standard library features
- Node.js runtime provides full compatibility with auth libraries

See `middleware.ts` for the runtime configuration.

## Development Notes

### Monorepo Structure

This frontend is part of a monorepo:
- `/frontend` - Next.js application (this directory)
- `/backend` - Encore.ts backend API

### API Client Generation

The Encore.ts backend client is generated using:

```bash
# Generate from staging environment
pnpm gen

# Generate from local environment
pnpm gen:local
```

This creates `lib/api/encore-client.ts` with type-safe API clients.

## Troubleshooting

### Build fails on Vercel

**Problem**: `NOT_FOUND` error or Edge Runtime errors

**Solutions**:
1. Verify Root Directory is set to `frontend` in Vercel settings
2. Check all environment variables are configured in Vercel
3. Ensure `middleware.ts` has `export const runtime = 'nodejs'`

### Environment variables not working locally

**Problem**: App can't connect to Clerk/Supabase

**Solutions**:
1. Ensure `env` file exists in the `frontend/` directory
2. Run `cp env .env.local` manually
3. Restart dev server after changing environment variables

### Middleware errors

**Problem**: Authentication not working or crashes

**Solutions**:
1. Check Clerk credentials in environment variables
2. Verify Clerk domain is configured for your deployment URL
3. Check middleware runtime is set to `nodejs` not `edge`

## Tech Stack

- **Framework**: Next.js 15.2 (App Router)
- **Auth**: Clerk
- **Database**: Supabase
- **Payments**: Stripe
- **UI**: Tailwind CSS + shadcn/ui
- **State**: TanStack Query
- **Maps**: MapLibre GL
- **Charts**: Recharts
- **Scraping**: Apify

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Encore.ts Documentation](https://encore.dev/docs)


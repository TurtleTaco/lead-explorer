# Supabase Setup Guide

This document explains how to set up Supabase integration for the Job Explorer feature.

## Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Supabase Database Connection
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Getting Your Supabase Credentials

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy the following:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Database Schema

The Job Explorer uses the following tables (created by the migration script):

- **users** - User accounts (email-based)
- **organizations** - Organizations with unique org_id
- **user_organizations** - Many-to-many user-org relationships
- **searches** - Search queries within organizations
- **jobs** - Job listings linked to searches

## Data Flow

```
User (email)
  └─ Organization (org_id from Clerk)
      └─ Search (search term)
          └─ Jobs (job listings)
```

## Running the Migration

1. Navigate to the `initial_data` directory
2. Update `dataset_configs.json` with your data:
   ```json
   {
     "user_name": "your-email@example.com",
     "org_id": "org_xxx_from_clerk",
     "search_term": "your search term",
     "data_file_name": "./your-data-file.json"
   }
   ```
3. Run the migration script:
   ```bash
   python3 supabase_initial_data_migration.py
   ```

## Frontend Features

### Job Explorer Page

Access the Job Explorer at: `/dashboard/org/[orgId]/jobs`

Features:
- View all searches within an organization
- Browse jobs organized by search term
- See job details including:
  - Job title, company, location
  - Employment type, seniority level
  - Salary information
  - Application links
  - Company information
- Expandable accordion view for each search term
- Scrollable job list with 100 jobs per search

### Navigation

A "Job Explorer" menu item has been added to the sidebar with a database icon.

## Installing Dependencies

Make sure to install the Supabase client:

```bash
cd frontend
pnpm install @supabase/supabase-js
```

Or run `pnpm install` to install all dependencies from the updated `package.json`.

## Troubleshooting

### "Missing Supabase environment variables" Error

Make sure you've added the `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to your `.env.local` file.

### "No Data Found" Message

This means the organization hasn't been migrated yet. Run the migration script with the correct `org_id` that matches your Clerk organization ID.

### Getting the Clerk Organization ID

You can find the Clerk organization ID in the URL when you're viewing an organization:
`http://localhost:3000/dashboard/org/org_xxxxxxxxxxxxx`

The part after `/org/` is the organization ID you need to use in `dataset_configs.json`.


# Supabase Data Migration

This directory contains a migration script to import LinkedIn job scraper data into Supabase with proper user segregation.

## Prerequisites

1. **Python 3.7+** installed
2. **psycopg2** library installed:
   ```bash
   pip install psycopg2-binary
   ```

## Setup

### 1. Configure Database Credentials

Edit the `supabase_credential` file and replace `[YOUR-PASSWORD]` with your actual Supabase database password:

```
# Connect to Supabase via connection pooling
DATABASE_URL="postgresql://postgres.nvwxlwgqccmgtcddvfok:YOUR_ACTUAL_PASSWORD@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct connection to the database. Used for migrations
DIRECT_URL="postgresql://postgres.nvwxlwgqccmgtcddvfok:YOUR_ACTUAL_PASSWORD@aws-1-us-east-2.pooler.supabase.com:5432/postgres"
```

### 2. Prepare Your Data Files

Place your JSON data files in this directory. The script expects filenames in the format:

```
{email}-{dataset}_{source}_{timestamp}.json
```

Example: `zac.amazonprime@gmail.com-gong-dataset_linkedin-jobs-scraper_2025-12-06_22-26-12-556.json`

## Running the Migration

Execute the migration script:

```bash
python supabase_initial_data_migration.py
```

The script will:
1. ✓ Parse filenames to extract user email addresses
2. ✓ Create necessary database tables (if they don't exist)
3. ✓ Create or find user records based on email
4. ✓ Import all job listings with proper user segregation
5. ✓ Track dataset imports for auditing

## Database Schema

### Tables Created

#### `users`
- Stores user information based on email addresses
- Primary key: `id`
- Unique constraint on `email`

#### `datasets`
- Tracks each imported dataset/file
- Links to `users` table
- Stores metadata about the import (filename, timestamp, record count)

#### `jobs`
- Main table storing job listings
- Each job is linked to a user via `user_id`
- Each job is linked to a dataset via `dataset_id`
- Comprehensive job information including:
  - Job details (title, description, location, salary)
  - Company information (name, website, logo, description)
  - Job metadata (seniority level, employment type, benefits)
  - Application details (apply URL, posted date, applicants count)

### Key Features

- **User Segregation**: All jobs are associated with a specific user (email)
- **Unique Constraint**: Prevents duplicate jobs per user (`user_id` + `job_id`)
- **Full-Text Search**: Indexes on title and company name for fast searching
- **JSONB Fields**: Benefits, salary info, and company address stored as JSONB for flexible querying
- **Audit Trail**: Tracks when datasets are imported and how many records

## Data Structure

The script expects JSON files containing an array of job objects with the following structure:

```json
[
  {
    "id": "4312335767",
    "title": "Sales Operations Analyst",
    "companyName": "Zillow",
    "location": "United States",
    "salary": "$90,900.00 - $145,100.00",
    "postedAt": "2025-11-20",
    "descriptionHtml": "...",
    "descriptionText": "...",
    "companyWebsite": "http://www.zillow.com",
    "benefits": ["Actively Hiring"],
    "salaryInfo": ["$90,900.00", "$145,100.00"],
    "companyAddress": {
      "type": "PostalAddress",
      "addressLocality": "Seattle",
      "addressRegion": "Washington",
      "addressCountry": "US"
    },
    ...
  }
]
```

## Security Notes

⚠️ **Important**: Never commit the `supabase_credential` file with actual passwords to version control!

Add it to your `.gitignore`:

```
initial_data/supabase_credential
```

## Querying the Data

After migration, you can query jobs for a specific user:

```sql
-- Get all jobs for a user
SELECT j.* 
FROM jobs j
JOIN users u ON j.user_id = u.id
WHERE u.email = 'zac.amazonprime@gmail.com';

-- Get job count by company
SELECT company_name, COUNT(*) as job_count
FROM jobs j
JOIN users u ON j.user_id = u.id
WHERE u.email = 'zac.amazonprime@gmail.com'
GROUP BY company_name
ORDER BY job_count DESC;

-- Search jobs by title
SELECT title, company_name, location, posted_at
FROM jobs j
JOIN users u ON j.user_id = u.id
WHERE u.email = 'zac.amazonprime@gmail.com'
  AND to_tsvector('english', title) @@ to_tsquery('english', 'sales & operations');
```

## Troubleshooting

### Connection Issues
- Verify your password is correct in `supabase_credential`
- Ensure your IP is whitelisted in Supabase (if applicable)
- Check that you're using the `DIRECT_URL` (port 5432) for migrations

### Import Errors
- Check that your JSON files are valid JSON arrays
- Ensure filenames follow the expected format
- Verify all required fields are present in the JSON data

### Re-running Migration
The script is designed to be idempotent:
- Tables are created only if they don't exist
- Users are created only if they don't exist
- Jobs with duplicate `(user_id, job_id)` will be updated instead of inserted

## Support

For issues or questions, please refer to:
- Supabase documentation: https://supabase.com/docs
- psycopg2 documentation: https://www.psycopg.org/docs/


#!/usr/bin/env python3
"""
Supabase Data Migration Script
Migrates LinkedIn job scraper data to Supabase following the user → org → search → jobs flow
"""

import json
import os
import re
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional
import psycopg2
from psycopg2.extras import execute_values

# Database connection configuration
def get_db_config():
    """Read database credentials from supabase_credential file"""
    credential_path = Path(__file__).parent / "supabase_credential"
    
    with open(credential_path, 'r') as f:
        content = f.read()
    
    # Extract the DIRECT_URL (used for migrations)
    direct_url_match = re.search(r'DIRECT_URL="([^"]+)"', content)
    if not direct_url_match:
        raise ValueError("Could not find DIRECT_URL in supabase_credential file")
    
    db_url = direct_url_match.group(1)
    
    # Parse the connection string
    # Format: postgresql://user:password@host:port/database
    pattern = r'postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/([^\?]+)'
    match = re.match(pattern, db_url)
    
    if not match:
        raise ValueError(f"Could not parse database URL: {db_url}")
    
    return {
        'user': match.group(1),
        'password': match.group(2),
        'host': match.group(3),
        'port': match.group(4),
        'database': match.group(5)
    }


def load_dataset_config(config_path: Path) -> Dict:
    """
    Load configuration from dataset_configs.json
    Expected format:
    {
      "user_name": "email@example.com",
      "org_id": "org_xxx",
      "search_term": "search query",
      "data_file_name": "./filename.json"
    }
    """
    with open(config_path, 'r', encoding='utf-8') as f:
        config = json.load(f)
    
    required_fields = ['user_name', 'org_id', 'search_term', 'data_file_name']
    for field in required_fields:
        if field not in config:
            raise ValueError(f"Missing required field '{field}' in dataset_configs.json")
    
    return config


def create_tables(cursor):
    """Create necessary tables following the user → org → search → jobs flow"""
    
    # Create users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    """)
    
    # Create organizations table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS organizations (
            id SERIAL PRIMARY KEY,
            org_id VARCHAR(255) UNIQUE NOT NULL,
            name VARCHAR(255),
            created_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_organizations_org_id ON organizations(org_id);
    """)
    
    # Create user_organizations junction table (many-to-many relationship)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_organizations (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            org_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
            role VARCHAR(50) DEFAULT 'member',
            joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT unique_user_org UNIQUE(user_id, org_id)
        );
        
        CREATE INDEX IF NOT EXISTS idx_user_organizations_user_id ON user_organizations(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_organizations_org_id ON user_organizations(org_id);
    """)
    
    # Create searches table to track search queries
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS searches (
            id SERIAL PRIMARY KEY,
            org_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
            search_term VARCHAR(512) NOT NULL,
            source VARCHAR(255) DEFAULT 'linkedin-jobs-scraper',
            data_file_name VARCHAR(512),
            job_count INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            metadata JSONB DEFAULT '{}'::jsonb
        );
        
        CREATE INDEX IF NOT EXISTS idx_searches_org_id ON searches(org_id);
        CREATE INDEX IF NOT EXISTS idx_searches_search_term ON searches(search_term);
    """)
    
    # Create jobs table (main table for job listings)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS jobs (
            id SERIAL PRIMARY KEY,
            search_id INTEGER NOT NULL REFERENCES searches(id) ON DELETE CASCADE,
            
            -- Job identifiers
            job_id VARCHAR(255) NOT NULL,
            tracking_id VARCHAR(255),
            ref_id VARCHAR(255),
            
            -- Job details
            title TEXT NOT NULL,
            link TEXT,
            apply_url TEXT,
            description_html TEXT,
            description_text TEXT,
            
            -- Company information
            company_name VARCHAR(512),
            company_linkedin_url TEXT,
            company_logo TEXT,
            company_website TEXT,
            company_slogan TEXT,
            company_description TEXT,
            company_employees_count INTEGER,
            
            -- Job metadata
            location VARCHAR(512),
            salary VARCHAR(255),
            salary_info JSONB DEFAULT '[]'::jsonb,
            posted_at DATE,
            applicants_count VARCHAR(50),
            benefits JSONB DEFAULT '[]'::jsonb,
            
            -- Job classification
            seniority_level VARCHAR(255),
            employment_type VARCHAR(255),
            job_function VARCHAR(512),
            industries VARCHAR(512),
            
            -- Company address (stored as JSONB)
            company_address JSONB,
            
            -- Source information
            input_url TEXT,
            
            -- Timestamps
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            
            -- Constraints
            CONSTRAINT unique_job_per_search UNIQUE(search_id, job_id)
        );
        
        -- Indexes for performance
        CREATE INDEX IF NOT EXISTS idx_jobs_search_id ON jobs(search_id);
        CREATE INDEX IF NOT EXISTS idx_jobs_company_name ON jobs(company_name);
        CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);
        CREATE INDEX IF NOT EXISTS idx_jobs_posted_at ON jobs(posted_at);
        CREATE INDEX IF NOT EXISTS idx_jobs_title ON jobs USING gin(to_tsvector('english', title));
        CREATE INDEX IF NOT EXISTS idx_jobs_company_name_search ON jobs USING gin(to_tsvector('english', company_name));
    """)
    
    print("✓ Tables created successfully")


def get_or_create_user(cursor, email: str) -> int:
    """Get or create user by email and return user_id"""
    cursor.execute(
        "SELECT id FROM users WHERE email = %s",
        (email,)
    )
    result = cursor.fetchone()
    
    if result:
        user_id = result[0]
        print(f"✓ Found existing user: {email} (ID: {user_id})")
    else:
        cursor.execute(
            "INSERT INTO users (email) VALUES (%s) RETURNING id",
            (email,)
        )
        user_id = cursor.fetchone()[0]
        print(f"✓ Created new user: {email} (ID: {user_id})")
    
    return user_id


def get_or_create_organization(cursor, org_id: str, created_by_user_id: int) -> int:
    """Get or create organization by org_id and return internal id"""
    cursor.execute(
        "SELECT id FROM organizations WHERE org_id = %s",
        (org_id,)
    )
    result = cursor.fetchone()
    
    if result:
        internal_org_id = result[0]
        print(f"✓ Found existing organization: {org_id} (ID: {internal_org_id})")
    else:
        cursor.execute(
            "INSERT INTO organizations (org_id, created_by_user_id) VALUES (%s, %s) RETURNING id",
            (org_id, created_by_user_id)
        )
        internal_org_id = cursor.fetchone()[0]
        print(f"✓ Created new organization: {org_id} (ID: {internal_org_id})")
    
    return internal_org_id


def link_user_to_organization(cursor, user_id: int, internal_org_id: int):
    """Link a user to an organization (if not already linked)"""
    cursor.execute(
        """
        INSERT INTO user_organizations (user_id, org_id, role)
        VALUES (%s, %s, 'owner')
        ON CONFLICT (user_id, org_id) DO NOTHING
        """,
        (user_id, internal_org_id)
    )
    print(f"✓ Linked user to organization")


def create_search_record(cursor, internal_org_id: int, search_term: str, data_file_name: str) -> int:
    """Create a search record and return search_id"""
    cursor.execute(
        """
        INSERT INTO searches (org_id, search_term, data_file_name)
        VALUES (%s, %s, %s)
        RETURNING id
        """,
        (internal_org_id, search_term, data_file_name)
    )
    search_id = cursor.fetchone()[0]
    print(f"✓ Created search record (ID: {search_id}) for term: '{search_term}'")
    return search_id


def migrate_jobs(cursor, search_id: int, jobs_data: List[Dict]):
    """Migrate job listings to the database"""
    
    if not jobs_data:
        print("⚠ No jobs to migrate")
        return
    
    # Prepare data for batch insert
    values = []
    for job in jobs_data:
        # Parse posted_at date
        posted_at = None
        if job.get('postedAt'):
            try:
                posted_at = datetime.strptime(job['postedAt'], '%Y-%m-%d').date()
            except (ValueError, TypeError):
                posted_at = None
        
        # Convert salary_info and benefits to JSON
        salary_info = json.dumps(job.get('salaryInfo', []))
        benefits = json.dumps(job.get('benefits', []))
        company_address = json.dumps(job.get('companyAddress')) if job.get('companyAddress') else None
        
        # Convert applicants_count to string or None
        applicants_count = str(job.get('applicantsCount')) if job.get('applicantsCount') else None
        
        values.append((
            search_id,
            job.get('id'),
            job.get('trackingId'),
            job.get('refId'),
            job.get('title'),
            job.get('link'),
            job.get('applyUrl'),
            job.get('descriptionHtml'),
            job.get('descriptionText'),
            job.get('companyName'),
            job.get('companyLinkedinUrl'),
            job.get('companyLogo'),
            job.get('companyWebsite'),
            job.get('companySlogan'),
            job.get('companyDescription'),
            job.get('companyEmployeesCount'),
            job.get('location'),
            job.get('salary'),
            salary_info,
            posted_at,
            applicants_count,
            benefits,
            job.get('seniorityLevel'),
            job.get('employmentType'),
            job.get('jobFunction'),
            job.get('industries'),
            company_address,
            job.get('inputUrl')
        ))
    
    # Batch insert
    execute_values(
        cursor,
        """
        INSERT INTO jobs (
            search_id, job_id, tracking_id, ref_id,
            title, link, apply_url, description_html, description_text,
            company_name, company_linkedin_url, company_logo, company_website,
            company_slogan, company_description, company_employees_count,
            location, salary, salary_info, posted_at, applicants_count, benefits,
            seniority_level, employment_type, job_function, industries,
            company_address, input_url
        ) VALUES %s
        ON CONFLICT (search_id, job_id) DO UPDATE SET
            updated_at = CURRENT_TIMESTAMP,
            title = EXCLUDED.title,
            company_name = EXCLUDED.company_name,
            location = EXCLUDED.location,
            posted_at = EXCLUDED.posted_at
        """,
        values
    )
    
    # Update job count in search record
    cursor.execute(
        "UPDATE searches SET job_count = %s WHERE id = %s",
        (len(jobs_data), search_id)
    )
    
    print(f"✓ Migrated {len(jobs_data):,} job listings")


def main():
    """Main migration function"""
    print("=" * 60)
    print("Supabase Data Migration Script")
    print("User → Organization → Search → Jobs Flow")
    print("=" * 60)
    print()
    
    # Load configuration
    script_dir = Path(__file__).parent
    config_path = script_dir / "dataset_configs.json"
    
    if not config_path.exists():
        print(f"✗ Configuration file not found: {config_path}")
        return
    
    try:
        config = load_dataset_config(config_path)
        print("✓ Configuration loaded from dataset_configs.json")
        print(f"  User: {config['user_name']}")
        print(f"  Organization: {config['org_id']}")
        print(f"  Search term: {config['search_term']}")
        print(f"  Data file: {config['data_file_name']}")
        print()
    except Exception as e:
        print(f"✗ Error loading configuration: {e}")
        return
    
    # Resolve data file path
    data_file = script_dir / config['data_file_name'].replace('./', '')
    if not data_file.exists():
        print(f"✗ Data file not found: {data_file}")
        return
    
    # Get database configuration
    try:
        db_config = get_db_config()
        print("✓ Database configuration loaded")
    except Exception as e:
        print(f"✗ Error loading database configuration: {e}")
        return
    
    # Connect to database
    try:
        conn = psycopg2.connect(**db_config)
        conn.autocommit = False
        cursor = conn.cursor()
        print("✓ Connected to database")
        print()
    except Exception as e:
        print(f"✗ Error connecting to database: {e}")
        return
    
    try:
        # Create tables
        print("Creating tables...")
        create_tables(cursor)
        conn.commit()
        print()
        
        print("Processing data migration...")
        print("-" * 60)
        
        # Step 1: Get or create user
        user_id = get_or_create_user(cursor, config['user_name'])
        
        # Step 2: Get or create organization
        internal_org_id = get_or_create_organization(cursor, config['org_id'], user_id)
        
        # Step 3: Link user to organization
        link_user_to_organization(cursor, user_id, internal_org_id)
        
        # Step 4: Create search record
        search_id = create_search_record(
            cursor, 
            internal_org_id, 
            config['search_term'],
            config['data_file_name']
        )
        
        # Step 5: Load job data
        print(f"Loading job data from {data_file.name}...")
        with open(data_file, 'r', encoding='utf-8') as f:
            jobs_data = json.load(f)
        
        print(f"✓ Loaded {len(jobs_data):,} job records")
        
        # Step 6: Migrate jobs
        print("Migrating jobs to database...")
        migrate_jobs(cursor, search_id, jobs_data)
        
        # Commit transaction
        conn.commit()
        print()
        print("✓ Successfully migrated all data")
        print()
        
        print("=" * 60)
        print("Migration completed!")
        print("=" * 60)
        
        # Print summary
        cursor.execute("SELECT COUNT(*) FROM users")
        user_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM organizations")
        org_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM searches")
        search_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM jobs")
        job_count = cursor.fetchone()[0]
        
        print()
        print("Summary:")
        print(f"  Users: {user_count}")
        print(f"  Organizations: {org_count}")
        print(f"  Searches: {search_count}")
        print(f"  Jobs: {job_count:,}")
        print()
        print("Data structure:")
        print(f"  User '{config['user_name']}'")
        print(f"    └─ Organization '{config['org_id']}'")
        print(f"        └─ Search '{config['search_term']}'")
        print(f"            └─ {job_count:,} Jobs")
        
    except Exception as e:
        print(f"✗ Error during migration: {e}")
        conn.rollback()
        raise
    
    finally:
        cursor.close()
        conn.close()
        print()
        print("✓ Database connection closed")


if __name__ == "__main__":
    main()


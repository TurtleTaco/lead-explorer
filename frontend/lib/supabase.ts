import { createClient } from "@supabase/supabase-js";

// Supabase client for server-side operations
export function getSupabaseClient() {
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

	if (!supabaseUrl || !supabaseKey) {
		throw new Error(
			"Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
		);
	}

	return createClient(supabaseUrl, supabaseKey);
}

// Type definitions based on the migration schema
export interface User {
	id: number;
	email: string;
	created_at: string;
	updated_at: string;
}

export interface Organization {
	id: number;
	org_id: string;
	name: string | null;
	created_by_user_id: number | null;
	created_at: string;
	updated_at: string;
}

export interface Search {
	id: number;
	org_id: number;
	search_term: string;
	source: string;
	data_file_name: string | null;
	job_count: number;
	created_at: string;
	updated_at: string;
	metadata: any;
}

export interface Job {
	id: number;
	search_id: number;
	job_id: string;
	tracking_id: string | null;
	ref_id: string | null;
	title: string;
	link: string | null;
	apply_url: string | null;
	description_html: string | null;
	description_text: string | null;
	company_name: string | null;
	company_linkedin_url: string | null;
	company_logo: string | null;
	company_website: string | null;
	company_slogan: string | null;
	company_description: string | null;
	company_employees_count: number | null;
	location: string | null;
	salary: string | null;
	salary_info: any;
	posted_at: string | null;
	applicants_count: string | null;
	benefits: any;
	seniority_level: string | null;
	employment_type: string | null;
	job_function: string | null;
	industries: string | null;
	company_address: any;
	input_url: string | null;
	created_at: string;
	updated_at: string;
}

export interface CompanyContact {
	id: number;
	first_name: string | null;
	last_name: string | null;
	full_name: string | null;
	email: string | null;
	mobile_number: string | null;
	personal_email: string | null;
	job_title: string | null;
	headline: string | null;
	seniority_level: string | null;
	functional_level: string | null;
	industry: string | null;
	linkedin: string | null;
	city: string | null;
	state: string | null;
	country: string | null;
	company_name: string | null;
	company_website: string;
	company_linkedin: string | null;
	company_linkedin_uid: string | null;
	company_domain: string | null;
	company_description: string | null;
	company_slogan: string | null;
	company_size: number | null;
	company_phone: string | null;
	company_annual_revenue: string | null;
	company_annual_revenue_clean: number | null;
	company_total_funding: string | null;
	company_total_funding_clean: number | null;
	company_founded_year: number | null;
	company_street_address: string | null;
	company_full_address: string | null;
	company_city: string | null;
	company_state: string | null;
	company_country: string | null;
	company_postal_code: string | null;
	keywords: string | null;
	company_technologies: string | null;
	created_at: string;
	updated_at: string;
}


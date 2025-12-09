import { getSupabaseClient, Organization, Search, Job, User } from "../supabase";

export interface OrganizationData {
	organization: Organization;
	searches: SearchWithJobs[];
	users: User[];
}

export interface SearchWithJobs {
	search: Search;
	jobs: Job[];
}

/**
 * Fetch organization data including searches and jobs
 */
export async function getOrganizationData(
	clerkOrgId: string
): Promise<OrganizationData | null> {
	const supabase = getSupabaseClient();

	// 1. Get organization by clerk org_id
	const { data: org, error: orgError } = await supabase
		.from("organizations")
		.select("*")
		.eq("org_id", clerkOrgId)
		.single();

	if (orgError || !org) {
		console.error("Organization not found:", orgError);
		return null;
	}

	// 2. Get all users in this organization
	const { data: userOrgs, error: userOrgsError } = await supabase
		.from("user_organizations")
		.select("user_id")
		.eq("org_id", org.id);

	if (userOrgsError) {
		console.error("Error fetching user organizations:", userOrgsError);
		return null;
	}

	const userIds = userOrgs?.map((uo) => uo.user_id) || [];

	// Get user details
	const { data: users, error: usersError } = await supabase
		.from("users")
		.select("*")
		.in("id", userIds);

	if (usersError) {
		console.error("Error fetching users:", usersError);
	}

	// 3. Get all searches for this organization
	const { data: searches, error: searchesError } = await supabase
		.from("searches")
		.select("*")
		.eq("org_id", org.id)
		.order("created_at", { ascending: false });

	if (searchesError) {
		console.error("Error fetching searches:", searchesError);
		return { organization: org, searches: [], users: users || [] };
	}

	// 4. For each search, get the first page of jobs (pagination handled client-side)
	const searchesWithJobs: SearchWithJobs[] = await Promise.all(
		(searches || []).map(async (search) => {
			const { data: jobs, error: jobsError } = await supabase
				.from("jobs")
				.select("*")
				.eq("search_id", search.id)
				.order("posted_at", { ascending: false })
				.limit(10); // Fetch first 10 jobs, pagination will load more

			if (jobsError) {
				console.error(`Error fetching jobs for search ${search.id}:`, jobsError);
				return { search, jobs: [] };
			}

			return { search, jobs: jobs || [] };
		})
	);

	return {
		organization: org,
		searches: searchesWithJobs,
		users: users || [],
	};
}

/**
 * Get all jobs for a specific search with optional company filter
 */
export async function getJobsForSearch(
	searchId: number,
	limit = 100,
	offset = 0,
	companyNames?: string[]
): Promise<Job[]> {
	const supabase = getSupabaseClient();

	let query = supabase
		.from("jobs")
		.select("*")
		.eq("search_id", searchId);

	// Apply company name filter if provided
	if (companyNames && companyNames.length > 0) {
		query = query.in("company_name", companyNames);
	}

	const { data: jobs, error } = await query
		.order("posted_at", { ascending: false })
		.range(offset, offset + limit - 1);

	if (error) {
		console.error("Error fetching jobs:", error);
		return [];
	}

	return jobs || [];
}

/**
 * Get count of jobs for a search with optional company filter
 */
export async function getJobCountForSearch(
	searchId: number,
	companyNames?: string[]
): Promise<number> {
	const supabase = getSupabaseClient();

	let query = supabase
		.from("jobs")
		.select("*", { count: "exact", head: true })
		.eq("search_id", searchId);

	// Apply company name filter if provided
	if (companyNames && companyNames.length > 0) {
		query = query.in("company_name", companyNames);
	}

	const { count, error } = await query;

	if (error) {
		console.error("Error counting jobs:", error);
		return 0;
	}

	return count || 0;
}

/**
 * Get distinct company names for a search
 */
export async function getCompanyNamesForSearch(searchId: number): Promise<string[]> {
	const supabase = getSupabaseClient();

	const { data: jobs, error } = await supabase
		.from("jobs")
		.select("company_name")
		.eq("search_id", searchId)
		.not("company_name", "is", null);

	if (error) {
		console.error("Error fetching company names:", error);
		return [];
	}

	// Get unique company names and sort alphabetically
	const uniqueCompanies = Array.from(
		new Set(jobs?.map((job) => job.company_name).filter(Boolean) as string[])
	).sort((a, b) => a.localeCompare(b));

	return uniqueCompanies;
}

/**
 * Get distinct industries for filter options
 */
export async function getJobFilterOptions(clerkOrgId: string): Promise<{ industries: string[] }> {
	const supabase = getSupabaseClient();

	// Get organization
	const { data: org } = await supabase
		.from("organizations")
		.select("id")
		.eq("org_id", clerkOrgId)
		.single();

	if (!org) {
		return { industries: [] };
	}

	// Get searches
	const { data: searches } = await supabase
		.from("searches")
		.select("id")
		.eq("org_id", org.id);

	if (!searches || searches.length === 0) {
		return { industries: [] };
	}

	const searchIds = searches.map((s) => s.id);

	// Get distinct industries
	const { data: jobs } = await supabase
		.from("jobs")
		.select("industries")
		.in("search_id", searchIds)
		.not("industries", "is", null);

	const industriesSet = new Set<string>();

	if (jobs) {
		for (const job of jobs) {
			if (job.industries) {
				// Industries might be comma-separated
				const industries = job.industries.split(",").map((i: string) => i.trim());
				industries.forEach((ind: string) => {
					if (ind) industriesSet.add(ind);
				});
			}
		}
	}

	return {
		industries: Array.from(industriesSet).sort(),
	};
}

/**
 * Get job statistics for an organization
 */
export interface JobStatistics {
	locations: { location: string; count: number }[];
	employeeDistribution: { range: string; count: number }[];
	industryDistribution: { industry: string; count: number }[];
}

export async function getJobStatistics(orgId: number): Promise<JobStatistics> {
	const supabase = getSupabaseClient();

	// Get all search IDs for this organization
	const { data: searches, error: searchesError } = await supabase
		.from("searches")
		.select("id")
		.eq("org_id", orgId);

	if (searchesError || !searches || searches.length === 0) {
		console.error("Error fetching searches:", searchesError);
		return {
			locations: [],
			employeeDistribution: [],
			industryDistribution: [],
		};
	}

	const searchIds = searches.map((s) => s.id);

	// Get all jobs for these searches
	const { data: jobs, error: jobsError } = await supabase
		.from("jobs")
		.select("location, company_employees_count, industries")
		.in("search_id", searchIds);

	if (jobsError || !jobs) {
		console.error("Error fetching jobs:", jobsError);
		return {
			locations: [],
			employeeDistribution: [],
			industryDistribution: [],
		};
	}

	// Process locations
	const locationMap = new Map<string, number>();
	jobs.forEach((job) => {
		if (job.location) {
			const loc = job.location.trim();
			locationMap.set(loc, (locationMap.get(loc) || 0) + 1);
		}
	});
	const locations = Array.from(locationMap.entries())
		.map(([location, count]) => ({ location, count }))
		.sort((a, b) => b.count - a.count);

	// Process employee count distribution
	const employeeMap = new Map<string, number>();
	jobs.forEach((job) => {
		if (job.company_employees_count) {
			const count = job.company_employees_count;
			let range: string;
			if (count < 10) range = "1-10";
			else if (count < 50) range = "10-50";
			else if (count < 200) range = "50-200";
			else if (count < 500) range = "200-500";
			else if (count < 1000) range = "500-1000";
			else if (count < 5000) range = "1000-5000";
			else range = "5000+";

			employeeMap.set(range, (employeeMap.get(range) || 0) + 1);
		}
	});
	
	// Sort employee distribution by range
	const rangeOrder = ["1-10", "10-50", "50-200", "200-500", "500-1000", "1000-5000", "5000+"];
	const employeeDistribution = rangeOrder
		.map(range => ({
			range,
			count: employeeMap.get(range) || 0
		}))
		.filter(item => item.count > 0);

	// Process industries distribution
	const industryMap = new Map<string, number>();
	jobs.forEach((job) => {
		if (job.industries) {
			// Split multiple industries if they're comma-separated
			const industries = typeof job.industries === 'string' 
				? job.industries.split(',').map(i => i.trim())
				: [job.industries];
			
			industries.forEach(industry => {
				if (industry) {
					industryMap.set(industry, (industryMap.get(industry) || 0) + 1);
				}
			});
		}
	});
	const industryDistribution = Array.from(industryMap.entries())
		.map(([industry, count]) => ({ industry, count }))
		.sort((a, b) => b.count - a.count)
		.slice(0, 20); // Top 20 industries

	return {
		locations,
		employeeDistribution,
		industryDistribution,
	};
}


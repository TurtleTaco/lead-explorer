import { getSupabaseClient, Job, CompanyContact, Search } from "../supabase";

export interface CompanyLead {
	company_name: string;
	company_website: string | null;
	company_employees_count: number | null;
	company_logo: string | null;
	company_description: string | null;
	industries: string | null;
	location: string | null;
	job_count: number;
	jobs: Job[];
	contacts: CompanyContact[];
	latest_job_posted: string | null;
}

export interface SearchWithLeads {
	search: Search;
	leads: CompanyLead[];
	total_companies: number;
	total_jobs: number;
}

export interface LeadsFilters {
	industry?: string;
	location?: string;
	employeeCountMin?: number;
	employeeCountMax?: number;
	hasContacts?: boolean;
	companyName?: string;
	sortBy?: "job_count" | "company_name" | "company_size";
}

/**
 * Get aggregated company leads data for an organization, grouped by search term
 */
export async function getLeadsDataBySearch(
	clerkOrgId: string,
	filters?: LeadsFilters
): Promise<SearchWithLeads[]> {
	const supabase = getSupabaseClient();

	// 1. Get organization by clerk org_id
	const { data: org, error: orgError } = await supabase
		.from("organizations")
		.select("id")
		.eq("org_id", clerkOrgId)
		.single();

	if (orgError || !org) {
		console.error("Organization not found:", orgError);
		return [];
	}

	// 2. Get all searches for this organization
	const { data: searches, error: searchesError } = await supabase
		.from("searches")
		.select("*")
		.eq("org_id", org.id)
		.order("created_at", { ascending: false });

	if (searchesError || !searches) {
		console.error("Error fetching searches:", searchesError);
		return [];
	}

	if (searches.length === 0) {
		return [];
	}

	// 3. For each search, get jobs and aggregate by company
	const searchesWithLeads: SearchWithLeads[] = [];

	for (const search of searches) {
		// Get jobs for this search
		let jobsQuery = supabase
			.from("jobs")
			.select("*")
			.eq("search_id", search.id)
			.not("company_name", "is", null);

		// Apply filters
		if (filters?.industry) {
			jobsQuery = jobsQuery.ilike("industries", `%${filters.industry}%`);
		}
		if (filters?.location) {
			jobsQuery = jobsQuery.ilike("location", `%${filters.location}%`);
		}
		if (filters?.employeeCountMin !== undefined) {
			jobsQuery = jobsQuery.gte("company_employees_count", filters.employeeCountMin);
		}
		if (filters?.employeeCountMax !== undefined) {
			jobsQuery = jobsQuery.lte("company_employees_count", filters.employeeCountMax);
		}
		if (filters?.companyName) {
			jobsQuery = jobsQuery.ilike("company_name", `%${filters.companyName}%`);
		}

		const { data: jobs, error: jobsError } = await jobsQuery;

		if (jobsError) {
			console.error(`Error fetching jobs for search ${search.id}:`, jobsError);
			continue;
		}

		if (!jobs || jobs.length === 0) {
			continue;
		}

		// Aggregate jobs by company
		const companyMap = new Map<string, CompanyLead>();

		for (const job of jobs) {
			const companyKey = job.company_website || job.company_name || "";
			
			if (!companyMap.has(companyKey)) {
				companyMap.set(companyKey, {
					company_name: job.company_name || "Unknown Company",
					company_website: job.company_website,
					company_employees_count: job.company_employees_count,
					company_logo: job.company_logo,
					company_description: job.company_description,
					industries: job.industries,
					location: job.location,
					job_count: 0,
					jobs: [],
					contacts: [],
					latest_job_posted: job.posted_at,
				});
			}

			const lead = companyMap.get(companyKey)!;
			lead.job_count++;
			lead.jobs.push(job);

			// Update latest posted date
			if (job.posted_at && (!lead.latest_job_posted || job.posted_at > lead.latest_job_posted)) {
				lead.latest_job_posted = job.posted_at;
			}
		}

		// Fetch contacts for companies with websites
		const companyWebsites = Array.from(companyMap.values())
			.map((lead) => lead.company_website)
			.filter((website): website is string => website !== null);

		if (companyWebsites.length > 0) {
			const { data: contacts, error: contactsError } = await supabase
				.from("company_contacts")
				.select("*")
				.in("company_website", companyWebsites)
				.order("seniority_level", { ascending: true });

			if (!contactsError && contacts) {
				// Map contacts to their companies
				for (const contact of contacts) {
					const lead = companyMap.get(contact.company_website);
					if (lead) {
						lead.contacts.push(contact);
					}
				}
			}
		}

		// Convert map to array
		let leads = Array.from(companyMap.values());

		// Apply contact filter if needed
		if (filters?.hasContacts) {
			leads = leads.filter((lead) => lead.contacts.length > 0);
		}

		// Apply sorting
		if (filters?.sortBy === "company_name") {
			leads.sort((a, b) => a.company_name.localeCompare(b.company_name));
		} else if (filters?.sortBy === "company_size") {
			// Sort by company size descending (largest first)
			leads.sort((a, b) => {
				const sizeA = a.company_employees_count || 0;
				const sizeB = b.company_employees_count || 0;
				return sizeB - sizeA;
			});
		} else {
			// Default: sort by job count descending
			leads.sort((a, b) => b.job_count - a.job_count);
		}

		if (leads.length > 0) {
			searchesWithLeads.push({
				search,
				leads,
				total_companies: leads.length,
				total_jobs: leads.reduce((acc, lead) => acc + lead.job_count, 0),
			});
		}
	}

	return searchesWithLeads;
}

/**
 * Get unique values for filter options
 */
export async function getFilterOptions(clerkOrgId: string) {
	const supabase = getSupabaseClient();

	// Get organization
	const { data: org } = await supabase
		.from("organizations")
		.select("id")
		.eq("org_id", clerkOrgId)
		.single();

	if (!org) {
		return { industries: [], locations: [] };
	}

	// Get searches
	const { data: searches } = await supabase
		.from("searches")
		.select("id")
		.eq("org_id", org.id);

	if (!searches) {
		return { industries: [], locations: [] };
	}

	const searchIds = searches.map((s) => s.id);

	if (searchIds.length === 0) {
		return { industries: [], locations: [] };
	}

	// Get distinct industries and locations
	const { data: jobs } = await supabase
		.from("jobs")
		.select("industries, location")
		.in("search_id", searchIds)
		.not("industries", "is", null)
		.not("location", "is", null);

	const industriesSet = new Set<string>();
	const locationsSet = new Set<string>();

	if (jobs) {
		for (const job of jobs) {
		if (job.industries) {
			// Industries might be comma-separated
			const industries = job.industries.split(",").map((i: string) => i.trim());
			industries.forEach((ind: string) => industriesSet.add(ind));
		}
			if (job.location) {
				locationsSet.add(job.location);
			}
		}
	}

	return {
		industries: Array.from(industriesSet).sort(),
		locations: Array.from(locationsSet).sort(),
	};
}

/**
 * Get paginated leads for a specific search
 */
export async function getLeadsForSearch(
	searchId: number,
	limit = 5,
	offset = 0,
	filters?: LeadsFilters
): Promise<CompanyLead[]> {
	const supabase = getSupabaseClient();

	// Get jobs for this search
	let jobsQuery = supabase
		.from("jobs")
		.select("*")
		.eq("search_id", searchId)
		.not("company_name", "is", null);

	// Apply filters
	if (filters?.industry) {
		jobsQuery = jobsQuery.ilike("industries", `%${filters.industry}%`);
	}
	if (filters?.location) {
		jobsQuery = jobsQuery.ilike("location", `%${filters.location}%`);
	}
	if (filters?.employeeCountMin !== undefined) {
		jobsQuery = jobsQuery.gte("company_employees_count", filters.employeeCountMin);
	}
	if (filters?.employeeCountMax !== undefined) {
		jobsQuery = jobsQuery.lte("company_employees_count", filters.employeeCountMax);
	}
	if (filters?.companyName) {
		jobsQuery = jobsQuery.ilike("company_name", `%${filters.companyName}%`);
	}

	const { data: jobs, error: jobsError } = await jobsQuery;

	if (jobsError || !jobs || jobs.length === 0) {
		return [];
	}

	// Aggregate jobs by company
	const companyMap = new Map<string, CompanyLead>();

	for (const job of jobs) {
		const companyKey = job.company_website || job.company_name || "";

		if (!companyMap.has(companyKey)) {
			companyMap.set(companyKey, {
				company_name: job.company_name || "Unknown Company",
				company_website: job.company_website,
				company_employees_count: job.company_employees_count,
				company_logo: job.company_logo,
				company_description: job.company_description,
				industries: job.industries,
				location: job.location,
				job_count: 0,
				jobs: [],
				contacts: [],
				latest_job_posted: job.posted_at,
			});
		}

		const lead = companyMap.get(companyKey)!;
		lead.job_count++;
		lead.jobs.push(job);

		if (job.posted_at && (!lead.latest_job_posted || job.posted_at > lead.latest_job_posted)) {
			lead.latest_job_posted = job.posted_at;
		}
	}

	// Fetch contacts for companies
	const companyWebsites = Array.from(companyMap.values())
		.map((lead) => lead.company_website)
		.filter((website): website is string => website !== null);

	if (companyWebsites.length > 0) {
		const { data: contacts } = await supabase
			.from("company_contacts")
			.select("*")
			.in("company_website", companyWebsites)
			.order("seniority_level", { ascending: true });

		if (contacts) {
			for (const contact of contacts) {
				const lead = companyMap.get(contact.company_website);
				if (lead) {
					lead.contacts.push(contact);
				}
			}
		}
	}

	// Convert to array
	let leads = Array.from(companyMap.values());

	// Apply contact filter
	if (filters?.hasContacts) {
		leads = leads.filter((lead) => lead.contacts.length > 0);
	}

	// Apply sorting
	if (filters?.sortBy === "company_name") {
		leads.sort((a, b) => a.company_name.localeCompare(b.company_name));
	} else if (filters?.sortBy === "company_size") {
		leads.sort((a, b) => {
			const sizeA = a.company_employees_count || 0;
			const sizeB = b.company_employees_count || 0;
			return sizeB - sizeA;
		});
	} else {
		leads.sort((a, b) => b.job_count - a.job_count);
	}

	// Apply pagination
	return leads.slice(offset, offset + limit);
}

/**
 * Get count of leads for a search with filters
 */
export async function getLeadsCountForSearch(
	searchId: number,
	filters?: LeadsFilters
): Promise<number> {
	const supabase = getSupabaseClient();

	let jobsQuery = supabase
		.from("jobs")
		.select("company_name, company_website")
		.eq("search_id", searchId)
		.not("company_name", "is", null);

	// Apply filters
	if (filters?.industry) {
		jobsQuery = jobsQuery.ilike("industries", `%${filters.industry}%`);
	}
	if (filters?.location) {
		jobsQuery = jobsQuery.ilike("location", `%${filters.location}%`);
	}
	if (filters?.employeeCountMin !== undefined) {
		jobsQuery = jobsQuery.gte("company_employees_count", filters.employeeCountMin);
	}
	if (filters?.employeeCountMax !== undefined) {
		jobsQuery = jobsQuery.lte("company_employees_count", filters.employeeCountMax);
	}
	if (filters?.companyName) {
		jobsQuery = jobsQuery.ilike("company_name", `%${filters.companyName}%`);
	}

	const { data: jobs } = await jobsQuery;

	if (!jobs || jobs.length === 0) {
		return 0;
	}

	// Count unique companies
	const uniqueCompanies = new Set(
		jobs.map((job) => job.company_website || job.company_name)
	);

	// If hasContacts filter is active, need to check which companies have contacts
	if (filters?.hasContacts) {
		const companyWebsites = Array.from(uniqueCompanies).filter(
			(key): key is string => typeof key === "string" && key.startsWith("http")
		);

		if (companyWebsites.length === 0) {
			return 0;
		}

		const { data: contacts } = await supabase
			.from("company_contacts")
			.select("company_website")
			.in("company_website", companyWebsites);

		if (!contacts) {
			return 0;
		}

		const companiesWithContacts = new Set(contacts.map((c) => c.company_website));
		return companiesWithContacts.size;
	}

	return uniqueCompanies.size;
}


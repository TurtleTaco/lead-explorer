import { getSupabaseClient, CompanyContact } from "../supabase";

export interface ContactWithCompanyInfo extends CompanyContact {
	job_count?: number;
	latest_job_title?: string;
	latest_job_posted?: string;
}

export interface ContactsFilters {
	search?: string;
	seniority?: string;
	industry?: string;
	location?: string;
	hasEmail?: boolean;
	hasPhone?: boolean;
	sortBy?: "name" | "company" | "recent";
}

export interface CompanyWithContacts {
	company_name: string;
	company_website: string;
	company_logo?: string | null;
	company_description?: string | null;
	company_size?: number | null;
	industry?: string | null;
	location?: string | null;
	contacts: ContactWithCompanyInfo[];
	job_count: number;
	latest_job_posted?: string | null;
}

export interface ContactsData {
	companies: CompanyWithContacts[];
	total_contacts: number;
	companies_count: number;
	filter_options: {
		seniorities: string[];
		industries: string[];
		locations: string[];
	};
}

/**
 * Get all contacts for an organization with filtering
 */
export async function getAllContacts(
	clerkOrgId: string,
	filters?: ContactsFilters
): Promise<ContactsData> {
	const supabase = getSupabaseClient();

	// 1. Get organization (for context, but we'll fetch all contacts regardless)
	const { data: org, error: orgError } = await supabase
		.from("organizations")
		.select("id")
		.eq("org_id", clerkOrgId)
		.single();

	if (orgError || !org) {
		console.error("Organization not found:", orgError);
		return {
			contacts: [],
			total_contacts: 0,
			companies_count: 0,
			filter_options: { seniorities: [], industries: [], locations: [] },
		};
	}

	// 2. Directly fetch all contacts from company_contacts table
	let contactsQuery = supabase
		.from("company_contacts")
		.select("*");

	// Apply filters
	if (filters?.search) {
		contactsQuery = contactsQuery.or(
			`full_name.ilike.%${filters.search}%,` +
			`email.ilike.%${filters.search}%,` +
			`company_name.ilike.%${filters.search}%,` +
			`job_title.ilike.%${filters.search}%`
		);
	}

	if (filters?.seniority && filters.seniority !== "all") {
		contactsQuery = contactsQuery.eq("seniority_level", filters.seniority);
	}

	if (filters?.industry && filters.industry !== "all") {
		contactsQuery = contactsQuery.ilike("industry", `%${filters.industry}%`);
	}

	if (filters?.location && filters.location !== "all") {
		contactsQuery = contactsQuery.or(
			`city.ilike.%${filters.location}%,` +
			`state.ilike.%${filters.location}%,` +
			`country.ilike.%${filters.location}%`
		);
	}

	if (filters?.hasEmail) {
		contactsQuery = contactsQuery.not("email", "is", null);
	}

	if (filters?.hasPhone) {
		contactsQuery = contactsQuery.not("mobile_number", "is", null);
	}

	const { data: contacts, error: contactsError } = await contactsQuery;

	if (contactsError || !contacts) {
		console.error("Error fetching contacts:", contactsError);
		return {
			contacts: [],
			total_contacts: 0,
			companies_count: 0,
			filter_options: { seniorities: [], industries: [], locations: [] },
		};
	}

	// 3. Optionally enrich contacts with job information from organization's searches
	let jobsByCompany = new Map<string, any[]>();
	
	// Get searches and jobs to enrich contact data (but don't filter by them)
	const { data: searches } = await supabase
		.from("searches")
		.select("id")
		.eq("org_id", org.id);

	if (searches && searches.length > 0) {
		const searchIds = searches.map((s) => s.id);
		
		const { data: jobs } = await supabase
			.from("jobs")
			.select("company_website, company_name, company_logo, title, posted_at, industries")
			.in("search_id", searchIds)
			.not("company_website", "is", null);

		if (jobs) {
			jobs.forEach((job) => {
				if (job.company_website) {
					if (!jobsByCompany.has(job.company_website)) {
						jobsByCompany.set(job.company_website, []);
					}
					jobsByCompany.get(job.company_website)!.push(job);
				}
			});
		}
	}

	// 4. Enrich contacts with job information (if available)
	const enrichedContacts: ContactWithCompanyInfo[] = contacts.map((contact) => {
		const companyJobs = jobsByCompany.get(contact.company_website) || [];
		const sortedJobs = companyJobs.sort((a, b) => {
			if (!a.posted_at) return 1;
			if (!b.posted_at) return -1;
			return new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime();
		});

		return {
			...contact,
			job_count: companyJobs.length,
			latest_job_title: sortedJobs[0]?.title,
			latest_job_posted: sortedJobs[0]?.posted_at,
		};
	});

	// 5. Aggregate contacts by company
	const companyMap = new Map<string, CompanyWithContacts>();
	
	enrichedContacts.forEach((contact) => {
		const companyKey = contact.company_website || contact.company_name || "Unknown";
		
		if (!companyMap.has(companyKey)) {
			// Get company logo from jobs data if available
			const companyJobs = jobsByCompany.get(contact.company_website) || [];
			const companyLogo = companyJobs.find(job => job.company_logo)?.company_logo || null;
			
			companyMap.set(companyKey, {
				company_name: contact.company_name || "Unknown Company",
				company_website: contact.company_website,
				company_logo: companyLogo,
				company_description: contact.company_description,
				company_size: contact.company_size,
				industry: contact.industry,
				location: [contact.company_city, contact.company_state, contact.company_country]
					.filter(Boolean)
					.join(", ") || null,
				contacts: [],
				job_count: contact.job_count || 0,
				latest_job_posted: contact.latest_job_posted,
			});
		}
		
		companyMap.get(companyKey)!.contacts.push(contact);
	});

	// Convert to array and sort companies
	let companies = Array.from(companyMap.values());
	
	// Sort contacts within each company by seniority
	const seniorityOrder: Record<string, number> = {
		"C-Suite": 1,
		"VP": 2,
		"Director": 3,
		"Manager": 4,
		"Senior": 5,
		"Entry": 6,
	};
	
	companies.forEach((company) => {
		company.contacts.sort((a, b) => {
			const orderA = seniorityOrder[a.seniority_level || ""] || 999;
			const orderB = seniorityOrder[b.seniority_level || ""] || 999;
			return orderA - orderB;
		});
	});

	// Sort companies based on filter
	if (filters?.sortBy === "company" || filters?.sortBy === "name") {
		companies.sort((a, b) => a.company_name.localeCompare(b.company_name));
	} else if (filters?.sortBy === "recent") {
		companies.sort((a, b) => {
			if (!a.latest_job_posted) return 1;
			if (!b.latest_job_posted) return -1;
			return new Date(b.latest_job_posted).getTime() - new Date(a.latest_job_posted).getTime();
		});
	} else {
		// Default: sort by number of contacts (most contacts first)
		companies.sort((a, b) => b.contacts.length - a.contacts.length);
	}

	// 6. Get filter options
	const seniorities = Array.from(
		new Set(contacts.map((c) => c.seniority_level).filter(Boolean) as string[])
	).sort();

	const industries = Array.from(
		new Set(contacts.map((c) => c.industry).filter(Boolean) as string[])
	).sort();

	const locations = Array.from(
		new Set(
			contacts.flatMap((c) => [c.city, c.state, c.country].filter(Boolean) as string[])
		)
	).sort();

	return {
		companies,
		total_contacts: enrichedContacts.length,
		companies_count: companies.length,
		filter_options: {
			seniorities,
			industries,
			locations,
		},
	};
}

/**
 * Export contacts to CSV format
 */
export function exportContactsToCSV(companies: CompanyWithContacts[]): string {
	// Flatten all contacts from all companies
	const contacts = companies.flatMap(company => company.contacts);
	const headers = [
		"Full Name",
		"Email",
		"Phone",
		"Job Title",
		"Company",
		"Company Website",
		"Location",
		"Seniority",
		"LinkedIn",
		"Industry",
		"Job Count"
	];

	const rows = contacts.map((contact) => [
		contact.full_name || `${contact.first_name || ""} ${contact.last_name || ""}`.trim(),
		contact.email || "",
		contact.mobile_number || "",
		contact.job_title || "",
		contact.company_name || "",
		contact.company_website || "",
		[contact.city, contact.state, contact.country].filter(Boolean).join(", "),
		contact.seniority_level || "",
		contact.linkedin || "",
		contact.industry || "",
		contact.job_count?.toString() || "0"
	]);

	const csvContent = [
		headers.join(","),
		...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))
	].join("\n");

	return csvContent;
}


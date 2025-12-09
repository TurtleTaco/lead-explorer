import { getLeadsDataBySearch, getFilterOptions } from "@/lib/api/leads-data";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Building2,
	Briefcase,
} from "lucide-react";
import { LeadsFilter } from "@/components/leads-filter";
import { LeadsAccordion } from "@/components/leads-accordion";

export default async function LeadWorkbenchPage({
	params,
	searchParams,
}: {
	params: Promise<{ orgId: string }>;
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
	const { orgId } = await params;
	const filters = await searchParams;

	// Parse filters
	const employeeCountMin = filters.employeeCountMin 
		? parseInt(filters.employeeCountMin as string) 
		: undefined;
	const employeeCountMax = filters.employeeCountMax 
		? parseInt(filters.employeeCountMax as string) 
		: undefined;

	// Get leads data grouped by search term
	const searchesWithLeads = await getLeadsDataBySearch(orgId, {
		industry: typeof filters.industry === "string" ? filters.industry : undefined,
		location: typeof filters.location === "string" ? filters.location : undefined,
		companyName: typeof filters.companyName === "string" ? filters.companyName : undefined,
		hasContacts: filters.hasContacts === "true",
		employeeCountMin,
		employeeCountMax,
		sortBy: (filters.sortBy === "company_name" || filters.sortBy === "job_count" || filters.sortBy === "company_size") 
			? filters.sortBy 
			: "job_count",
	});

	// Get filter options
	const filterOptions = await getFilterOptions(orgId);

	// Calculate totals across all searches
	const totalCompanies = searchesWithLeads.reduce((acc, s) => acc + s.total_companies, 0);
	const totalJobs = searchesWithLeads.reduce((acc, s) => acc + s.total_jobs, 0);

	return (
		<div className="container py-8 space-y-6">
			{/* Header with Compact Stats */}
			<div className="space-y-3">
				<div>
					<h1 className="text-4xl font-bold">Company Workbench</h1>
					<p className="text-muted-foreground mt-2">
						Discover companies and key contacts from your job search results
					</p>
				</div>
				
				{/* Compact Stats Bar */}
				<div className="flex flex-wrap gap-3">
					<div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/5 border">
						<Building2 className="h-4 w-4 text-primary" />
						<div className="flex items-baseline gap-1.5">
							<span className="text-lg font-bold">{totalCompanies}</span>
							<span className="text-xs text-muted-foreground">companies</span>
						</div>
					</div>
					
					<div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/5 border">
						<Briefcase className="h-4 w-4 text-primary" />
						<div className="flex items-baseline gap-1.5">
							<span className="text-lg font-bold">{totalJobs}</span>
							<span className="text-xs text-muted-foreground">jobs</span>
						</div>
					</div>
				
				</div>
			</div>

			{/* Filters */}
			<LeadsFilter industries={filterOptions.industries} orgId={orgId} />

			{/* Companies List - Grouped by Search */}
			<Card>
				<CardHeader>
					<CardTitle>Company Leads by Search Term</CardTitle>
					<CardDescription>
						{filters.sortBy === "company_name" 
							? "Companies sorted alphabetically" 
							: filters.sortBy === "company_size"
							? "Companies sorted by size (largest first)"
							: "Companies sorted by number of open positions"}
					</CardDescription>
				</CardHeader>
				<CardContent>
					{searchesWithLeads.length === 0 ? (
						<div className="text-center py-12">
							<Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
							<p className="text-muted-foreground">
								No companies found. Try adjusting your filters or run a job search first.
							</p>
						</div>
					) : (
						<LeadsAccordion 
							searchesWithLeads={searchesWithLeads} 
							orgId={orgId}
							filters={{
								industry: typeof filters.industry === "string" ? filters.industry : undefined,
								location: typeof filters.location === "string" ? filters.location : undefined,
								companyName: typeof filters.companyName === "string" ? filters.companyName : undefined,
								hasContacts: filters.hasContacts === "true",
								employeeCountMin,
								employeeCountMax,
								sortBy: (filters.sortBy === "company_name" || filters.sortBy === "job_count" || filters.sortBy === "company_size") 
									? filters.sortBy 
									: "job_count",
							}}
						/>
					)}
				</CardContent>
			</Card>
		</div>
	);
}


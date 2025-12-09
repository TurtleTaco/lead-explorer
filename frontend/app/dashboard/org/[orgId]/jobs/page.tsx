import { getOrganizationData, getJobFilterOptions } from "@/lib/api/jobs-data";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	Briefcase,
	Search,
} from "lucide-react";
import { JobsByCompanyAccordion } from "@/components/jobs-by-company-accordion";
import { AddSearchDialog } from "@/components/add-search-dialog";
import { JobsFilter } from "@/components/jobs-filter";

export default async function JobExplorerPage({
	params,
	searchParams,
}: {
	params: Promise<{ orgId: string }>;
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
	const { orgId } = await params;
	const filters = await searchParams;
	const data = await getOrganizationData(orgId);
	const filterOptions = await getJobFilterOptions(orgId);

	if (!data) {
		return (
			<div className="container py-8 space-y-6">
				{/* Header */}
				<div className="flex items-start justify-between">
					<div>
						<h1 className="text-4xl font-bold">Job Database</h1>
						<p className="text-muted-foreground mt-3">
							Start by adding your first job search
						</p>
					</div>
					<AddSearchDialog />
				</div>

				<Card>
					<CardHeader>
						<CardTitle>No Data Found</CardTitle>
						<CardDescription>
							No job data found for this organization. Click "Add New Search" above to get started.
						</CardDescription>
					</CardHeader>
				</Card>
			</div>
		);
	}

	// Parse filters
	const employeeCountMin = filters.employeeCountMin 
		? parseInt(filters.employeeCountMin as string) 
		: undefined;
	const employeeCountMax = filters.employeeCountMax 
		? parseInt(filters.employeeCountMax as string) 
		: undefined;

	const sortBy = filters.sortBy === "company_name" || filters.sortBy === "job_count" || filters.sortBy === "company_size" 
		? filters.sortBy 
		: "job_count";

	const jobFilters = {
		industry: typeof filters.industry === "string" ? filters.industry : undefined,
		companyName: typeof filters.companyName === "string" ? filters.companyName : undefined,
		employeeCountMin,
		employeeCountMax,
		sortBy: sortBy as "company_name" | "job_count" | "company_size",
	};

	const totalJobs = data.searches.reduce(
		(acc, s) => acc + s.search.job_count,
		0
	);

	return (
		<div className="container py-8 space-y-6">
			{/* Header with Compact Stats */}
			<div className="flex items-start justify-between">
				<div>
					<h1 className="text-4xl font-bold">Job Database</h1>
					<div className="flex items-center gap-3 mt-3">
						<p className="text-muted-foreground">
							View and manage job search results
						</p>
						<div className="flex items-center gap-2">
							<Badge variant="secondary" className="gap-1.5">
								<Briefcase className="h-3.5 w-3.5" />
								<span>{totalJobs.toLocaleString()} jobs</span>
							</Badge>
							<Badge variant="secondary" className="gap-1.5">
								<Search className="h-3.5 w-3.5" />
								<span>{data.searches.length} {data.searches.length === 1 ? 'search' : 'searches'}</span>
							</Badge>
						</div>
					</div>
				</div>
				<AddSearchDialog />
			</div>

			{/* Filters */}
			<JobsFilter industries={filterOptions.industries} orgId={orgId} />

			{/* Searches and Jobs */}
			<Card>
				<CardHeader>
					<CardTitle>Job Searches</CardTitle>
					<CardDescription>
						{jobFilters.sortBy === "company_name" 
							? "Companies sorted alphabetically" 
							: jobFilters.sortBy === "company_size"
							? "Companies sorted by size (largest first)"
							: "Companies sorted by number of open positions"}
					</CardDescription>
				</CardHeader>
				<CardContent>
					{data.searches.length === 0 ? (
						<p className="text-muted-foreground text-center py-8">
							No searches found
						</p>
					) : (
						<JobsByCompanyAccordion searches={data.searches} filters={jobFilters} />
					)}
				</CardContent>
			</Card>
		</div>
	);
}


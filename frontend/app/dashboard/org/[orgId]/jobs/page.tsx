import { getOrganizationData } from "@/lib/api/jobs-data";
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
import { JobSearchAccordion } from "@/components/job-search-accordion";
import { AddSearchDialog } from "@/components/add-search-dialog";

export default async function JobExplorerPage({
	params,
}: {
	params: Promise<{ orgId: string }>;
}) {
	const { orgId } = await params;
	const data = await getOrganizationData(orgId);

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

			{/* Searches and Jobs */}
			<Card>
				<CardHeader>
					<CardTitle>Job Searches</CardTitle>
					<CardDescription>
						Browse jobs organized by search term. Filter by company to narrow your results.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{data.searches.length === 0 ? (
						<p className="text-muted-foreground text-center py-8">
							No searches found
						</p>
					) : (
						<JobSearchAccordion searches={data.searches} />
					)}
				</CardContent>
			</Card>
		</div>
	);
}


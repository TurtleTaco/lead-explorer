import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { getOrganizationData, getJobStatistics } from "@/lib/api/jobs-data";
import { EmployeeDistributionChart, IndustryDistributionChart, TopLocationsList } from "@/components/job-statistics-charts";
import { Suspense } from "react";

async function JobStatisticsSection({ orgDatabaseId }: { orgDatabaseId: number }) {
	const stats = await getJobStatistics(orgDatabaseId);

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-bold mb-4">Lead Distribution</h2>
				<p className="text-muted-foreground mb-6">
					Explore the distribution of jobs across locations, company sizes, and industries
				</p>
			</div>


			{/* Two column layout for location list and employee distribution */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<TopLocationsList data={stats.locations} limit={15} />
				<EmployeeDistributionChart data={stats.employeeDistribution} />
			</div>

			{/* Industry Distribution */}
			<IndustryDistributionChart data={stats.industryDistribution} />
		</div>
	);
}

export default async function OrganizationDashboard({
	params,
}: {
	params: Promise<{ orgId: string }>;
}) {
	const { orgId } = await params;
	
	// Fetch organization data to get the database ID
	const orgData = await getOrganizationData(orgId);
	
	if (!orgData) {
		return (
			<div className="container py-8">
				<div className="max-w-6xl mx-auto">
					<Card>
						<CardContent className="py-8">
							<div className="text-center text-muted-foreground">
								Organization not found
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	return (
		<div className="container py-8">
			<div className="max-w-6xl mx-auto space-y-6">

				{/* Job Statistics Section */}
				<Suspense fallback={
					<Card>
						<CardContent className="py-8">
							<div className="text-center text-muted-foreground">
								Loading job statistics...
							</div>
						</CardContent>
					</Card>
				}>
					<JobStatisticsSection orgDatabaseId={orgData.organization.id} />
				</Suspense>
			</div>
		</div>
	);
}


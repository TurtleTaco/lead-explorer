import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Search } from "lucide-react";

export default function JobExplorerLoading() {
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
								<Skeleton className="h-4 w-12 inline-block" />
							</Badge>
							<Badge variant="secondary" className="gap-1.5">
								<Search className="h-3.5 w-3.5" />
								<Skeleton className="h-4 w-16 inline-block" />
							</Badge>
						</div>
					</div>
				</div>
				<Skeleton className="h-10 w-32" />
			</div>

			{/* Searches and Jobs Skeleton */}
			<Card>
				<CardHeader>
					<CardTitle>Job Searches</CardTitle>
					<CardDescription>
						Loading job searches...
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{/* Skeleton for search items */}
						{[1, 2, 3].map((i) => (
							<div key={i} className="space-y-2">
								<Skeleton className="h-16 w-full" />
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}


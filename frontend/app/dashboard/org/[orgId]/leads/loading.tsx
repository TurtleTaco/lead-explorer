import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Briefcase } from "lucide-react";

export default function LeadWorkbenchLoading() {
	return (
		<div className="container py-8 space-y-6">
			{/* Header with Compact Stats */}
			<div className="space-y-3">
				<div>
					<h1 className="text-4xl font-bold">Company</h1>
					<p className="text-muted-foreground mt-2">
						Discover companies and key contacts from your job search results
					</p>
				</div>
				
				{/* Compact Stats Bar - Skeleton */}
				<div className="flex flex-wrap gap-3">
					<div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/5 border">
						<Building2 className="h-4 w-4 text-primary" />
						<div className="flex items-baseline gap-1.5">
							<Skeleton className="h-7 w-12" />
							<span className="text-xs text-muted-foreground">companies</span>
						</div>
					</div>
					
					<div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/5 border">
						<Briefcase className="h-4 w-4 text-primary" />
						<div className="flex items-baseline gap-1.5">
							<Skeleton className="h-7 w-12" />
							<span className="text-xs text-muted-foreground">jobs</span>
						</div>
					</div>
				</div>
			</div>

			{/* Filters Skeleton */}
			<Card>
				<CardContent className="pt-6">
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
					</div>
				</CardContent>
			</Card>

			{/* Companies List Skeleton */}
			<Card>
				<CardHeader>
					<CardTitle>Company Leads by Search Term</CardTitle>
					<CardDescription>
						Loading company data...
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{/* Skeleton for search groups */}
						{[1, 2, 3].map((i) => (
							<div key={i} className="space-y-2">
								<Skeleton className="h-12 w-full" />
								<div className="ml-4 space-y-2">
									<Skeleton className="h-32 w-full" />
									<Skeleton className="h-32 w-full" />
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}


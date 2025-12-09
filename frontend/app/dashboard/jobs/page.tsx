import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";
import Link from "next/link";

export default function JobsPageWithoutOrg() {
	return (
		<div className="container py-8">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Building2 className="h-6 w-6" />
						Select an Organization
					</CardTitle>
					<CardDescription>
						Please select an organization from the sidebar to view job data
					</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground">
						Once you select an organization, you'll be able to view all job searches
						and job listings associated with that organization.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}

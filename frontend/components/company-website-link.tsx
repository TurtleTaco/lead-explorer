"use client";

import { ExternalLink } from "lucide-react";

interface CompanyWebsiteLinkProps {
	website: string;
}

export function CompanyWebsiteLink({ website }: CompanyWebsiteLinkProps) {
	return (
		<a
			href={website}
			target="_blank"
			rel="noopener noreferrer"
			className="text-muted-foreground hover:text-primary"
			onClick={(e) => e.stopPropagation()}
		>
			<ExternalLink className="h-4 w-4" />
		</a>
	);
}


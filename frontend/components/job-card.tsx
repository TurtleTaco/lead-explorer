"use client";

import { useState } from "react";
import { Job } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Building2,
	MapPin,
	Calendar,
	Users,
	ExternalLink,
	Briefcase,
	DollarSign,
	ChevronDown,
	ChevronUp,
} from "lucide-react";
import Link from "next/link";

interface JobCardProps {
	job: Job;
	searchTerm?: string;
}

function highlightTextInHTML(html: string, searchTerm?: string): string {
	if (!searchTerm || !html) return html;

	// Replace all instances of the search term in HTML with highlighted version
	const regex = new RegExp(`(${searchTerm})(?![^<]*>)`, "gi");
	return html.replace(
		regex,
		'<mark class="bg-yellow-200 dark:bg-yellow-900 font-semibold">$1</mark>'
	);
}

export function JobCard({ job, searchTerm }: JobCardProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	return (
		<Card className="hover:shadow-md transition-shadow">
			<CardHeader>
				<div className="flex items-start justify-between gap-4">
					<div className="flex-1 min-w-0">
						<CardTitle className="text-xl line-clamp-2">
							{job.title}
						</CardTitle>
						<CardDescription className="flex items-center gap-2 mt-1">
							<Building2 className="h-4 w-4 flex-shrink-0" />
							<span className="truncate">{job.company_name || "Unknown Company"}</span>
						</CardDescription>
					</div>
					{job.company_logo && (
						<img
							src={job.company_logo}
							alt={job.company_name || "Company"}
							className="h-12 w-12 object-contain rounded flex-shrink-0"
						/>
					)}
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Job Metadata Badges */}
				<div className="flex flex-wrap gap-2">
					{job.location && (
						<Badge variant="secondary">
							<MapPin className="h-3 w-3 mr-1" />
							{job.location}
						</Badge>
					)}
					{job.employment_type && (
						<Badge variant="secondary">
							<Briefcase className="h-3 w-3 mr-1" />
							{job.employment_type}
						</Badge>
					)}
					{job.seniority_level && (
						<Badge variant="secondary">
							{job.seniority_level}
						</Badge>
					)}
					{job.salary && (
						<Badge variant="secondary">
							<DollarSign className="h-3 w-3 mr-1" />
							{job.salary}
						</Badge>
					)}
				</div>

				{/* Job Details Grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
					{job.posted_at && (
						<div className="flex items-center gap-2 text-muted-foreground">
							<Calendar className="h-4 w-4" />
							<span>Posted: {new Date(job.posted_at).toLocaleDateString()}</span>
						</div>
					)}
					{job.applicants_count && (
						<div className="flex items-center gap-2 text-muted-foreground">
							<Users className="h-4 w-4" />
							<span>{job.applicants_count} applicants</span>
						</div>
					)}
				</div>

				{/* Description Preview/Full */}
				{job.description_html && (
					<div className="text-sm text-muted-foreground leading-relaxed">
						<div 
							className={isExpanded ? "prose prose-sm max-w-none dark:prose-invert" : "line-clamp-3"}
							dangerouslySetInnerHTML={{
								__html: highlightTextInHTML(job.description_html, searchTerm)
							}}
						/>
					</div>
				)}

				{/* Expanded Content */}
				{isExpanded && (
					<div className="space-y-3 border-t pt-3">
						{/* Company Info */}
						{job.company_description && (
							<div className="text-sm">
								<span className="font-medium">About the company: </span>
								<span className="text-muted-foreground">
									{job.company_description}
								</span>
							</div>
						)}

						{/* Additional Details */}
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
							{job.job_function && (
								<div>
									<span className="font-medium">Job Function: </span>
									<span className="text-muted-foreground">{job.job_function}</span>
								</div>
							)}
							{job.industries && (
								<div>
									<span className="font-medium">Industries: </span>
									<span className="text-muted-foreground">{job.industries}</span>
								</div>
							)}
							{job.company_employees_count && (
								<div>
									<span className="font-medium">Company Size: </span>
									<span className="text-muted-foreground">
										{job.company_employees_count.toLocaleString()} employees
									</span>
								</div>
							)}
							{job.company_website && (
								<div>
									<span className="font-medium">Website: </span>
									<Link
										href={job.company_website}
										target="_blank"
										rel="noopener noreferrer"
										className="text-primary hover:underline"
									>
										{job.company_website}
									</Link>
								</div>
							)}
						</div>

						{/* Benefits */}
						{job.benefits && Array.isArray(job.benefits) && job.benefits.length > 0 && (
							<div className="text-sm">
								<span className="font-medium">Benefits: </span>
								<div className="flex flex-wrap gap-1 mt-1">
									{job.benefits.map((benefit: string, idx: number) => (
										<Badge key={idx} variant="outline" className="text-xs">
											{benefit}
										</Badge>
									))}
								</div>
							</div>
						)}

						{/* Salary Info */}
						{job.salary_info && Array.isArray(job.salary_info) && job.salary_info.length > 0 && (
							<div className="text-sm">
								<span className="font-medium">Salary Details: </span>
								<div className="text-muted-foreground mt-1">
									{job.salary_info.map((info: any, idx: number) => (
										<div key={idx}>
											{typeof info === 'string' ? info : JSON.stringify(info)}
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				)}

				{/* Action Buttons */}
				<div className="flex flex-wrap items-center justify-between gap-2 pt-2">
					<div className="flex flex-wrap gap-2">
						{job.link && (
							<Button asChild size="sm" variant="default">
								<Link href={job.link} target="_blank" rel="noopener noreferrer">
									<ExternalLink className="h-4 w-4 mr-1" />
									View Job
								</Link>
							</Button>
						)}
						{job.apply_url && (
							<Button asChild size="sm" variant="outline">
								<Link href={job.apply_url} target="_blank" rel="noopener noreferrer">
									Apply Now
								</Link>
							</Button>
						)}
						{job.company_linkedin_url && (
							<Button asChild size="sm" variant="ghost">
								<Link href={job.company_linkedin_url} target="_blank" rel="noopener noreferrer">
									<Building2 className="h-4 w-4 mr-1" />
									Company
								</Link>
							</Button>
						)}
					</div>

					{/* Expand/Collapse Button */}
					<Button
						size="sm"
						variant="ghost"
						onClick={() => setIsExpanded(!isExpanded)}
						className="text-muted-foreground hover:text-foreground"
					>
						{isExpanded ? (
							<>
								<ChevronUp className="h-4 w-4 mr-1" />
								Show Less
							</>
						) : (
							<>
								<ChevronDown className="h-4 w-4 mr-1" />
								Show More
							</>
						)}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}


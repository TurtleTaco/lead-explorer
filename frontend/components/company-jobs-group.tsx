"use client";

import { useState } from "react";
import { Job } from "@/lib/supabase";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Building2,
	MapPin,
	Briefcase,
	ExternalLink,
	Users,
	ChevronDown,
	ChevronUp,
	Calendar,
	DollarSign,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { FetchContactsButton } from "@/components/fetch-contacts-button";

interface CompanyJobsGroupProps {
	companyName: string;
	jobs: Job[];
	searchTerm?: string;
	contactsCount?: number;
	onContactsFetched?: () => void;
}

interface CompanyWithJobs {
	companyName: string;
	jobs: Job[];
	logo?: string;
	website?: string;
	linkedinUrl?: string;
	employeeCount?: number;
	locations: string[];
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

function CompactJobItem({ 
	job, 
	searchTerm, 
	isExpanded, 
	onToggle 
}: { 
	job: Job; 
	searchTerm?: string;
	isExpanded: boolean;
	onToggle: () => void;
}) {
	return (
		<div className="border rounded-lg p-3 hover:bg-accent/50 transition-colors">
			{/* Compact Job Header */}
			<div className="flex items-start justify-between gap-3">
				<div className="flex-1 min-w-0">
					<h4 className="font-medium text-sm line-clamp-1">{job.title}</h4>
					<div className="flex flex-wrap items-center gap-2 mt-1">
						{job.location && (
							<Badge variant="secondary" className="text-xs">
								<MapPin className="h-3 w-3 mr-1" />
								{job.location}
							</Badge>
						)}
						{job.employment_type && (
							<Badge variant="secondary" className="text-xs">
								<Briefcase className="h-3 w-3 mr-1" />
								{job.employment_type}
							</Badge>
						)}
						{job.seniority_level && (
							<Badge variant="outline" className="text-xs">
								{job.seniority_level}
							</Badge>
						)}
						{job.salary && (
							<Badge variant="secondary" className="text-xs">
								<DollarSign className="h-3 w-3 mr-1" />
								{job.salary}
							</Badge>
						)}
					</div>
				</div>
				<Button
					variant="ghost"
					size="sm"
					onClick={onToggle}
					className="flex-shrink-0"
				>
					{isExpanded ? (
						<ChevronUp className="h-4 w-4" />
					) : (
						<ChevronDown className="h-4 w-4" />
					)}
				</Button>
			</div>

			{/* Expanded Job Details */}
			{isExpanded && (
				<div className="mt-3 pt-3 border-t space-y-3">
					{/* Job Metadata */}
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

					{/* Job Description - Full HTML */}
					{job.description_html && (
						<div 
							className="text-sm text-muted-foreground prose prose-sm max-w-none dark:prose-invert"
							dangerouslySetInnerHTML={{ 
								__html: highlightTextInHTML(job.description_html, searchTerm) 
							}}
						/>
					)}

					{/* Company Info */}
					{job.company_description && (
						<div className="text-sm pt-3 border-t">
							<span className="font-medium">About the company: </span>
							<span className="text-muted-foreground">
								{job.company_description}
							</span>
						</div>
					)}

					{/* Additional Details */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm pt-3 border-t">
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

					{/* Action Buttons */}
					<div className="flex flex-wrap gap-2 pt-3 border-t">
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
					</div>
				</div>
			)}
		</div>
	);
}

export function CompanyJobsGroup({ companyName, jobs, searchTerm, contactsCount = 0, onContactsFetched }: CompanyJobsGroupProps) {
	const [expandedJobId, setExpandedJobId] = useState<number | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const jobsPerPage = 5;

	// Aggregate company info from jobs
	const companyData: CompanyWithJobs = {
		companyName,
		jobs,
		logo: jobs[0]?.company_logo || undefined,
		website: jobs[0]?.company_website || undefined,
		linkedinUrl: jobs[0]?.company_linkedin_url || undefined,
		employeeCount: jobs[0]?.company_employees_count || undefined,
		locations: Array.from(new Set(jobs.map(j => j.location).filter(Boolean) as string[])),
	};

	const handleToggleJob = (jobId: number) => {
		setExpandedJobId(expandedJobId === jobId ? null : jobId);
	};

	// Pagination calculations
	const totalPages = Math.ceil(jobs.length / jobsPerPage);
	const startIndex = (currentPage - 1) * jobsPerPage;
	const endIndex = startIndex + jobsPerPage;
	const currentJobs = jobs.slice(startIndex, endIndex);

	const goToPage = (page: number) => {
		if (page >= 1 && page <= totalPages) {
			setCurrentPage(page);
			setExpandedJobId(null); // Collapse any expanded job when changing pages
		}
	};

	return (
		<div className="border rounded-lg overflow-hidden bg-card">
			{/* Company Header */}
			<div className="p-4 bg-muted/30 border-b">
				<div className="flex items-start justify-between gap-4">
					<div className="flex items-start gap-3 flex-1 min-w-0">
						{companyData.logo && (
							<img
								src={companyData.logo}
								alt={companyName}
								className="h-12 w-12 object-contain rounded flex-shrink-0 bg-white p-1"
							/>
						)}
						<div className="flex-1 min-w-0">
							<h3 className="font-semibold text-lg truncate">{companyName}</h3>
							<div className="flex flex-wrap items-center gap-2 mt-1">
								<Badge variant="default" className="gap-1">
									<Briefcase className="h-3 w-3" />
									{jobs.length} {jobs.length === 1 ? "position" : "positions"}
								</Badge>
								{companyData.employeeCount && (
									<Badge variant="secondary" className="gap-1 text-xs">
										<Users className="h-3 w-3" />
										{companyData.employeeCount.toLocaleString()} employees
									</Badge>
								)}
								{companyData.locations.length > 0 && (
									<Badge variant="secondary" className="gap-1 text-xs">
										<MapPin className="h-3 w-3" />
										{companyData.locations.length} {companyData.locations.length === 1 ? "location" : "locations"}
									</Badge>
								)}
							</div>
						</div>
					</div>
					
					{/* Company Links */}
					<div className="flex gap-1 flex-shrink-0">
						{companyData.website && (
							<>
								<Button asChild size="sm" variant="outline">
									<Link href={companyData.website} target="_blank" rel="noopener noreferrer">
										<ExternalLink className="h-3 w-3 mr-1" />
										Website
									</Link>
								</Button>
								{contactsCount > 0 ? (
									<Button size="sm" variant="secondary" disabled className="gap-1.5">
										<Users className="h-3.5 w-3.5" />
										{contactsCount} {contactsCount === 1 ? "Contact" : "Contacts"}
									</Button>
								) : (
									<FetchContactsButton 
										company_website={companyData.website}
										company_name={companyName}
										onSuccess={onContactsFetched}
									/>
								)}
							</>
						)}
						{companyData.linkedinUrl && (
							<Button asChild size="sm" variant="outline">
								<Link href={companyData.linkedinUrl} target="_blank" rel="noopener noreferrer">
									<Building2 className="h-3 w-3 mr-1" />
									LinkedIn
								</Link>
							</Button>
						)}
					</div>
				</div>
			</div>

			{/* Jobs List */}
			<div className="p-4 space-y-2">
				{currentJobs.map((job) => (
					<CompactJobItem 
						key={job.id} 
						job={job} 
						searchTerm={searchTerm}
						isExpanded={expandedJobId === job.id}
						onToggle={() => handleToggleJob(job.id)}
					/>
				))}
			</div>

			{/* Pagination Controls */}
			{totalPages > 1 && (
				<div className="px-4 pb-4 border-t pt-3">
					<div className="flex items-center justify-between">
						<div className="text-sm text-muted-foreground">
							{startIndex + 1}-{Math.min(endIndex, jobs.length)} of {jobs.length} positions
						</div>
						
						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => goToPage(currentPage - 1)}
								disabled={currentPage === 1}
							>
								<ChevronLeft className="h-4 w-4 mr-1" />
								Previous
							</Button>

							<div className="flex items-center gap-1">
								{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
									<Button
										key={page}
										variant={currentPage === page ? "default" : "outline"}
										size="sm"
										onClick={() => goToPage(page)}
										className="min-w-[36px]"
									>
										{page}
									</Button>
								))}
							</div>

							<Button
								variant="outline"
								size="sm"
								onClick={() => goToPage(currentPage + 1)}
								disabled={currentPage === totalPages}
							>
								Next
								<ChevronRight className="h-4 w-4 ml-1" />
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}


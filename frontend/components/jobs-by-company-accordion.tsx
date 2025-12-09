"use client";

import { useState, useEffect } from "react";
import { Search } from "@/lib/supabase";
import { SearchWithJobs } from "@/lib/api/jobs-data";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CompanyJobsGroup } from "@/components/company-jobs-group";
import { getJobsForSearch } from "@/lib/api/jobs-data";
import { Search as SearchIcon, Building2, Filter, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Job } from "@/lib/supabase";
import { getSupabaseClient } from "@/lib/supabase";

interface JobFilters {
	industry?: string;
	companyName?: string;
	employeeCountMin?: number;
	employeeCountMax?: number;
	sortBy?: "job_count" | "company_name" | "company_size";
}

interface JobsByCompanyAccordionProps {
	searches: SearchWithJobs[];
	filters?: JobFilters;
}

interface CompanyGroup {
	companyName: string;
	jobs: Job[];
}

export function JobsByCompanyAccordion({ searches, filters }: JobsByCompanyAccordionProps) {
	const [expandedSearch, setExpandedSearch] = useState<string | null>(null);
	const [allJobsForSearch, setAllJobsForSearch] = useState<Record<number, Job[]>>({});
	const [loadingJobs, setLoadingJobs] = useState<Record<number, boolean>>({});
	const [companyFilter, setCompanyFilter] = useState<Record<number, string>>({});
	const [companyContactsCount, setCompanyContactsCount] = useState<Record<string, number>>({});
	const [companyPage, setCompanyPage] = useState<Record<number, number>>({});
	const companiesPerPage = 10;

	// Fetch contacts count for companies
	const fetchContactsCount = async (jobs: Job[]) => {
		const supabase = getSupabaseClient();
		const companyWebsites = Array.from(
			new Set(
				jobs
					.map(job => job.company_website)
					.filter((website): website is string => website !== null && website !== undefined)
			)
		);

		if (companyWebsites.length === 0) return;

		const { data: contactsData, error } = await supabase
			.from("company_contacts")
			.select("company_website")
			.in("company_website", companyWebsites);

		if (!error && contactsData) {
			// Count contacts per company
			const counts: Record<string, number> = {};
			for (const contact of contactsData) {
				counts[contact.company_website] = (counts[contact.company_website] || 0) + 1;
			}
			
			setCompanyContactsCount((prev) => ({ ...prev, ...counts }));
		}
	};

	// Fetch all jobs when accordion item is opened
	const handleAccordionChange = async (value: string) => {
		setExpandedSearch(value);
		
		if (!value) return;
		
		const searchId = parseInt(value.replace("search-", ""));
		
		// If we already have the jobs, don't fetch again
		if (allJobsForSearch[searchId]) return;

		setLoadingJobs((prev) => ({ ...prev, [searchId]: true }));
		
		// Fetch all jobs for this search (with a reasonable limit)
		const jobs = await getJobsForSearch(searchId, 1000, 0);
		
		setAllJobsForSearch((prev) => ({ ...prev, [searchId]: jobs }));
		setLoadingJobs((prev) => ({ ...prev, [searchId]: false }));

		// Fetch contacts count for these companies
		await fetchContactsCount(jobs);
	};

	const groupJobsByCompany = (jobs: Job[], filterText: string = ""): CompanyGroup[] => {
		const companyMap = new Map<string, Job[]>();
		
		jobs.forEach((job) => {
			const companyName = job.company_name || "Unknown Company";
			
			// Apply global filters
			if (filters?.industry && job.industries) {
				const jobIndustries = job.industries.toLowerCase();
				if (!jobIndustries.includes(filters.industry.toLowerCase())) {
					return;
				}
			}
			
			if (filters?.companyName && !companyName.toLowerCase().includes(filters.companyName.toLowerCase())) {
				return;
			}
			
			if (filters?.employeeCountMin !== undefined && job.company_employees_count !== null) {
				if (job.company_employees_count < filters.employeeCountMin) {
					return;
				}
			}
			
			if (filters?.employeeCountMax !== undefined && job.company_employees_count !== null) {
				const maxCount = filters.employeeCountMax >= 100 ? Infinity : filters.employeeCountMax;
				if (job.company_employees_count > maxCount) {
					return;
				}
			}
			
			// Apply local filter (from the search-specific filter input)
			if (filterText && !companyName.toLowerCase().includes(filterText.toLowerCase())) {
				return;
			}
			
			if (!companyMap.has(companyName)) {
				companyMap.set(companyName, []);
			}
			companyMap.get(companyName)!.push(job);
		});

		// Convert to array
		let companyGroups = Array.from(companyMap.entries())
			.map(([companyName, jobs]) => ({ 
				companyName, 
				jobs,
				jobCount: jobs.length,
				companySize: jobs[0]?.company_employees_count || 0
			}));

		// Apply sorting based on global filter
		const sortBy = filters?.sortBy || "job_count";
		
		if (sortBy === "company_name") {
			companyGroups.sort((a, b) => a.companyName.localeCompare(b.companyName));
		} else if (sortBy === "company_size") {
			companyGroups.sort((a, b) => {
				const sizeA = a.companySize || 0;
				const sizeB = b.companySize || 0;
				return sizeB - sizeA;
			});
		} else {
			// Default: sort by job count
			companyGroups.sort((a, b) => {
				if (b.jobCount !== a.jobCount) {
					return b.jobCount - a.jobCount;
				}
				return a.companyName.localeCompare(b.companyName);
			});
		}

		return companyGroups.map(({ companyName, jobs }) => ({ companyName, jobs }));
	};

	const handleCompanyPageChange = (searchId: number, newPage: number) => {
		setCompanyPage((prev) => ({ ...prev, [searchId]: newPage }));
	};

	return (
		<Accordion 
			type="single" 
			collapsible 
			className="w-full"
			value={expandedSearch || undefined}
			onValueChange={handleAccordionChange}
		>
			{searches.map((searchWithJobs) => {
				const { search } = searchWithJobs;
				const jobs = allJobsForSearch[search.id] || [];
				const isLoadingJobs = loadingJobs[search.id] || false;
				const filterText = companyFilter[search.id] || "";
				const companyGroups = groupJobsByCompany(jobs, filterText);
				const totalCompanies = groupJobsByCompany(jobs, "").length;
				const isExpanded = expandedSearch === `search-${search.id}`;
				
				// Pagination
				const currentPage = companyPage[search.id] || 1;
				const totalPages = Math.ceil(companyGroups.length / companiesPerPage);
				const startIndex = (currentPage - 1) * companiesPerPage;
				const endIndex = startIndex + companiesPerPage;
				const paginatedCompanyGroups = companyGroups.slice(startIndex, endIndex);

				return (
					<AccordionItem
						key={search.id}
						value={`search-${search.id}`}
					>
						<AccordionTrigger className="hover:no-underline">
							<div className="flex items-center justify-between w-full pr-4">
								<div className="flex items-center gap-3">
									<div className="bg-primary/10 p-2 rounded-lg">
										<SearchIcon className="h-5 w-5 text-primary" />
									</div>
									<div className="text-left">
										<div className="font-semibold text-lg">
											{search.search_term}
										</div>
										<div className="text-sm text-muted-foreground">
											{search.job_count.toLocaleString()} jobs • {totalCompanies} companies • {search.source}
										</div>
									</div>
								</div>
								<Badge variant="outline">
									{new Date(search.created_at).toLocaleDateString()}
								</Badge>
							</div>
						</AccordionTrigger>
						<AccordionContent>
							<div className="space-y-4 pt-4">
								{/* Company Filter */}
								{isExpanded && (
									<div className="flex items-center gap-2 pb-4 border-b">
										<Filter className="h-4 w-4 text-muted-foreground" />
										<div className="flex-1 relative">
											<Input
												placeholder="Filter by company name..."
												value={filterText}
												onChange={(e) => {
													setCompanyFilter((prev) => ({ 
														...prev, 
														[search.id]: e.target.value 
													}));
													// Reset to page 1 when filter changes
													setCompanyPage((prev) => ({ ...prev, [search.id]: 1 }));
												}}
												className="pr-8"
											/>
											{filterText && (
												<Button
													variant="ghost"
													size="sm"
													className="absolute right-0 top-0 h-full px-2"
													onClick={() => 
														setCompanyFilter((prev) => ({ 
															...prev, 
															[search.id]: "" 
														}))
													}
												>
													<X className="h-4 w-4" />
												</Button>
											)}
										</div>
										{filterText && (
											<span className="text-sm text-muted-foreground">
												{companyGroups.length} of {totalCompanies}
											</span>
										)}
									</div>
								)}

								{/* Loading State */}
								{isLoadingJobs ? (
									<div className="flex items-center justify-center py-12">
										<div className="text-center space-y-2">
											<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
											<p className="text-sm text-muted-foreground">Loading jobs...</p>
										</div>
									</div>
								) : companyGroups.length === 0 ? (
									<div className="flex items-center justify-center py-12">
										<div className="text-center space-y-2">
											<Building2 className="h-12 w-12 mx-auto text-muted-foreground" />
											<p className="text-lg font-medium">No companies found</p>
											<p className="text-sm text-muted-foreground">
												{filterText ? "Try adjusting your filter" : "No companies available for this search"}
											</p>
										</div>
									</div>
								) : (
									<>
										<div className="space-y-4">
											{paginatedCompanyGroups.map((group) => {
												const companyWebsite = group.jobs[0]?.company_website;
												const contactsCount = companyWebsite ? (companyContactsCount[companyWebsite] || 0) : 0;
												
												return (
													<CompanyJobsGroup
														key={group.companyName}
														companyName={group.companyName}
														jobs={group.jobs}
														searchTerm={search.search_term}
														contactsCount={contactsCount}
														onContactsFetched={async () => {
															// Refresh contacts count after fetching
															const jobs = allJobsForSearch[search.id] || [];
															await fetchContactsCount(jobs);
														}}
													/>
												);
											})}
										</div>

										{/* Company Pagination Controls */}
										{totalPages > 1 && (
											<div className="flex items-center justify-between pt-4 border-t mt-4">
												<div className="text-sm text-muted-foreground">
													Showing {startIndex + 1}-{Math.min(endIndex, companyGroups.length)} of {companyGroups.length} companies
												</div>
												
												<div className="flex items-center gap-2">
													<Button
														variant="outline"
														size="sm"
														onClick={() => handleCompanyPageChange(search.id, currentPage - 1)}
														disabled={currentPage === 1}
													>
														<ChevronLeft className="h-4 w-4 mr-1" />
														Previous
													</Button>

													<div className="flex items-center gap-1">
														{Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
															// Show first page, last page, and pages around current page
															if (totalPages <= 7) {
																return i + 1;
															}
															
															if (i === 0) return 1;
															if (i === 6) return totalPages;
															
															if (currentPage <= 4) {
																return i + 1;
															} else if (currentPage >= totalPages - 3) {
																return totalPages - 6 + i;
															} else {
																return currentPage - 3 + i;
															}
														}).map((page, idx) => (
															<Button
																key={idx}
																variant={currentPage === page ? "default" : "outline"}
																size="sm"
																onClick={() => handleCompanyPageChange(search.id, page)}
																className="min-w-[36px]"
															>
																{page}
															</Button>
														))}
													</div>

													<Button
														variant="outline"
														size="sm"
														onClick={() => handleCompanyPageChange(search.id, currentPage + 1)}
														disabled={currentPage === totalPages}
													>
														Next
														<ChevronRight className="h-4 w-4 ml-1" />
													</Button>
												</div>
											</div>
										)}
									</>
								)}
							</div>
						</AccordionContent>
					</AccordionItem>
				);
			})}
		</Accordion>
	);
}


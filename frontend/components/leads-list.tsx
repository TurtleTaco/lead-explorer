"use client";

import { useState, useEffect } from "react";
import { CompanyLead, LeadsFilters } from "@/lib/api/leads-data";
import { getLeadsForSearch, getLeadsCountForSearch } from "@/lib/api/leads-data";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
	Users, 
	Briefcase, 
	Mail, 
	MapPin, 
	Calendar, 
	ExternalLink,
	Phone,
	Linkedin
} from "lucide-react";
import {
	Accordion as InnerAccordion,
	AccordionContent as InnerAccordionContent,
	AccordionItem as InnerAccordionItem,
	AccordionTrigger as InnerAccordionTrigger,
} from "@/components/ui/accordion";
import { ContactCard } from "@/components/contact-card";
import { CompanyCardWithFetch } from "@/components/company-card-with-fetch";

interface LeadsListProps {
	searchId: number;
	initialLeads: CompanyLead[];
	totalCount: number;
	filters?: LeadsFilters;
}

export function LeadsList({ searchId, initialLeads, totalCount, filters }: LeadsListProps) {
	const [leads, setLeads] = useState<CompanyLead[]>(initialLeads);
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(5);
	const [isLoading, setIsLoading] = useState(false);
	const [filteredCount, setFilteredCount] = useState(totalCount);

	const totalPages = Math.ceil(filteredCount / pageSize);

	// Format company size
	const formatCompanySize = (size: number | null) => {
		if (!size) return "Unknown";
		if (size < 50) return "1-49 employees";
		if (size < 200) return "50-199 employees";
		if (size < 500) return "200-499 employees";
		if (size < 1000) return "500-999 employees";
		return "1000+ employees";
	};

	// Fetch lead count when filters change
	useEffect(() => {
		const fetchCount = async () => {
			const count = await getLeadsCountForSearch(searchId, filters);
			setFilteredCount(count);
			setCurrentPage(1);
		};

		fetchCount();
	}, [searchId, filters]);

	// Fetch leads when page, page size, or filters change
	useEffect(() => {
		const fetchLeads = async () => {
			setIsLoading(true);
			const offset = (currentPage - 1) * pageSize;
			const newLeads = await getLeadsForSearch(searchId, pageSize, offset, filters);
			setLeads(newLeads);
			setIsLoading(false);
		};

		fetchLeads();
	}, [currentPage, pageSize, searchId, filters]);

	const handlePageSizeChange = (value: string) => {
		setPageSize(Number(value));
		setCurrentPage(1);
	};

	const goToPage = (page: number) => {
		if (page >= 1 && page <= totalPages) {
			setCurrentPage(page);
		}
	};

	// Calculate page numbers to show
	const getPageNumbers = () => {
		const pages: (number | string)[] = [];
		const showPages = 5;

		if (totalPages <= showPages) {
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			pages.push(1);

			if (currentPage > 3) {
				pages.push("...");
			}

			const start = Math.max(2, currentPage - 1);
			const end = Math.min(totalPages - 1, currentPage + 1);

			for (let i = start; i <= end; i++) {
				pages.push(i);
			}

			if (currentPage < totalPages - 2) {
				pages.push("...");
			}

			pages.push(totalPages);
		}

		return pages;
	};

	return (
		<div className="space-y-4">
			{/* Page Size Selector and Info */}
			<div className="flex items-center justify-between border-b pb-3">
				<div className="flex items-center gap-2">
					<span className="text-sm text-muted-foreground">Show:</span>
					<Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
						<SelectTrigger className="w-[80px]">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="5">5</SelectItem>
							<SelectItem value="10">10</SelectItem>
							<SelectItem value="20">20</SelectItem>
						</SelectContent>
					</Select>
					<span className="text-sm text-muted-foreground">companies per page</span>
				</div>

				<div className="text-sm text-muted-foreground">
					Showing {filteredCount > 0 ? (currentPage - 1) * pageSize + 1 : 0}-
					{Math.min(currentPage * pageSize, filteredCount)} of{" "}
					{filteredCount.toLocaleString()} companies
				</div>
			</div>

			{/* Leads List */}
			{isLoading ? (
				<div className="flex items-center justify-center py-12">
					<div className="text-center space-y-2">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
						<p className="text-sm text-muted-foreground">Loading companies...</p>
					</div>
				</div>
			) : leads.length === 0 ? (
				<div className="flex items-center justify-center py-12">
					<div className="text-center space-y-2">
						<p className="text-lg font-medium">No companies found</p>
						<p className="text-sm text-muted-foreground">
							Try adjusting your filters
						</p>
					</div>
				</div>
			) : (
				<div className="space-y-4">
					{leads.map((lead, idx) => (
						<Card key={idx} className="border-2">
							<CardHeader>
								<div className="flex items-start justify-between gap-4">
									<div className="flex items-start gap-4 flex-1">
										{lead.company_logo && (
											<Avatar className="h-16 w-16">
												<AvatarImage src={lead.company_logo} alt={lead.company_name} />
												<AvatarFallback>
													{lead.company_name.substring(0, 2).toUpperCase()}
												</AvatarFallback>
											</Avatar>
										)}
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2 mb-1">
												<CardTitle className="text-xl">
													{lead.company_name}
												</CardTitle>
												{lead.company_website && (
													<a
														href={lead.company_website}
														target="_blank"
														rel="noopener noreferrer"
														className="text-muted-foreground hover:text-primary"
													>
														<ExternalLink className="h-4 w-4" />
													</a>
												)}
											</div>
											<div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
												{lead.company_employees_count && (
													<div className="flex items-center gap-1">
														<Users className="h-3 w-3" />
														{formatCompanySize(lead.company_employees_count)}
													</div>
												)}
												{lead.location && (
													<div className="flex items-center gap-1">
														<MapPin className="h-3 w-3" />
														{lead.location}
													</div>
												)}
												{lead.industries && (
													<Badge variant="outline" className="text-xs">
														{lead.industries}
													</Badge>
												)}
											</div>
											{lead.company_description && (
												<p className="text-sm text-muted-foreground mt-2 line-clamp-2">
													{lead.company_description}
												</p>
											)}
										</div>
									</div>
									<div className="text-right space-y-1">
										<div className="text-2xl font-bold">{lead.job_count}</div>
										<div className="text-xs text-muted-foreground">
											Open Positions
										</div>
										{lead.contacts.length > 0 && (
											<Badge variant="secondary" className="mt-2">
												{lead.contacts.length} Contact{lead.contacts.length > 1 ? "s" : ""}
											</Badge>
										)}
									</div>
								</div>
								{/* Fetch Contacts Button */}
								{lead.company_website && (
									<div className="mt-3">
										<CompanyCardWithFetch
											company_website={lead.company_website}
											company_name={lead.company_name}
										/>
									</div>
								)}
							</CardHeader>

							<CardContent>
								<InnerAccordion type="single" collapsible className="w-full">
									{/* Contacts Section */}
									{lead.contacts.length > 0 && (
										<InnerAccordionItem value="contacts">
											<InnerAccordionTrigger className="hover:no-underline">
												<div className="flex items-center gap-2">
													<Users className="h-4 w-4" />
													<span className="font-semibold">
														Key Contacts ({lead.contacts.length})
													</span>
												</div>
											</InnerAccordionTrigger>
											<InnerAccordionContent>
												<div className="grid grid-cols-1 lg:grid-cols-2 gap-3 pt-2">
													{lead.contacts.map((contact, cIdx) => (
														<ContactCard key={cIdx} contact={contact} />
													))}
												</div>
											</InnerAccordionContent>
										</InnerAccordionItem>
									)}

									{/* Jobs Section */}
									<InnerAccordionItem value="jobs">
										<InnerAccordionTrigger className="hover:no-underline">
											<div className="flex items-center gap-2">
												<Briefcase className="h-4 w-4" />
												<span className="font-semibold">
													Open Positions ({lead.job_count})
												</span>
											</div>
										</InnerAccordionTrigger>
										<InnerAccordionContent>
											<div className="space-y-2 pt-2">
												{lead.jobs.slice(0, 10).map((job, jIdx) => (
													<div
														key={jIdx}
														className="flex items-start justify-between gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
													>
														<div className="flex-1 min-w-0">
															<h5 className="font-medium text-sm mb-1">
																{job.title}
															</h5>
															<div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
																{job.location && (
																	<span className="flex items-center gap-1">
																		<MapPin className="h-3 w-3" />
																		{job.location}
																	</span>
																)}
																{job.employment_type && (
																	<Badge variant="outline" className="text-xs h-5">
																		{job.employment_type}
																	</Badge>
																)}
																{job.seniority_level && (
																	<Badge variant="outline" className="text-xs h-5">
																		{job.seniority_level}
																	</Badge>
																)}
																{job.posted_at && (
																	<span className="flex items-center gap-1">
																		<Calendar className="h-3 w-3" />
																		{new Date(job.posted_at).toLocaleDateString()}
																	</span>
																)}
															</div>
														</div>
														{job.link && (
															<Button size="sm" variant="outline" asChild>
																<a
																	href={job.link}
																	target="_blank"
																	rel="noopener noreferrer"
																>
																	View Job
																</a>
															</Button>
														)}
													</div>
												))}
												{lead.jobs.length > 10 && (
													<p className="text-sm text-muted-foreground text-center py-2">
														And {lead.jobs.length - 10} more positions...
													</p>
												)}
											</div>
										</InnerAccordionContent>
									</InnerAccordionItem>
								</InnerAccordion>
							</CardContent>
						</Card>
					))}
				</div>
			)}

			{/* Pagination Controls */}
			{totalPages > 1 && (
				<div className="flex items-center justify-center gap-2 pt-4 border-t">
					{/* First Page */}
					<Button
						variant="outline"
						size="icon"
						onClick={() => goToPage(1)}
						disabled={currentPage === 1 || isLoading}
						aria-label="First page"
					>
						<ChevronsLeft className="h-4 w-4" />
					</Button>

					{/* Previous Page */}
					<Button
						variant="outline"
						size="icon"
						onClick={() => goToPage(currentPage - 1)}
						disabled={currentPage === 1 || isLoading}
						aria-label="Previous page"
					>
						<ChevronLeft className="h-4 w-4" />
					</Button>

					{/* Page Numbers */}
					<div className="flex items-center gap-1">
						{getPageNumbers().map((page, idx) =>
							page === "..." ? (
								<span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">
									...
								</span>
							) : (
								<Button
									key={page}
									variant={currentPage === page ? "default" : "outline"}
									size="sm"
									onClick={() => goToPage(page as number)}
									disabled={isLoading}
									className="min-w-[40px]"
								>
									{page}
								</Button>
							)
						)}
					</div>

					{/* Next Page */}
					<Button
						variant="outline"
						size="icon"
						onClick={() => goToPage(currentPage + 1)}
						disabled={currentPage === totalPages || isLoading}
						aria-label="Next page"
					>
						<ChevronRight className="h-4 w-4" />
					</Button>

					{/* Last Page */}
					<Button
						variant="outline"
						size="icon"
						onClick={() => goToPage(totalPages)}
						disabled={currentPage === totalPages || isLoading}
						aria-label="Last page"
					>
						<ChevronsRight className="h-4 w-4" />
					</Button>
				</div>
			)}
		</div>
	);
}


"use client";

import { useState, useEffect } from "react";
import { Job, Search } from "@/lib/supabase";
import { JobCard } from "./job-card";
import { Button } from "./ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { getJobsForSearch, getJobCountForSearch } from "@/lib/api/jobs-data";

interface SearchResultsProps {
	search: Search;
	initialJobs: Job[];
	totalJobCount: number;
	companyFilter?: string[];
}

export function SearchResults({ search, initialJobs, totalJobCount, companyFilter }: SearchResultsProps) {
	const [jobs, setJobs] = useState<Job[]>(initialJobs);
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [isLoading, setIsLoading] = useState(false);
	const [filteredJobCount, setFilteredJobCount] = useState(totalJobCount);

	const totalPages = Math.ceil(filteredJobCount / pageSize);

	// Fetch job count when company filter changes
	useEffect(() => {
		const fetchJobCount = async () => {
			const count = await getJobCountForSearch(search.id, companyFilter);
			setFilteredJobCount(count);
			setCurrentPage(1); // Reset to first page when filter changes
		};

		fetchJobCount();
	}, [companyFilter, search.id]);

	// Fetch jobs when page, page size, or company filter changes
	useEffect(() => {
		const fetchJobs = async () => {
			setIsLoading(true);
			const offset = (currentPage - 1) * pageSize;
			const newJobs = await getJobsForSearch(search.id, pageSize, offset, companyFilter);
			setJobs(newJobs);
			setIsLoading(false);
		};

		fetchJobs();
	}, [currentPage, pageSize, search.id, companyFilter]);

	const handlePageSizeChange = (value: string) => {
		setPageSize(Number(value));
		setCurrentPage(1); // Reset to first page when changing page size
	};

	const goToPage = (page: number) => {
		if (page >= 1 && page <= totalPages) {
			setCurrentPage(page);
		}
	};

	// Calculate page numbers to show
	const getPageNumbers = () => {
		const pages: (number | string)[] = [];
		const showPages = 5; // Number of page buttons to show

		if (totalPages <= showPages) {
			// Show all pages
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			// Always show first page
			pages.push(1);

			if (currentPage > 3) {
				pages.push("...");
			}

			// Show pages around current page
			const start = Math.max(2, currentPage - 1);
			const end = Math.min(totalPages - 1, currentPage + 1);

			for (let i = start; i <= end; i++) {
				pages.push(i);
			}

			if (currentPage < totalPages - 2) {
				pages.push("...");
			}

			// Always show last page
			pages.push(totalPages);
		}

		return pages;
	};

	return (
		<div className="space-y-4 pt-4">
			{/* Page Size Selector and Info */}
			<div className="flex items-center justify-between border-b pb-3">
				<div className="flex items-center gap-2">
					<span className="text-sm text-muted-foreground">Show:</span>
					<Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
						<SelectTrigger className="w-[80px]">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="10">10</SelectItem>
							<SelectItem value="20">20</SelectItem>
							<SelectItem value="30">30</SelectItem>
						</SelectContent>
					</Select>
					<span className="text-sm text-muted-foreground">jobs per page</span>
				</div>

				<div className="text-sm text-muted-foreground">
					Showing {filteredJobCount > 0 ? (currentPage - 1) * pageSize + 1 : 0}-
					{Math.min(currentPage * pageSize, filteredJobCount)} of{" "}
					{filteredJobCount.toLocaleString()} jobs
					{companyFilter && companyFilter.length > 0 && (
						<span className="ml-1">(filtered)</span>
					)}
				</div>
			</div>

			{/* Job List */}
			{isLoading ? (
				<div className="flex items-center justify-center py-12">
					<div className="text-center space-y-2">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
						<p className="text-sm text-muted-foreground">Loading jobs...</p>
					</div>
				</div>
			) : jobs.length === 0 ? (
				<div className="flex items-center justify-center py-12">
					<div className="text-center space-y-2">
						<p className="text-lg font-medium">No jobs found</p>
						<p className="text-sm text-muted-foreground">
							{companyFilter && companyFilter.length > 0 
								? "Try adjusting your company filters"
								: "No jobs available for this search"}
						</p>
					</div>
				</div>
			) : (
				<div className="space-y-4">
					{jobs.map((job) => (
						<JobCard key={job.id} job={job} searchTerm={search.search_term} />
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


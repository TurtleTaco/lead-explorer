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
import { SearchResults } from "@/components/search-results";
import { CompanyFilter } from "@/components/company-filter";
import { getCompanyNamesForSearch } from "@/lib/api/jobs-data";
import { Search as SearchIcon } from "lucide-react";

interface JobSearchAccordionProps {
	searches: SearchWithJobs[];
}

export function JobSearchAccordion({ searches }: JobSearchAccordionProps) {
	const [selectedCompanies, setSelectedCompanies] = useState<Record<number, string[]>>({});
	const [companyLists, setCompanyLists] = useState<Record<number, string[]>>({});
	const [loadingCompanies, setLoadingCompanies] = useState<Record<number, boolean>>({});

	// Fetch company names when accordion item is opened
	const handleAccordionChange = async (searchId: number) => {
		// If we already have the company list, don't fetch again
		if (companyLists[searchId]) return;

		setLoadingCompanies((prev) => ({ ...prev, [searchId]: true }));
		const companies = await getCompanyNamesForSearch(searchId);
		setCompanyLists((prev) => ({ ...prev, [searchId]: companies }));
		setLoadingCompanies((prev) => ({ ...prev, [searchId]: false }));
	};

	const handleCompanySelectionChange = (searchId: number, companies: string[]) => {
		setSelectedCompanies((prev) => ({
			...prev,
			[searchId]: companies,
		}));
	};

	return (
		<Accordion type="single" collapsible className="w-full">
			{searches.map((searchWithJobs) => {
				const { search, jobs } = searchWithJobs;
				const companies = companyLists[search.id] || [];
				const isLoadingCompanies = loadingCompanies[search.id] || false;
				const selectedForSearch = selectedCompanies[search.id] || [];

				return (
					<AccordionItem
						key={search.id}
						value={`search-${search.id}`}
					>
						<AccordionTrigger 
							className="hover:no-underline"
							onClick={() => handleAccordionChange(search.id)}
						>
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
											{search.job_count.toLocaleString()} jobs • {search.source}
											{selectedForSearch.length > 0 && (
												<span className="ml-1">
													• {selectedForSearch.length} {selectedForSearch.length === 1 ? "company" : "companies"} filtered
												</span>
											)}
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
								{isLoadingCompanies ? (
									<div className="text-sm text-muted-foreground">
										Loading companies...
									</div>
								) : companies.length > 0 ? (
									<div className="pb-4 border-b">
										<CompanyFilter
											companies={companies}
											selectedCompanies={selectedForSearch}
											onSelectionChange={(companies) =>
												handleCompanySelectionChange(search.id, companies)
											}
										/>
									</div>
								) : null}

								{/* Search Results */}
								<SearchResults
									search={search}
									initialJobs={jobs.slice(0, 10)}
									totalJobCount={search.job_count}
									companyFilter={selectedForSearch.length > 0 ? selectedForSearch : undefined}
								/>
							</div>
						</AccordionContent>
					</AccordionItem>
				);
			})}
		</Accordion>
	);
}


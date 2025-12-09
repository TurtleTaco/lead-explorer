"use client";

import { useState } from "react";
import { SearchWithLeads } from "@/lib/api/leads-data";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Search as SearchIcon } from "lucide-react";
import { LeadsList } from "@/components/leads-list";

interface LeadsAccordionProps {
	searchesWithLeads: SearchWithLeads[];
	orgId: string;
	filters?: any;
}

export function LeadsAccordion({ searchesWithLeads, orgId, filters }: LeadsAccordionProps) {
	return (
		<Accordion type="single" collapsible className="w-full space-y-2">
			{searchesWithLeads.map((searchWithLeads) => {
				const { search, leads, total_companies, total_jobs } = searchWithLeads;

				return (
					<AccordionItem
						key={search.id}
						value={`search-${search.id}`}
						className="border rounded-lg px-4"
					>
						<AccordionTrigger className="hover:no-underline py-4">
							<div className="flex items-center justify-between w-full pr-4">
								<div className="flex items-center gap-3">
									<div className="bg-primary/10 p-3 rounded-lg">
										<SearchIcon className="h-5 w-5 text-primary" />
									</div>
									<div className="text-left">
										<div className="font-semibold text-lg">
											{search.search_term}
										</div>
										<div className="text-sm text-muted-foreground">
											{total_companies} {total_companies === 1 ? "company" : "companies"} •{" "}
											{total_jobs} {total_jobs === 1 ? "job" : "jobs"}
										</div>
									</div>
								</div>
								<Badge variant="outline">
									{new Date(search.created_at).toLocaleDateString()}
								</Badge>
							</div>
						</AccordionTrigger>
						<AccordionContent className="pt-4 pb-6">
							<LeadsList
								searchId={search.id}
								initialLeads={leads}
								totalCount={total_companies}
								filters={filters}
							/>
						</AccordionContent>
					</AccordionItem>
				);
			})}
		</Accordion>
	);
}


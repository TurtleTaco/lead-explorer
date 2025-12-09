"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Search, X, Filter, ChevronDown } from "lucide-react";

interface ContactsFilterProps {
	filterOptions: {
		seniorities: string[];
		industries: string[];
		locations: string[];
	};
	orgId: string;
	totalContacts: number;
}

export function ContactsFilter({ filterOptions, orgId, totalContacts }: ContactsFilterProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isPending, startTransition] = useTransition();
	const [isOpen, setIsOpen] = useState(true);

	const [search, setSearch] = useState(searchParams.get("search") || "");
	const [seniority, setSeniority] = useState(searchParams.get("seniority") || "all");
	const [industry, setIndustry] = useState(searchParams.get("industry") || "all");
	const [location, setLocation] = useState(searchParams.get("location") || "all");
	const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "name");
	const [hasEmail, setHasEmail] = useState(searchParams.get("hasEmail") === "true");
	const [hasPhone, setHasPhone] = useState(searchParams.get("hasPhone") === "true");

	const applyFilters = () => {
		const params = new URLSearchParams();

		if (search) params.set("search", search);
		if (seniority && seniority !== "all") params.set("seniority", seniority);
		if (industry && industry !== "all") params.set("industry", industry);
		if (location && location !== "all") params.set("location", location);
		if (sortBy) params.set("sortBy", sortBy);
		if (hasEmail) params.set("hasEmail", "true");
		if (hasPhone) params.set("hasPhone", "true");

		startTransition(() => {
			router.push(`/dashboard/org/${orgId}/contacts?${params.toString()}`);
		});
	};

	const clearFilters = () => {
		setSearch("");
		setSeniority("all");
		setIndustry("all");
		setLocation("all");
		setSortBy("name");
		setHasEmail(false);
		setHasPhone(false);

		startTransition(() => {
			router.push(`/dashboard/org/${orgId}/contacts`);
		});
	};

	const hasActiveFilters = 
		search || 
		(seniority && seniority !== "all") || 
		(industry && industry !== "all") || 
		(location && location !== "all") || 
		hasEmail || 
		hasPhone;

	return (
		<Collapsible open={isOpen} onOpenChange={setIsOpen}>
			<Card>
				<CardHeader className="pb-3">
					<div className="flex items-center justify-between">
						<CollapsibleTrigger className="flex items-center gap-2 hover:opacity-70 transition-opacity">
							<Filter className="h-4 w-4" />
							<CardTitle className="text-base">Filters & Search</CardTitle>
							<ChevronDown
								className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
							/>
						</CollapsibleTrigger>
						<div className="flex items-center gap-2">
							{hasActiveFilters && (
								<Button variant="ghost" size="sm" onClick={clearFilters}>
									<X className="h-3 w-3 mr-1" />
									Clear
								</Button>
							)}
						</div>
					</div>
				</CardHeader>
				<CollapsibleContent>
					<CardContent className="space-y-4 pt-2">
						{/* Search Input */}
						<div className="space-y-1.5">
							<Label htmlFor="search" className="text-xs">
								Search Contacts
							</Label>
							<div className="relative">
								<Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
								<Input
									id="search"
									placeholder="Name, email, company, job title..."
									value={search}
									onChange={(e) => setSearch(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											applyFilters();
										}
									}}
									className="pl-8 h-9 text-sm"
								/>
							</div>
						</div>

						{/* Filter Row 1: Seniority, Industry, Location */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
							{/* Seniority Filter */}
							<div className="space-y-1.5">
								<Label htmlFor="seniority" className="text-xs">
									Seniority Level
								</Label>
								<Select value={seniority} onValueChange={setSeniority}>
									<SelectTrigger id="seniority" className="h-9 text-sm">
										<SelectValue placeholder="All Levels" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Levels</SelectItem>
										{filterOptions.seniorities.map((sen, idx) => (
											<SelectItem key={`seniority-${idx}`} value={sen}>
												{sen}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							{/* Industry Filter */}
							<div className="space-y-1.5">
								<Label htmlFor="industry" className="text-xs">
									Industry
								</Label>
								<Select value={industry} onValueChange={setIndustry}>
									<SelectTrigger id="industry" className="h-9 text-sm">
										<SelectValue placeholder="All Industries" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Industries</SelectItem>
										{filterOptions.industries.map((ind, idx) => (
											<SelectItem key={`industry-${idx}`} value={ind}>
												{ind}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							{/* Location Filter */}
							<div className="space-y-1.5">
								<Label htmlFor="location" className="text-xs">
									Location
								</Label>
								<Select value={location} onValueChange={setLocation}>
									<SelectTrigger id="location" className="h-9 text-sm">
										<SelectValue placeholder="All Locations" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Locations</SelectItem>
										{filterOptions.locations.map((loc, idx) => (
											<SelectItem key={`location-${idx}`} value={loc}>
												{loc}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>

						{/* Filter Row 2: Sort and Toggles */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
							{/* Sort By */}
							<div className="space-y-1.5">
								<Label htmlFor="sort" className="text-xs">
									Sort By
								</Label>
								<Select value={sortBy} onValueChange={setSortBy}>
									<SelectTrigger id="sort" className="h-9 text-sm">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="name">Most Contacts</SelectItem>
										<SelectItem value="company">Company (A-Z)</SelectItem>
										<SelectItem value="recent">Recent Jobs</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{/* Has Email Toggle */}
							<div className="flex items-center justify-between space-x-2 h-9 px-3 rounded-md border bg-background">
								<Label htmlFor="has-email" className="cursor-pointer text-xs">
									Has email
								</Label>
								<Switch
									id="has-email"
									checked={hasEmail}
									onCheckedChange={setHasEmail}
								/>
							</div>

							{/* Has Phone Toggle */}
							<div className="flex items-center justify-between space-x-2 h-9 px-3 rounded-md border bg-background">
								<Label htmlFor="has-phone" className="cursor-pointer text-xs">
									Has phone
								</Label>
								<Switch
									id="has-phone"
									checked={hasPhone}
									onCheckedChange={setHasPhone}
								/>
							</div>
						</div>

						{/* Apply Button */}
						<Button
							onClick={applyFilters}
							className="w-full h-9"
							disabled={isPending}
							size="sm"
						>
							{isPending ? "Applying..." : "Apply Filters"}
						</Button>
					</CardContent>
				</CollapsibleContent>
			</Card>
		</Collapsible>
	);
}


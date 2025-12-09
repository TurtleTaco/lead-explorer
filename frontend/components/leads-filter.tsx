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
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Search, SlidersHorizontal, X, Filter, ChevronDown } from "lucide-react";

interface LeadsFilterProps {
	industries: string[];
	orgId: string;
}

export function LeadsFilter({ industries, orgId }: LeadsFilterProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isPending, startTransition] = useTransition();
	const [isOpen, setIsOpen] = useState(true);

	const [companyName, setCompanyName] = useState(searchParams.get("companyName") || "");
	const [industry, setIndustry] = useState(searchParams.get("industry") || "all");
	const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "job_count");
	const [hasContacts, setHasContacts] = useState(searchParams.get("hasContacts") === "true");
	const [employeeCount, setEmployeeCount] = useState<number[]>([
		parseInt(searchParams.get("employeeCountMin") || "0"),
		parseInt(searchParams.get("employeeCountMax") || "100"),
	]);

	const applyFilters = () => {
		const params = new URLSearchParams();
		
		if (companyName) params.set("companyName", companyName);
		if (industry && industry !== "all") params.set("industry", industry);
		if (sortBy) params.set("sortBy", sortBy);
		if (hasContacts) params.set("hasContacts", "true");
		if (employeeCount[0] > 0) params.set("employeeCountMin", employeeCount[0].toString());
		if (employeeCount[1] < 100) params.set("employeeCountMax", employeeCount[1].toString());

		startTransition(() => {
			router.push(`/dashboard/org/${orgId}/leads?${params.toString()}`);
		});
	};

	const clearFilters = () => {
		setCompanyName("");
		setIndustry("all");
		setSortBy("job_count");
		setHasContacts(false);
		setEmployeeCount([0, 100]);
		
		startTransition(() => {
			router.push(`/dashboard/org/${orgId}/leads`);
		});
	};

	const hasActiveFilters = companyName || (industry && industry !== "all") || hasContacts || employeeCount[0] > 0 || employeeCount[1] < 100;

	const formatEmployeeCount = (count: number) => {
		if (count >= 100) return "100+";
		return count.toString();
	};

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
				{/* Top Row: Search and Industry */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
					{/* Company Name Search */}
					<div className="space-y-1.5">
						<Label htmlFor="company-search" className="text-xs">Search Company</Label>
						<div className="relative">
							<Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
							<Input
								id="company-search"
								placeholder="Company name..."
								value={companyName}
								onChange={(e) => setCompanyName(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										applyFilters();
									}
								}}
								className="pl-8 h-9 text-sm"
							/>
						</div>
					</div>

					{/* Industry Filter */}
					<div className="space-y-1.5">
						<Label htmlFor="industry" className="text-xs">Industry</Label>
						<Select value={industry} onValueChange={setIndustry}>
							<SelectTrigger id="industry" className="h-9 text-sm">
								<SelectValue placeholder="All Industries" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Industries</SelectItem>
								{industries.filter(Boolean).map((ind, idx) => (
									<SelectItem key={`industry-${idx}-${ind}`} value={ind}>
										{ind}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>

				{/* Employee Count Slider */}
				<div className="space-y-2">
					<Label className="text-xs">Company Size: {formatEmployeeCount(employeeCount[0])} - {formatEmployeeCount(employeeCount[1])} employees</Label>
					<Slider
						value={employeeCount}
						onValueChange={setEmployeeCount}
						min={0}
						max={100}
						step={5}
						className="w-full"
					/>
				</div>

				{/* Bottom Row: Sort and Contacts Toggle */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
					{/* Sort By */}
					<div className="space-y-1.5">
						<Label htmlFor="sort" className="text-xs">Sort By</Label>
						<Select value={sortBy} onValueChange={setSortBy}>
							<SelectTrigger id="sort" className="h-9 text-sm">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="job_count">Most Jobs</SelectItem>
								<SelectItem value="company_size">Company Size</SelectItem>
								<SelectItem value="company_name">Company Name (A-Z)</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Has Contacts Toggle */}
					<div className="flex items-center justify-between space-x-2 h-9 px-3 rounded-md border bg-background">
						<Label htmlFor="has-contacts" className="cursor-pointer text-xs">
							With contacts only
						</Label>
						<Switch
							id="has-contacts"
							checked={hasContacts}
							onCheckedChange={setHasContacts}
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


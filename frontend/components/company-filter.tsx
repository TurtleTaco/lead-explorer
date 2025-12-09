"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Building2, X, Search } from "lucide-react";

interface CompanyFilterProps {
	companies: string[];
	selectedCompanies: string[];
	onSelectionChange: (companies: string[]) => void;
}

export function CompanyFilter({ 
	companies, 
	selectedCompanies, 
	onSelectionChange 
}: CompanyFilterProps) {
	const [searchTerm, setSearchTerm] = useState("");
	const [open, setOpen] = useState(false);

	// Filter companies based on search term
	const filteredCompanies = useMemo(() => {
		if (!searchTerm) return companies;
		return companies.filter((company) =>
			company.toLowerCase().includes(searchTerm.toLowerCase())
		);
	}, [companies, searchTerm]);

	const toggleCompany = (company: string) => {
		if (selectedCompanies.includes(company)) {
			onSelectionChange(selectedCompanies.filter((c) => c !== company));
		} else {
			onSelectionChange([...selectedCompanies, company]);
		}
	};

	const clearSelection = () => {
		onSelectionChange([]);
	};

	const selectAll = () => {
		onSelectionChange(filteredCompanies);
	};

	const removeCompany = (company: string, e: React.MouseEvent) => {
		e.stopPropagation();
		onSelectionChange(selectedCompanies.filter((c) => c !== company));
	};

	return (
		<div className="space-y-2">
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button 
						variant="outline" 
						className="w-full justify-start text-left font-normal"
					>
						<Building2 className="mr-2 h-4 w-4 shrink-0" />
						<span className="truncate">
							{selectedCompanies.length === 0
								? "Filter by company..."
								: `${selectedCompanies.length} ${selectedCompanies.length === 1 ? "company" : "companies"} selected`}
						</span>
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-[400px] p-0" align="start">
					<div className="p-3 space-y-2 border-b">
						<div className="relative">
							<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search companies..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-8"
							/>
						</div>
						<div className="flex items-center justify-between">
							<Button
								variant="ghost"
								size="sm"
								onClick={selectAll}
								disabled={filteredCompanies.length === 0}
							>
								Select All
							</Button>
							<Button
								variant="ghost"
								size="sm"
								onClick={clearSelection}
								disabled={selectedCompanies.length === 0}
							>
								Clear
							</Button>
						</div>
					</div>
					<ScrollArea className="h-[300px]">
						<div className="p-3 space-y-2">
							{filteredCompanies.length === 0 ? (
								<div className="text-center py-6 text-sm text-muted-foreground">
									No companies found
								</div>
							) : (
								filteredCompanies.map((company) => (
									<div
										key={company}
										className="flex items-center space-x-2 py-2 px-2 rounded hover:bg-muted cursor-pointer"
										onClick={() => toggleCompany(company)}
									>
										<Checkbox
											checked={selectedCompanies.includes(company)}
											onCheckedChange={() => toggleCompany(company)}
											onClick={(e) => e.stopPropagation()}
										/>
										<label className="flex-1 text-sm cursor-pointer leading-none">
											{company}
										</label>
									</div>
								))
							)}
						</div>
					</ScrollArea>
				</PopoverContent>
			</Popover>

			{/* Selected companies badges */}
			{selectedCompanies.length > 0 && (
				<div className="flex flex-wrap gap-2">
					{selectedCompanies.map((company) => (
						<Badge key={company} variant="secondary" className="pl-2 pr-1">
							<span className="max-w-[200px] truncate">{company}</span>
							<button
								onClick={(e) => removeCompany(company, e)}
								className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
							>
								<X className="h-3 w-3" />
							</button>
						</Badge>
					))}
					{selectedCompanies.length > 1 && (
						<Button
							variant="ghost"
							size="sm"
							onClick={clearSelection}
							className="h-6 px-2 text-xs"
						>
							Clear all
						</Button>
					)}
				</div>
			)}
		</div>
	);
}


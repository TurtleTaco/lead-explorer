import { getAllContacts } from "@/lib/api/contacts-data";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Users,
	Building2,
	Mail,
	Phone,
	MapPin,
	Linkedin,
	ExternalLink,
	Download,
	Briefcase,
	Copy,
	Calendar,
} from "lucide-react";
import { ContactsFilter } from "@/components/contacts-filter";
import { CompanyWebsiteLink } from "@/components/company-website-link";
import Link from "next/link";

export default async function ContactManagerPage({
	params,
	searchParams,
}: {
	params: Promise<{ orgId: string }>;
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
	const { orgId } = await params;
	const filters = await searchParams;

	// Parse filters
	const contactsData = await getAllContacts(orgId, {
		search: typeof filters.search === "string" ? filters.search : undefined,
		seniority: typeof filters.seniority === "string" ? filters.seniority : undefined,
		industry: typeof filters.industry === "string" ? filters.industry : undefined,
		location: typeof filters.location === "string" ? filters.location : undefined,
		hasEmail: filters.hasEmail === "true",
		hasPhone: filters.hasPhone === "true",
		sortBy: 
			filters.sortBy === "name" || 
			filters.sortBy === "company" || 
			filters.sortBy === "recent"
				? filters.sortBy
				: "name",
	});

	const { companies, total_contacts, companies_count, filter_options } = contactsData;

	const formatCompanySize = (size: number | null | undefined) => {
		if (!size) return null;
		if (size < 50) return "1-49 employees";
		if (size < 200) return "50-199 employees";
		if (size < 500) return "200-499 employees";
		if (size < 1000) return "500-999 employees";
		return "1000+ employees";
	};

	const getInitials = (name: string | null | undefined) => {
		if (!name) return "??";
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	return (
		<div className="container py-8 space-y-6">
			{/* Header with Compact Stats */}
			<div>
				<h1 className="text-4xl font-bold">Contact Manager</h1>
				<div className="flex items-center gap-3 mt-3">
					<p className="text-muted-foreground">
						Manage and export all contacts discovered from job postings
					</p>
					<div className="flex items-center gap-2">
						<Badge variant="secondary" className="gap-1.5">
							<Users className="h-3.5 w-3.5" />
							<span>{total_contacts} contacts</span>
						</Badge>
						<Badge variant="secondary" className="gap-1.5">
							<Building2 className="h-3.5 w-3.5" />
							<span>{companies_count} companies</span>
						</Badge>
					</div>
				</div>
			</div>

			{/* Filters */}
			<ContactsFilter 
				filterOptions={filter_options}
				orgId={orgId}
				totalContacts={total_contacts}
			/>

			{/* Contacts List by Company */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle>Contacts by Company</CardTitle>
							<CardDescription>
								{total_contacts} contact{total_contacts !== 1 ? "s" : ""} across {companies_count} {companies_count === 1 ? "company" : "companies"}
							</CardDescription>
						</div>
						{total_contacts > 0 && (
							<Button variant="outline" size="sm" asChild>
								<Link href={`/dashboard/org/${orgId}/contacts/export`}>
									<Download className="h-4 w-4 mr-2" />
									Export CSV
								</Link>
							</Button>
						)}
					</div>
				</CardHeader>
				<CardContent>
					{companies.length === 0 ? (
						<div className="text-center py-12">
							<Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
							<p className="text-lg font-medium mb-2">No contacts found</p>
							<p className="text-sm text-muted-foreground">
								Try adjusting your filters or import contacts first
							</p>
						</div>
					) : (
						<Accordion type="single" collapsible className="w-full space-y-2">
							{companies.map((company, idx) => (
								<AccordionItem
									key={idx}
									value={`company-${idx}`}
									className="border rounded-lg px-4"
								>
									<AccordionTrigger className="hover:no-underline py-4">
										<div className="flex items-center justify-between w-full pr-4">
											<div className="flex items-center gap-3">
												<Avatar className="h-12 w-12 border-2 border-primary/10">
													{company.company_logo && (
														<AvatarImage 
															src={company.company_logo} 
															alt={company.company_name}
															className="object-contain p-1"
														/>
													)}
													<AvatarFallback className="bg-primary/10">
														<Building2 className="h-5 w-5 text-primary" />
													</AvatarFallback>
												</Avatar>
												<div className="text-left">
													<div className="font-semibold text-lg">
														{company.company_name}
													</div>
													<div className="flex flex-wrap gap-2 text-sm text-muted-foreground mt-1">
														<span>{company.contacts.length} {company.contacts.length === 1 ? "contact" : "contacts"}</span>
														{company.job_count > 0 && (
															<>
																<span>•</span>
																<span>{company.job_count} {company.job_count === 1 ? "job" : "jobs"}</span>
															</>
														)}
														{company.industry && (
															<>
																<span>•</span>
																<span>{company.industry}</span>
															</>
														)}
													</div>
												</div>
											</div>
											<div className="flex items-center gap-2">
												{company.company_size && (
													<Badge variant="outline" className="text-xs">
														{formatCompanySize(company.company_size)}
													</Badge>
												)}
												{company.company_website && (
													<CompanyWebsiteLink website={company.company_website} />
												)}
											</div>
										</div>
									</AccordionTrigger>
									<AccordionContent className="pt-4 pb-6">
										<div className="space-y-1">
											{company.contacts.map((contact, cIdx) => (
												<div
													key={cIdx}
													className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors border"
												>
													{/* Avatar */}
													<Avatar className="h-10 w-10 border">
														<AvatarFallback className="text-xs font-semibold bg-primary/10">
															{getInitials(contact.full_name)}
														</AvatarFallback>
													</Avatar>

													{/* Contact Info */}
													<div className="flex-1 min-w-0">
														<div className="flex items-start justify-between gap-2 mb-1">
															<div>
																<div className="font-semibold text-sm">
																	{contact.full_name || `${contact.first_name} ${contact.last_name}`}
																</div>
																{contact.job_title && (
																	<div className="text-xs text-muted-foreground">
																		{contact.job_title}
																	</div>
																)}
															</div>
															{contact.seniority_level && (
																<Badge variant="secondary" className="text-xs shrink-0">
																	{contact.seniority_level}
																</Badge>
															)}
														</div>

														{/* Contact Details */}
														<div className="space-y-1 mt-2">
															{contact.email && (
																<div className="flex items-center gap-2 text-xs">
																	<Mail className="h-3 w-3 text-muted-foreground" />
																	<a
																		href={`mailto:${contact.email}`}
																		className="text-primary hover:underline truncate"
																	>
																		{contact.email}
																	</a>
																</div>
															)}
															{contact.mobile_number && (
																<div className="flex items-center gap-2 text-xs">
																	<Phone className="h-3 w-3 text-muted-foreground" />
																	<a
																		href={`tel:${contact.mobile_number}`}
																		className="text-primary hover:underline"
																	>
																		{contact.mobile_number}
																	</a>
																</div>
															)}
															{contact.linkedin && (
																<div className="flex items-center gap-2 text-xs">
																	<Linkedin className="h-3 w-3 text-muted-foreground" />
																	<a
																		href={contact.linkedin}
																		target="_blank"
																		rel="noopener noreferrer"
																		className="text-primary hover:underline truncate"
																	>
																		LinkedIn Profile
																	</a>
																</div>
															)}
															{(contact.city || contact.state || contact.country) && (
																<div className="flex items-center gap-2 text-xs text-muted-foreground">
																	<MapPin className="h-3 w-3" />
																	<span>
																		{[contact.city, contact.state, contact.country]
																			.filter(Boolean)
																			.join(", ")}
																	</span>
																</div>
															)}
														</div>
													</div>
												</div>
											))}
										</div>
									</AccordionContent>
								</AccordionItem>
							))}
						</Accordion>
					)}
				</CardContent>
			</Card>
		</div>
	);
}


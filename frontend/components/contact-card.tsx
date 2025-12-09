"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Mail,
	Linkedin,
	MapPin,
	Phone,
	Copy,
	Check,
	Globe,
	Briefcase,
	Building2,
	Calendar,
} from "lucide-react";
import { CompanyContact } from "@/lib/supabase";
import { ContactWithCompanyInfo } from "@/lib/api/contacts-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ContactCardProps {
	contact: CompanyContact | ContactWithCompanyInfo;
	showCompanyJobs?: boolean;
}

export function ContactCard({ contact, showCompanyJobs = false }: ContactCardProps) {
	const [emailCopied, setEmailCopied] = useState(false);
	const [phoneCopied, setPhoneCopied] = useState(false);

	const copyToClipboard = async (text: string, type: "email" | "phone") => {
		try {
			await navigator.clipboard.writeText(text);
			if (type === "email") {
				setEmailCopied(true);
				setTimeout(() => setEmailCopied(false), 2000);
			} else {
				setPhoneCopied(true);
				setTimeout(() => setPhoneCopied(false), 2000);
			}
		} catch (err) {
			console.error("Failed to copy:", err);
		}
	};

	const getSeniorityColor = (level: string | null) => {
		if (!level) return "outline";
		const levelLower = level.toLowerCase();
		if (levelLower.includes("founder") || levelLower === "c_suite") return "default";
		if (levelLower.includes("vp") || levelLower === "director") return "secondary";
		return "outline";
	};

	const getInitials = (name: string | null) => {
		if (!name) return "??";
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	const formatLocation = () => {
		const parts = [];
		if (contact.city) parts.push(contact.city);
		if (contact.state) parts.push(contact.state);
		if (contact.country && contact.country !== "United States") parts.push(contact.country);
		return parts.join(", ");
	};

	return (
		<Card className="bg-gradient-to-br from-background to-muted/30 border-2 hover:border-primary/50 transition-all">
			<CardContent className="pt-5">
				<div className="flex gap-4">
					{/* Avatar */}
					<Avatar className="h-16 w-16 border-2 border-primary/10">
						<AvatarFallback className="text-lg font-semibold bg-primary/10">
							{getInitials(contact.full_name)}
						</AvatarFallback>
					</Avatar>

					{/* Main Content */}
					<div className="flex-1 min-w-0 space-y-3">
						{/* Header */}
						<div className="space-y-1">
							<div className="flex items-start justify-between gap-2">
								<h4 className="font-bold text-base leading-tight">
									{contact.full_name || `${contact.first_name} ${contact.last_name}`}
								</h4>
								{contact.seniority_level && (
									<Badge variant={getSeniorityColor(contact.seniority_level)} className="shrink-0">
										{contact.seniority_level}
									</Badge>
								)}
							</div>
							
							{contact.job_title && (
								<div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
									<Briefcase className="h-3.5 w-3.5" />
									{contact.job_title}
								</div>
							)}
							
							{contact.functional_level && (
								<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
									<Building2 className="h-3 w-3" />
									{contact.functional_level}
								</div>
							)}
						</div>

						{/* Headline */}
						{contact.headline && (
							<p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
								{contact.headline}
							</p>
						)}

						{/* Contact Methods */}
						<div className="space-y-2">
							{/* Email with Copy */}
							{contact.email && (
								<div className="flex items-center gap-2">
									<div className="flex items-center gap-1.5 flex-1 min-w-0 text-sm">
										<Mail className="h-3.5 w-3.5 text-primary shrink-0" />
										<a
											href={`mailto:${contact.email}`}
											className="text-primary hover:underline truncate"
										>
											{contact.email}
										</a>
									</div>
									<Button
										variant="ghost"
										size="sm"
										className="h-7 w-7 p-0 shrink-0"
										onClick={() => copyToClipboard(contact.email!, "email")}
										title="Copy email"
									>
										{emailCopied ? (
											<Check className="h-3.5 w-3.5 text-green-600" />
										) : (
											<Copy className="h-3.5 w-3.5" />
										)}
									</Button>
								</div>
							)}

							{/* Mobile with Copy */}
							{contact.mobile_number && (
								<div className="flex items-center gap-2">
									<div className="flex items-center gap-1.5 flex-1 min-w-0 text-sm">
										<Phone className="h-3.5 w-3.5 text-primary shrink-0" />
										<a
											href={`tel:${contact.mobile_number}`}
											className="text-primary hover:underline"
										>
											{contact.mobile_number}
										</a>
									</div>
									<Button
										variant="ghost"
										size="sm"
										className="h-7 w-7 p-0 shrink-0"
										onClick={() => copyToClipboard(contact.mobile_number!, "phone")}
										title="Copy phone"
									>
										{phoneCopied ? (
											<Check className="h-3.5 w-3.5 text-green-600" />
										) : (
											<Copy className="h-3.5 w-3.5" />
										)}
									</Button>
								</div>
							)}

							{/* LinkedIn */}
							{contact.linkedin && (
								<div className="flex items-center gap-1.5 text-sm">
									<Linkedin className="h-3.5 w-3.5 text-primary shrink-0" />
									<a
										href={contact.linkedin}
										target="_blank"
										rel="noopener noreferrer"
										className="text-primary hover:underline truncate"
									>
										View LinkedIn Profile
									</a>
								</div>
							)}
						</div>

						{/* Additional Info */}
						<div className="flex flex-wrap gap-3 pt-1">
							{/* Location */}
							{formatLocation() && (
								<div className="flex items-center gap-1 text-xs text-muted-foreground">
									<MapPin className="h-3 w-3" />
									{formatLocation()}
								</div>
							)}

							{/* Company Jobs Info (if available) */}
							{showCompanyJobs && "job_count" in contact && contact.job_count !== undefined && contact.job_count > 0 && (
								<div className="flex items-center gap-1 text-xs font-medium text-primary">
									<Briefcase className="h-3 w-3" />
									{contact.job_count} {contact.job_count === 1 ? "job" : "jobs"}
								</div>
							)}

							{/* Latest Job (if available) */}
							{showCompanyJobs && "latest_job_title" in contact && contact.latest_job_title && (
								<div className="flex items-center gap-1 text-xs text-muted-foreground">
									<Calendar className="h-3 w-3" />
									{contact.latest_job_title}
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Personal Email (if different) */}
				{contact.personal_email && contact.personal_email !== contact.email && (
					<div className="mt-3 pt-3 border-t">
						<div className="flex items-center gap-2 text-xs">
							<Mail className="h-3 w-3 text-muted-foreground" />
							<span className="text-muted-foreground">Personal:</span>
							<a
								href={`mailto:${contact.personal_email}`}
								className="text-primary hover:underline"
							>
								{contact.personal_email}
							</a>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}


"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Users, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { clientSideEnv } from "@/lib/env/client-side";
import { createClient } from "@supabase/supabase-js";

interface FetchContactsButtonProps {
	company_website: string;
	company_name: string;
	onSuccess?: () => void;
}

interface ApifyContactData {
	first_name?: string;
	last_name?: string;
	full_name?: string;
	email?: string;
	mobile_number?: string;
	personal_email?: string;
	job_title?: string;
	headline?: string;
	seniority_level?: string;
	functional_level?: string;
	industry?: string;
	linkedin?: string;
	city?: string;
	state?: string;
	country?: string;
	company_name?: string;
	company_linkedin?: string;
	company_linkedin_uid?: string;
	company_domain?: string;
	company_description?: string;
	company_slogan?: string;
	company_size?: number;
	company_phone?: string;
	company_annual_revenue?: string;
	company_annual_revenue_clean?: number;
	company_total_funding?: string;
	company_total_funding_clean?: number;
	company_founded_year?: number;
	company_street_address?: string;
	company_full_address?: string;
	company_city?: string;
	company_state?: string;
	company_country?: string;
	company_postal_code?: string;
	keywords?: string;
	company_technologies?: string;
}

export function FetchContactsButton({
	company_website,
	company_name,
	onSuccess,
}: FetchContactsButtonProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

	const handleFetchContacts = async () => {
		setIsLoading(true);
		setStatus("idle");

		try {
			// Check for required environment variables
			const apifyApiKey = clientSideEnv.NEXT_PUBLIC_APIFY_API_KEY;
			const supabaseUrl = clientSideEnv.NEXT_PUBLIC_SUPABASE_URL;
			const supabaseAnonKey = clientSideEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;

			if (!apifyApiKey) {
				throw new Error("NEXT_PUBLIC_APIFY_API_KEY is not configured");
			}

			if (!supabaseUrl || !supabaseAnonKey) {
				throw new Error("Supabase environment variables are not configured");
			}

			// Extract domain from company website
			let company_domain: string;
			try {
				const url = new URL(company_website);
				company_domain = url.hostname.replace(/^www\./, "");
			} catch (error) {
				throw new Error(`Invalid company website URL: ${company_website}`);
			}

			toast.info(`Starting contact fetch for ${company_name}...`);

			// Call Apify API to run the actor
			const actorInput = {
				company_domain: [company_domain],
			};

			const actorRunResponse = await fetch(
				"https://api.apify.com/v2/acts/IoSHqwTR9YGhzccez/runs?token=" + apifyApiKey,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(actorInput),
				}
			);

			if (!actorRunResponse.ok) {
				const errorText = await actorRunResponse.text();
				throw new Error(`Apify API error: ${actorRunResponse.status} - ${errorText}`);
			}

			const runData = await actorRunResponse.json();
			const runId = runData.data.id;
			const defaultDatasetId = runData.data.defaultDatasetId;

			toast.info("Waiting for Apify to complete...");

			// Poll for run completion
			let runStatus = runData.data.status;
			let attempts = 0;
			const maxAttempts = 60; // 5 minutes max (5 seconds * 60)
			
			while (runStatus !== "SUCCEEDED" && runStatus !== "FAILED" && runStatus !== "ABORTED" && attempts < maxAttempts) {
				await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
				
				const statusResponse = await fetch(
					`https://api.apify.com/v2/actor-runs/${runId}?token=${apifyApiKey}`
				);
				
				if (!statusResponse.ok) {
					throw new Error("Failed to check Apify run status");
				}
				
				const statusData = await statusResponse.json();
				runStatus = statusData.data.status;
				attempts++;
			}

			if (runStatus === "FAILED" || runStatus === "ABORTED") {
				throw new Error(`Apify run ${runStatus.toLowerCase()}`);
			}

			if (attempts >= maxAttempts) {
				throw new Error("Apify run timed out after 5 minutes");
			}

			// Fetch results from the dataset
			const datasetResponse = await fetch(
				`https://api.apify.com/v2/datasets/${defaultDatasetId}/items?token=${apifyApiKey}`
			);

			if (!datasetResponse.ok) {
				throw new Error("Failed to fetch results from Apify");
			}

			const contacts = await datasetResponse.json() as ApifyContactData[];

			if (!contacts || contacts.length === 0) {
				toast.info(`No contacts found for ${company_name}`);
				setStatus("success");
				return;
			}

			// Initialize Supabase client
			const supabase = createClient(supabaseUrl, supabaseAnonKey);

			// Store contacts in Supabase
			let insertedCount = 0;
			for (const contact of contacts) {
				try {
					const { error } = await supabase
						.from("company_contacts")
						.insert({
							first_name: contact.first_name || null,
							last_name: contact.last_name || null,
							full_name: contact.full_name || null,
							email: contact.email || null,
							mobile_number: contact.mobile_number || null,
							personal_email: contact.personal_email || null,
							job_title: contact.job_title || null,
							headline: contact.headline || null,
							seniority_level: contact.seniority_level || null,
							functional_level: contact.functional_level || null,
							industry: contact.industry || null,
							linkedin: contact.linkedin || null,
							city: contact.city || null,
							state: contact.state || null,
							country: contact.country || null,
							company_name: contact.company_name || null,
							company_website: company_website,
							company_linkedin: contact.company_linkedin || null,
							company_linkedin_uid: contact.company_linkedin_uid || null,
							company_domain: contact.company_domain || null,
							company_description: contact.company_description || null,
							company_slogan: contact.company_slogan || null,
							company_size: contact.company_size || null,
							company_phone: contact.company_phone || null,
							company_annual_revenue: contact.company_annual_revenue || null,
							company_annual_revenue_clean: contact.company_annual_revenue_clean || null,
							company_total_funding: contact.company_total_funding || null,
							company_total_funding_clean: contact.company_total_funding_clean || null,
							company_founded_year: contact.company_founded_year || null,
							company_street_address: contact.company_street_address || null,
							company_full_address: contact.company_full_address || null,
							company_city: contact.company_city || null,
							company_state: contact.company_state || null,
							company_country: contact.company_country || null,
							company_postal_code: contact.company_postal_code || null,
							keywords: contact.keywords || null,
							company_technologies: contact.company_technologies || null,
						});

					if (!error) {
						insertedCount++;
					} else {
						console.error("Error inserting contact:", error);
					}
				} catch (error) {
					console.error("Error processing contact:", error);
				}
			}

			setStatus("success");
			toast.success(
				`Fetched ${insertedCount} contact${insertedCount !== 1 ? "s" : ""} for ${company_name}`,
			);

			// Call onSuccess callback to refresh the page data
			if (onSuccess) {
				setTimeout(() => {
					onSuccess();
				}, 1000);
			}
		} catch (error) {
			console.error("Fetch contacts error:", error);
			setStatus("error");
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to fetch contacts. Please try again.",
			);
		} finally {
			setIsLoading(false);
			// Reset status after 3 seconds
			setTimeout(() => {
				setStatus("idle");
			}, 3000);
		}
	};

	return (
		<Button
			onClick={handleFetchContacts}
			disabled={isLoading}
			variant={status === "success" ? "default" : "outline"}
			size="sm"
			className="gap-2"
		>
			{isLoading ? (
				<>
					<Loader2 className="h-4 w-4 animate-spin" />
					Fetching...
				</>
			) : status === "success" ? (
				<>
					<CheckCircle2 className="h-4 w-4" />
					Fetched!
				</>
			) : status === "error" ? (
				<>
					<AlertCircle className="h-4 w-4" />
					Try Again
				</>
			) : (
				<>
					<Users className="h-4 w-4" />
					Fetch Contacts
				</>
			)}
		</Button>
	);
}


"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { clientSideEnv } from "@/lib/env/client-side";
import { createClient } from "@supabase/supabase-js";
import { useAuth, useOrganization } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface ApifyJobData {
	id: string;
	trackingId?: string;
	refId?: string;
	title: string;
	link?: string;
	applyUrl?: string;
	descriptionHtml?: string;
	descriptionText?: string;
	companyName?: string;
	companyLinkedinUrl?: string;
	companyLogo?: string;
	companyWebsite?: string;
	companySlogan?: string;
	companyDescription?: string;
	companyEmployeesCount?: number;
	location?: string;
	salary?: string;
	salaryInfo?: any[];
	postedAt?: string;
	applicantsCount?: number | string;
	benefits?: any[];
	seniorityLevel?: string;
	employmentType?: string;
	jobFunction?: string;
	industries?: string;
	companyAddress?: any;
	inputUrl?: string;
}

export function AddSearchDialog() {
	const [open, setOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
	const { userId } = useAuth();
	const { organization } = useOrganization();
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!searchTerm.trim()) {
			toast.error("Please enter a search term");
			return;
		}

		if (!userId || !organization) {
			toast.error("You must be logged in and have an organization");
			return;
		}

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

			toast.info(`Starting job search for: "${searchTerm}"...`);

			// Initialize Supabase client
			const supabase = createClient(supabaseUrl, supabaseAnonKey);

			// Step 1: Get or create user
			const userEmail = userId; // Using Clerk user ID as identifier
			let dbUserId: number;

			const { data: existingUser } = await supabase
				.from("users")
				.select("id")
				.eq("email", userEmail)
				.single();

			if (existingUser) {
				dbUserId = existingUser.id;
			} else {
				const { data: newUser, error: userError } = await supabase
					.from("users")
					.insert({ email: userEmail })
					.select("id")
					.single();

				if (userError || !newUser) {
					throw new Error("Failed to create user: " + userError?.message);
				}
				dbUserId = newUser.id;
			}

			// Step 2: Get or create organization
			const clerkOrgId = organization.id;
			let dbOrgId: number;

			const { data: existingOrg } = await supabase
				.from("organizations")
				.select("id")
				.eq("org_id", clerkOrgId)
				.single();

			if (existingOrg) {
				dbOrgId = existingOrg.id;
			} else {
				const { data: newOrg, error: orgError } = await supabase
					.from("organizations")
					.insert({ 
						org_id: clerkOrgId, 
						name: organization.name || "Untitled Organization",
						created_by_user_id: dbUserId 
					})
					.select("id")
					.single();

				if (orgError || !newOrg) {
					throw new Error("Failed to create organization: " + orgError?.message);
				}
				dbOrgId = newOrg.id;
			}

			// Step 3: Link user to organization (if not already linked)
			const { error: linkError } = await supabase
				.from("user_organizations")
				.upsert(
					{ user_id: dbUserId, org_id: dbOrgId, role: "owner" },
					{ onConflict: "user_id,org_id", ignoreDuplicates: true }
				);

			if (linkError) {
				console.error("Error linking user to organization:", linkError);
			}

			// Step 4: Call Apify API
			const searchUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(searchTerm)}&position=1&pageNum=10`;
			const actorInput = {
				scrapeCompany: true,
				urls: [searchUrl],
			};

			toast.info("Calling LinkedIn job scraper...");

			const actorRunResponse = await fetch(
				"https://api.apify.com/v2/acts/hKByXkMQaC5Qt9UMN/runs?token=" + apifyApiKey,
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

			toast.info("Waiting for scraper to complete (this may take 1-2 minutes)...");

			// Poll for run completion
			let runStatus = runData.data.status;
			let attempts = 0;
			const maxAttempts = 60; // 5 minutes max (5 seconds * 60)

			while (
				runStatus !== "SUCCEEDED" &&
				runStatus !== "FAILED" &&
				runStatus !== "ABORTED" &&
				attempts < maxAttempts
			) {
				await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds

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

			const jobs = (await datasetResponse.json()) as ApifyJobData[];

			if (!jobs || jobs.length === 0) {
				toast.info(`No jobs found for "${searchTerm}"`);
				setStatus("success");
				setOpen(false);
				return;
			}

			toast.info(`Found ${jobs.length} jobs, saving to database...`);

			// Step 5: Create search record
			const { data: searchRecord, error: searchError } = await supabase
				.from("searches")
				.insert({
					org_id: dbOrgId,
					search_term: searchTerm,
					source: "linkedin-jobs-scraper",
					data_file_name: `apify_run_${runId}`,
					job_count: jobs.length,
				})
				.select("id")
				.single();

			if (searchError || !searchRecord) {
				throw new Error("Failed to create search record: " + searchError?.message);
			}

			const searchId = searchRecord.id;

			// Step 6: Insert jobs
			let insertedCount = 0;
			const batchSize = 50; // Insert in batches to avoid request size limits

			for (let i = 0; i < jobs.length; i += batchSize) {
				const batch = jobs.slice(i, i + batchSize);

				const jobsToInsert = batch.map((job) => ({
					search_id: searchId,
					job_id: job.id,
					tracking_id: job.trackingId || null,
					ref_id: job.refId || null,
					title: job.title,
					link: job.link || null,
					apply_url: job.applyUrl || null,
					description_html: job.descriptionHtml || null,
					description_text: job.descriptionText || null,
					company_name: job.companyName || null,
					company_linkedin_url: job.companyLinkedinUrl || null,
					company_logo: job.companyLogo || null,
					company_website: job.companyWebsite || null,
					company_slogan: job.companySlogan || null,
					company_description: job.companyDescription || null,
					company_employees_count: job.companyEmployeesCount || null,
					location: job.location || null,
					salary: job.salary || null,
					salary_info: job.salaryInfo || [],
					posted_at: job.postedAt || null,
					applicants_count: job.applicantsCount?.toString() || null,
					benefits: job.benefits || [],
					seniority_level: job.seniorityLevel || null,
					employment_type: job.employmentType || null,
					job_function: job.jobFunction || null,
					industries: job.industries || null,
					company_address: job.companyAddress || null,
					input_url: job.inputUrl || null,
				}));

				const { error: insertError } = await supabase
					.from("jobs")
					.upsert(jobsToInsert, {
						onConflict: "search_id,job_id",
						ignoreDuplicates: false,
					});

				if (insertError) {
					console.error("Error inserting job batch:", insertError);
				} else {
					insertedCount += batch.length;
				}
			}

			setStatus("success");
			toast.success(
				`Successfully imported ${insertedCount} job${insertedCount !== 1 ? "s" : ""} for "${searchTerm}"`
			);

			// Close dialog and refresh page
			setTimeout(() => {
				setOpen(false);
				setSearchTerm("");
				router.refresh();
			}, 1000);
		} catch (error) {
			console.error("Add search error:", error);
			setStatus("error");
			toast.error(
				error instanceof Error ? error.message : "Failed to add search. Please try again."
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button className="gap-2">
					<Plus className="h-4 w-4" />
					Add New Search
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[500px]">
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>Add New Job Search</DialogTitle>
						<DialogDescription>
							Enter a search term to scrape LinkedIn job postings. This will find jobs, extract
							company information, and add them to your database.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="searchTerm">Search Term</Label>
							<Input
								id="searchTerm"
								placeholder="e.g., Software Engineer Remote, Data Analyst NYC"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								disabled={isLoading}
								autoFocus
							/>
							<p className="text-xs text-muted-foreground">
								Try specific job titles, skills, or locations for best results
							</p>
						</div>
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
							disabled={isLoading}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isLoading || !searchTerm.trim()}>
							{isLoading ? (
								<>
									<Loader2 className="h-4 w-4 animate-spin mr-2" />
									Searching...
								</>
							) : status === "success" ? (
								<>
									<CheckCircle2 className="h-4 w-4 mr-2" />
									Success!
								</>
							) : status === "error" ? (
								<>
									<AlertCircle className="h-4 w-4 mr-2" />
									Try Again
								</>
							) : (
								<>
									<Plus className="h-4 w-4 mr-2" />
									Start Search
								</>
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}


"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { 
	Target, 
	Search, 
	Users, 
	Briefcase, 
	TrendingUp, 
	Zap, 
	Database,
	ArrowRight,
	CheckCircle2,
	Building2,
	Mail,
	MapPin
} from "lucide-react";
import Link from "next/link";

const features = [
	{
		icon: Search,
		title: "Job Posting Intelligence",
		description: "Automatically discover companies from LinkedIn job postings. Find businesses that are actively hiring and growing.",
		id: "job-scraping"
	},
	{
		icon: Users,
		title: "Contact Enrichment",
		description: "Instantly fetch verified contact information including emails, phone numbers, and LinkedIn profiles for decision makers.",
		id: "contact-enrichment"
	},
	{
		icon: Database,
		title: "Lead Management",
		description: "Organize, filter, and prioritize your leads with powerful search and filtering capabilities.",
		id: "lead-management"
	},
	{
		icon: TrendingUp,
		title: "Real-Time Insights",
		description: "Get immediate insights into company size, location, industry, and hiring trends to prioritize your outreach.",
	},
	{
		icon: Zap,
		title: "Lightning Fast",
		description: "Powered by modern infrastructure for instant results. No more manual research or data entry.",
	},
	{
		icon: Briefcase,
		title: "B2B Focus",
		description: "Built specifically for B2B sales teams, recruiters, and marketing professionals.",
	},
];

const stats = [
	{ label: "Active Companies", value: "10K+" },
	{ label: "Contacts Enriched", value: "50K+" },
	{ label: "Time Saved", value: "80%" },
	{ label: "Conversion Rate", value: "3x" },
];

export default function Home() {
	return (
		<div className="flex flex-col">
			{/* Hero Section */}
			<section className="py-20 md:py-32 bg-gradient-to-b from-primary/5 via-background to-background">
				<div className="container">
					<div className="flex flex-col items-center text-center gap-8 max-w-4xl mx-auto">
						<Badge variant="secondary" className="px-4 py-1.5">
							<Zap className="size-3 mr-1" />
							AI-Powered Lead Generation
						</Badge>
						
						<h1 className="text-4xl leading-tight font-bold text-foreground lg:text-6xl xl:text-7xl bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">
							Find Your Next Customer Where They're Hiring
						</h1>
						
						<p className="text-lg leading-relaxed text-muted-foreground xl:text-xl max-w-2xl">
							Turn job postings into qualified leads. LeadScout automatically discovers companies from their hiring activity and enriches them with verified contact information—so you can reach decision makers faster.
						</p>

						<div className="flex flex-col sm:flex-row gap-4 mt-4">
							<SignedOut>
								<SignInButton forceRedirectUrl="/dashboard">
									<Button size="lg" className="gap-2 text-base">
										Get Started Free <ArrowRight className="size-5" />
									</Button>
								</SignInButton>
							</SignedOut>
							<SignedIn>
								<Button asChild size="lg" className="gap-2 text-base">
									<Link href="/dashboard">
										Go to Dashboard <ArrowRight className="size-5" />
									</Link>
								</Button>
							</SignedIn>
							<Button asChild size="lg" variant="outline" className="gap-2 text-base">
								<Link href="/pricing">
									View Pricing
								</Link>
							</Button>
						</div>

						<div className="flex flex-wrap items-center justify-center gap-8 mt-8 text-sm text-muted-foreground">
							<div className="flex items-center gap-2">
								<CheckCircle2 className="size-4 text-primary" />
								No credit card required
							</div>
							<div className="flex items-center gap-2">
								<CheckCircle2 className="size-4 text-primary" />
								10,000+ companies
							</div>
							<div className="flex items-center gap-2">
								<CheckCircle2 className="size-4 text-primary" />
								Real-time data
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Stats Section */}
			<section className="py-12 border-y bg-muted/30">
				<div className="container">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-8">
						{stats.map((stat) => (
							<div key={stat.label} className="text-center">
								<div className="text-3xl md:text-4xl font-bold text-primary mb-2">
									{stat.value}
								</div>
								<div className="text-sm text-muted-foreground">
									{stat.label}
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* How It Works */}
			<section className="py-20 md:py-32">
				<div className="container">
					<div className="text-center mb-16">
						<h2 className="text-3xl md:text-4xl font-bold mb-4">
							How LeadScout Works
						</h2>
						<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
							Three simple steps to transform job postings into qualified leads
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
						<Card className="relative border-2">
							<div className="absolute -top-4 left-6 bg-primary text-primary-foreground rounded-full size-8 flex items-center justify-center font-bold">
								1
							</div>
							<CardHeader>
								<Search className="size-10 text-primary mb-4" />
								<CardTitle>Search Job Postings</CardTitle>
								<CardDescription>
									Enter your target criteria—industry, location, job titles, or keywords. We'll scan LinkedIn for matching job postings.
								</CardDescription>
							</CardHeader>
						</Card>

						<Card className="relative border-2">
							<div className="absolute -top-4 left-6 bg-primary text-primary-foreground rounded-full size-8 flex items-center justify-center font-bold">
								2
							</div>
							<CardHeader>
								<Building2 className="size-10 text-primary mb-4" />
								<CardTitle>Discover Companies</CardTitle>
								<CardDescription>
									Automatically extract company information from job postings including size, location, industry, and growth signals.
								</CardDescription>
							</CardHeader>
						</Card>

						<Card className="relative border-2">
							<div className="absolute -top-4 left-6 bg-primary text-primary-foreground rounded-full size-8 flex items-center justify-center font-bold">
								3
							</div>
							<CardHeader>
								<Users className="size-10 text-primary mb-4" />
								<CardTitle>Enrich Contacts</CardTitle>
								<CardDescription>
									Get verified contact details for key decision makers with one click. Start reaching out to warm leads immediately.
								</CardDescription>
							</CardHeader>
						</Card>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="py-20 md:py-32 bg-muted/30">
				<div className="container">
					<div className="text-center mb-16">
						<h2 className="text-3xl md:text-4xl font-bold mb-4">
							Everything You Need to Scale Outreach
						</h2>
						<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
							Powerful features designed to help you find and connect with your ideal customers
						</p>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
						{features.map((feature) => (
							<Card key={feature.title} id={feature.id} className="border-2 hover:border-primary/50 transition-colors">
								<CardHeader>
									<feature.icon className="size-12 text-primary mb-4" />
									<CardTitle className="text-xl">{feature.title}</CardTitle>
									<CardDescription className="text-base">
										{feature.description}
									</CardDescription>
								</CardHeader>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* Use Cases */}
			<section className="py-20 md:py-32">
				<div className="container">
					<div className="text-center mb-16">
						<h2 className="text-3xl md:text-4xl font-bold mb-4">
							Perfect For
						</h2>
						<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
							Built for teams that need to find and connect with growing companies
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
						<Card>
							<CardHeader>
								<TrendingUp className="size-10 text-primary mb-4" />
								<CardTitle>Sales Teams</CardTitle>
								<CardContent className="px-0">
									<p className="text-muted-foreground">
										Find companies that are growing and have budget. Target them when they're most likely to buy.
									</p>
								</CardContent>
							</CardHeader>
						</Card>

						<Card>
							<CardHeader>
								<Users className="size-10 text-primary mb-4" />
								<CardTitle>Recruiters</CardTitle>
								<CardContent className="px-0">
									<p className="text-muted-foreground">
										Discover companies with active hiring needs. Connect with hiring managers directly.
									</p>
								</CardContent>
							</CardHeader>
						</Card>

						<Card>
							<CardHeader>
								<Mail className="size-10 text-primary mb-4" />
								<CardTitle>Marketers</CardTitle>
								<CardContent className="px-0">
									<p className="text-muted-foreground">
										Build targeted lists for outbound campaigns. Reach decision makers with personalized messaging.
									</p>
								</CardContent>
							</CardHeader>
						</Card>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-20 md:py-32 bg-gradient-to-b from-primary/5 to-background">
				<div className="container">
					<div className="max-w-3xl mx-auto text-center">
						<h2 className="text-3xl md:text-5xl font-bold mb-6">
							Ready to Find Your Next Customer?
						</h2>
						<p className="text-lg text-muted-foreground mb-8">
							Join thousands of sales professionals who are using LeadScout to discover and connect with qualified leads every day.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<SignedOut>
								<SignInButton forceRedirectUrl="/dashboard">
									<Button size="lg" className="gap-2 text-base">
										Start Finding Leads <ArrowRight className="size-5" />
									</Button>
								</SignInButton>
							</SignedOut>
							<SignedIn>
								<Button asChild size="lg" className="gap-2 text-base">
									<Link href="/dashboard">
										Go to Dashboard <ArrowRight className="size-5" />
									</Link>
								</Button>
							</SignedIn>
							<Button asChild size="lg" variant="outline" className="gap-2 text-base">
								<Link href="/pricing">
									View Pricing
								</Link>
							</Button>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}

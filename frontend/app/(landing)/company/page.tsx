import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Users, Zap, TrendingUp } from "lucide-react";

export default function CompanyPage() {
	return (
		<main className="container">
			<div className="flex flex-col items-center py-12 md:py-20">
				<h1 className="text-4xl md:text-5xl font-bold mb-4">About LeadScout</h1>
				<p className="text-lg text-muted-foreground max-w-2xl text-center">
					We're on a mission to transform how businesses find and connect with their ideal customers.
				</p>
			</div>

			<div className="max-w-4xl mx-auto space-y-12 pb-20">
				<section>
					<h2 className="text-3xl font-bold mb-6">Our Story</h2>
					<div className="prose prose-lg max-w-none text-muted-foreground">
						<p className="mb-4">
							LeadScout was born from a simple observation: companies that are actively hiring are companies 
							that are growing. And growing companies need solutions—whether that's software, services, or talent.
						</p>
						<p className="mb-4">
							Traditional lead generation methods are time-consuming, expensive, and often yield poor results. 
							We built LeadScout to change that by connecting job posting data with contact enrichment, 
							giving sales teams, recruiters, and marketers a powerful new way to discover and reach potential customers.
						</p>
					</div>
				</section>

				<section>
					<h2 className="text-3xl font-bold mb-6">Our Values</h2>
					<div className="grid md:grid-cols-2 gap-6">
						<Card>
							<CardHeader>
								<Target className="size-10 text-primary mb-4" />
								<CardTitle>Focus on Results</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-muted-foreground">
									We're obsessed with helping our customers achieve their goals. Every feature we build 
									is designed to drive real business outcomes.
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<Users className="size-10 text-primary mb-4" />
								<CardTitle>Customer-First</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-muted-foreground">
									Your success is our success. We listen to feedback, iterate quickly, and always 
									put our customers' needs at the center of everything we do.
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<Zap className="size-10 text-primary mb-4" />
								<CardTitle>Speed & Efficiency</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-muted-foreground">
									Time is money. We build tools that are fast, reliable, and easy to use—so you can 
									focus on closing deals, not managing data.
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<TrendingUp className="size-10 text-primary mb-4" />
								<CardTitle>Continuous Innovation</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-muted-foreground">
									The market evolves, and so do we. We're constantly improving our platform and 
									exploring new ways to help you find better leads faster.
								</p>
							</CardContent>
						</Card>
					</div>
				</section>

				<section className="bg-muted/30 rounded-lg p-8 md:p-12 text-center">
					<h2 className="text-3xl font-bold mb-4">Join Us on Our Journey</h2>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
						We're just getting started. If you're passionate about helping businesses grow and want to 
						be part of something special, we'd love to hear from you.
					</p>
				</section>
			</div>
		</main>
	);
}

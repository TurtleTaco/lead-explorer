import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { plans } from "@/lib/plans";
import { auth } from "@clerk/nextjs/server";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
	return (
		<main className="container">
			<div className="flex flex-col items-center py-12 md:py-20">
				<h1 className="text-4xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
				<p className="text-lg text-muted-foreground max-w-2xl text-center">
					Choose the plan that fits your team size and lead generation needs. All plans include our core features.
				</p>
			</div>

			<div className="flex flex-col lg:flex-row gap-8 justify-center items-stretch max-w-6xl mx-auto pb-20">
				{plans.map((plan, index) => (
					<Card 
						key={plan.name} 
						className={`relative group flex-1 ${index === 1 ? 'border-primary border-2 shadow-lg' : 'border-2'}`}
					>
						<Link href="/dashboard/subscription" className="absolute inset-0" />
						{index === 1 && (
							<div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
								Most Popular
							</div>
						)}

						<CardHeader className="min-w-60">
							<CardTitle className="text-2xl">{plan.name}</CardTitle>
							<CardDescription className="pt-4">
								<span className="text-5xl font-bold text-foreground">${plan.price}</span>
								<span className="text-muted-foreground"> /month</span>
							</CardDescription>
						</CardHeader>

						<CardContent className="grow">
							<p className="mb-4 font-semibold text-sm text-muted-foreground uppercase tracking-wide">
								Everything in {plan.name}
							</p>
							<ul className="space-y-3">
								{plan.features.map((feature) => (
									<li key={feature} className="flex items-start gap-3">
										<Check className="size-5 text-primary mt-0.5 flex-shrink-0" />
										<span className="text-sm">{feature}</span>
									</li>
								))}
							</ul>
						</CardContent>

						<CardFooter className="flex justify-center gap-2 group-hover:underline font-medium">
							Get started <ArrowRight className="size-4" />
						</CardFooter>
					</Card>
				))}
			</div>

			<div className="max-w-4xl mx-auto text-center pb-20">
				<h2 className="text-2xl font-bold mb-4">Need a custom plan?</h2>
				<p className="text-muted-foreground mb-6">
					We offer custom enterprise plans for larger teams with specific requirements. Contact our sales team to discuss your needs.
				</p>
				<Link href="mailto:sales@leadscout.com" className="text-primary hover:underline font-medium">
					Contact Sales →
				</Link>
			</div>
		</main>
	);
}

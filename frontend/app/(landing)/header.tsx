import { Button } from "@/components/ui/button";
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { ArrowRight, Target } from "lucide-react";
import Link from "next/link";

export function Header() {
	return (
		<header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
			<div className="container flex items-center justify-between py-4">
				<Link href="/" className="text-xl font-bold flex items-center gap-2 hover:opacity-80 transition-opacity">
					<Target className="size-6 text-primary" /> 
					<span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
						LeadScout
					</span>
				</Link>

				<NavigationMenu className="hidden md:flex">
					<NavigationMenuList>
						<NavigationMenuItem>
							<NavigationMenuTrigger>Features</NavigationMenuTrigger>
							<NavigationMenuContent>
								<ul className="w-80 p-4 space-y-3">
									<li>
										<NavigationMenuLink asChild>
											<Link href="/#job-scraping" className="block p-3 rounded-md hover:bg-accent transition-colors">
												<p className="font-medium leading-none">Job Scraping</p>
												<p className="text-sm text-muted-foreground leading-snug mt-1">
													Automatically discover companies from job postings
												</p>
											</Link>
										</NavigationMenuLink>
									</li>

									<li>
										<NavigationMenuLink asChild>
											<Link href="/#contact-enrichment" className="block p-3 rounded-md hover:bg-accent transition-colors">
												<p className="font-medium leading-none">Contact Enrichment</p>
												<p className="text-sm text-muted-foreground leading-snug mt-1">
													Get verified contact information instantly
												</p>
											</Link>
										</NavigationMenuLink>
									</li>

									<li>
										<NavigationMenuLink asChild>
											<Link href="/#lead-management" className="block p-3 rounded-md hover:bg-accent transition-colors">
												<p className="font-medium leading-none">Lead Management</p>
												<p className="text-sm text-muted-foreground leading-snug mt-1">
													Organize and prioritize your prospects
												</p>
											</Link>
										</NavigationMenuLink>
									</li>
								</ul>
							</NavigationMenuContent>
						</NavigationMenuItem>

						<NavigationMenuItem>
							<Link href="/pricing" legacyBehavior passHref>
								<NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50">
									Pricing
								</NavigationMenuLink>
							</Link>
						</NavigationMenuItem>
					</NavigationMenuList>
				</NavigationMenu>

				<SignedOut>
					<SignInButton forceRedirectUrl="/dashboard">
						<Button className="gap-2">
							Get Started <ArrowRight className="size-4" />
						</Button>
					</SignInButton>
				</SignedOut>
				<SignedIn>
					<div className="flex items-center gap-4">
						<Button asChild variant="outline">
							<Link href="/dashboard" className="gap-2">
								Dashboard <ArrowRight className="size-4" />
							</Link>
						</Button>
						<UserButton />
					</div>
				</SignedIn>
			</div>
		</header>
	);
}

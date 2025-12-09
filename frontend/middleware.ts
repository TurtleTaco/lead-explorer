import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Force middleware to use Node.js runtime instead of Edge
export const runtime = 'nodejs';

const isPublicRoute = createRouteMatcher(["/", "/pricing", "/sign-in(.*)", "/company"]);

export default clerkMiddleware(async (auth, request) => {
	const isPublic = isPublicRoute(request);
	if (!isPublic) {
		await auth.protect();
	}

	// If we don't have an organization ID, redirect to the select organization page
	if (
		!isPublic &&
		request.nextUrl.pathname !== "/select-organization" &&
		!request.nextUrl.pathname.startsWith("/dashboard/org/")
	) {
		const user = await auth();

		if (!user.orgId) {
			return NextResponse.redirect(
				new URL("/select-organization", request.url),
			);
		}

		// If user has an org but is accessing generic /dashboard routes, redirect to org-specific routes
		if (user.orgId) {
			if (request.nextUrl.pathname === "/dashboard") {
				return NextResponse.redirect(
					new URL(`/dashboard/org/${user.orgId}`, request.url),
				);
			}
			if (request.nextUrl.pathname === "/dashboard/subscription") {
				return NextResponse.redirect(
					new URL(`/dashboard/org/${user.orgId}/subscription`, request.url),
				);
			}
			if (request.nextUrl.pathname === "/dashboard/settings") {
				return NextResponse.redirect(
					new URL(`/dashboard/org/${user.orgId}/settings`, request.url),
				);
			}
		}
	}
});

export const config = {
	matcher: [
		// Skip Next.js internals and all static files, unless found in search params
		"/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
		// Always run for API routes
		"/(api|trpc)(.*)",
	],
};

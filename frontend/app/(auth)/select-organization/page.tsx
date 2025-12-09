"use client";

import { OrganizationSwitcher, useOrganization } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * This page renders the Clerk OrganizationSwitcher component.
 * After selecting an organization, it redirects to the organization-specific dashboard.
 * See https://clerk.com/docs/components/organization/organization-switcher for more information.
 */
export default function SelectOrganizationPage() {
	const { organization } = useOrganization();
	const router = useRouter();

	useEffect(() => {
		// When an organization is selected, redirect to its dashboard
		if (organization?.id) {
			router.push(`/dashboard/org/${organization.id}`);
		}
	}, [organization?.id, router]);

	return (
		<div className="min-h-screen flex flex-col gap-4 items-center justify-center">
			<p className="text-lg font-medium">Select an organization to continue.</p>

			<OrganizationSwitcher
				hidePersonal
				defaultOpen
				appearance={{
					elements: {
						rootBox: "mx-auto",
					},
				}}
			/>
		</div>
	);
}

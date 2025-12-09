"use client";

import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { OrganizationSwitcher, useOrganization } from "@clerk/nextjs";
import { Cog, Database, LayoutDashboard, Wallet, Target, Users } from "lucide-react";
import Link from "next/link";

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
	const { ...rest } = props;
	const { organization } = useOrganization();
	const orgId = organization?.id;

	return (
		<Sidebar {...rest}>
			<SidebarHeader>
				<OrganizationSwitcher
					hidePersonal
					afterSelectOrganizationUrl={orgId ? `/dashboard/org/${orgId}` : "/dashboard"}
				/>
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton asChild>
								<Link href={orgId ? `/dashboard/org/${orgId}` : "/dashboard"}>
									<LayoutDashboard /> Dashboard
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
						<SidebarMenuItem>
							<SidebarMenuButton asChild>
								<Link href={orgId ? `/dashboard/org/${orgId}/leads` : "/dashboard/leads"}>
									<Target /> Company Workbench
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
						<SidebarMenuItem>
							<SidebarMenuButton asChild>
								<Link href={orgId ? `/dashboard/org/${orgId}/contacts` : "/dashboard/contacts"}>
									<Users /> Contact Manager
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
						<SidebarMenuItem>
							<SidebarMenuButton asChild>
								<Link href={orgId ? `/dashboard/org/${orgId}/jobs` : "/dashboard/jobs"}>
									<Database /> Job Database
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>

						<SidebarMenuItem>
							<SidebarMenuButton asChild>
								<Link href={orgId ? `/dashboard/org/${orgId}/subscription` : "/dashboard/subscription"}>
									<Wallet /> Subscription
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
						<SidebarMenuItem>
							<SidebarMenuButton asChild>
								<Link href={orgId ? `/dashboard/org/${orgId}/settings` : "/dashboard/settings"}>
									<Cog /> Settings
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}

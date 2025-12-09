import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SignOutButton } from "@clerk/nextjs";
import { LogOut } from "lucide-react";

export default async function SettingsPage({
	params,
}: {
	params: Promise<{ orgId: string }>;
}) {
	const { orgId } = await params;

	return (
		<main className="container">
			<h1 className="text-3xl font-semibold mb-4">Settings</h1>

			<div className="mb-4 text-sm text-muted-foreground">
				Organization ID: <span className="font-mono">{orgId}</span>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Sign out</CardTitle>
				</CardHeader>
				<CardContent>
					<SignOutButton>
						<Button>
							Sign out <LogOut />
						</Button>
					</SignOutButton>
				</CardContent>
			</Card>
		</main>
	);
}


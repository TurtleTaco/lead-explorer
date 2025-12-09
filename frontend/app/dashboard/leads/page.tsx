import { redirect } from "next/navigation";

export default function LeadsPageWithoutOrg() {
	// Redirect to dashboard if no org is selected
	redirect("/dashboard");
}


"use client";

import { useRouter } from "next/navigation";
import { FetchContactsButton } from "@/components/fetch-contacts-button";

interface CompanyCardWithFetchProps {
	company_website: string;
	company_name: string;
}

export function CompanyCardWithFetch({
	company_website,
	company_name,
}: CompanyCardWithFetchProps) {
	const router = useRouter();

	const handleSuccess = () => {
		// Refresh the page to show new contacts
		router.refresh();
	};

	return (
		<FetchContactsButton
			company_website={company_website}
			company_name={company_name}
			onSuccess={handleSuccess}
		/>
	);
}


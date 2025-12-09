import { NextRequest, NextResponse } from "next/server";
import { getAllContacts, exportContactsToCSV } from "@/lib/api/contacts-data";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ orgId: string }> }
) {
	const { orgId } = await params;
	const searchParams = request.nextUrl.searchParams;

	// Get contacts with current filters
	const contactsData = await getAllContacts(orgId, {
		search: searchParams.get("search") || undefined,
		seniority: searchParams.get("seniority") || undefined,
		industry: searchParams.get("industry") || undefined,
		location: searchParams.get("location") || undefined,
		hasEmail: searchParams.get("hasEmail") === "true",
		hasPhone: searchParams.get("hasPhone") === "true",
	});

	// Generate CSV
	const csv = exportContactsToCSV(contactsData.companies);

	// Return as downloadable file
	return new NextResponse(csv, {
		headers: {
			"Content-Type": "text/csv",
			"Content-Disposition": `attachment; filename="contacts-${new Date().toISOString().split("T")[0]}.csv"`,
		},
	});
}

